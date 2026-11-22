export type Axis = "custo" | "apresentacao" | "acompanhamento" | "execucao";
export type Visual = "chat" | "conta" | "parados" | "macaneta";

export type Option = { label: string; sub?: string; icon: string; soloLabel?: string };
export type Question = {
  id: string;
  kicker?: string;
  title: string;
  highlight?: string;
  options: Option[];
  axis?: Axis;
  weights?: (number | null)[]; // peso por opção; null = sem informação
  visual?: Visual;
  grid?: boolean;
};

export const QUESTIONS: Question[] = [
  { id: "equipe", title: "Quantas pessoas trabalham hoje na sua funilaria,", highlight: "contando com você?", grid: true, options: [
    { label: "Só eu", icon: "user" }, { label: "Eu e mais", sub: "uma pessoa", icon: "users" },
    { label: "De 3 a 5", sub: "pessoas", icon: "users-round" }, { label: "6 ou mais", sub: "pessoas", icon: "building" }] },
  { id: "preco", kicker: "Mesmo cobrando um valor que você considera justo…", title: "Com que frequência você perde serviço porque", highlight: "outra oficina passou mais barato?",
    axis: "apresentacao", weights: [0, 1, 2, null], options: [
    { label: "Acontece direto", icon: "trending-down" }, { label: "Acontece de vez em quando", icon: "repeat" },
    { label: "Quase nunca", icon: "shield-check" }, { label: "Não sei por que o cliente não fechou", icon: "help" }] },
  { id: "resposta", visual: "chat", grid: true, title: "Quando chega uma mensagem dessas,", highlight: "qual é sua primeira resposta?", options: [
    { label: "Mando uma faixa", sub: "de preço por áudio", icon: "mic" }, { label: "Escrevo uma estimativa", sub: "no WhatsApp", icon: "message" },
    { label: "Peço mais fotos", sub: "ou um vídeo", icon: "camera" }, { label: "Marco uma avaliação", sub: "na oficina", icon: "calendar" }] },
  { id: "custo", visual: "conta", kicker: "Pensa no último carro que você entregou.", title: "Depois de descontar materiais e mão de obra,", highlight: "você sabe quanto sobrou?",
    axis: "custo", weights: [2, 1, 0, 0], options: [
    { label: "Tenho os valores anotados", icon: "notebook" }, { label: "Sei mais ou menos", icon: "scale" },
    { label: "Só sei quanto entrou", icon: "wallet" }, { label: "Teria que fazer a conta agora", icon: "calculator" }] },
  { id: "retomada", visual: "parados", kicker: "Quando a oficina fica mais parada…", title: "Como você encontra quem pediu orçamento e", highlight: "ainda não respondeu?",
    axis: "acompanhamento", weights: [2, 1, 0, 0], options: [
    { label: "Tenho as propostas salvas e sei com quem falar", icon: "folder" }, { label: "Procuro nas conversas do WhatsApp", icon: "search" },
    { label: "Lembro de alguns clientes de cabeça", icon: "brain" }, { label: "Costumo esperar o cliente voltar", icon: "hourglass" }] },
  { id: "dificuldade", title: "Pensando nesses atendimentos,", highlight: "o que mais atrapalha sua oficina hoje?", options: [
    { label: "Saber quanto cobrar sem apertar a margem", icon: "percent" }, { label: "Mostrar pro cliente o que o preço inclui", icon: "file" },
    { label: "Retomar orçamentos que esfriaram", icon: "snowflake" }, { label: "Acompanhar o que foi aprovado em cada carro", icon: "clipboard" }] },
  { id: "execucao", visual: "macaneta", kicker: "O carro já está na preparação e surge a dúvida:", title: "A pintura da maçaneta entrou no combinado?", highlight: "Onde você confere?",
    axis: "execucao", weights: [2, 1, 1, 0], options: [
    { label: "Na proposta aprovada ou ordem de serviço", icon: "clipboard-check" }, { label: "Na conversa com o cliente", icon: "message" },
    { label: "Pergunto pra quem recebeu o carro", soloLabel: "Tento lembrar do que conversei com ele", icon: "brain" },
    { label: "Preciso confirmar de novo com o cliente", icon: "phone" }] },
  { id: "crescimento", kicker: "Se começassem a entrar mais carros na semana que vem…", title: "Qual parte da oficina você precisaria", highlight: "organizar primeiro pra dar conta?", options: [
    { label: "Preparar os orçamentos mais rápido", icon: "zap" }, { label: "Saber a etapa de cada carro", icon: "car" },
    { label: "Passar o serviço aprovado pra quem vai executar", soloLabel: "Organizar a ordem dos serviços do dia", icon: "list" },
    { label: "Minha rotina já dá conta de mais carros", icon: "thumbs-up" }] },
  { id: "interesse", title: "Se você pudesse calcular o serviço, mostrar à cliente o que entrou no preço e guardar o combinado até a entrega,", highlight: "isso faria sentido na sua oficina?", options: [
    { label: "Sim, eu usaria no dia a dia", icon: "check" }, { label: "Quero ver como funciona num carro de verdade", icon: "play" },
    { label: "Hoje já faço isso e quero comparar", icon: "scale" }, { label: "Hoje não é uma prioridade", icon: "clock" }] },
];

