import { NextRequest, NextResponse } from "next/server";
import { getSupabaseConfig, supabaseHeaders } from "@/lib/supabase-config";

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

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

    // ── Save to Supabase messages table ──────────────────────
    try {
      const { url, key } = getSupabaseConfig();
      await fetch(`${url}/rest/v1/messages`, {
        method: "POST",
        headers: supabaseHeaders(key),
        body: JSON.stringify({
          name,
          email,
          phone: phone || "",
          subject: subject || "",
          message,
          status: "new",
        }),
      });
    } catch (dbErr) {
      console.error("Supabase message save error:", dbErr);
    }

    // ── If a webhook URL is configured, forward the submission ──
    const webhookUrl = process.env.CONTACT_WEBHOOK_URL;
    if (webhookUrl) {
      try {
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            phone,
            subject,
            message,
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
