import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';

dotenv.config({ path: '.env.development.local' });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('Fehlende DATABASE_URL in Umgebungsvariablen');
  process.exit(1);
}

const sql = neon(connectionString);

async function init() {
  try {
    await sql`CREATE EXTENSION IF NOT EXISTS pgcrypto;`;
    await sql`CREATE TABLE IF NOT EXISTS users (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );`;
    await sql`CREATE OR REPLACE FUNCTION set_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;`;
    await sql`DROP TRIGGER IF EXISTS users_set_updated_at ON users;`;
    await sql`CREATE TRIGGER users_set_updated_at
      BEFORE UPDATE ON users
      FOR EACH ROW
      EXECUTE PROCEDURE set_updated_at();`;
    console.log('users Tabelle ist bereit.');

    await sql`CREATE TABLE IF NOT EXISTS search_queries (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      search_term TEXT NOT NULL,
      website_url TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );`;
    await sql`CREATE INDEX IF NOT EXISTS idx_search_queries_user_id_created_at ON search_queries(user_id, created_at DESC);`;
    console.log('search_queries Tabelle ist bereit.');
  } catch (err) {
    console.error('Fehler beim Initialisieren der DB:', err);
    process.exit(1);
  }
}

init();
