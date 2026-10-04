import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, isBotHoneypotTriggered } from "@/lib/rate-limit";

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    // ── 1. Edge Rate Limiter (Anti-DDoS / Anti-Spam) ───────────
    const rl = checkRateLimit(request, {
      endpointName: 'newsletter',
      maxRequests: 3,
      windowMs: 10 * 60 * 1000, // 3 requests per 10 minutes
    });

    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Trop de tentatives d'inscription. Veuillez réessayer plus tard." },
        { status: 429, headers: { 'Retry-After': String(Math.ceil(rl.resetMs / 1000)) } }
      );
    }

    const body = await request.json();

    // ── 2. Silent Bot Honeypot Shield ────────────────────────
    if (isBotHoneypotTriggered(body, ['website', 'nobot', 'company_name'])) {
      return NextResponse.json({ success: true, message: "Inscription réussie!" }, { status: 200 });
    }

    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "L'adresse email est requise." },
        { status: 400 }
      );
    }

    const safeEmail = String(email).trim().slice(0, 120);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(safeEmail)) {
      return NextResponse.json(
        { error: "Format d'email invalide." },
        { status: 400 }
      );
    }

    // ── Forward to newsletter service / webhook ─────────────
    // TODO: Wire up to the same newsletter webhook used by the original.
    console.log("Newsletter signup:", { email, timestamp: new Date().toISOString() });

    const webhookUrl = process.env.NEWSLETTER_WEBHOOK_URL;
    if (webhookUrl) {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          source: "Château d'art Website",
          timestamp: new Date().toISOString(),
        }),
      });
    }

    return NextResponse.json(
      { success: true, message: "Inscription réussie!" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Newsletter signup error:", error);
    return NextResponse.json(
      { error: "Erreur interne du serveur." },
      { status: 500 }
    );
  }
}
