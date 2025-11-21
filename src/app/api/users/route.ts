import { createUser } from '@/lib/user';

interface CreateUserBody {
  username?: string;
  email?: string;
  password?: string;
}

function json(data: any, init: ResponseInit = {}) {
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
    return json({ error: 'Ungültiges JSON' }, { status: 400 });
  }

  const { username, email, password } = body;

  if (!username || !email || !password) {
    return json({ error: 'username, email und password sind Pflichtfelder' }, { status: 400 });
  }
  if (username.length < 3) {
    return json({ error: 'Username muss mindestens 3 Zeichen haben' }, { status: 400 });
  }
  if (!validateEmail(email)) {
    return json({ error: 'Ungültige Email-Adresse' }, { status: 400 });
  }
  if (password.length < 8) {
    return json({ error: 'Passwort muss mindestens 8 Zeichen haben' }, { status: 400 });
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
  } catch (e: any) {
    if (e?.code === '23505') {
      return json({ error: 'Username oder Email bereits vergeben' }, { status: 409 });
    }
    const msg = e?.message || 'Unbekannter Fehler';
    if (msg.includes('bereits vergeben')) {
      return json({ error: 'Username oder Email bereits vergeben' }, { status: 409 });
    }
    console.error('Fehler beim Erstellen des Users:', e);
    return json({ error: 'Interner Serverfehler' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic'; // Sicherstellen dass Server-Funktion ausgeführt wird
