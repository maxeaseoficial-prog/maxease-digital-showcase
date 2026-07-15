import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ArrowRight, ArrowLeft, Video, Globe, Cpu, Megaphone, Check, Send } from "lucide-react";

/* ---------------- Types ---------------- */
type ServiceKey = "audiovisual" | "sites" | "sistemas" | "criativos";

type FormData = Record<string, string>;

type QuoteContextType = {
  open: () => void;
  close: () => void;
  isOpen: boolean;
};

const QuoteContext = createContext<QuoteContextType | null>(null);

export function useQuoteModal() {
  const ctx = useContext(QuoteContext);
  if (!ctx) throw new Error("useQuoteModal must be used within QuoteModalProvider");
  return ctx;
}

/* ---------------- Config ---------------- */
const WHATSAPP_NUMBER = "5542988377640";

const services: {
  key: ServiceKey;
  title: string;
  icon: typeof Video;
  desc: string;
}[] = [
  { key: "audiovisual", title: "Produção Audiovisual", icon: Video, desc: "Vídeos institucionais, comerciais e reels." },
  { key: "sites", title: "Sites Profissionais", icon: Globe, desc: "Landing pages, institucionais e catálogos." },
  { key: "sistemas", title: "Sistemas Personalizados", icon: Cpu, desc: "Sistemas sob medida para o seu negócio." },
  { key: "criativos", title: "Criativos para Campanhas", icon: Megaphone, desc: "Vídeos e criativos para tráfego pago." },
];


type FieldType = "text" | "textarea" | "select" | "radio";
type FieldDef = {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: string[];
  required?: boolean;
};

type SectionDef = { title: string; fields: FieldDef[] };

const commonInfo = (extra: FieldDef[] = []): FieldDef[] => [
  { name: "nome", label: "Nome", type: "text", required: true, placeholder: "Seu nome completo" },
  { name: "empresa", label: "Empresa", type: "text", required: true, placeholder: "Nome da sua empresa" },
  { name: "instagram", label: "Instagram (@)", type: "text", required: true, placeholder: "@suaempresa" },
  ...extra,
];

const schemas: Record<ServiceKey, SectionDef[]> = {
  audiovisual: [
    { title: "Informações", fields: commonInfo([{ name: "cidade", label: "Cidade", type: "text", required: true, placeholder: "Sua cidade" }]) },
    {
      title: "Projeto",
      fields: [
        { name: "tipo", label: "Tipo de vídeo", type: "radio", required: true, options: ["Institucional", "Comercial", "Reels", "Evento", "Outro"] },
        { name: "quantidade", label: "Quantidade de vídeos", type: "text", required: true, placeholder: "Ex.: 4" },
        { name: "tempo", label: "Tempo médio dos vídeos", type: "text", required: true, placeholder: "Ex.: 4 vídeos de até 30s e 2 vídeos de aproximadamente 1 minuto." },
        { name: "prazo", label: "Prazo desejado", type: "text", required: true, placeholder: "Ex.: 30 dias" },
        { name: "descricao", label: "Conte um pouco sobre o projeto", type: "textarea", required: true, placeholder: "Descreva seu projeto, objetivo, referências ou qualquer informação importante." },
      ],
    },
  ],
  sites: [
    { title: "Informações", fields: commonInfo() },
    {
      title: "Projeto",
      fields: [
        { name: "tipo", label: "Tipo de site", type: "radio", required: true, options: ["Landing Page", "Institucional", "Catálogo", "Outro"] },
        { name: "dominio", label: "Já possui domínio?", type: "radio", required: true, options: ["Sim", "Não"] },
        { name: "identidade", label: "Já possui identidade visual?", type: "radio", required: true, options: ["Sim", "Não"] },
        { name: "prazo", label: "Prazo desejado", type: "text", required: true, placeholder: "Ex.: 30 dias" },
        { name: "descricao", label: "Descreva seu projeto", type: "textarea", required: true, placeholder: "Descreva o projeto, objetivo e referências." },
      ],
    },
  ],
  sistemas: [
    { title: "Informações", fields: commonInfo() },
    {
      title: "Projeto",
      fields: [
        { name: "sistema", label: "Qual sistema você precisa?", type: "text", required: true, placeholder: "Ex.: Sistema de gestão de clientes" },
        { name: "usuarios", label: "Quantas pessoas utilizarão o sistema?", type: "text", required: true, placeholder: "Ex.: 5 usuários" },
        { name: "prazo", label: "Prazo desejado", type: "text", required: true, placeholder: "Ex.: 60 dias" },
        { name: "descricao", label: "Explique como gostaria que o sistema funcionasse", type: "textarea", required: true, placeholder: "Descreva o funcionamento desejado." },
      ],
    },
  ],
  criativos: [
    { title: "Informações", fields: commonInfo() },
    {
      title: "Projeto",
      fields: [
        { name: "quantidade", label: "Quantidade de criativos", type: "text", required: true, placeholder: "Ex.: 10 criativos" },
        { name: "formato", label: "Formato", type: "radio", required: true, options: ["Vertical", "Horizontal", "Ambos"] },
        { name: "prazo", label: "Prazo desejado", type: "text", required: true, placeholder: "Ex.: 15 dias" },
        { name: "descricao", label: "Descreva sua campanha ou objetivo", type: "textarea", required: true, placeholder: "Descreva a campanha, público-alvo e objetivo." },
      ],
    },
  ],
};

