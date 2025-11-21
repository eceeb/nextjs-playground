import 'dotenv/config';
import { sql } from '../src/lib/db';

async function main() {
  try {
    const users = await sql`SELECT id, username, email, created_at FROM users ORDER BY created_at DESC LIMIT 20;` as any[];
    const queries = await sql`SELECT id, user_id, search_term, website_url, created_at FROM search_queries ORDER BY created_at DESC LIMIT 20;` as any[];
    const userCount = await sql`SELECT COUNT(*)::int AS count FROM users;` as any[];
    const queryCount = await sql`SELECT COUNT(*)::int AS count FROM search_queries;` as any[];

    console.log('=== Users (latest 20) ===');
    if (users.length === 0) console.log('No users');
    users.forEach(u => console.log(`${u.id} | ${u.username} | ${u.email} | ${u.created_at}`));

    console.log('\nTotal users:', userCount[0]?.count ?? 0);

    console.log('\n=== Search Queries (latest 20) ===');
    if (queries.length === 0) console.log('No search queries');
    queries.forEach(q => console.log(`${q.id} | user:${q.user_id} | ${q.search_term} | ${q.website_url} | ${q.created_at}`));

    console.log('\nTotal search queries:', queryCount[0]?.count ?? 0);
  } catch (e) {
    console.error('Error inspecting DB:', e);
    process.exit(1);
  }
}

main();
