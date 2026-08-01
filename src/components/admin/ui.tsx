// Shared, product-grade UI primitives for the admin panel and client portal.
// Visual language: neutral surfaces, restrained borders, almost no shadow,
// generous whitespace, one quiet accent. Inspired by Linear / Stripe / Notion.
import { useEffect, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Loader2, X, Copy, CheckCircle2, AlertCircle, UploadCloud, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ Button */

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "subtle";
type ButtonSize = "sm" | "md";

const BUTTON_BASE =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium whitespace-nowrap transition-[background-color,border-color,color,opacity] duration-150 outline-none focus-visible:ring-2 focus-visible:ring-slate-900/15 focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.99]";

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-slate-900 text-white hover:bg-slate-800",
  secondary: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300",
  ghost: "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
  subtle: "bg-slate-100 text-slate-700 hover:bg-slate-200/80",
  danger: "border border-red-200 bg-white text-red-600 hover:bg-red-50",
};

const BUTTON_SIZES: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-[13px]",
  md: "h-10 px-4 text-sm",
};

export function UIButton({
  variant = "secondary",
  size = "md",
  loading,
  className,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}) {
  return (
    <button
      {...rest}
      disabled={rest.disabled || loading}
      className={cn(BUTTON_BASE, BUTTON_VARIANTS[variant], BUTTON_SIZES[size], className)}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

export function IconButton({
  className,
  children,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      {...rest}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 outline-none focus-visible:ring-2 focus-visible:ring-slate-900/15",
        className,
      )}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------- Form fields */

const CONTROL =
  "w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400/80 outline-none transition-[border-color,box-shadow] duration-150 hover:border-slate-300 focus:border-slate-400 focus:ring-4 focus:ring-slate-900/[0.04]";

export function FieldLabel({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <span className="flex items-baseline justify-between gap-3">
      <span className="text-[13px] font-medium text-slate-700">{children}</span>
      {hint && <span className="text-[11px] text-slate-400">{hint}</span>}
    </span>
  );
}

export function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  multiline,
  rows = 3,
  hint,
  className,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  multiline?: boolean;
  rows?: number;
  hint?: string;
  className?: string;
}) {
  return (
    <label className={cn("block space-y-2", className)}>
      <FieldLabel hint={hint}>{label}</FieldLabel>
      {multiline ? (
        <textarea
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(CONTROL, "resize-y leading-relaxed")}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={CONTROL}
        />
      )}
    </label>
  );
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  hint?: string;
}) {
  return (
    <label className="block space-y-2">
      <FieldLabel hint={hint}>{label}</FieldLabel>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(CONTROL, "appearance-none bg-[length:16px] pr-9 cursor-pointer")}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round'><path d='m6 9 6 6 6-6'/></svg>\")",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 0.75rem center",
        }}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="inline-flex w-full rounded-lg border border-slate-200 bg-slate-50 p-1 sm:w-auto">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              "relative flex-1 rounded-md px-3.5 py-1.5 text-[13px] font-medium transition-colors duration-150 sm:flex-none",
              active ? "text-slate-900" : "text-slate-500 hover:text-slate-700",
            )}
          >
            {active && (
              <motion.span
                layoutId={`seg-${options.map((x) => x.value).join("")}`}
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
                className="absolute inset-0 rounded-md bg-white ring-1 ring-slate-200/80"
              />
            )}
            <span className="relative">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function Chip({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[13px] font-medium transition-colors duration-150",
        active
          ? "border-slate-900 bg-slate-900 text-white"
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
      )}
    >
      {active && <Check className="h-3.5 w-3.5" />}
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------- Cards */

export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("rounded-xl border border-slate-200/80 bg-white", className)}>{children}</div>
  );
}

