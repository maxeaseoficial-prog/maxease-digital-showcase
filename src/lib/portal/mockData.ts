// Mock data for the Client Portal. Ready to be swapped for a real API later.

export type ContentStatus =
  | "Planejado"
  | "Em Produção"
  | "Aguardando Aprovação"
  | "Aprovado"
  | "Agendado"
  | "Publicado"
  | "Solicitou Alteração";

export type Platform = "Instagram" | "Facebook" | "TikTok";

export type CalendarKind = "Postagem" | "Gravação";

export interface CalendarContent {
  id: string;
  title: string;
  caption: string;
  script: string;
  platforms: Platform[];
  date: string; // ISO
  time: string; // HH:mm
  status: ContentStatus;
  kind?: CalendarKind;
  tagColor?: string; // hex color e.g. #1428FF
  scriptFile?: { name: string; dataUrl: string };
}

export interface ScriptFile {
  name: string;
  size: string;
  url: string;
}

export interface Recording {
  id: string;
  date: string;
  time: string;
  location: string;
  estimated: string;
  status: "Confirmada" | "A Confirmar" | "Reagendada";
  videos: string[];
  objective: string;
  scriptSummary: string;
  notes: string;
  scripts?: ScriptFile[];
  team?: string[];
  equipment?: string[];
}

export interface Report {
  id: string;
  name: string;
  period: string;
  date: string;
  highlights: { label: string; value: string }[];
  summary: string;
  folder?: string;
  fileName?: string;
  fileDataUrl?: string;
}

export interface Approval {
  id: string;
  title: string;
  type: "Reels" | "Post" | "Story" | "Roteiro";
  caption: string;
  script: string;
  date: string;
  status: ContentStatus;
  history: { at: string; message: string }[];
}

export interface Notice {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
}

export interface ClientInfo {
  name: string;
  company: string;
  activeProject: string;
  monthlyContent: number;
  publishedContent: number;
  pendingApproval: number;
  nextRecording: { date: string; time: string };
  lastReport: string;
  activeCampaign: string;
  nextPost: { title: string; date: string; time: string };
  overallStatus: string;
}

export const mockClient: ClientInfo = {
  name: "Academia For Action",
  company: "For Action",
  activeProject: "Gestão de Redes Sociais",
  monthlyContent: 16,
  publishedContent: 8,
  pendingApproval: 3,
  nextRecording: { date: "28/07/2026", time: "09:00" },
  lastReport: "Julho 2026",
  activeCampaign: "Instagram Orgânico",
  nextPost: { title: "Treino de Costas", date: "25/07", time: "18:00" },
  overallStatus: "Em andamento",
};

export const mockActivities = [
  { id: "a1", text: "Calendário de Agosto disponível", date: "22/07/2026" },
  { id: "a2", text: "Novo roteiro enviado para aprovação", date: "21/07/2026" },
  { id: "a3", text: "Relatório de Julho publicado", date: "20/07/2026" },
  { id: "a4", text: "Próxima gravação confirmada", date: "19/07/2026" },
];

