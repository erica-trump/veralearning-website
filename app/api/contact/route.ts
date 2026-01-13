import { NextResponse } from "next/server";
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!, {
    ssl: "require",
});

function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function GET() {
    return NextResponse.json({ ok: true, route: "/api/contact" });
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        const email = (body.email ?? "").toString().trim();
        const name = (body.name ?? "").toString().trim();
        const company = (body.company ?? "").toString().trim();
        const role = (body.role ?? "").toString().trim();
        const message = (body.message ?? "").toString().trim();
        const source = (body.source ?? "local").toString().trim();

        // Honeypot (optional): if you include a hidden "website" field in your form
        if (body.website) return NextResponse.json({ ok: true });

        if (!email || !isValidEmail(email)) {
            return NextResponse.json({ ok: false, error: "Invalid email" }, { status: 400 });
        }

        const rows = await sql`
      insert into contact_submissions (email, name, company, role, message, source)
      values (${email}, ${name}, ${company}, ${role}, ${message}, ${source})
      returning id, created_at
    `;

        return NextResponse.json({ ok: true, inserted: rows[0] });
    } catch (e: any) {
        return NextResponse.json(
            { ok: false, error: e?.message ?? "Insert failed" },
            { status: 500 }
        );
    }
}
