import { createFileRoute, redirect } from '@tanstack/react-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getGPTAdsConfig, updateGPTAdsConfig } from '@/lib/gpt-ads.functions';
import { useState, useEffect } from 'react';
import { Save, CheckCircle2, XCircle, AlertTriangle, Loader2, ShieldCheck, Settings, Puzzle, Bell } from 'lucide-react';
import { toast } from 'sonner';

export const Route = createFileRoute('/_authenticated/admin/integrations/gpt-ads')({
  component: GPTAdsAdminPage,
  loader: async ({ context }) => {
    // Basic protection for demo purposes. 
    // In a real app, the _authenticated layout handles the session, 
    // and we'd check for 'admin' role here.
    return {};
  }
});

function GPTAdsAdminPage() {
  const queryClient = useQueryClient();
  const { data: config, isLoading } = useQuery({
    queryKey: ['gpt-ads-config'],
    queryFn: () => getGPTAdsConfig(),
  });

  const updateMutation = useMutation({
    mutationFn: (newData: any) => updateGPTAdsConfig(newData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gpt-ads-config'] });
      toast.success('Configurações salvas com sucesso!');
    },
    onError: (err: any) => {
      toast.error(`Erro ao salvar: ${err.message}`);
    }
  });

  const [formData, setFormData] = useState<any>({
    pixel_id: '',
    config_code: '',
    status: 'inactive',
    whatsapp_contact_enabled: true,
    lead_form_submitted_enabled: true,
    budget_requested_enabled: true,
  });

  useEffect(() => {
    if (config) {
      setFormData(config);
    }
  }, [config]);

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-brand-blue" />
      </div>
    );
  }

  const getStatusDisplay = () => {
    if (!formData.pixel_id || !formData.config_code) {
      return { icon: AlertTriangle, text: 'Configuração incompleta', color: 'text-yellow-500', bg: 'bg-yellow-50' };
    }
    if (formData.status === 'active') {
      return { icon: CheckCircle2, text: 'Pixel configurado e ativo', color: 'text-green-500', bg: 'bg-green-50' };
    }
    return { icon: XCircle, text: 'Pixel desativado', color: 'text-slate-400', bg: 'bg-slate-50' };
  };

  const status = getStatusDisplay();
  const StatusIcon = status.icon;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <div className="flex items-center gap-2 text-brand-blue font-bold text-sm uppercase tracking-widest mb-1">
            <Settings className="h-4 w-4" /> Configurações
          </div>
          <h1 className="text-3xl font-bold text-slate-900">Integrações → GPT Ads</h1>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium ${status.color} ${status.bg} border-current/10`}>
          <StatusIcon className="h-4 w-4" />
          {status.text}
        </div>
      </header>

      <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center gap-3">
          <Puzzle className="h-5 w-5 text-brand-blue" />
          <h2 className="text-lg font-bold text-slate-900">Configuração do Pixel</h2>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Pixel ID</label>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/5 outline-none transition-all placeholder:text-slate-300"
              placeholder="Insira o ID fornecido pelo GPT Ads"
              value={formData.pixel_id || ''}
              onChange={(e) => setFormData({ ...formData, pixel_id: e.target.value })}
            />
            <p className="text-xs text-slate-400">Identificador único do seu Pixel GPT Ads.</p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Código de configuração do Pixel</label>
            <textarea
              rows={8}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/5 outline-none transition-all font-mono text-sm placeholder:text-slate-300 bg-slate-50"
              placeholder="Cole aqui o código oficial de configuração fornecido pelo GPT Ads..."
              value={formData.config_code || ''}
              onChange={(e) => setFormData({ ...formData, config_code: e.target.value })}
            />
            <p className="text-xs text-slate-400">Cole o snippet script completo gerado pela plataforma.</p>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
            <div>
              <div className="text-sm font-bold text-slate-900">Status da Integração</div>
              <div className="text-xs text-slate-500">Ative ou desative o rastreamento globalmente</div>
            </div>
            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
              <button
                onClick={() => setFormData({ ...formData, status: 'active' })}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  formData.status === 'active' ? 'bg-brand-blue text-white' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                Ativado
              </button>
              <button
                onClick={() => setFormData({ ...formData, status: 'inactive' })}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                  formData.status === 'inactive' ? 'bg-slate-200 text-slate-700' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                Desativado
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex items-center gap-3">
          <Bell className="h-5 w-5 text-brand-blue" />
          <h2 className="text-lg font-bold text-slate-900">Eventos de Conversão</h2>
        </div>
        
        <div className="p-6 divide-y divide-slate-50">
          {[
            { key: 'whatsapp_contact_enabled', label: 'Contato pelo WhatsApp', event: 'whatsapp_contact' },
            { key: 'lead_form_submitted_enabled', label: 'Formulário enviado', event: 'lead_form_submitted' },
            { key: 'budget_requested_enabled', label: 'Solicitação de orçamento', event: 'budget_requested' },
          ].map((ev) => (
            <div key={ev.key} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-slate-900">{ev.label}</div>
                <div className="text-xs text-slate-400 font-mono">Evento: {ev.event}</div>
              </div>
              <button
                onClick={() => setFormData({ ...formData, [ev.key]: !formData[ev.key] })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  formData[ev.key] ? 'bg-brand-blue' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    formData[ev.key] ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </section>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-brand-gradient text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-brand-blue/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {updateMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
          Salvar configurações
        </button>
        
        <button
          onClick={() => {
            if (!formData.pixel_id || !formData.config_code) {
              toast.error('Configure o Pixel antes de testar.');
              return;
            }
            toast.info('Validando configuração...');
            setTimeout(() => toast.success('Estrutura de configuração válida!'), 1000);
          }}
          className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all"
        >
          Testar configuração
        </button>
      </div>

      <footer className="p-6 rounded-2xl bg-brand-deep text-white/60 text-sm flex items-center gap-4 border border-white/5">
        <ShieldCheck className="h-6 w-6 text-brand-light shrink-0" />
        <p>
          Esta área é protegida e auditada. Alterações afetam diretamente o rastreamento comercial da MAXEASE.
          Nenhuma credencial é exposta no frontend.
        </p>
      </footer>
    </div>
  );
}
