import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Check, MessageSquareText } from "lucide-react";

export const Route = createFileRoute("/planos")({
  head: () => ({
    meta: [
      { title: "Planos | FunilaBot" },
      { name: "description", content: "Conheça os planos do FunilaBot para a sua funilaria: orçamento, acompanhamento e entrega sem dor de cabeça." },
      { property: "og:title", content: "Planos do FunilaBot" },
      { property: "og:description", content: "Escolha o plano ideal para a sua funilaria." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Planos,
});

// [PRECOS] — valores e link de WhatsApp da empresa aguardam confirmação.
const WHATSAPP_EMPRESA = ""; // ex.: "5511987654321"

const PLANS = [
  {
    name: "Começar",
    desc: "Pra quem trabalha sozinho e quer parar de fazer orçamento no chute.",
    feats: ["Orçamentos com conta interna", "PDF pronto pro cliente", "Registro de fotos do serviço"],
  },
  {
    name: "Oficina",
    desc: "Pra equipe pequena que precisa acompanhar cada carro sem planilha.",
    feats: ["Tudo do Começar", "Etapas do serviço em tempo real", "Lembretes de clientes sem resposta"],
    highlight: true,
  },
  {
    name: "Completo",
    desc: "Pra oficina cheia que quer medir lucro e não perder nenhum retorno.",
    feats: ["Tudo do Oficina", "Relatório de lucro por serviço", "Suporte prioritário"],
  },
];

function Planos() {
  const cta = WHATSAPP_EMPRESA ? `https://wa.me/${WHATSAPP_EMPRESA}` : null;
  return (
    <div className="min-h-dvh bg-background font-sans text-foreground">
      <header className="sticky top-0 z-10 bg-background/95 px-4 backdrop-blur">
        <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-3">
          <Link to="/" aria-label="Voltar" className="-ml-1 rounded-full p-2 hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <span className="font-display text-xl font-extrabold tracking-tight">
            Funila<span className="text-primary">Bot</span>
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 pb-16 pt-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Planos</p>
        <h1 className="mt-1 font-display text-3xl font-extrabold leading-tight">Escolha como quer rodar sua oficina</h1>
        <p className="mt-3 text-lg text-muted-foreground">Os valores e condições saem em breve. Deixe seu interesse e a gente te chama no WhatsApp.</p>

        <div id="planos" className="mt-6 scroll-mt-20 space-y-4">
          {PLANS.map((p) => (
            <section key={p.name} className={`rounded-2xl border-2 bg-card p-5 shadow-sm ${p.highlight ? "border-primary" : "border-border"}`}>
              <div className="flex items-center justify-between gap-2">
                <h2 className="font-display text-2xl font-bold">{p.name}</h2>
                {p.highlight && <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground">Mais escolhido</span>}
              </div>
              <p className="mt-1 text-muted-foreground">{p.desc}</p>
              <ul className="mt-3 space-y-2">
                {p.feats.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 font-display text-xl font-bold text-muted-foreground">Valor em breve</p>
            </section>
          ))}
        </div>

        {cta ? (
          <a href={cta} target="_blank" rel="noreferrer" className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-4 font-display text-xl font-bold text-primary-foreground shadow-press active:translate-y-0.5">
            <MessageSquareText className="h-5 w-5" /> Falar no WhatsApp
          </a>
        ) : (
          <p className="mt-6 rounded-xl bg-accent p-4 text-center text-sm font-semibold text-muted-foreground">
            Quer ser avisado quando os planos abrirem? Refaça o diagnóstico e deixe seu WhatsApp no final.
          </p>
        )}
      </main>
    </div>
  );
}
