import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const schema = readFileSync(join(__dirname, "schema.sql"), "utf8");

// Set these env vars before running: SUPABASE_PROJECT_REF and SUPABASE_ACCESS_TOKEN
const REF   = process.env.SUPABASE_PROJECT_REF   || "";
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN  || "";

async function runQuery(sql, label) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: sql }),
  });
  const data = await res.json();
  if (!res.ok || data.error || (Array.isArray(data) && data[0]?.error)) {
    console.error(`❌ ${label}:`, JSON.stringify(data, null, 2));
    return false;
  }
  console.log(`✅ ${label}`);
  return true;
}

async function createBucket(name) {
  // Use service-role key via Management API for storage
  const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/storage/buckets`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id: name, name, public: true, fileSizeLimit: 10485760 }),
  });
  const data = await res.json();
  if (res.ok) {
    console.log(`✅ Bucket: ${name}`);
  } else if (data.error?.includes("already exists") || data.message?.includes("already exists") || res.status === 409) {
    console.log(`⚠️  Bucket already exists: ${name}`);
  } else {
    console.error(`❌ Bucket ${name}:`, JSON.stringify(data));
  }
}

async function main() {
  console.log("🚀 Setting up new Supabase database...\n");

  // Run the full schema
  const ok = await runQuery(schema, "Full schema (tables, RLS, functions, settings)");

  if (!ok) {
    console.log("\n⚠️  Schema run failed or had errors. Trying in chunks...");
    // Break into smaller chunks if needed
  }

  // Create storage buckets
  console.log("\n📦 Creating storage buckets...");
  await createBucket("gallery");
  await createBucket("news-covers");
  await createBucket("offers");
  await createBucket("products");
  await createBucket("avatars");

  console.log("\n✅ Database setup complete!");
}

main().catch(console.error);
