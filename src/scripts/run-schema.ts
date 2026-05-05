import { Client } from "pg";
import { readFileSync } from "fs";
import { resolve } from "path";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error(
    "\nMissing DATABASE_URL in .env.local\n" +
      "Get it from Supabase Dashboard → Project Settings → Database → Connection string\n" +
      'Choose "Session" mode (port 5432) and paste the URI.\n'
  );
  process.exit(1);
}

const schemaPath = resolve(process.cwd(), "src/lib/db/schema.sql");
const rawSql = readFileSync(schemaPath, "utf-8");

// Split on semicolons while respecting $$-quoted function bodies and line comments
function splitStatements(sql: string): string[] {
  const statements: string[] = [];
  let buf = "";
  let inDollarQuote = false;
  let dollarTag = "";

  for (let i = 0; i < sql.length; ) {
    // Skip line comments outside dollar quotes
    if (!inDollarQuote && sql[i] === "-" && sql[i + 1] === "-") {
      const nl = sql.indexOf("\n", i);
      i = nl === -1 ? sql.length : nl + 1;
      continue;
    }

    // Detect opening $$-tag
    if (!inDollarQuote && sql[i] === "$") {
      const tagEnd = sql.indexOf("$", i + 1);
      if (tagEnd !== -1) {
        const tag = sql.slice(i, tagEnd + 1);
        if (/^\$[A-Za-z_0-9]*\$$/.test(tag)) {
          inDollarQuote = true;
          dollarTag = tag;
          buf += tag;
          i = tagEnd + 1;
          continue;
        }
      }
    }

    // Detect closing $$-tag
    if (inDollarQuote && sql.startsWith(dollarTag, i)) {
      buf += dollarTag;
      i += dollarTag.length;
      inDollarQuote = false;
      dollarTag = "";
      continue;
    }

    // Statement boundary
    if (!inDollarQuote && sql[i] === ";") {
      const stmt = buf.trim();
      if (stmt) statements.push(stmt);
      buf = "";
      i++;
      continue;
    }

    buf += sql[i++];
  }

  const last = buf.trim();
  if (last) statements.push(last);
  return statements;
}

async function main() {
  const statements = splitStatements(rawSql);
  console.log(`\nConnecting to database...`);

  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  console.log(`Connected. Running ${statements.length} statements from schema.sql\n`);

  let passed = 0;
  let failed = 0;

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    const preview = stmt.replace(/\s+/g, " ").slice(0, 72);

    try {
      await client.query(stmt);
      console.log(`✓  [${i + 1}/${statements.length}]  ${preview}`);
      passed++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`✗  [${i + 1}/${statements.length}]  ${preview}`);
      console.error(`   └─ ${msg}`);
      failed++;
    }
  }

  await client.end();
  console.log(`\n${passed} passed  ${failed} failed\n`);
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
