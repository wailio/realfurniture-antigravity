import { NextRequest, NextResponse } from "next/server";
import { getSupabaseConfig, supabaseHeaders } from "@/lib/supabase-config";
import { sendTelegramAlert } from "@/lib/telegram";
import { checkRateLimit, isBotHoneypotTriggered } from "@/lib/rate-limit";

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    // ── 1. Edge Rate Limiter (Anti-DDoS / Anti-Spam) ───────────
    const rl = checkRateLimit(request, {
      endpointName: 'contact',
      maxRequests: 5,
      windowMs: 10 * 60 * 1000, // 5 requests per 10 minutes
    });

    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Trop de messages envoyés. Veuillez patienter quelques minutes avant de réessayer." },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(rl.resetMs / 1000)) } }
      );
    }

    const body = await request.json();

    // ── 2. Silent Bot Honeypot Shield ────────────────────────
    if (isBotHoneypotTriggered(body, ['website', 'nobot', 'company_fax'])) {
      // Return 200 to confuse the bot, but DO NOT save to DB or send Telegram alert
      return NextResponse.json({ success: true, message: "Message reçu." }, { status: 200 });
    }

    const { name, email, phone, subject, message, product } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Nom, email et message sont requis." },
        { status: 400 }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Format d'email invalide." },
        { status: 400 }
      );
    }

    // ── 3. Input Sanitization & Length Clamping ──────────────
    const safeName = String(name).trim().slice(0, 100);
    const safeEmail = String(email).trim().slice(0, 120);
    const safePhone = String(phone || "").trim().slice(0, 40);
    const safeSubject = String(subject || (product ? `Commande: ${product}` : "")).trim().slice(0, 200);
    const safeMessage = String(message).trim().slice(0, 2500);
    const safeProduct = String(product || "").trim().slice(0, 150);

    // ── Save to Supabase messages table ──────────────────────
    try {
      const { url, key } = getSupabaseConfig();
      const insertRes = await fetch(`${url}/rest/v1/messages`, {
        method: "POST",
        headers: supabaseHeaders(key),
        body: JSON.stringify({
          name: safeName,
          email: safeEmail,
          phone: safePhone,
          subject: safeSubject,
          message: safeMessage,
          product: safeProduct,
          status: "new",
        }),
      });
      if (!insertRes.ok) {
        console.error("Supabase insert error:", insertRes.status, await insertRes.text());
      }
    } catch (dbErr) {
      console.error("Supabase message save error:", dbErr);
    }

    // ── Telegram admin ping — awaited so Cloudflare edge doesn't kill it ──
    // Fires regardless of Supabase result so we never miss a lead
    await sendTelegramAlert({
      type: 'order',
      name: safeName,
      phone: safePhone || 'Non fourni',
      subject: safeSubject,
      product: safeProduct || undefined,
    });

    // ── If a webhook URL is configured, forward the submission ──
    const webhookUrl = process.env.CONTACT_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: safeName,
            email: safeEmail,
            phone: safePhone,
            subject: safeSubject,
            message: safeMessage,
            source: "Château d'art Website",
            timestamp: new Date().toISOString(),
          }),
        });
      } catch (whErr) {
        console.error("Webhook error:", whErr);
      }
    }

    return NextResponse.json(
      { success: true, message: "Message envoyé avec succès!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}