export type Answers = { [k: string]: number | undefined; equipe?: number; preco?: number; resposta?: number; dificuldade?: number; crescimento?: number; interesse?: number };

export const AXES: Axis[] = ["custo", "apresentacao", "acompanhamento", "execucao"];
export const PRIORITY_AXIS: Axis[] = ["custo", "apresentacao", "acompanhamento", "execucao"];

export const AXIS_LABEL: Record<Axis, string> = {
  custo: "Precificação",
  apresentacao: "Apresentação do preço",
  acompanhamento: "Retorno dos orçamentos",
  execucao: "Execução do combinado",
};
export const LEVEL = ["Merece atenção", "Pode melhorar", "Organizado"] as const;

export const PATHS: Record<Axis, { label: string; title: string; recommendation: string; button: string; videoLine: string }> = {
  custo: {
    label: "Margem",
    title: "Quanto vai sobrar do próximo serviço que você orçar?",
    recommendation: "Antes de passar o preço, junte o custo dos materiais e da mão de obra. Assim você enxerga quanto daquele valor ainda fica na oficina.",
    button: "Quero acertar o preço do meu próximo serviço",
    videoLine: "Veja onde conferir o que sobra antes de enviar o orçamento.",
  },
  apresentacao: {
    label: "Explicar o preço",
    title: "Quando o cliente compara dois preços, ele consegue ver o que o seu inclui?",
    recommendation: "Mostre a peça, o reparo e a pintura junto do valor. O cliente consegue comparar o serviço que cada oficina está oferecendo.",
    button: "Quero mostrar o que meu preço inclui",
    videoLine: "Veja o orçamento pela tela de quem recebe a proposta no WhatsApp.",
  },
  acompanhamento: {
    label: "Retomar orçamentos",
    title: "Quem pediu orçamento essa semana e ainda não te respondeu?",
    recommendation: "Abra a proposta antes de chamar o cliente. Você consegue retomar a conversa já falando do carro, do serviço e do valor que passou.",
    button: "Quero retomar meus orçamentos",
    videoLine: "Veja como encontrar uma proposta e retomar a conversa com o cliente.",
  },
  execucao: {
    label: "Acompanhar o aprovado",
    title: "Na hora de preparar o carro, onde você confere o que entrou no serviço?",
    recommendation: "Deixe a peça e o serviço aprovado registrados na ordem de serviço. Quando surgir uma dúvida, o combinado está ali para consultar.",
    button: "Quero organizar os serviços aprovados",
    videoLine: "Veja onde conferir o combinado antes de executar o serviço.",
  },
};

export const MARGIN_EXAMPLE = { service: 850, materials: 230, labor: 300 };
export function serviceRemainder(service: number, materials: number, labor: number) {
  return service - materials - labor;
}

