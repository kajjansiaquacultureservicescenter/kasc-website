// Creates Supabase storage buckets using the project's Storage API directly
// Set these env vars before running: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
const PROJECT_URL    = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SERVICE_KEY    = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const BUCKETS = ["gallery", "news-covers", "offers", "products", "avatars"];

async function createBucket(name) {
  const res = await fetch(`${PROJECT_URL}/storage/v1/bucket`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SERVICE_KEY}`,
      apikey: SERVICE_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: name,
      name,
      public: true,
      file_size_limit: 10485760,
      allowed_mime_types: ["image/jpeg","image/png","image/webp","image/gif","video/mp4"],
    }),
  });

  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { raw: text }; }

  if (res.ok) {
    console.log(`✅ Created bucket: ${name}`);
  } else if (res.status === 409 || (data.error && data.error.includes("already exists"))) {
    console.log(`⚠️  Bucket already exists: ${name}`);
  } else {
    console.error(`❌ Failed bucket ${name} [${res.status}]:`, JSON.stringify(data));
  }
}

async function main() {
  console.log("📦 Creating storage buckets on new database...\n");
  for (const bucket of BUCKETS) {
    await createBucket(bucket);
  }
  console.log("\n✅ Done.");
}

main().catch(console.error);
