import './init-db.js';
import { createUser } from '@/lib/user';
import { createSearchQuery, listSearchQueriesForUser } from '@/lib/search';

async function run() {
  try {
    const user = await createUser('searcher', 'searcher@example.com', 'Password123');
    console.log('User created:', user.username);

    await createSearchQuery(user.id, 'neon postgresql latency', 'https://neon.tech');
    await createSearchQuery(user.id, 'nextjs app router tutorial', 'https://nextjs.org');
    await createSearchQuery(user.id, 'tailwind v4 features', 'https://tailwindcss.com');

    const queries = await listSearchQueriesForUser(user.id);
    console.log('Search queries:', queries.map(q => ({ term: q.search_term, url: q.website_url })));
  } catch (e) {
    const err = e as { message?: string };
    console.error('Error:', err.message ?? e);
  }
}

run();
