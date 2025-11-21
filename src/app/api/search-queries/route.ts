import { createSearchQuery, listSearchQueriesForUser, deleteSearchQuery } from '@/lib/search';
import { findByUsername, findByEmail } from '@/lib/user';

function json(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
}

function badRequest(message: string) {
  return json({ error: message }, { status: 400 });
}

function validateUrl(u: string): boolean {
  try {
    const url = new URL(u);
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
}

async function resolveUserId({ user_id, username, email }: { user_id?: string; username?: string; email?: string; }): Promise<string | null> {
  if (user_id) return user_id;
  if (username) {
    const u = await findByUsername(username);
    return u?.id ?? null;
  }
  if (email) {
    const u = await findByEmail(email);
    return u?.id ?? null;
  }
  return null;
}

interface CreateSearchQueryBody {
  user_id?: string;
  username?: string;
  email?: string;
  search_term: string;
  website_url: string;
}

interface DeleteSearchQueryBody {
  id: string;
  user_id?: string;
  username?: string;
  email?: string;
}

export async function POST(request: Request) {
  let body: CreateSearchQueryBody;
  try {
    body = await request.json();
  } catch {
    return badRequest('Invalid JSON body');
  }

  const { user_id, username, email, search_term, website_url } = body;

  if (!search_term) {
    return badRequest('search_term missing or invalid');
  }
  if (search_term.length > 512) {
    return badRequest('search_term too long (max 512 chars)');
  }
  if (!website_url) {
    return badRequest('website_url missing or invalid');
  }
  if (!validateUrl(website_url)) {
    return badRequest('website_url must be a valid http/https URL');
  }

  const resolvedUserId = await resolveUserId({ user_id, username, email });
  if (!resolvedUserId) {
    return json({ error: 'User not found' }, { status: 404 });
  }

  try {
    const entry = await createSearchQuery(resolvedUserId, search_term, website_url);
    return json({
      id: entry.id,
      user_id: entry.user_id,
      search_term: entry.search_term,
      website_url: entry.website_url,
      created_at: entry.created_at,
    }, { status: 201 });
  } catch (e: unknown) {
    const err = e as { message?: string };
    console.error('Error creating search query:', err?.message ?? e);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET: Liste der Suchanfragen für einen User: /api/search-queries?user_id=... | username=... | email=...&limit=50
export async function GET(request: Request) {
  const url = new URL(request.url);
  const user_id = url.searchParams.get('user_id') ?? undefined;
  const username = url.searchParams.get('username') ?? undefined;
  const email = url.searchParams.get('email') ?? undefined;
  const limitParam = url.searchParams.get('limit');
  let limit = 50;
  if (limitParam) {
    const parsed = parseInt(limitParam, 10);
    if (!Number.isNaN(parsed) && parsed > 0 && parsed <= 500) {
      limit = parsed;
    }
  }
  const resolvedUserId = await resolveUserId({ user_id, username, email });
  if (!resolvedUserId) {
    return json({ error: 'User not found' }, { status: 404 });
  }
  try {
    const entries = await listSearchQueriesForUser(resolvedUserId, limit);
    return json(entries.map(e => ({
      id: e.id,
      search_term: e.search_term,
      website_url: e.website_url,
      created_at: e.created_at,
    })));
  } catch (e: unknown) {
    const err = e as { message?: string };
    console.error('Error fetching search queries:', err?.message ?? e);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  let body: DeleteSearchQueryBody;
  try {
    body = await request.json();
  } catch {
    return badRequest('Invalid JSON body');
  }
  const { id, user_id, username, email } = body;
  if (!id) return badRequest('id missing');
  const resolvedUserId = await resolveUserId({ user_id, username, email });
  if (!resolvedUserId) {
    return json({ error: 'User not found' }, { status: 404 });
  }
  try {
    const ok = await deleteSearchQuery(id, resolvedUserId);
    if (!ok) return json({ error: 'Query not found' }, { status: 404 });
    return json({ deleted: true });
  } catch (e: unknown) {
    const err = e as { message?: string };
    console.error('Error deleting search query:', err?.message ?? e);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
