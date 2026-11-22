import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { queryOptions, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, ExternalLink, LogOut, MessageSquareText, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AXIS_LABEL, type Axis } from "@/lib/funil";
import { listLeads, type LeadRow } from "@/lib/leads.functions";
import { supabase } from "@/integrations/supabase/client";

const leadsQueryOptions = queryOptions({
  queryKey: ["leads"],
  queryFn: () => listLeads(),
});

export const Route = createFileRoute("/_authenticated/leads")({
  head: () => ({
    meta: [
      { title: "Leads | FunilaBot" },
      { name: "description", content: "Lista interna de leads capturados pelo diagnóstico do FunilaBot." },
      { property: "og:title", content: "Leads do FunilaBot" },
      { property: "og:description", content: "Quem pediu a demonstração e o que o diagnóstico apontou." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(leadsQueryOptions),
  component: LeadsPage,
});

function displayWhats(digits: string) {
  const d = digits.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function when(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function priorityLabel(p: string) {
  return (AXIS_LABEL as Partial<Record<Axis, string>>)[p as Axis] ?? (p || "Sem prioridade");
}

function LeadCard({ lead }: { lead: LeadRow }) {
  const chat = `https://wa.me/55${lead.whatsapp.replace(/\D/g, "")}`;
  return (
    <li className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <a
            href={chat}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 font-display text-xl font-bold text-primary hover:underline"
          >
            {displayWhats(lead.whatsapp)}
            <ExternalLink className="h-4 w-4 shrink-0" />
          </a>
          <p className="mt-0.5 text-sm text-muted-foreground">{when(lead.createdAt)}</p>
        </div>
        <span className="shrink-0 rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-primary">
          {priorityLabel(lead.priority)}
        </span>
      </div>
      {lead.headline && <p className="mt-3 leading-snug">{lead.headline}</p>}
      <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-muted-foreground">
        {lead.solo && <span className="rounded-full bg-muted px-2 py-0.5">Trabalha sozinho</span>}
        {lead.lowInterest && <span className="rounded-full bg-muted px-2 py-0.5">Menos interessado</span>}
      </div>
    </li>
  );
}

function LeadsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data } = useSuspenseQuery(leadsQueryOptions);
  const [leaving, setLeaving] = useState(false);

  async function leave() {
    setLeaving(true);
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (leaving) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-background font-sans text-muted-foreground">
        <p>Saindo…</p>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-background font-sans text-foreground">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 px-4 backdrop-blur">
        <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-3">
          <Link to="/" aria-label="Voltar ao início" className="-ml-1 rounded-full p-2 hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <span className="font-display text-xl font-extrabold tracking-tight">
            Funila<span className="text-primary">Bot</span>
          </span>
          <Button variant="ghost" onClick={leave} className="ml-auto h-auto gap-1.5 px-2 py-1.5 text-sm">
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 pb-16 pt-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Área interna</p>
        <h1 className="mt-1 font-display text-3xl font-extrabold leading-tight">Leads do diagnóstico</h1>

        {!data.ok && data.error === "no-access" && (
          <div className="mt-6 rounded-2xl border-2 border-warning bg-accent p-5">
            <p className="flex items-center gap-2 font-display text-xl font-bold">
              <ShieldAlert className="h-5 w-5 text-warning" />
              Esta conta ainda não tem acesso
            </p>
            <p className="mt-2 text-muted-foreground">
              Você entrou, mas não está marcado como administrador. Peça a liberação de quem cuida do FunilaBot.
            </p>
          </div>
        )}

        {!data.ok && data.error === "read-failed" && (
          <div className="mt-6 rounded-2xl border-2 border-warning bg-accent p-5">
            <p className="font-display text-xl font-bold">Não consegui carregar a lista agora</p>
            <p className="mt-2 text-muted-foreground">Tente recarregar a página em alguns instantes.</p>
          </div>
        )}

        {data.ok && (
          <>
            <p className="mt-3 text-lg text-muted-foreground">
              {data.leads.length === 0
                ? "Ninguém deixou o WhatsApp ainda. Assim que alguém terminar o diagnóstico, aparece aqui."
                : `${data.leads.length} ${data.leads.length === 1 ? "pessoa deixou" : "pessoas deixaram"} o WhatsApp pelo diagnóstico.`}
            </p>
            <ul className="mt-5 space-y-3">
              {data.leads.map((lead) => <LeadCard key={lead.id} lead={lead} />)}
            </ul>
          </>
        )}

        <p className="mt-8 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
          <MessageSquareText className="h-3.5 w-3.5" />
          Toque no número para abrir a conversa no WhatsApp.
        </p>
      </main>
    </div>
  );
}
