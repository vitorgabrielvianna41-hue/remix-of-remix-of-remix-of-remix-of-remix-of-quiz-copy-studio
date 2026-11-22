import { Button } from "@/components/ui/button";
import { ResultScreen } from "@/components/quiz-result";
import { VslPlayer } from "@/components/vsl-player";
import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft, Brain, Building2, Calculator, Calendar, Camera, Car, Check, ChevronRight, ClipboardCheck, ClipboardList,
  Clock, FileText, FolderOpen, CircleHelp, Hourglass, List, Loader2, MessageSquareText, Mic, Notebook, Pencil, Percent, Phone,
  Play, Repeat, Scale, Search, ShieldCheck, Snowflake, ThumbsUp, TrendingDown, User, Users, UsersRound, Wallet, Zap,
  type LucideIcon,
} from "lucide-react";
import conversa from "@/assets/conversa-juliana-onix.png.asset.json";
import bancada from "@/assets/bancada-funilaria.jpg";
import {
  AXIS_LABEL, LEVEL, QUESTIONS,
  computeResult, isComplete, optionLabel, type Answers, type Visual,
} from "@/lib/funil";
import { saveLead } from "@/lib/lead.functions";
import { normalizeWhats, whatsValid } from "@/lib/lead-input";
import { initializeQuizTracking } from "@/lib/quiz-tracking";

const WISTIA_MEDIA_ID = "85xuu9y7rj";

const STORE = "funilabot_quiz";
const ANALYZE = QUESTIONS.length;
const RESULT = ANALYZE + 1;
const LEAD = RESULT + 1;
const VSL = LEAD + 1;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Diagnóstico da oficina | FunilaBot" },
      { name: "description", content: "Funileiro: veja em qual etapa da sua oficina vale mexer primeiro, do orçamento à entrega do carro." },
      { property: "og:title", content: "Orçamento no chute tira seu lucro? | FunilaBot" },
      { property: "og:description", content: "Diagnóstico grátis em 2 minutos para funilarias. Sem cadastro." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Quiz,
});

