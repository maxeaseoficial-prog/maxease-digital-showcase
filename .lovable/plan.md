# Plano de Implementação - GPT Ads Pixel

Implementação de um sistema de rastreamento GPT Ads Pixel com gerenciamento via painel administrativo, garantindo segurança e evitando código hardcoded.

## Etapas

### 1. Banco de Dados e Segurança
- Criar a tabela `gpt_ads_config` no banco de dados via migração SQL.
- Configurar Row Level Security (RLS) para proteger os dados.
- Garantir que apenas administradores possam modificar as configurações.

### 2. Backend (Server Functions)
- Desenvolver funções de servidor para ler e atualizar as configurações do Pixel de forma segura.
- Implementar validação de dados no lado do servidor.

### 3. Frontend - Rastreamento Centralizado
- Criar o arquivo `src/lib/gpt-ads-tracking.ts` para centralizar toda a lógica do Pixel.
- Desenvolver um hook `useGPTAds` para inicializar o Pixel (uma única vez).
- Implementar a função `trackGPTAdsEvent` para disparo de eventos em todo o site.

### 4. Painel Administrativo
- Criar a nova rota e página `src/routes/_authenticated/admin/integrations/gpt-ads.tsx`.
- Desenvolver o formulário de configuração com campos para Pixel ID, Código de Configuração e Status.
- Adicionar controles para ativar/desativar eventos específicos (WhatsApp, Leads, Orçamentos).
- Implementar funcionalidade de teste de configuração.

### 5. Integração com Eventos do Site
- **WhatsApp**: Rastrear todos os cliques em links de WhatsApp (`wa.me`, `api.whatsapp.com`) enviando o evento `whatsapp_contact` com a origem (`source`).
- **Formulários**: Rastrear envios bem-sucedidos de formulários (como o Modal de Orçamento) com o evento `lead_form_submitted`.
- **Navegação**: Garantir que a inicialização e o rastreamento funcionem corretamente em uma Single Page Application (SPA).

## Detalhes Técnicos
- **Tecnologia**: TanStack Start + Supabase.
- **Segurança**: As configurações serão lidas do banco de dados e nunca expostas em variáveis de ambiente públicas ou código-fonte.
- **Performance**: O script do Pixel será injetado dinamicamente apenas quando ativado, evitando carregamentos desnecessários.
- **Manutenibilidade**: A troca de ID ou código do Pixel poderá ser feita inteiramente via interface administrativa.
