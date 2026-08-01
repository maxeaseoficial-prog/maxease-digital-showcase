import { Toaster as Sonner } from "sonner";
import { CheckCircle2, AlertCircle, Info, Loader2 } from "lucide-react";

type ToasterProps = React.ComponentProps<typeof Sonner>;

// Compact, top-right, product-grade toasts: neutral surface, single colored
// icon per intent, never wider than a card.
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      position="top-right"
      offset={16}
      gap={10}
      duration={4000}
      icons={{
        success: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
        error: <AlertCircle className="h-4 w-4 text-red-500" />,
        info: <Info className="h-4 w-4 text-blue-500" />,
        warning: <AlertCircle className="h-4 w-4 text-amber-500" />,
        loading: <Loader2 className="h-4 w-4 animate-spin text-slate-400" />,
      }}
      style={{ ["--width" as string]: "336px" }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "flex w-full items-start gap-2.5 rounded-xl border border-slate-200/80 bg-white px-3.5 py-3 shadow-[0_10px_30px_-14px_rgba(15,23,42,0.25)]",
          icon: "mt-px shrink-0",
          content: "min-w-0 flex-1",
          title: "text-[13px] font-medium text-slate-900 leading-snug",
          description: "mt-0.5 text-[12.5px] text-slate-500 leading-relaxed",
          actionButton:
            "shrink-0 rounded-md bg-slate-900 px-2.5 py-1 text-[12px] font-medium text-white hover:bg-slate-800",
          cancelButton:
            "shrink-0 rounded-md bg-slate-100 px-2.5 py-1 text-[12px] font-medium text-slate-600 hover:bg-slate-200",
          closeButton: "border-slate-200 bg-white text-slate-400",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
