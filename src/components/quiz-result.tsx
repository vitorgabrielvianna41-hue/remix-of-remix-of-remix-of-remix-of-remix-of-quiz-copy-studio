import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, ClipboardCheck, FileText, FolderOpen, Pencil, Play, RotateCcw, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { computeResult, MARGIN_EXAMPLE, serviceRemainder, QUESTIONS, optionLabel, AXIS_LABEL, PATHS, type Answers, type Axis } from "@/lib/funil";

const ctaClass = "h-auto min-h-14 w-full whitespace-normal px-4 py-3 text-center font-display text-xl font-bold leading-tight shadow-press";
const money = (value: number) => `R$ ${value}`;

function PriorityExample({ priority }: { priority: Axis }) {
  if (priority === "custo") {
    const { service, materials, labor } = MARGIN_EXAMPLE;
    return (
      <figure className="mt-6 rounded-lg border border-border bg-card p-4">
        <figcaption className="mb-4 flex items-center gap-2 text-sm font-semibold text-muted-foreground"><Wallet className="h-4 w-4" /> Exemplo · sobra do serviço</figcaption>
        <dl className="space-y-3">
          {[["Pelo serviço", money(service)], ["Material", `− ${money(materials)}`], ["Mão de obra", `− ${money(labor)}`]].map(([label, value]) => (
            <div key={label} className="flex justify-between gap-3"><dt>{label}</dt><dd className="font-semibold tabular-nums">{value}</dd></div>
          ))}
          <div className="flex justify-between gap-3 border-t border-border pt-3 text-xl font-bold text-primary"><dt>Sobra</dt><dd>= {money(serviceRemainder(service, materials, labor))}</dd></div>
        </dl>
        <p className="mt-3 text-xs text-muted-foreground">Exemplo antes de despesas fixas e impostos.</p>
      </figure>
    );
  }
  if (priority === "apresentacao") return (
    <figure className="mt-6">
      <figcaption className="mb-3 flex items-center gap-2 text-sm font-semibold text-muted-foreground"><FileText className="h-4 w-4" /> Exemplo · o mesmo valor, dois orçamentos</figcaption>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-border bg-chat-in p-3"><p className="text-xs font-semibold text-muted-foreground">Só o valor</p><p className="mt-3">O serviço fica em <strong>R$ 850.</strong></p></div>
        <div className="rounded-lg border border-border bg-chat-out p-3"><p className="text-xs font-semibold text-muted-foreground">Proposta detalhada</p><dl className="mt-3 space-y-1 text-sm"><div><dt className="font-semibold">Peça</dt><dd>Porta dianteira</dd></div><div><dt className="font-semibold">Reparo</dt><dd>Desamassar a porta</dd></div><div><dt className="font-semibold">Pintura</dt><dd>Pintura da peça</dd></div></dl><p className="mt-3 border-t border-border pt-2 font-bold">R$ 850</p></div>
      </div>
    </figure>
  );
  if (priority === "acompanhamento") return (
    <figure className="mt-6 rounded-lg border border-border bg-card p-4">
      <figcaption className="mb-4 flex items-center gap-2 text-sm font-semibold text-muted-foreground"><FolderOpen className="h-4 w-4" /> Exemplo · proposta salva</figcaption>
      <p className="font-semibold">Proposta #024 · HB20</p><p className="mt-1 text-sm text-muted-foreground">Reparo e pintura do para-choque · R$ 850</p>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3"><span className="text-sm">Aguardando resposta</span><span className="flex items-center gap-2 text-sm font-semibold text-primary"><RotateCcw className="h-4 w-4" /> Reabrir proposta</span></div>
    </figure>
  );
  return (
    <figure className="mt-6 rounded-lg border border-border bg-card p-4">
      <figcaption className="mb-4 flex items-center gap-2 text-sm font-semibold text-muted-foreground"><ClipboardCheck className="h-4 w-4" /> Exemplo · ordem de serviço #024</figcaption>
      <p className="text-sm text-muted-foreground">Serviço aprovado</p>
      <div className="mt-2 flex items-start justify-between gap-3 border-y border-border py-3"><span className="font-semibold">Pintura da maçaneta</span><span className="flex shrink-0 items-center gap-1 text-sm font-semibold text-success"><ClipboardCheck className="h-4 w-4" /> Incluída</span></div>
      <p className="mt-3 text-sm text-muted-foreground">Registrada no combinado antes da execução.</p>
    </figure>
  );
}

