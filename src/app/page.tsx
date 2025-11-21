'use client';
import { useState, useEffect, type FormEvent } from "react";

export default function Home() {
  return <LandingForm />;
}

function LandingForm() {
  const [email, setEmail] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [queries, setQueries] = useState<
    Array<{
      id: string;
      search_term: string;
      website_url: string;
      created_at: string;
    }>
  >([]);

  useEffect(() => {
    setQueries([]);
  }, [email]);

  function isValidEmail(v: string) {
    return /^(?=.{3,254}$)[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(v);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus(null);
    if (!email || !searchTerm || !websiteUrl) {
      setStatus("Email, search term and website URL are required.");
      return;
    }
    if (!isValidEmail(email)) {
      setStatus("Invalid email address.");
      return;
    }
    setLoading(true);
    try {
      // Check if user exists via email
      const preCheck = await fetch(
        `/api/search-queries?email=${encodeURIComponent(email)}&limit=1`
      );
      if (preCheck.status === 404) {
        setStatus("User not found. Please use the login link to sign in or register.");
        return;
      }
      // Create search query (identified via email)
      const queryRes = await fetch("/api/search-queries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, search_term: searchTerm, website_url: websiteUrl }),
      });
      if (!queryRes.ok) {
        const txt = await queryRes.text();
        setStatus(`Error (${queryRes.status}): ${txt}`);
        return;
      }
      setStatus("Search query created.");
      await loadQueries();
      setSearchTerm("");
      setWebsiteUrl("");
    } catch (err: unknown) {
      const e = err as { message?: string }; setStatus(e.message || "Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  async function loadQueries() {
    if (!email || !isValidEmail(email)) {
      setQueries([]);
      return;
    }
    const res = await fetch(
      `/api/search-queries?email=${encodeURIComponent(email)}&limit=20`
    );
    if (res.ok) {
      const data = await res.json();
      setQueries(data);
    }
  }

  return (
    <div className="min-h-screen w-full bg-zinc-50 dark:bg-black flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-xl flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-zinc-800 dark:text-zinc-100">
          Search Portal
        </h1>
        <a href="/login" className="text-sm underline">
          Login / Register
        </a>
      </div>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl bg-white dark:bg-zinc-900 shadow rounded-lg p-6 space-y-4"
      >
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded border px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700"
            placeholder="john@example.com"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Search Term</label>
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="rounded border px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700"
            placeholder="nextjs tutorial"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Website URL</label>
          <input
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            className="rounded border px-3 py-2 bg-zinc-50 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700"
            placeholder="https://example.com"
          />
        </div>
        <button
          disabled={loading}
          type="submit"
          className="w-full rounded bg-black text-white dark:bg-zinc-200 dark:text-black py-2 font-medium disabled:opacity-60"
        >
          {loading ? "Saving..." : "Create Search Entry"}
        </button>
        {status && (
          <p className="text-sm text-zinc-700 dark:text-zinc-300">{status}</p>
        )}
      </form>
      <div className="w-full max-w-xl mt-10">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold text-zinc-800 dark:text-zinc-100">Recent Queries</h2>
          <button
            onClick={loadQueries}
            className="text-sm underline"
          >
            Reload
          </button>
        </div>
        <ul className="space-y-2">
          {queries.map((q) => (
            <li
              key={q.id}
              className="rounded border border-zinc-200 dark:border-zinc-700 p-3 flex flex-col"
            >
              <span className="font-medium">{q.search_term}</span>
              <a
                href={q.website_url}
                className="text-xs text-blue-600"
                target="_blank"
                rel="noopener noreferrer"
              >
                {q.website_url}
              </a>
              <span className="text-[10px] text-zinc-500">
                {new Date(q.created_at).toLocaleString()}
              </span>
            </li>
          ))}
          {queries.length === 0 && <li className="text-sm text-zinc-500">No queries yet.</li>}
        </ul>
      </div>
    </div>
  );
}
