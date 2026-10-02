import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseConfig, supabaseHeaders } from '@/lib/supabase-config'
import { requireAdminSession } from '@/lib/admin-auth'

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

// Default storage file for cold leads in Supabase
const STORAGE_FILE = 'products/cold-leads.json'

async function loadStorageColdLeads(): Promise<ColdLeadRecord[]> {
  try {
    const { url, key } = getSupabaseConfig()
    if (!url || !key) return []
    const fetchUrl = `${url}/storage/v1/object/authenticated/${STORAGE_FILE}?t=${Date.now()}`
    const res = await fetch(fetchUrl, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    })
    if (res.ok) {
      const data = await res.json()
      return Array.isArray(data.leads) ? data.leads : []
    }

    const publicUrl = `${url}/storage/v1/object/${STORAGE_FILE}?t=${Date.now()}`
    const resPub = await fetch(publicUrl, {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
    })
    if (resPub.ok) {
      const data = await resPub.json()
      return Array.isArray(data.leads) ? data.leads : []
    }
  } catch (err) {
    console.error('Failed to load storage cold leads:', err)
  }
  return []
}

async function saveStorageColdLeads(leads: ColdLeadRecord[]): Promise<boolean> {
  try {
    const { url, key } = getSupabaseConfig()
    if (!url || !key) return false
    const uploadUrl = `${url}/storage/v1/object/${STORAGE_FILE}`
    const res = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${key}`,
        apikey: key,
        'x-upsert': 'true',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ leads, updatedAt: new Date().toISOString() }, null, 2),
    })
    return res.ok
  } catch (err) {
    console.error('Failed to save storage cold leads:', err)
    return false
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireAdminSession(request)
    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { url, key } = getSupabaseConfig()

    // 1. Load from dedicated storage
    const storageLeads = await loadStorageColdLeads()

    // 2. Also query Supabase orders table for leads matching cold widget
    let dbLeads: ColdLeadRecord[] = []
    try {
      const dbRes = await fetch(`${url}/rest/v1/orders?select=*&order=created_at.desc`, {
        headers: supabaseHeaders(key),
      })
      if (dbRes.ok) {
        const rows = await dbRes.json()
        if (Array.isArray(rows)) {
          dbLeads = rows
            .filter((r) => r.notes && (r.notes.includes('Hero') || r.notes.includes('Cold Lead') || r.notes.includes('Devis')))
            .map((r) => {
              // Parse category from notes if possible
              let furnitureType = 'salon'
              let furnitureTitle = 'Salons & Canapés'
              const lower = (r.notes || '').toLowerCase()
              if (lower.includes('salle') || lower.includes('manger')) {
                furnitureType = 'salle-a-manger'
                furnitureTitle = 'Salles à Manger'
              } else if (lower.includes('chambre')) {
                furnitureType = 'chambre'
                furnitureTitle = 'Chambres à Coucher'
              } else if (lower.includes('armoire') || lower.includes('dressing')) {
                furnitureType = 'armoire'
                furnitureTitle = 'Dressings & Armoires'
              } else if (lower.includes('deco') || lower.includes('art')) {
                furnitureType = 'deco'
                furnitureTitle = 'Décoration & Art'
              } else if (lower.includes('complet') || lower.includes('aménagement')) {
                furnitureType = 'complet'
                furnitureTitle = 'Aménagement Complet'
              }

              const b = Number(r.amount) || 85000

              return {
                id: 'db_' + r.id,
                customer_name: r.customer_name || 'Client Devis',
                phone: r.phone || '',
                furniture_type: furnitureType,
                furniture_title: furnitureTitle,
                budget: b,
                formatted_budget: new Intl.NumberFormat('fr-DZ').format(b) + ' DA',
                status: r.funnel_stage === 'completed'
                  ? 'converted'
                  : r.funnel_stage === 'interested'
                  ? 'contacted'
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

    // Merge without duplicates by phone + created_at day
    const combinedMap = new Map<string, ColdLeadRecord>()

    // Prioritize storage leads
    for (const lead of storageLeads) {
      const key = `${lead.phone.replace(/[^0-9]/g, '')}_${lead.created_at.substring(0, 10)}`
      combinedMap.set(key, lead)
    }

    // Add db leads if not already present
    for (const lead of dbLeads) {
      const key = `${lead.phone.replace(/[^0-9]/g, '')}_${lead.created_at.substring(0, 10)}`
      if (!combinedMap.has(key)) {
        combinedMap.set(key, lead)
      }
    }

    const allLeads = Array.from(combinedMap.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

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
    const body = await request.json()
    const { customer_name, phone, furniture_type, furniture_title, budget, formatted_budget } = body

    if (!phone) {
      return NextResponse.json({ error: 'Numéro de téléphone requis' }, { status: 400 })
    }

    const b = Number(budget) || 85000
    const newRecord: ColdLeadRecord = {
      id: 'cold_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
      customer_name: (customer_name || 'Client').trim(),
      phone: String(phone).trim(),
      furniture_type: furniture_type || 'salon',
      furniture_title: furniture_title || 'Salons & Canapés',
      budget: b,
      formatted_budget: formatted_budget || new Intl.NumberFormat('fr-DZ').format(b) + ' DA',
      status: 'nouveau',
      created_at: new Date().toISOString(),
      notes: `Choix Hero Shape: ${furniture_title || furniture_type} | Budget: ${formatted_budget || b + ' DA'}`,
    }

    const currentLeads = await loadStorageColdLeads()
    const updated = [newRecord, ...currentLeads]
    await saveStorageColdLeads(updated)

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

    const currentLeads = await loadStorageColdLeads()
    let found = false
    const updated = currentLeads.map((l) => {
      if (l.id === id) {
        found = true
        return {
          ...l,
          status: status || l.status,
          notes: notes !== undefined ? notes : l.notes,
        }
      }
      return l
    })

    if (!found) {
      // If it originated from DB table order
      if (id.startsWith('db_')) {
        const dbId = id.replace('db_', '')
        const { url, key } = getSupabaseConfig()
        let dbFunnel = 'cold'
        if (status === 'contacted') dbFunnel = 'interested'
        else if (status === 'negotiating') dbFunnel = 'delivering'
        else if (status === 'converted') dbFunnel = 'completed'

        await fetch(`${url}/rest/v1/orders?id=eq.${dbId}`, {
          method: 'PATCH',
          headers: supabaseHeaders(key),
          body: JSON.stringify({ funnel_stage: dbFunnel }),
        }).catch(() => {})

        return NextResponse.json({ success: true, message: 'Statut mis à jour dans la base' })
      }
      return NextResponse.json({ error: 'Lead introuvable' }, { status: 404 })
    }

    const saved = await saveStorageColdLeads(updated)
    if (!saved) {
      return NextResponse.json({ error: 'Erreur de sauvegarde Supabase' }, { status: 500 })
    }

    return NextResponse.json({ success: true, leads: updated })
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

    const currentLeads = await loadStorageColdLeads()
    const updated = currentLeads.filter((l) => l.id !== id)
    await saveStorageColdLeads(updated)

    // If the lead originated from the Supabase database table `orders`
    if (id.startsWith('db_')) {
      const dbId = id.replace('db_', '')
      const { url, key } = getSupabaseConfig()
      await fetch(`${url}/rest/v1/orders?id=eq.${dbId}`, {
        method: 'DELETE',
        headers: supabaseHeaders(key),
      }).catch(() => {})
    }

    return NextResponse.json({ success: true, message: 'Lead supprimé définitivement de la base et du stockage' })
  } catch (err: any) {
    console.error('DELETE /api/admin/cold-leads error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