const serviceLabels: Record<ServiceKey, string> = {
  audiovisual: "Produção Audiovisual",
  sites: "Sites Profissionais",
  sistemas: "Sistemas Personalizados",
  criativos: "Criativos para Campanhas",
};

/* ---------------- WhatsApp message builders ---------------- */
function buildMessage(service: ServiceKey, data: FormData): string {
  const serviceEmoji: Record<ServiceKey, string> = {
    audiovisual: "\u{1F3A5}",
    sites: "\u{1F310}",
    sistemas: "\u{1F4BB}",
    criativos: "\u{1F4E2}",
  };

  const E = {
    wave: "\u{1F44B}",
    pin: "\u{1F4CC}",
    person: "\u{1F464}",
    building: "\u{1F3E2}",
    camera: "\u{1F4F7}",
    location: "\u{1F4CD}",
    clapper: "\u{1F3AC}",
    numbers: "\u{1F522}",
    clock: "\u{23F1}\u{FE0F}",
    calendar: "\u{1F4C5}",
    memo: "\u{1F4DD}",
    globe: "\u{1F310}",
    link: "\u{1F517}",
    art: "\u{1F3A8}",
    computer: "\u{1F4BB}",
    users: "\u{1F465}",
    ruler: "\u{1F4D0}",
  };

  const header = `Olá Henrique! ${E.wave}\n\nGostaria de solicitar um orçamento.\n\n${E.pin} *Serviço:*\n${serviceEmoji[service]} ${serviceLabels[service]}\n\n${E.person} *Nome:*\n${data.nome}\n\n${E.building} *Empresa:*\n${data.empresa}\n\n${E.camera} *Instagram:*\n${data.instagram}`;

  let body = "";
  if (service === "audiovisual") {
    body = `\n\n${E.location} *Cidade:*\n${data.cidade}\n\n${E.clapper} *Tipo de vídeo:*\n${data.tipo}\n\n${E.numbers} *Quantidade:*\n${data.quantidade}\n\n${E.clock} *Tempo médio:*\n${data.tempo}\n\n${E.calendar} *Prazo:*\n${data.prazo}\n\n${E.memo} *Descrição:*\n${data.descricao}`;
  } else if (service === "sites") {
    body = `\n\n${E.globe} *Tipo de site:*\n${data.tipo}\n\n${E.link} *Já possui domínio?*\n${data.dominio}\n\n${E.art} *Já possui identidade visual?*\n${data.identidade}\n\n${E.calendar} *Prazo:*\n${data.prazo}\n\n${E.memo} *Descrição:*\n${data.descricao}`;
  } else if (service === "sistemas") {
    body = `\n\n${E.computer} *Sistema desejado:*\n${data.sistema}\n\n${E.users} *Usuários:*\n${data.usuarios}\n\n${E.calendar} *Prazo:*\n${data.prazo}\n\n${E.memo} *Descrição:*\n${data.descricao}`;
  } else if (service === "criativos") {
    body = `\n\n${E.numbers} *Quantidade:*\n${data.quantidade}\n\n${E.ruler} *Formato:*\n${data.formato}\n\n${E.calendar} *Prazo:*\n${data.prazo}\n\n${E.memo} *Descrição:*\n${data.descricao}`;
  }




  return `${header}${body}\n\nAguardo seu retorno!`;
}

