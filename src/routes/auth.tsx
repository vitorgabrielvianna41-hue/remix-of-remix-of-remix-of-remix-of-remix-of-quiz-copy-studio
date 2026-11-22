import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LovableMark } from "@lovable.dev/cloud-auth-js/react";
import { Loader2, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import { lovable } from "@/integrations/lovable/index";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar | FunilaBot" },
      { name: "description", content: "Acesso interno do FunilaBot: entre para ver os leads que o diagnóstico gerou." },
      { property: "og:title", content: "Entrar no FunilaBot" },
      { property: "og:description", content: "Acesso interno para quem cuida do FunilaBot." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function Logo() {
  return (
    <span className="font-display text-xl font-extrabold tracking-tight">
      Funila<span className="text-primary">Bot</span>
    </span>
  );
}

/** Google's branding rules fix these three values; they are not theme tokens. */
const GOOGLE_LIGHT = { backgroundColor: "#FFFFFF", border: "1px solid #747775", color: "#1F1F1F" } as const;

function GoogleMark() {
  return (
    <svg aria-hidden="true" width={18} height={18} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z" />
      <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z" />
    </svg>
  );
}

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [busy, setBusy] = useState<"google" | "lovable" | "email" | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [signedInAs, setSignedInAs] = useState<string | null>(null);

  // The session only exists in the browser, so read it after mount, never during SSR.
  useEffect(() => {
    let alive = true;
    void supabase.auth.getUser().then(({ data }) => {
      if (alive && data.user) setSignedInAs(data.user.email ?? "conta conectada");
    });
    return () => { alive = false; };
  }, []);

  const toLeads = () => navigate({ to: "/leads" });

  async function oauth(provider: "google" | "lovable") {
    setBusy(provider);
    setNote(null);
    const result = await lovable.auth.signInWithOAuth(provider, { redirect_uri: window.location.origin });
    if (result.error) {
      setBusy(null);
      setNote("Não consegui entrar com esse provedor agora. Tente de novo ou use e-mail.");
      return;
    }
    if (result.redirected) return; // the browser is navigating
    await toLeads();
  }

  async function emailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy("email");
    setNote(null);
    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({ email, password });
      setBusy(null);
      if (error) { setNote(error.message); return; }
      if (!data.session) {
        setNote("Confira seu e-mail e clique no link de confirmação para entrar.");
        return;
      }
      await toLeads();
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(null);
    if (error) { setNote("E-mail ou senha não conferem."); return; }
    await toLeads();
  }

  async function leave() {
    await supabase.auth.signOut();
    setSignedInAs(null);
    setNote(null);
  }

  if (signedInAs) {
    return (
      <div className="min-h-dvh bg-background font-sans text-foreground">
        <header className="px-4 py-4">
          <div className="mx-auto max-w-sm"><Logo /></div>
        </header>
        <main className="mx-auto max-w-sm px-4 pb-16 pt-6">
          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Você está conectado</p>
            <p className="mt-2 font-semibold break-all">{signedInAs}</p>
            <Button onClick={toLeads} className="mt-5 w-full">Ver os leads</Button>
            <Button variant="link" onClick={leave} className="mt-2 h-auto w-full text-muted-foreground">Sair desta conta</Button>
          </section>
          {note && <p className="mt-3 text-sm font-semibold text-warning">{note}</p>}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background font-sans text-foreground">
      <header className="px-4 py-4">
        <div className="mx-auto max-w-sm"><Logo /></div>
      </header>
      <main className="mx-auto max-w-sm px-4 pb-16 pt-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Acesso interno</p>
        <h1 className="mt-1 font-display text-3xl font-extrabold leading-tight">Entre para ver os leads</h1>
        <p className="mt-3 text-muted-foreground">
          Esta área não faz parte do quiz público. Só quem tem acesso de administrador consegue abrir a lista.
        </p>

        <div className="mt-6 space-y-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => void oauth("google")}
            disabled={busy !== null}
            style={GOOGLE_LIGHT}
            className="flex h-12 w-full items-center justify-center gap-2.5 rounded-lg px-3 text-sm font-medium"
          >
            {busy === "google" ? <Loader2 className="h-4 w-4 animate-spin" /> : <GoogleMark />}
            <span>Continuar com Google</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => void oauth("lovable")}
            disabled={busy !== null}
            className="flex h-12 w-full items-center justify-center gap-2.5 rounded-lg px-3 text-sm font-medium"
          >
            {busy === "lovable" ? <Loader2 className="h-4 w-4 animate-spin" /> : <LovableMark />}
            <span>Continuar com Lovable</span>
          </Button>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-border" />
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">ou</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <form className="mt-5" onSubmit={emailSubmit}>
          <label htmlFor="email" className="text-sm font-semibold">E-mail</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-xl border-2 border-border bg-card px-4 py-3 outline-none focus:border-primary"
          />
          <label htmlFor="password" className="mt-4 block text-sm font-semibold">Senha</label>
          <input
            id="password"
            type="password"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-xl border-2 border-border bg-card px-4 py-3 outline-none focus:border-primary"
          />
          <Button type="submit" disabled={busy !== null || !email || !password} className="mt-4 w-full">
            {busy === "email" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
            {mode === "signup" ? "Criar conta" : "Entrar"}
          </Button>
          <button
            type="button"
            onClick={() => { setMode(mode === "signup" ? "signin" : "signup"); setNote(null); }}
            className="mt-3 w-full text-center text-sm font-semibold text-primary underline"
          >
            {mode === "signup" ? "Já tenho conta, entrar" : "Criar conta com e-mail"}
          </button>
        </form>

        {note && <p className="mt-4 rounded-xl bg-accent p-3 text-sm font-semibold text-muted-foreground">{note}</p>}
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Criar uma conta não libera a lista sozinha: é preciso estar marcado como administrador.
        </p>
      </main>
    </div>
  );
}
