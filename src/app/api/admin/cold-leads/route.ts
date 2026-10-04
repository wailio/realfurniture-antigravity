import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseConfig, supabaseHeaders } from '@/lib/supabase-config'
import { requireAdminSession } from '@/lib/admin-auth'
import { sendTelegramAlert } from '@/lib/telegram'
import { checkRateLimit, isBotHoneypotTriggered } from '@/lib/rate-limit'

export const runtime = 'edge'

export interface ColdLeadRecord {
  id: string
  customer_name: string
  phone: string
  furniture_type: string
  furniture_title: string
  budget: number
  formatted_budget: string
  status: 'nouveau' | 'contacted' | 'negotiating' | 'converted' | 'archived'
  created_at: string
  notes?: string
}

function parseFurnitureType(notes: string): { type: string; title: string } {
  const lower = (notes || '').toLowerCase()
  if (lower.includes('salle') || lower.includes('manger')) {
    return { type: 'salle-a-manger', title: 'Salles à Manger' }
  } else if (lower.includes('chambre')) {
    return { type: 'chambre', title: 'Chambres à Coucher' }
  } else if (lower.includes('armoire') || lower.includes('dressing')) {
    return { type: 'armoire', title: 'Dressings & Armoires' }
  } else if (lower.includes('deco') || lower.includes('art')) {
    return { type: 'deco', title: 'Décoration & Art' }
  } else if (lower.includes('complet') || lower.includes('aménagement')) {
    return { type: 'complet', title: 'Aménagement Complet' }
  }
  return { type: 'salon', title: 'Salons & Canapés' }
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireAdminSession(request)
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { url, key } = getSupabaseConfig()
    let allLeads: ColdLeadRecord[] = []

    try {
      const dbRes = await fetch(`${url}/rest/v1/orders?select=*&order=created_at.desc`, {
        headers: supabaseHeaders(key),
      })
      if (dbRes.ok) {
        const rows = await dbRes.json()
        if (Array.isArray(rows)) {
          allLeads = rows
            .filter((r) => r.notes && (r.notes.includes('Hero') || r.notes.includes('Cold Lead') || r.notes.includes('Devis') || r.funnel_stage === 'cold'))
            .map((r) => {
              const { type, title } = parseFurnitureType(r.notes || '')
              const b = Number(r.amount) || 85000

              return {
                id: String(r.id),
                customer_name: r.customer_name || 'Client Devis',
                phone: r.phone || '',
                furniture_type: type,
                furniture_title: title,
                budget: b,
                formatted_budget: new Intl.NumberFormat('fr-DZ').format(b) + ' DA',
                status: r.funnel_stage === 'completed'
                  ? 'converted'
                  : r.funnel_stage === 'interested'
                  ? 'contacted'
                  : r.funnel_stage === 'delivering'
                  ? 'negotiating'
                  : 'nouveau',
                created_at: r.created_at || new Date().toISOString(),
                notes: r.notes || '',
              } as ColdLeadRecord
            })
        }
      }
    } catch (e) {
      console.error('Failed to query orders for cold leads:', e)
    }

    // Compute analytics
    const totalLeads = allLeads.length
    const typeDistribution: Record<string, { count: number; totalBudget: number }> = {
      'salon': { count: 0, totalBudget: 0 },
      'salle-a-manger': { count: 0, totalBudget: 0 },
      'chambre': { count: 0, totalBudget: 0 },
      'armoire': { count: 0, totalBudget: 0 },
      'deco': { count: 0, totalBudget: 0 },
      'complet': { count: 0, totalBudget: 0 },
    }

    let totalBudgetSum = 0

    for (const lead of allLeads) {
      const t = lead.furniture_type || 'salon'
      if (!typeDistribution[t]) {
        typeDistribution[t] = { count: 0, totalBudget: 0 }
      }
      typeDistribution[t].count++
      typeDistribution[t].totalBudget += lead.budget || 0
      totalBudgetSum += lead.budget || 0
    }

    const avgBudget = totalLeads > 0 ? Math.round(totalBudgetSum / totalLeads) : 0

    return NextResponse.json({
      leads: allLeads,
      totalCount: totalLeads,
      avgBudget,
      totalBudget: totalBudgetSum,
      typeDistribution,
    })
  } catch (err: any) {
    console.error('GET /api/admin/cold-leads error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // ── 1. Edge Rate Limiter (Anti-DDoS / Anti-Spam) ───────────
    const rl = checkRateLimit(request, {
      endpointName: 'cold-leads',
      maxRequests: 5,
      windowMs: 10 * 60 * 1000, // 5 requests per 10 minutes
    })

    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Trop de requêtes. Veuillez patienter quelques minutes.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(rl.resetMs / 1000)) } }
      )
    }

    const body = await request.json()

    // ── 2. Silent Bot Honeypot Shield ────────────────────────
    if (isBotHoneypotTriggered(body, ['website', 'nobot', 'company_fax'])) {
      return NextResponse.json({ success: true, message: 'Reçu.' }, { status: 200 })
    }

    const { customer_name, phone, furniture_type, furniture_title, budget, formatted_budget } = body

    if (!phone) {
      return NextResponse.json({ error: 'Numéro de téléphone requis' }, { status: 400 })
    }

    const safeName = String(customer_name || 'Client').trim().slice(0, 100)
    const safePhone = String(phone).trim().slice(0, 40)
    const safeType = String(furniture_type || 'salon').trim().slice(0, 50)
    const safeTitle = String(furniture_title || 'Salons & Canapés').trim().slice(0, 80)
    const b = Number(budget) || 85000
    const safeFormattedBudget = formatted_budget || new Intl.NumberFormat('fr-DZ').format(b) + ' DA'
    const safeNotes = `[Cold Lead Widget] ${safeTitle} | Budget: ${safeFormattedBudget}`

    // ── 3. Save directly to secure Supabase PostgreSQL orders table ──
    const { url, key } = getSupabaseConfig()
    let createdRecordId = 'cold_' + Date.now().toString(36)

    try {
      const dbRes = await fetch(`${url}/rest/v1/orders`, {
        method: 'POST',
        headers: {
          ...supabaseHeaders(key),
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          customer_name: safeName,
          phone: safePhone,
          amount: b,
          funnel_stage: 'cold',
          notes: safeNotes,
        }),
      })

      if (dbRes.ok) {
        const rows = await dbRes.json()
        if (Array.isArray(rows) && rows[0]?.id) {
          createdRecordId = String(rows[0].id)
        }
      }
    } catch (dbErr) {
      console.error('Failed to save cold lead to database:', dbErr)
    }

    const newRecord: ColdLeadRecord = {
      id: createdRecordId,
      customer_name: safeName,
      phone: safePhone,
      furniture_type: safeType,
      furniture_title: safeTitle,
      budget: b,
      formatted_budget: safeFormattedBudget,
      status: 'nouveau',
      created_at: new Date().toISOString(),
      notes: safeNotes,
    }

    // ── Telegram admin ping — awaited so Cloudflare edge doesn't kill it ──
    await sendTelegramAlert({
      type: 'cold_lead',
      name: newRecord.customer_name,
      phone: newRecord.phone,
      category: newRecord.furniture_title,
      budget: newRecord.formatted_budget,
    })

    return NextResponse.json({ success: true, lead: newRecord }, { status: 201 })
  } catch (err: any) {
    console.error('POST /api/admin/cold-leads error:', err)
    return NextResponse.json({ error: 'Erreur lors de l\'enregistrement' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAdminSession(request)
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { id, status, notes } = body

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }

    const cleanId = String(id).replace('db_', '')
    const { url, key } = getSupabaseConfig()

    let dbFunnel = 'cold'
    if (status === 'contacted') dbFunnel = 'interested'
    else if (status === 'negotiating') dbFunnel = 'delivering'
    else if (status === 'converted') dbFunnel = 'completed'

    const patchBody: Record<string, any> = { funnel_stage: dbFunnel }
    if (notes !== undefined) patchBody.notes = notes

    const res = await fetch(`${url}/rest/v1/orders?id=eq.${cleanId}`, {
      method: 'PATCH',
      headers: supabaseHeaders(key),
      body: JSON.stringify(patchBody),
    })

    if (!res.ok) {
      const errText = await res.text()
      return NextResponse.json({ error: `Erreur Supabase: ${errText}` }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Statut mis à jour dans la base' })
  } catch (err: any) {
    console.error('PATCH /api/admin/cold-leads error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await requireAdminSession(request)
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID requis' }, { status: 400 })
    }

    const cleanId = String(id).replace('db_', '')
    const { url, key } = getSupabaseConfig()

    const res = await fetch(`${url}/rest/v1/orders?id=eq.${cleanId}`, {
      method: 'DELETE',
      headers: supabaseHeaders(key),
    })

    if (!res.ok) {
      const errText = await res.text()
      return NextResponse.json({ error: `Erreur Supabase: ${errText}` }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Lead supprimé définitivement de la base de données' })
  } catch (err: any) {
    console.error('DELETE /api/admin/cold-leads error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
