import { createUser } from '@/lib/user';

interface CreateUserBody {
  username?: string;
  email?: string;
  password?: string;
}

function json(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
}

function validateEmail(email: string): boolean {
  return /^(?=.{3,254}$)[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email);
}

export async function POST(request: Request) {
  let body: CreateUserBody;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { username, email, password } = body;

  if (!username || !email || !password) {
    return json({ error: 'username, email and password are required' }, { status: 400 });
  }
  if (username.length < 3) {
    return json({ error: 'Username must be at least 3 characters long' }, { status: 400 });
  }
  if (!validateEmail(email)) {
    return json({ error: 'Invalid email address' }, { status: 400 });
  }
  if (password.length < 8) {
    return json({ error: 'Password must be at least 8 characters long' }, { status: 400 });
  }

  try {
    const user = await createUser(username, email, password);
    return json({
      id: user.id,
      username: user.username,
      email: user.email,
      created_at: user.created_at,
      updated_at: user.updated_at,
    }, { status: 201 });
  } catch (e: unknown) {
    const err = e as { code?: string; message?: string };
    if (err?.code === '23505') {
      return json({ error: 'Username or email already exists' }, { status: 409 });
    }
    const msg = err?.message || 'Unknown error';
    if (msg.includes('already taken')) {
      return json({ error: 'Username or email already exists' }, { status: 409 });
    }
    console.error('Error creating user:', e);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