export function FormBlock({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-slate-100 pt-7 first:border-t-0 first:pt-0">
      <header className="mb-4">
        <h3 className="text-[13px] font-semibold uppercase tracking-[0.06em] text-slate-500">{title}</h3>
        {description && <p className="mt-1 text-[13px] text-slate-400">{description}</p>}
      </header>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

/* ------------------------------------------------------------------- Modal */

export function Modal({
  open,
  onClose,
  title,
  eyebrow,
  footer,
  size = "lg",
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  eyebrow?: string;
  footer?: ReactNode;
  size?: "sm" | "lg" | "xl";
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const width = size === "sm" ? "max-w-md" : size === "xl" ? "max-w-3xl" : "max-w-xl";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/30 p-0 backdrop-blur-[3px] sm:items-center sm:p-6"
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.99 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-[0_24px_60px_-24px_rgba(15,23,42,0.28)] ring-1 ring-slate-900/[0.06] sm:rounded-2xl",
              width,
            )}
          >
            <header className="flex items-start justify-between gap-4 px-6 py-5 sm:px-8">
              <div className="min-w-0">
                {eyebrow && (
                  <div className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-400">{eyebrow}</div>
                )}
                <h2 className="mt-0.5 truncate text-[17px] font-semibold tracking-tight text-slate-900">{title}</h2>
              </div>
              <IconButton onClick={onClose} aria-label="Fechar">
                <X className="h-4.5 w-4.5" />
              </IconButton>
            </header>
            <div className="flex-1 overflow-y-auto px-6 pb-6 sm:px-8">{children}</div>
            {footer && (
              <footer className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/60 px-6 py-4 sm:flex-row sm:justify-end sm:px-8">
                {footer}
              </footer>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ----------------------------------------------------------- Success modal */

export function SuccessModal({
  open,
  onClose,
  title,
  message,
  link,
  onCopy,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  link?: string;
  onCopy?: () => void;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title=""
      size="sm"
      footer={
        <>
          <UIButton variant="secondary" onClick={onClose}>
            Fechar
          </UIButton>
          {link && (
            <UIButton variant="primary" onClick={onCopy}>
              <Copy className="h-4 w-4" /> Copiar link
            </UIButton>
          )}
        </>
      }
    >
      <div className="-mt-2 pb-1">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.05, type: "spring", stiffness: 400, damping: 24 }}
          className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"
        >
          <CheckCircle2 className="h-5.5 w-5.5" />
        </motion.div>
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">{title}</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{message}</p>
        {link && (
          <div className="mt-5 space-y-2">
            <FieldLabel>Link de aprovação</FieldLabel>
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
              <span className="min-w-0 flex-1 truncate font-mono text-[12.5px] text-slate-600">{link}</span>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------ Upload field */

export interface UploadView {
  name: string;
  progress: number;
  status: "uploading" | "done" | "error";
  errorMessage?: string;
  previewUrl?: string;
}

function humanKind(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  if (["mp4", "mov", "webm"].includes(ext)) return "Vídeo";
  if (["pdf"].includes(ext)) return "PDF";
  if (["png", "jpg", "jpeg", "webp"].includes(ext)) return "Imagem";
  return "Arquivo";
}

export function UploadField({
  label,
  hint,
  placeholder,
  accept,
  slot,
  onFile,
  onRemove,
  icon,
}: {
  label: string;
  hint?: string;
  placeholder: string;
  accept: string;
  slot?: UploadView;
  onFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
  icon?: ReactNode;
}) {
  const percent = Math.min(100, Math.round(slot?.progress ?? 0));

  return (
    <div className="space-y-2">
      <FieldLabel hint={hint}>{label}</FieldLabel>

      {!slot && (
        <label className="group flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-slate-250 bg-slate-50/60 px-4 py-4 transition-colors duration-150 hover:border-slate-300 hover:bg-slate-50">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-slate-400 ring-1 ring-slate-200 transition-colors group-hover:text-slate-600">
            {icon ?? <UploadCloud className="h-4 w-4" />}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-medium text-slate-700">{placeholder}</span>
            <span className="block text-[11.5px] text-slate-400">Clique para selecionar do seu dispositivo</span>
          </span>
          <input type="file" accept={accept} onChange={onFile} className="hidden" />
        </label>
      )}

      <AnimatePresence mode="popLayout">
        {slot && (
          <motion.div
            key={slot.name + slot.status}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className={cn(
              "flex items-center gap-3 rounded-lg border bg-white px-3.5 py-3",
              slot.status === "error" ? "border-red-200" : "border-slate-200",
            )}
          >
            {slot.previewUrl && slot.status === "done" ? (
              <img src={slot.previewUrl} alt="" className="h-10 w-10 shrink-0 rounded-md object-cover ring-1 ring-slate-200" />
            ) : (
              <span
                className={cn(
                  "grid h-10 w-10 shrink-0 place-items-center rounded-md",
                  slot.status === "done"
                    ? "bg-emerald-50 text-emerald-600"
                    : slot.status === "error"
                      ? "bg-red-50 text-red-500"
                      : "bg-slate-50 text-slate-400",
                )}
              >
                {slot.status === "done" ? (
                  <Check className="h-4 w-4" />
                ) : slot.status === "error" ? (
                  <AlertCircle className="h-4 w-4" />
                ) : (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
              </span>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-3">
                <span className="truncate text-[13px] font-medium text-slate-800">{slot.name}</span>
                {slot.status === "uploading" && (
                  <span className="shrink-0 text-[12px] font-medium tabular-nums text-slate-500">{percent}%</span>
                )}
              </div>

              {slot.status === "uploading" && (
                <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-slate-100">
                  <motion.div
                    className="h-full rounded-full bg-slate-800"
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                  />
                </div>
              )}

              {slot.status === "done" && (
                <div className="mt-0.5 flex items-center gap-1.5 text-[12px] font-medium text-emerald-600">
                  <Check className="h-3.5 w-3.5" /> {humanKind(slot.name)} enviado
                </div>
              )}

              {slot.status === "error" && (
                <div className="mt-0.5 text-[12px] text-red-500">{slot.errorMessage ?? "Não foi possível enviar."}</div>
              )}
            </div>

            <UIButton variant="ghost" size="sm" onClick={onRemove} className="shrink-0 px-2 text-slate-400">
              {slot.status === "error" ? <RotateCcw className="h-4 w-4" /> : <X className="h-4 w-4" />}
            </UIButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------- Empty state */

export function EmptyState({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <span className="mb-3 grid h-10 w-10 place-items-center rounded-full bg-slate-50 text-slate-300 ring-1 ring-slate-100">
        {icon}
      </span>
      <p className="text-sm font-medium text-slate-700">{title}</p>
      {description && <p className="mt-1 max-w-xs text-[13px] text-slate-400">{description}</p>}
    </div>
  );
}
