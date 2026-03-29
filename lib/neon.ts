import postgres, { type Sql } from "postgres";

export interface IssuedCredentialRow {
  learner_email: string | null;
  learner_id: string | null;
  proof_type: string | null;
  created_at: string | Date | null;
  expires_at: string | Date | null;
}

declare global {
  var __badgesSql: Sql | undefined;
}

function getConnectionString() {
  return process.env.BADGES_DATABASE_URL ?? process.env.DATABASE_URL ?? null;
}

function getSqlClient() {
  const connectionString = getConnectionString();

  if (!connectionString) {
    return null;
  }

  if (!global.__badgesSql) {
    global.__badgesSql = postgres(connectionString, { ssl: "require" });
  }

  return global.__badgesSql;
}

export async function getIssuedCredentialRow(credentialId: string) {
  const sql = getSqlClient();

  if (!sql) {
    return null;
  }

  try {
    const rows = await sql<IssuedCredentialRow[]>`
      SELECT learner_email, learner_id, proof_type, created_at, expires_at
      FROM issued_credentials
      WHERE credential_id = ${credentialId}
      LIMIT 1
    `;

    return rows[0] ?? null;
  } catch {
    return null;
  }
}
