import './init-db.js';
import { createUser } from '../src/lib/user';
import { createSearchQuery, listSearchQueriesForUser } from '../src/lib/search';

async function run() {
  try {
    const user = await createUser('sucher', 'sucher@example.com', 'Passwort123');
    console.log('User angelegt:', user.username);

    await createSearchQuery(user.id, 'neon postgresql latency', 'https://neon.tech');
    await createSearchQuery(user.id, 'nextjs app router tutorial', 'https://nextjs.org');
    await createSearchQuery(user.id, 'tailwind v4 features', 'https://tailwindcss.com');

    const queries = await listSearchQueriesForUser(user.id);
    console.log('Gefundene Suchanfragen:', queries.map(q => ({ term: q.search_term, url: q.website_url })));
  } catch (e:any) {
    console.error('Fehler:', e.message);
  }
}

run();
