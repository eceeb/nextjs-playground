import { verifyUserPassword } from '@/lib/user';

function json(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
}

interface LoginBody { identifier?: string; password?: string }

export async function POST(request: Request) {
  let body: LoginBody;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const { identifier, password } = body;
  if (!identifier || !password) {
    return json({ error: 'identifier and password are required' }, { status: 400 });
  }
  try {
    const user = await verifyUserPassword(identifier, password);
    if (!user) {
      return json({ error: 'Invalid credentials' }, { status: 401 });
    }
    return json({ id: user.id, username: user.username, email: user.email });
  } catch (e: unknown) {
    console.error('Error in login route:', e);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
