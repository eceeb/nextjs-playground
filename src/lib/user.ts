import { sql } from './db';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
}

const SALT_ROUNDS = 12;

function mapRow(row: Record<string, any>): User {
  return row as User;
}

export async function createUser(username: string, email: string, password: string): Promise<User> {
  const existing = await sql`SELECT * FROM users WHERE username = ${username} OR email = ${email} LIMIT 1;` as unknown as User[];
  if (existing[0]) {
    throw new Error('Username or email already taken');
  }
  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  const rows = await sql`INSERT INTO users (username, email, password_hash) VALUES (${username}, ${email}, ${hash}) RETURNING *;` as unknown as User[];
  return mapRow(rows[0]);
}

export async function findByUsername(username: string): Promise<User | null> {
  const rows = await sql`SELECT * FROM users WHERE username = ${username} LIMIT 1;` as unknown as User[];
  return rows[0] ? mapRow(rows[0]) : null;
}

export async function findByEmail(email: string): Promise<User | null> {
  const rows = await sql`SELECT * FROM users WHERE email = ${email} LIMIT 1;` as unknown as User[];
  return rows[0] ? mapRow(rows[0]) : null;
}

export async function verifyUserPassword(usernameOrEmail: string, password: string): Promise<User | null> {
  const rows = await sql`SELECT * FROM users WHERE username = ${usernameOrEmail} OR email = ${usernameOrEmail} LIMIT 1;` as unknown as User[];
  const user = rows[0];
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.password_hash);
  return ok ? mapRow(user) : null;
}
