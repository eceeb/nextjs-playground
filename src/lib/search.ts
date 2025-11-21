import { sql } from './db';

export interface SearchQuery {
  id: string;
  user_id: string;
  search_term: string;
  website_url: string;
  created_at: string;
}

export async function createSearchQuery(userId: string, searchTerm: string, websiteUrl: string): Promise<SearchQuery> {
  const rows = await sql<SearchQuery[]>`INSERT INTO search_queries (user_id, search_term, website_url) VALUES (${userId}, ${searchTerm}, ${websiteUrl}) RETURNING *;`;
  return rows[0];
}

export async function listSearchQueriesForUser(userId: string, limit = 50): Promise<SearchQuery[]> {
  const rows = await sql<SearchQuery[]>`SELECT * FROM search_queries WHERE user_id = ${userId} ORDER BY created_at DESC LIMIT ${limit};`;
  return rows;
}

export async function deleteSearchQuery(id: string, userId: string): Promise<boolean> {
  const rows = await sql`DELETE FROM search_queries WHERE id = ${id} AND user_id = ${userId} RETURNING id;`;
  return rows.length > 0;
}