export const mockCalendar: CalendarContent[] = [
  {
    id: "c1",
    title: "Treino de Costas",
    caption: "Ative sua região dorsal com esses 3 movimentos essenciais. Salve para o próximo treino!",
    script: "Abertura energética • Demonstração dos 3 exercícios • CTA final para agendar aula experimental.",
    platforms: ["Instagram", "TikTok"],
    date: "2026-07-25",
    time: "18:00",
    status: "Aguardando Aprovação",
  },
  {
    id: "c2",
    title: "Depoimento Aluna Marina",
    caption: "A Marina perdeu 8kg em 4 meses treinando com a gente. Confere o depoimento dela!",
    script: "Corte com música • Fala natural da aluna • Cards com resultados • Encerramento com CTA.",
    platforms: ["Instagram", "Facebook"],
    date: "2026-07-27",
    time: "12:00",
    status: "Aprovado",
  },
  {
    id: "c3",
    title: "Bastidores Gravação",
    caption: "Um dia por trás das câmeras da For Action.",
    script: "Timelapse do set • Entrevistas rápidas • Encerramento com identidade visual.",
    platforms: ["Instagram"],
    date: "2026-07-29",
    time: "20:00",
    status: "Em Produção",
  },
  {
    id: "c4",
    title: "Dica Rápida: Alongamento",
    caption: "3 alongamentos para fazer antes de qualquer treino.",
    script: "Intro • 3 alongamentos demonstrados • CTA para salvar.",
    platforms: ["Instagram", "TikTok", "Facebook"],
    date: "2026-07-30",
    time: "07:30",
    status: "Planejado",
  },
  {
    id: "c5",
    title: "Novidade Modalidade",
    caption: "Chegou o funcional na For Action. Vem conferir!",
    script: "Abertura impactante • Apresentação da nova modalidade • CTA para matrícula.",
    platforms: ["Instagram", "Facebook"],
    date: "2026-08-02",
    time: "19:00",
    status: "Agendado",
  },
  {
    id: "c6",
    title: "Post Motivacional",
    caption: "Comece a semana com foco. Sua evolução depende da constância.",
    script: "Card motivacional estático.",
    platforms: ["Instagram"],
    date: "2026-07-20",
    time: "07:00",
    status: "Publicado",
  },
];

export const mockRecordings: Recording[] = [
  {
    id: "r1",
    date: "28/07/2026",
    time: "09:00",
    location: "For Action • Estúdio Principal",
    estimated: "3 horas",
    status: "Confirmada",
    videos: ["Treino de Costas", "Dica de Alongamento", "Depoimento Marina"],
    objective: "Gerar conteúdo para a segunda quinzena de julho e primeira de agosto.",
    scriptSummary: "3 blocos de gravação com transições dinâmicas e closes de execução.",
    notes: "Levar figurino oficial da academia. Iluminação preparada às 08:30.",
    scripts: [
      { name: "Roteiro Treino de Costas.pdf", size: "1.2 MB", url: "#" },
      { name: "Roteiro Alongamento.pdf", size: "820 KB", url: "#" },
      { name: "Roteiro Depoimento Marina.pdf", size: "1.5 MB", url: "#" },
    ],
    team: ["Diretor: Henrique Castro", "Cinegrafista: Lucas M.", "Assistente: Bruna R."],
    equipment: ["Sony FX3", "Lente 24-70mm", "Kit de iluminação Aputure", "Gimbal DJI RS3"],
  },
  {
    id: "r2",
    date: "05/08/2026",
    time: "14:00",
    location: "For Action • Área Externa",
    estimated: "2 horas",
    status: "A Confirmar",
    videos: ["Aula ao ar livre", "Bastidores"],
    objective: "Reforçar conteúdo institucional e experiência de alunos.",
    scriptSummary: "Aula demonstrativa + entrevistas rápidas com 2 alunos.",
    notes: "Confirmar disponibilidade dos alunos convidados até 30/07.",
    scripts: [
      { name: "Roteiro Aula ao Ar Livre.pdf", size: "980 KB", url: "#" },
      { name: "Perguntas Entrevistas.pdf", size: "410 KB", url: "#" },
    ],
    team: ["Diretor: Henrique Castro", "Cinegrafista: Lucas M."],
    equipment: ["Sony FX3", "Lente 35mm", "Estabilizador"],
  },
];

export const mockReports: Report[] = [
  {
    id: "jul-2026",
    name: "Relatório de Marketing",
    period: "01/07 a 31/07",
    date: "Julho 2026",
    highlights: [
      { label: "Alcance", value: "184.320" },
      { label: "Engajamento", value: "+38%" },
      { label: "Novos seguidores", value: "612" },
      { label: "Conteúdos publicados", value: "18" },
    ],
    summary:
      "Mês com crescimento consistente no Instagram, destaque para o Reels da aluna Marina que atingiu 62 mil visualizações.",
  },
  {
    id: "ago-2026",
    name: "Relatório de Marketing",
    period: "01/08 a 31/08",
    date: "Agosto 2026",
    highlights: [
      { label: "Alcance", value: "—" },
      { label: "Engajamento", value: "—" },
      { label: "Novos seguidores", value: "—" },
      { label: "Conteúdos publicados", value: "—" },
    ],
    summary: "Relatório em consolidação. Será publicado no início de setembro.",
  },
  {
    id: "set-2026",
    name: "Relatório de Marketing",
    period: "01/09 a 30/09",
    date: "Setembro 2026",
    highlights: [
      { label: "Alcance", value: "—" },
      { label: "Engajamento", value: "—" },
      { label: "Novos seguidores", value: "—" },
      { label: "Conteúdos publicados", value: "—" },
    ],
    summary: "Aguardando encerramento do mês.",
  },
];

