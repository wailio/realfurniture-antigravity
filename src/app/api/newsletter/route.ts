import { NextRequest, NextResponse } from "next/server";

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "L'adresse email est requise." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
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
