'use client';
import { useState, type FormEvent, useEffect } from 'react';

export default function LoginPage() {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black py-12 px-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 shadow rounded-lg p-8 space-y-6">
        <h1 className="text-2xl font-semibold text-center text-zinc-800 dark:text-zinc-100">{tab === 'login' ? 'Login' : 'Register'}</h1>
        <div className="flex justify-center gap-4 text-sm">
          <button onClick={() => setTab('login')} className={tab==='login' ? 'underline font-medium' : 'text-zinc-500'}>Login</button>
          <button onClick={() => setTab('register')} className={tab==='register' ? 'underline font-medium' : 'text-zinc-500'}>Register</button>
        </div>
        {tab === 'login' ? <LoginForm onSwitchToRegister={() => setTab('register')} /> : <RegisterForm onSwitchToLogin={() => setTab('login')} />}
        <div className="text-center text-xs text-zinc-500">
          <a href="/" className="underline">Back to search</a>
        </div>
      </div>
    </div>
  );
}

function LoginForm({ onSwitchToRegister }: { onSwitchToRegister: () => void }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus(null);
    if (!identifier || !password) { setStatus('Identifier and password are required.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ identifier, password }) });
      if (!res.ok) {
        const txt = await res.text();
        setStatus(`Login failed: ${txt}`);
        return;
      }
      const user = await res.json();
      localStorage.setItem('authUser', JSON.stringify(user));
      localStorage.setItem('email', user.email);
      setStatus('Login successful.');
      setPassword('');
    } catch (err: unknown) {
      const e = err as { message?: string }; setStatus(e.message || 'Unexpected error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Email or Username</label>
        <input value={identifier} onChange={e=>setIdentifier(e.target.value)} className="rounded border px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700" placeholder="you@example.com" />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Password</label>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="rounded border px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700" placeholder="••••••••" />
      </div>
      <button disabled={loading} className="w-full rounded bg-black text-white dark:bg-zinc-200 dark:text-black py-2 font-medium disabled:opacity-60">{loading ? 'Logging in...' : 'Login'}</button>
      {status && <p className="text-sm text-zinc-600 dark:text-zinc-300">{status}</p>}
      <p className="text-xs text-zinc-500">No account? <button type="button" onClick={onSwitchToRegister} className="underline">Register</button></p>
    </form>
  );
}

function RegisterForm({ onSwitchToLogin }: { onSwitchToLogin: () => void }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function isValidEmail(v: string) {
    return /^(?=.{3,254}$)[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(v);
  }

  async function handleRegister(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus(null);
    if (!username || !email || !password) { setStatus('All fields are required.'); return; }
    if (!isValidEmail(email)) { setStatus('Invalid email address.'); return; }
    if (password.length < 8) { setStatus('Password must be at least 8 characters long.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, email, password }) });
      if (!res.ok && res.status !== 409) {
        const txt = await res.text();
        setStatus(`Registration failed: ${txt}`);
        return;
      }
      // Auto-login after registration
      const loginRes = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ identifier: email, password }) });
      if (loginRes.ok) {
        const user = await loginRes.json();
        localStorage.setItem('authUser', JSON.stringify(user));
        localStorage.setItem('email', user.email);
        setStatus('Registration successful.');
        setPassword('');
      } else {
        setStatus('Registered but auto-login failed. Please login manually.');
      }
    } catch (err: unknown) {
      const e = err as { message?: string }; setStatus(e.message || 'Unexpected error');
    } finally { setLoading(false); }
  }

  return (
    <form onSubmit={handleRegister} className="space-y-4">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Username</label>
        <input value={username} onChange={e=>setUsername(e.target.value)} className="rounded border px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700" placeholder="yourname" />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Email</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} className="rounded border px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700" placeholder="you@example.com" />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Password</label>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} className="rounded border px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700" placeholder="••••••••" />
      </div>
      <button disabled={loading} className="w-full rounded bg-black text-white dark:bg-zinc-200 dark:text-black py-2 font-medium disabled:opacity-60">{loading ? 'Registering...' : 'Register'}</button>
      {status && <p className="text-sm text-zinc-600 dark:text-zinc-300">{status}</p>}
      <p className="text-xs text-zinc-500">Have an account? <button type="button" onClick={onSwitchToLogin} className="underline">Login</button></p>
    </form>
  );
}

