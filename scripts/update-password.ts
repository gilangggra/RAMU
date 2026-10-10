const { Client } = require('pg');
async function main() {
  const client = new Client({ connectionString: 'postgresql://postgres.dxvcklytzeekydhoialh:RAMUASALJADI@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres?connect_timeout=15' });
  await client.connect();
  const result = await client.query("UPDATE auth.users SET encrypted_password = crypt('password123', gen_salt('bf')) WHERE email = 'bernadya@gmail.com'");
  console.log('Updated rows:', result.rowCount);
  await client.end();
}
main().catch(console.error);