const ease = "cubic-bezier(.22,1,.36,1)";

function useMounted() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setOn(true));
    return () => cancelAnimationFrame(t);
  }, []);
  return on;
}

function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setValue(target); return; }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setValue(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}

function ScoreGauge({ score }: { score: number }) {
  const r = 80, c = Math.PI * r;
  const on = useMounted();
  const shown = useCountUp(score);
  const off = on ? c * (1 - score / 100) : c;
  const status = score < 40 ? "Precisa de atenção agora" : score < 75 ? "Precisa de ajustes" : "Bem organizada";
  return (
    <div className="animate-rise rounded-2xl border border-border bg-card p-5 text-center shadow-sm">
      <svg viewBox="0 0 200 115" className="mx-auto w-full max-w-[240px]" aria-hidden>
        <path d="M20 100 A80 80 0 0 1 180 100" fill="none" className="stroke-muted" strokeWidth="18" strokeLinecap="round" />
        <path d="M20 100 A80 80 0 0 1 180 100" fill="none" className="stroke-primary" strokeWidth="18" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off} style={{ transition: `stroke-dashoffset 1.2s ${ease} .1s` }} />
      </svg>
      <p className="-mt-14 font-display text-5xl font-extrabold tabular-nums">{shown}<span className="text-lg text-muted-foreground">/100</span></p>
      <p className="mt-1 text-sm text-muted-foreground">Organização da sua oficina</p>
      <span className="mt-3 inline-block rounded-full bg-accent px-3 py-1 text-xs font-bold text-primary">● {status}</span>
      <p className="mt-2 text-xs text-muted-foreground">Calculado a partir das suas respostas</p>
    </div>
  );
}

const LEVEL_STYLE = [
  { bar: "bg-destructive", text: "text-destructive", pct: 25, tag: "Crítico" },
  { bar: "bg-warning", text: "text-warning", pct: 55, tag: "Atenção" },
  { bar: "bg-success", text: "text-success", pct: 90, tag: "Bom" },
];