const ROUTINE_LABELS = {
  custo: ["Custos anotados", "Custos estimados", "Registra só o valor recebido", "Custos ainda por calcular"],
  retomada: ["Propostas salvas", "Busca nas conversas", "Lembra de alguns clientes", "Espera o cliente voltar"],
  execucao: ["Consulta a ordem de serviço", "Consulta a conversa", "Consulta quem recebeu o carro", "Confirma de novo com o cliente"],
};

export function optionLabel(q: Question, o: Option, solo: boolean) {
  return solo && o.soloLabel ? o.soloLabel : o.label;
}

export function isComplete(a: Answers) {
  return QUESTIONS.every((q) => typeof a[q.id] === "number");
}

export type Result = {
  weights: Partial<Record<Axis, number>>;
  shown: Axis[];
  actions: Axis[];
  priority: Axis;
  priorityOrganized: boolean;
  allOrganized: boolean;
  headline: string;
  feedback: string;
  goal: string;
  solo: boolean;
  lowInterest: boolean;
  profile: string;
  path: (typeof PATHS)[Axis];
  button: string;
  routine: { axis: "custo" | "retomada" | "execucao"; label: string }[];
};

export function computeResult(a: Answers): Result {
  const weights: Partial<Record<Axis, number>> = {};
  for (const q of QUESTIONS) {
    if (!q.axis || !q.weights) continue;
    const w = q.weights[a[q.id] ?? -1];
    if (typeof w === "number") weights[q.axis] = w;
  }
  const shown = AXES.filter((x) => typeof weights[x] === "number");
  const priority = PRIORITY_AXIS[a.dificuldade ?? 0] ?? "custo";
  const priorityOrganized = weights[priority] === 2;
  const allOrganized = shown.length > 0 && shown.every((x) => weights[x] === 2);
  const actions = [priority];
  const solo = (a.equipe ?? 0) === 0;
  const path = PATHS[priority];
  const routine = (["custo", "retomada", "execucao"] as const).map((axis) => ({
    axis,
    label: axis === "execucao" && a["execucao"] === 2 && solo
      ? "Tenta lembrar do combinado"
      : ROUTINE_LABELS[axis][a[axis] ?? 0] ?? ROUTINE_LABELS[axis][0] ?? "",
  }));
  let habit: string;
  if (a["retomada"] === 0 && a["execucao"] === 0) habit = "Você já guarda suas propostas e sabe onde conferir o combinado.";
  else if (a["custo"] === 0) habit = "Você já anota os custos.";
  else if (a["retomada"] === 0) habit = "Você já guarda suas propostas.";
  else if (a["execucao"] === 0) habit = "Você já consulta o combinado na proposta aprovada ou na ordem de serviço.";
  else if (a["retomada"] === 1) habit = "Você busca os orçamentos nas conversas do WhatsApp.";
  else if (a["execucao"] === 1) habit = "Você consulta a conversa com o cliente para conferir o combinado.";
  else if (a["custo"] === 1) habit = "Você estima os custos do serviço.";
  else if (a["custo"] === 2) habit = "Você acompanha o valor que entrou pelo serviço.";
  else habit = "Você contou que precisa fazer a conta dos custos para conferir a sobra.";
  const next: Record<Axis, string> = {
    custo: "O ponto que você quer acertar agora é quanto cobrar pelo serviço.",
    apresentacao: "Seu foco agora é mostrar ao cliente o que o preço inclui.",
    acompanhamento: "Seu foco agora é retomar os orçamentos que ainda não tiveram resposta.",
    execucao: "Seu foco agora é acompanhar o que foi aprovado em cada carro.",
  };
  const feedback = priority === "custo" && a["custo"] === 0
    ? "Você já anota os custos. Seu próximo passo é conferir a sobra antes de fechar o preço."
    : `${habit} ${next[priority]}`;
  const button = a.interesse === 2 ? "Comparar com a rotina da minha oficina"
    : a.interesse === 3 ? "Ver a demonstração" : path.button;
  return { weights, shown, actions, priority, priorityOrganized, allOrganized,
    headline: path.title, feedback, goal: "", solo, lowInterest: a.interesse === 3,
    profile: solo ? "Funileiro autônomo" : "Oficina com equipe", path, button, routine };
}