/* ---------------- Provider ---------------- */
export function QuoteModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo(() => ({ open, close, isOpen }), [open, close, isOpen]);

  return (
    <QuoteContext.Provider value={value}>
      {children}
      <QuoteModal isOpen={isOpen} onClose={close} />
    </QuoteContext.Provider>
  );
}

/* ---------------- Modal ---------------- */
function QuoteModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [service, setService] = useState<ServiceKey | null>(null);
  const [data, setData] = useState<FormData>({});
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const totalSteps = 3;
  const progress = ((step + 1) / totalSteps) * 100;

  const reset = () => {
    setStep(0);
    setService(null);
    setData({});
    setErrors({});
  };

  const handleClose = () => {
    onClose();
    setTimeout(reset, 300);
  };

  const currentFields = useMemo<FieldDef[]>(() => {
    if (!service) return [];
    return schemas[service].flatMap((s) => s.fields);
  }, [service]);

  const validateStep2 = () => {
    const newErrors: Record<string, boolean> = {};
    currentFields.forEach((f) => {
      if (f.required && !data[f.name]?.trim()) newErrors[f.name] = true;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const canContinueStep1 = !!service;
  const canContinueStep2 = currentFields.every((f) => !f.required || data[f.name]?.trim());

  const handleNext = () => {
    if (step === 0 && !canContinueStep1) return;
    if (step === 1 && !validateStep2()) return;
    setStep((s) => s + 1);
  };

  const handleBack = () => setStep((s) => Math.max(0, s - 1));

  const handleSend = () => {
    if (!service) return;
    const msg = buildMessage(service, data);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    handleClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
        >
          {/* backdrop */}
          <div
            onClick={handleClose}
            className="absolute inset-0 bg-brand-deep/70 backdrop-blur-md"
          />

          {/* modal */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl bg-white shadow-[0_40px_120px_-20px_rgba(10,15,45,0.6)] ring-1 ring-black/5 flex flex-col"
          >
            {/* Header */}
            <div className="relative px-6 sm:px-8 pt-6 pb-4 border-b border-slate-100">
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-brand-blue font-semibold">
                <span>Solicitar Orçamento</span>
              </div>
              <div className="text-xs text-slate-500 mt-2">
                Etapa {step + 1} de {totalSteps}
              </div>
              {/* Progress bar */}
              <div className="mt-3 h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <motion.div
                  className="h-full bg-brand-gradient rounded-full"
                  initial={false}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 sm:px-8 py-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {step === 0 && (
                    <StepService selected={service} onSelect={setService} />
                  )}
                  {step === 1 && service && (
                    <StepForm
                      service={service}
                      data={data}
                      errors={errors}
                      onChange={(name, value) => {
                        setData((d) => ({ ...d, [name]: value }));
                        if (errors[name]) setErrors((e) => ({ ...e, [name]: false }));
                      }}
                    />
                  )}
                  {step === 2 && service && (
                    <StepSummary service={service} data={data} />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-6 sm:px-8 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3">
              {step > 0 ? (
                <button
                  onClick={handleBack}
                  className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Voltar{step === 2 ? " e editar" : ""}
                </button>
              ) : (
                <div />
              )}

              {step < 2 ? (
                <button
                  onClick={handleNext}
                  disabled={step === 0 ? !canContinueStep1 : !canContinueStep2}
                  className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_-8px_rgba(30,64,255,0.6)] transition-all hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  Continuar
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={handleSend}
                  className="inline-flex items-center gap-2 rounded-full bg-brand-gradient px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_-8px_rgba(30,64,255,0.6)] transition-all hover:scale-[1.02]"
                >
                  <Send className="h-4 w-4" />
                  Enviar para WhatsApp
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ---------------- Step 1: choose service ---------------- */
function StepService({ selected, onSelect }: { selected: ServiceKey | null; onSelect: (s: ServiceKey) => void }) {
  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold text-brand-deep">Qual serviço você procura?</h2>
      <p className="mt-2 text-sm text-slate-500">Selecione o serviço que melhor atende sua necessidade.</p>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {services.map((s) => {
          const Icon = s.icon;
          const active = selected === s.key;
          return (
            <button
              key={s.key}
              onClick={() => onSelect(s.key)}
              className={`group relative text-left rounded-2xl border-2 p-4 transition-all duration-300 ${
                active
                  ? "border-brand-blue bg-brand-blue/5 shadow-[0_10px_30px_-10px_rgba(30,64,255,0.4)]"
                  : "border-slate-200 hover:border-brand-light/60 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`shrink-0 h-11 w-11 rounded-xl flex items-center justify-center transition-all ${
                    active ? "bg-brand-gradient text-white shadow-md" : "bg-slate-100 text-brand-blue group-hover:bg-brand-blue/10"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold text-brand-deep text-sm">{s.title}</div>
                  </div>

                  <p className="mt-1 text-xs text-slate-500 leading-relaxed">{s.desc}</p>
                </div>
                {active && (
                  <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-brand-gradient flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- Step 2: form ---------------- */
function StepForm({
  service,
  data,
  errors,
  onChange,
}: {
  service: ServiceKey;
  data: FormData;
  errors: Record<string, boolean>;
  onChange: (name: string, value: string) => void;
}) {
  const sections = schemas[service];
  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold text-brand-deep">{serviceLabels[service]}</h2>
      <p className="mt-2 text-sm text-slate-500">Preencha as informações abaixo para prosseguir.</p>

      <div className="mt-6 space-y-6">
        {sections.map((section) => (
          <div key={section.title}>
            <div className="text-xs uppercase tracking-[0.2em] text-brand-blue font-semibold mb-3">
              {section.title}
            </div>
            <div className="space-y-4">
              {section.fields.map((f) => (
                <Field
                  key={f.name}
                  field={f}
                  value={data[f.name] || ""}
                  error={!!errors[f.name]}
                  onChange={(v) => onChange(f.name, v)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Field({
  field,
  value,
  error,
  onChange,
}: {
  field: FieldDef;
  value: string;
  error: boolean;
  onChange: (v: string) => void;
}) {
  const baseInput = `w-full rounded-xl border-2 px-4 py-2.5 text-sm text-brand-deep bg-white placeholder:text-slate-400 outline-none transition-all ${
    error ? "border-red-400 focus:border-red-500" : "border-slate-200 focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10"
  }`;

  return (
    <div>
      <label className="block text-sm font-medium text-brand-deep mb-1.5">
        {field.label}
        {field.required && <span className="text-brand-blue ml-0.5">*</span>}
      </label>

      {field.type === "text" && (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={baseInput}
        />
      )}

      {field.type === "textarea" && (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={4}
          className={`${baseInput} resize-none`}
        />
      )}

      {field.type === "radio" && field.options && (
        <div className="flex flex-wrap gap-2">
          {field.options.map((opt) => {
            const active = value === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => onChange(opt)}
                className={`rounded-full px-4 py-2 text-sm font-medium border-2 transition-all ${
                  active
                    ? "border-brand-blue bg-brand-blue text-white shadow-[0_6px_16px_-6px_rgba(30,64,255,0.5)]"
                    : error
                    ? "border-red-300 text-slate-700 hover:border-brand-light"
                    : "border-slate-200 text-slate-700 hover:border-brand-light hover:bg-brand-blue/5"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---------------- Step 3: summary ---------------- */
function StepSummary({ service, data }: { service: ServiceKey; data: FormData }) {
  const fields = schemas[service].flatMap((s) => s.fields);

  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold text-brand-deep">Confirme seu pedido</h2>
      <p className="mt-2 text-sm text-slate-500">Revise as informações antes de enviar pelo WhatsApp.</p>

      <div className="mt-6 rounded-2xl border-2 border-slate-100 overflow-hidden">
        <div className="bg-brand-gradient px-5 py-4 text-white">
          <div className="text-xs uppercase tracking-[0.2em] opacity-90">Serviço</div>
          <div className="text-lg font-semibold mt-0.5">{serviceLabels[service]}</div>
        </div>
        <div className="divide-y divide-slate-100">
          {fields.map((f) => {
            const val = data[f.name];
            if (!val) return null;
            return (
              <div key={f.name} className="px-5 py-3 grid grid-cols-3 gap-3">
                <div className="text-xs font-medium text-slate-500 col-span-1">{f.label}</div>
                <div className="text-sm text-brand-deep col-span-2 whitespace-pre-wrap break-words">{val}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