export function ResultScreen({ answers, onEdit, onVsl }: { answers: Answers; onEdit: (n: number) => void; onVsl: () => void }) {
  const originalCta = useRef<HTMLButtonElement>(null);
  const [showFixedCta, setShowFixedCta] = useState(true);
  useEffect(() => {
    const button = originalCta.current;
    if (!button) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry) setShowFixedCta(entry.intersectionRatio < 1);
    }, { threshold: [0, 1], rootMargin: "-64px 0px 0px 0px" });
    observer.observe(button);
    return () => observer.disconnect();
  }, []);
  const r = useMemo(() => computeResult(answers), [answers]);
  const vals = r.shown.map((x) => r.weights[x] ?? 0);
  const score = vals.length ? Math.max(8, Math.round((vals.reduce((a, b) => a + b, 0) / (vals.length * 2)) * 100)) : 50;
  const urgent = r.shown.filter((x) => (r.weights[x] ?? 0) < 2).sort((a, b) => (a === r.priority ? -1 : b === r.priority ? 1 : 0));
  return (
    <section className="space-y-4 pb-28">
      <div className="text-center">
        <span className="inline-block rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold">{r.profile}</span>
        <p className="mt-4 text-sm font-bold uppercase tracking-wide text-primary">Sua prioridade · {r.path.label}</p>
        <h1 className="mt-2 font-display text-3xl font-extrabold leading-tight">{r.headline}</h1>
      </div>

      <ScoreGauge score={score} />

      {r.shown.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="font-display text-xl font-bold">Onde o serviço está escapando</h2>
          <p className="mt-1 text-sm text-muted-foreground">Quanto mais curta a barra, mais dinheiro fica na mesa.</p>
          <ul className="mt-4 space-y-4">
            {r.shown.map((x) => {
              const s = LEVEL_STYLE[r.weights[x] ?? 0] ?? LEVEL_STYLE[0]!;
              return (
                <li key={x}>
                  <div className="flex justify-between gap-3 text-sm"><span className="font-semibold">{AXIS_LABEL[x]}</span><span className={`shrink-0 text-xs font-bold ${s.text}`}>{s.tag}</span></div>
                  <div className="mt-1.5 h-2.5 rounded-full bg-muted"><div className={`h-full rounded-full ${s.bar}`} style={{ width: `${s.pct}%` }} /></div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h2 className="font-display text-xl font-bold">Como sua oficina trabalha hoje</h2>
        <ul className="mt-4 grid gap-2">
          {r.routine.map(({ axis, label }) => {
            const Icon = axis === "custo" ? Wallet : axis === "retomada" ? FolderOpen : ClipboardCheck;
            return <li key={axis} className="flex items-center gap-3 rounded-xl bg-muted p-3 text-sm"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent"><Icon className="h-4 w-4 text-primary" /></span><span className="font-medium">{label}</span></li>;
          })}
        </ul>
        <p className="mt-4 leading-relaxed">{r.feedback}</p>
        <PriorityExample priority={r.priority} />
      </div>

      {urgent.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="font-display text-xl font-bold">Seus pontos mais urgentes</h2>
          <ul className="mt-4 space-y-3">
            {urgent.map((x) => (
              <li key={x} className="flex gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-destructive/10"><AlertTriangle className="h-4 w-4 text-destructive" /></span>
                <div><p className="font-bold">{AXIS_LABEL[x]}</p><p className="text-sm text-muted-foreground">{PATHS[x].recommendation}</p></div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-2xl bg-foreground p-5 text-background shadow-lg">
        <h2 className="font-display text-2xl font-extrabold">A culpa não é sua.</h2>
        <p className="mt-2 leading-relaxed opacity-90">Não é falta de esforço nem de mão boa no serviço. Falta um jeito organizado de cuidar do que vem antes e depois do carro entrar.</p>
        <h3 className="mt-4 font-bold">Seu próximo passo</h3>
        <ol className="mt-3 space-y-3">
          {[r.path.recommendation, r.path.videoLine].map((t, i) => (
            <li key={i} className="flex gap-3"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{i + 1}</span><span className="text-sm leading-relaxed">{t}</span></li>
          ))}
        </ol>
        <Button ref={originalCta} onClick={onVsl} className={`mt-5 ${ctaClass}`}><Play />{r.button}</Button>
      </div>

      <details className="pt-2">
        <summary className="cursor-pointer text-center text-sm font-semibold text-muted-foreground underline underline-offset-4">Revisar minhas respostas</summary>
        <ul className="mt-3 space-y-2">
          {QUESTIONS.map((q, i) => {
            const option = q.options[answers[q.id] ?? 0];
            return <li key={q.id}><Button variant="ghost" onClick={() => onEdit(i)} className="h-auto w-full justify-start whitespace-normal p-2 text-left text-sm"><Pencil className="shrink-0 text-primary" /><span><span className="text-muted-foreground">{q.title} {q.highlight}</span><br /><strong>{option ? optionLabel(q, option, r.solo) : ""}</strong></span></Button></li>;
          })}
        </ul>
      </details>
      {showFixedCta && <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-background/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur">
        <div className="mx-auto max-w-lg"><Button onClick={onVsl} className={ctaClass}><Play />{r.button}</Button></div>
      </div>}
    </section>
  );
}