export const mockApprovals: Approval[] = [
  {
    id: "ap1",
    title: "Treino de Costas",
    type: "Reels",
    caption: "Ative sua região dorsal com esses 3 movimentos essenciais. Salve para o próximo treino!",
    script:
      "1. Abertura energética com corte rápido.\n2. Demonstração do exercício 1 (remada curvada).\n3. Exercício 2 (puxada frontal).\n4. Exercício 3 (pull-over).\n5. CTA final: 'Agende sua aula experimental'.",
    date: "25/07/2026",
    status: "Aguardando Aprovação",
    history: [{ at: "21/07/2026 14:20", message: "Roteiro enviado para aprovação." }],
  },
  {
    id: "ap2",
    title: "Depoimento Aluna Marina",
    type: "Reels",
    caption: "A Marina perdeu 8kg em 4 meses treinando com a gente. Confere o depoimento dela!",
    script:
      "Abre com música energética. Marina conta a jornada. Cards animados com resultados. Encerramento com logo e CTA.",
    date: "27/07/2026",
    status: "Aprovado",
    history: [
      { at: "18/07/2026 10:00", message: "Roteiro enviado." },
      { at: "18/07/2026 16:42", message: "Cliente aprovou o conteúdo." },
    ],
  },
  {
    id: "ap3",
    title: "Post Novidade Modalidade",
    type: "Post",
    caption: "Chegou o funcional na For Action. Vem conferir!",
    script: "Card com foto do novo espaço + copy institucional.",
    date: "02/08/2026",
    status: "Aguardando Aprovação",
    history: [{ at: "22/07/2026 09:15", message: "Roteiro enviado para aprovação." }],
  },
];

export const mockNotices: Notice[] = [
  {
    id: "n1",
    title: "Gravação reagendada",
    message: "Sua gravação foi reagendada para quinta-feira, 28/07 às 09:00.",
    date: "22/07/2026",
    read: false,
  },
  {
    id: "n2",
    title: "Calendário de Agosto disponível",
    message: "O calendário de conteúdo de agosto já está disponível para visualização.",
    date: "21/07/2026",
    read: false,
  },
  {
    id: "n3",
    title: "Conteúdos aguardando aprovação",
    message: "Existem 2 conteúdos aguardando sua aprovação no portal.",
    date: "20/07/2026",
    read: true,
  },
  {
    id: "n4",
    title: "Novo relatório publicado",
    message: "O relatório de Julho de 2026 já está disponível na aba Relatórios.",
    date: "20/07/2026",
    read: true,
  },
];

// Corporate, soft badge palette (Notion / Linear style)
export const STATUS_STYLES: Record<ContentStatus, string> = {
  "Planejado": "bg-slate-50 text-slate-600 border-slate-200",
  "Em Produção": "bg-amber-50 text-amber-700 border-amber-200",
  "Aguardando Aprovação": "bg-orange-50 text-orange-700 border-orange-200",
  "Aprovado": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Agendado": "bg-sky-50 text-sky-700 border-sky-200",
  "Publicado": "bg-violet-50 text-violet-700 border-violet-200",
  "Solicitou Alteração": "bg-rose-50 text-rose-700 border-rose-200",
};

// Solid dot colors for indicators (calendar chips, timelines, etc.)
export const STATUS_DOT: Record<ContentStatus, string> = {
  "Planejado": "bg-slate-400",
  "Em Produção": "bg-amber-500",
  "Aguardando Aprovação": "bg-orange-500",
  "Aprovado": "bg-emerald-500",
  "Agendado": "bg-sky-500",
  "Publicado": "bg-violet-500",
  "Solicitou Alteração": "bg-rose-500",
};
