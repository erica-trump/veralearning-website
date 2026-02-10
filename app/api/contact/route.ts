import { NextResponse } from "next/server";
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!, { ssl: "require" });
const ALLOWED_CONTACT_REASONS = new Set([
    "Piloting or integrating VeraCredentials",
    "AI systems design & architecture",
    "AI governance, safety, or risk",
    "Credentialing & assessment strategy",
    "Learning solution design or evaluation",
    "Something else (describe below)",
]);

function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function verifyTurnstile(token: string, ip?: string | null) {
    const secret = process.env.TURNSTILE_SECRET_KEY;
    if (!secret) throw new Error("Missing TURNSTILE_SECRET_KEY");

    const formData = new FormData();
    formData.append("secret", secret);
    formData.append("response", token);
    if (ip) formData.append("remoteip", ip);

    const resp = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        { method: "POST", body: formData }
    );

    const data = (await resp.json()) as {
        success: boolean;
        "error-codes"?: string[];
    };

    return data;
}

export async function GET() {
    return NextResponse.json({ ok: true, route: "/api/contact" });
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Honeypot: if hidden "website" field is filled, silently succeed
        if (body.website) return NextResponse.json({ ok: true });

        // Turnstile required
        const turnstileToken = (body.turnstileToken ?? "").toString().trim();
        if (!turnstileToken) {
            return NextResponse.json(
                { ok: false, error: "Captcha required" },
                { status: 400 }
            );
        }

        // Determine best-effort client IP (useful for Turnstile verification)
        const ip =
            req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
            req.headers.get("x-real-ip");

        const check = await verifyTurnstile(turnstileToken, ip);

        if (!check.success) {
            return NextResponse.json(
                { ok: false, error: "Captcha failed. Please try again." },
                { status: 400 }
            );
        }

        const email = (body.email ?? "").toString().trim();
        const name = (body.name ?? "").toString().trim();
        const company = (body.company ?? "").toString().trim();
        const role = (body.role ?? "").toString().trim();
        const message = (body.message ?? "").toString().trim();
        const source = (body.source ?? "local").toString().trim();
        const contactReasonsInput: unknown[] = Array.isArray(body.contact_reasons)
            ? body.contact_reasons
            : [];
        const contactReasons = contactReasonsInput
            .map((value: unknown): string => String(value ?? "").trim())
            .filter((value: string): boolean => value.length > 0);

        if (!email || !isValidEmail(email)) {
            return NextResponse.json(
                { ok: false, error: "Invalid email" },
                { status: 400 }
            );
        }
        if (!name) {
            return NextResponse.json(
                { ok: false, error: "Name is required" },
                { status: 400 }
            );
        }
        if (!company) {
            return NextResponse.json(
                { ok: false, error: "Company or Institution is required" },
                { status: 400 }
            );
        }

        const hasInvalidReason = contactReasons.some(
            (reason) => !ALLOWED_CONTACT_REASONS.has(reason)
        );
        if (hasInvalidReason) {
            return NextResponse.json(
                { ok: false, error: "Invalid contact reason selected" },
                { status: 400 }
            );
        }

        const rows = await sql`
      insert into contact_submissions (email, name, company, role, message, source, contact_reasons)
      values (${email}, ${name}, ${company}, ${role}, ${message}, ${source}, ${contactReasons})
      returning id, created_at
    `;

        return NextResponse.json({ ok: true, inserted: rows[0] });
    } catch (e: unknown) {
        const message =
            e instanceof Error ? e.message : "Insert failed";
        return NextResponse.json(
            { ok: false, error: message },
            { status: 500 }
        );
    }
}