function Quiz() {
  const [answers, setAnswers] = useState<Answers>({});
  const [whats, setWhats] = useState("");
  const [savedWhats, setSavedWhats] = useState("");
  const [step, setStepRaw] = useState(0);
  const loaded = useRef(false);

  useEffect(() => {
    initializeQuizTracking();
  }, []);

  useEffect(() => {
    try {
      const s = JSON.parse(sessionStorage.getItem(STORE) || "{}");
      if (s.answers) setAnswers(s.answers);
      if (typeof s.whats === "string") setWhats(s.whats);
      if (typeof s.savedWhats === "string") setSavedWhats(s.savedWhats);
      if (typeof s.step === "number") setStepRaw(s.step === ANALYZE ? RESULT : s.step);
    } catch {}
    history.replaceState({ step: 0 }, "");
    loaded.current = true;
    const onPop = (e: PopStateEvent) => {
      if (typeof e.state?.step === "number") setStepRaw(e.state.step);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    if (loaded.current) sessionStorage.setItem(STORE, JSON.stringify({ answers, whats, savedWhats, step }));
  }, [answers, whats, savedWhats, step]);

  const go = (n: number) => {
    setStepRaw(n);
    history.pushState({ step: n }, "");
    window.scrollTo({ top: 0 });
  };
  const back = () => go(step === VSL ? RESULT : step === LEAD ? RESULT : step === RESULT ? QUESTIONS.length - 1 : Math.max(0, step - 1));

  const choose = (qi: number, oi: number) => {
    const q = QUESTIONS[qi];
    if (!q) return;
    const next = { ...answers, [q.id]: oi };
    setAnswers(next);
    setTimeout(() => go(qi === QUESTIONS.length - 1 ? ANALYZE : qi + 1), 220);
  };

  useEffect(() => {
    if (step !== ANALYZE) return;
    const t = setTimeout(() => go(RESULT), ANALYZE_MS + 400);
    return () => clearTimeout(t);
  }, [step]);

  const progress = Math.min(step, QUESTIONS.length) / QUESTIONS.length;
  const complete = isComplete(answers);

  return (
    <div className="min-h-dvh bg-background font-sans text-foreground">
      <header className="sticky top-0 z-10 bg-background/95 px-4 backdrop-blur">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3 px-4 py-3">
          {step > 0 && step !== ANALYZE ? (
            <button onClick={back} aria-label="Voltar" className="-ml-1 rounded-full p-2 hover:bg-muted">
              <ArrowLeft className="h-5 w-5" />
            </button>
          ) : <span className="w-9" />}
          <Logo />
          <span className="ml-auto w-9" />
        </div>
        {step < RESULT && (
          <div className="mx-auto mb-2 h-2 max-w-lg overflow-hidden rounded-full bg-muted px-0">
            <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${Math.max(progress * 100, 4)}%` }} />
          </div>
        )}
      </header>

      <main className="mx-auto max-w-lg px-4 pb-16 pt-5">
        {step < QUESTIONS.length && (
          <QuestionScreen key={step} qi={step} answers={answers} onChoose={choose}
            onResult={complete && step < QUESTIONS.length - 1 ? () => go(RESULT) : undefined} />
        )}
        {step === ANALYZE && <Analyzing answers={answers} />}
        {step === RESULT && complete && <ResultScreen answers={answers} onEdit={go} onVsl={() => go(VSL)} />}
        {step === LEAD && complete && (
          <LeadScreen whats={whats} savedWhats={savedWhats} answers={answers}
            onSave={(w) => { setWhats(w); go(VSL); }} onSaved={setSavedWhats} />
        )}
        {step === VSL && complete && <VslScreen />}
        {step >= RESULT && !complete && (
          <div className="py-10 text-center">
            <p className="mb-4">Faltam algumas respostas.</p>
            <button className="option-btn justify-center" onClick={() => go(QUESTIONS.findIndex((q) => answers[q.id] === undefined))}>Continuar</button>
          </div>
        )}
      </main>
    </div>
  );
}

function Logo() {
  return (
    <span className="font-display text-xl font-extrabold tracking-tight">
      Funila<span className="text-primary">Bot</span>
    </span>
  );
}

const ICONS: Record<string, LucideIcon> = {
  user: User, users: Users, "users-round": UsersRound, building: Building2, "trending-down": TrendingDown, repeat: Repeat,
  "shield-check": ShieldCheck, help: CircleHelp, mic: Mic, message: MessageSquareText, camera: Camera, calendar: Calendar,
  notebook: Notebook, scale: Scale, wallet: Wallet, calculator: Calculator, folder: FolderOpen, search: Search, brain: Brain,
  hourglass: Hourglass, percent: Percent, file: FileText, snowflake: Snowflake, clipboard: ClipboardList,
  "clipboard-check": ClipboardCheck, phone: Phone, zap: Zap, car: Car, list: List, "thumbs-up": ThumbsUp, check: Check,
  play: Play, clock: Clock,
};

function QuestionScreen({ qi, answers, onChoose, onResult }: {
  qi: number; answers: Answers; onChoose: (qi: number, oi: number) => void; onResult?: (() => void) | undefined;
}) {
  const q = QUESTIONS[qi];
  if (!q) return null;
  const selected = answers[q.id];
  const solo = (answers.equipe ?? 0) === 0;
  return (
    <section className="animate-rise">
      {qi === 0 && (
        <div className="mb-6 text-center">
          <h1 className="font-display text-[2rem] font-extrabold leading-[1.05] tracking-tight">
            Funileiro, você já percebeu que fazer um orçamento <span className="text-primary">no chute</span> pode tirar seu lucro?
          </h1>
          <p className="mt-3 text-muted-foreground">Veja em qual etapa da sua oficina vale mexer primeiro, do orçamento à entrega do carro.</p>
          <img src={bancada} alt="Bancada de funilaria com porta em reparo" width={1024} height={640}
            className="mt-4 aspect-[16/7] w-full rounded-2xl object-cover shadow-sm" />
          <p className="mt-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Grátis · 2 min · Sem cadastro</p>
        </div>
      )}
      {q.visual && <VisualCard v={q.visual} />}
      <div className="text-center">
        {q.visual && <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-primary" />}
        {q.kicker && <p className="mb-2 font-semibold text-muted-foreground">{q.kicker}</p>}
        <h2 className="font-display text-[1.65rem] font-extrabold leading-tight">
          {q.title} {q.highlight && <span className="text-primary">{q.highlight}</span>}
        </h2>
      </div>
      <div className={q.grid ? "mt-5 grid grid-cols-2 gap-3" : "mt-5 flex flex-col gap-3"}>
        {q.options.map((o, oi) => {
          const Icon = ICONS[o.icon] ?? Check;
          const on = selected === oi;
          const label = optionLabel(q, o, solo);
          return q.grid ? (
            <button key={oi} data-selected={on} onClick={() => onChoose(qi, oi)}
              className="relative flex flex-col items-center gap-2 rounded-2xl border-2 border-border bg-card px-2 pb-4 pt-6 text-center shadow-press transition active:translate-y-0.5 data-[selected=true]:border-primary data-[selected=true]:bg-accent">
              <Radio on={on} className="absolute left-2.5 top-2.5" />
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-primary">
                <Icon className="h-8 w-8" />
              </span>
              <span className="leading-tight"><strong className="block">{label}</strong>
                {o.sub && <span className="text-sm text-muted-foreground">{o.sub}</span>}</span>
            </button>
          ) : (
            <button key={oi} className="option-btn" data-selected={on} onClick={() => onChoose(qi, oi)}>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <span className="flex-1">{label}</span>
              <Radio on={on} />
            </button>
          );
        })}
      </div>
      {onResult && (
        <button onClick={onResult} className="mt-5 w-full text-center text-sm font-semibold text-primary underline">Ver resultado atualizado</button>
      )}
    </section>
  );
}

function Radio({ on, className = "" }: { on: boolean; className?: string }) {
  return (
    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background"} ${className}`}>
      {on && <Check className="h-4 w-4" />}
    </span>
  );
}

function VisualCard({ v }: { v: Visual }) {
  if (v === "chat") return <ChatSim />;
  if (v === "conta") return (
    <div className="mb-5 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Último serviço entregue</p>
      {[["Valor cobrado", "R$ ?", ""], ["Materiais", "– R$ ?", "text-muted-foreground"], ["Mão de obra", "– R$ ?", "text-muted-foreground"]].map(([k, val, c]) => (
        <div key={k} className={`mt-2 flex justify-between ${c}`}><span>{k}</span><span className="font-semibold">{val}</span></div>
      ))}
      <div className="mt-3 flex justify-between border-t border-border pt-3 font-bold text-primary"><span>Sobra do serviço</span><span>R$ ?</span></div>
      <p className="mt-1 text-xs text-muted-foreground">Antes de despesas fixas e impostos</p>
    </div>
  );
  if (v === "parados") return (
    <div className="mb-5 divide-y divide-border rounded-2xl border border-border bg-card px-4 shadow-sm">
      {[["JS", "Juliana Souza", "Reparo de porta · há 5 dias"], ["RM", "Ricardo Melo", "Para-choque do HB20 · há 12 dias"]].map(([i, n, d]) => (
        <div key={n} className="flex items-center gap-3 py-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-bold text-primary">{i}</span>
          <div className="flex-1 leading-tight"><div className="font-semibold">{n}</div><div className="text-sm text-muted-foreground">{d}</div></div>
          <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-primary">Sem resposta</span>
        </div>
      ))}
    </div>
  );
  return (
    <div className="mb-5 flex items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-warning/20 text-2xl">❓</span>
      <div className="leading-tight"><div className="font-semibold">Pintura da maçaneta</div><div className="text-sm text-muted-foreground">Carro em preparação</div></div>
    </div>
  );
}

function ChatSim() {
  return (
    <img src={conversa.url}
      alt="Conversa com Juliana Souza pedindo um orçamento para arrumar e pintar a porta amassada do Onix prata"
      width={399} height={476}
      className="mb-5 h-auto w-full rounded-2xl border border-border shadow-sm" />
  );
}

const ANALYZE_MS = 5200;
const STAGES = ["Lendo suas respostas…", "Conferindo a rotina da oficina…", "Calculando o lucro por serviço…", "Montando seu plano de ação…"];

function Analyzing({ answers }: { answers: Answers }) {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const t0 = performance.now();
    let raf = 0;
    const tick = () => {
      const p = Math.min(1, (performance.now() - t0) / ANALYZE_MS);
      setPct(Math.round((1 - Math.pow(1 - p, 2)) * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  const lines = useMemo(() => {
    const r = isComplete(answers) ? computeResult(answers) : null;
    const out: { k: string; v: string; flag?: string }[] = QUESTIONS.slice(0, 3).map((q) => ({
      k: q.id, v: q.options[answers[q.id] ?? 0]?.label.toLowerCase() ?? "",
    }));
    r?.shown.forEach((ax) => {
      const w = r.weights[ax] ?? 0;
      out.push({ k: AXIS_LABEL[ax].toLowerCase().replace(/\s+/g, "_"), v: (LEVEL[w] ?? LEVEL[0]).toLowerCase(), ...(w === 0 ? { flag: "crítico" } : {}) });
    });
    return out;
  }, [answers]);
  const visible = Math.min(lines.length, Math.floor((pct / 100) * (lines.length + 1)));
  const stage = STAGES[Math.min(STAGES.length - 1, Math.floor((pct / 100) * STAGES.length))];
  const R = 52, C = 2 * Math.PI * R;
  return (
    <div className="flex flex-col items-center py-8 text-center animate-rise" role="status" aria-live="polite">
      <div className="relative h-36 w-36">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle cx="60" cy="60" r={R} fill="none" strokeWidth="6" className="stroke-muted" />
          <circle cx="60" cy="60" r={R} fill="none" strokeWidth="6" strokeLinecap="round" className="stroke-primary"
            strokeDasharray={C} strokeDashoffset={C * (1 - pct / 100)} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-4xl font-extrabold text-primary">{pct}%</span>
          <span className="font-mono text-[11px] tracking-widest text-muted-foreground">IA</span>
        </div>
      </div>
      <h1 className="mt-6 font-display text-3xl font-extrabold">Analisando sua oficina…</h1>
      <p className="mt-1 font-mono text-xs font-semibold uppercase tracking-[0.2em] text-primary">Inteligência artificial · FunilaBot</p>
      <div className="mt-4 h-1.5 w-44 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-4 text-lg">{stage}</p>
      <div className="mt-6 w-full max-w-sm text-left font-mono text-[13px]">
        <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
          <span className="h-2 w-2 animate-pulse rounded-full bg-primary" /> Data stream
        </p>
        <ul className="min-h-[10rem] space-y-1.5">
          {lines.slice(0, visible).map((l) => (
            <li key={l.k} className="flex gap-2 animate-rise">
              <span className="text-primary">›</span>
              <span className="flex-1 truncate">{l.k} = {l.v}</span>
              {l.flag && <span className="font-semibold text-destructive">{l.flag}</span>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function maskWhats(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function LeadScreen({ whats, savedWhats, answers, onSave, onSaved }: {
  whats: string; savedWhats: string; answers: Answers;
  onSave: (w: string) => void; onSaved: (digits: string) => void;
}) {
  const [value, setValue] = useState(whats);
  const [touched, setTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);
  const send = useServerFn(saveLead);
  const ok = whatsValid(value);

  async function submit() {
    const digits = normalizeWhats(value);
    if (digits === normalizeWhats(savedWhats)) { onSave(value); return; }
    setSaving(true);
    setFailed(false);
    const res = await send({ data: { whatsapp: value, answers } }).catch(() => ({ ok: false as const }));
    setSaving(false);
    if (res.ok) { onSaved(digits); onSave(value); } else setFailed(true);
  }

  return (
    <section className="animate-rise">
      <p className="text-sm font-semibold uppercase tracking-wide text-primary">Quase lá</p>
      <h1 className="mt-1 font-display text-3xl font-extrabold leading-tight">Qual é o WhatsApp da sua oficina?</h1>
      <p className="mt-3 text-lg text-muted-foreground">Deixe seu WhatsApp pra receber a demonstração completa e as condições do FunilaBot.</p>
      <form className="mt-6" onSubmit={(e) => { e.preventDefault(); if (ok) void submit(); else setTouched(true); }}>
        <label htmlFor="whats" className="text-sm font-semibold">Seu WhatsApp com DDD</label>
        <input
          id="whats"
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder="(11) 98765-4321"
          value={value}
          onChange={(e) => setValue(maskWhats(e.target.value))}
          onBlur={() => setTouched(true)}
          aria-invalid={touched && !ok}
          className="mt-2 w-full rounded-xl border-2 border-border bg-card px-4 py-3 text-lg font-semibold outline-none focus:border-primary"
        />
        {touched && !ok && <p className="mt-2 text-sm font-semibold text-warning">Confira o número: precisa de DDD + telefone.</p>}
        <button type="submit" disabled={saving} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-4 font-display text-xl font-bold text-primary-foreground shadow-press active:translate-y-0.5 disabled:opacity-70">
          {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Play className="h-5 w-5" />}
          {saving ? "Enviando…" : "Ver a demonstração"}
        </button>
        {failed && <p className="mt-2 text-sm font-semibold text-warning">Não consegui enviar agora. Confira o número e tente de novo.</p>}
      </form>
      <p className="mt-3 text-center text-xs text-muted-foreground">Sem spam. Só o que você pediu sobre o FunilaBot.</p>
    </section>
  );
}

function VslScreen() {
  return (
    <section className="animate-rise text-center">
      <h1 className="flex items-start justify-center gap-2 font-display text-2xl font-extrabold uppercase leading-tight">
        <Check className="mt-1 h-6 w-6 shrink-0 rounded-sm bg-success text-primary-foreground" />
        <span className="bg-vsl-highlight px-1 text-vsl-highlight-foreground">SEU SISTEMA ESTÁ PRONTO!</span>
      </h1>
      <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
        Assista ao vídeo <strong className="text-foreground">até o final</strong> e descubra como o FunilaBot pode ajudar sua oficina.
      </p>
      <VslPlayer mediaId={WISTIA_MEDIA_ID} actions={
        <Button asChild className="h-auto min-h-14 w-full whitespace-normal px-4 py-3 font-display text-xl font-bold leading-tight shadow-press">
          <a href="https://funilabotpagina.vercel.app/funileiro/index.html" target="_blank" rel="noopener noreferrer">Acessar agora <ChevronRight /></a>
        </Button>
      } />
    </section>
  );
}
