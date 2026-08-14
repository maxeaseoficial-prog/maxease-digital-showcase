# Redesign Visual Profissional — MAXEASE Digital

Este plano detalha o redesign visual completo da MAXEASE Digital, transformando a estética atual (genérica de IA/SaaS) em uma linguagem de estúdio digital premium, autoral e sofisticada, preservando todas as funcionalidades e conteúdos reais.

## Auditoria do Estado Atual

- **Tecnologias:** React 19, TanStack Start/Router, Tailwind CSS 4, Framer Motion, Lucide, Supabase.
- **Estrutura:** Rotas `/`, `/sites`, `/audiovisual` ativas. Componentes principais concentrados em `src/routes/index.tsx`.
- **Estética:** Excesso de glows azuis, partículas, glassmorphism carregado, botões "pill" e gradientes de IA.
- **Assets:** Logo, fotos reais (Henrique Castro), cases de sites e vídeos reais.

## Design System & Identidade Visual

### Paleta de Cores
- **Navy/Deep:** `#0B1220` (Fundo principal/contraste).
- **Brand Blue:** `#155EEF` (Azul corporativo maduro).
- **Light:** `#F8FAFC` (Para seções claras e superfícies).
- **Text:** `#101828` (Escuro) / `#667085` (Muted).
- **Borders:** `#E4E7EC` (Light) / `rgba(255,255,255,0.06)` (Dark).

### Tipografia
- Escala editorial usando as fontes já configuradas (Space Grotesk e Inter).
- Hierarquia baseada em peso e espaçamento, não apenas tamanho.
- H1 editorial com line-height controlado.

### Componentes Primitivos
- **Radius:** Padronizado em 12px para cards e 8px para botões/inputs (removendo rounded-full).
- **Sombras:** Neutras e suaves (evitando brilhos azuis).
- **Whitespace:** Aumento significativo do respiro entre seções.

## Implementação por Seção

### 1. Header & Navegação
- Refatorar Navbar para ser mais sóbria.
- Remover o "card flutuante" do nav; usar fundo sólido ou transparente com borda inferior sutil ao rolar.
- Redesenhar menu mobile usando uma abordagem mais limpa.

### 2. Hero (Redesign Total)
- Composição assimétrica editorial.
- **Lado Esquerdo:** Texto central preservado com tipografia refinada.
- **Lado Direito:** Substituir mockup 3D flutuante por uma composição de trabalhos REAIS (sites/interfaces) em frames de browser ou recortes limpos.
- Remover partículas, cursor glow e linhas decorativas.

### 3. Serviços
- Layout editorial (lista premium ou grid 2x2 com números e ícones Lucide discretos).
- Foco em clareza e whitespace, reduzindo backgrounds carregados.

### 4. Portfólio (Sites & Audiovisual)
- **Sites:** Grid editorial com imagens grandes e tipografia lateral.
- **Audiovisual:** Thumbnails em proporção cinematográfica, mantendo a sobriedade.
- Simplificar o fluxo de "Ver Projetos" removendo o modal intermediário se possível (ou tornando-o muito mais discreto).

### 5. Clientes & Sobre
- **Clientes:** Grid de logos monocromáticos e neutros para transmitir confiança.
- **Sobre:** Destaque para a fotografia real de Henrique Castro em layout de revista/agência.

### 6. Quote Modal
- Redesign visual completo mantendo 100% da lógica de negócio e integração com WhatsApp.
- Inputs refinados e progressão de etapas mais elegante.

### 7. Footer
- Design minimalista, focado em ícones e links essenciais.

## Detalhes Técnicos
- **Framer Motion:** Animações de revelação sutis (reveal/fade), removendo loops infinitos.
- **Performance:** Redução de complexidade visual resultará em melhor LCP/FID.
- **Responsividade:** Ajuste criterioso em todos os breakpoints (Mobile a Desktop 4K).

## Etapas de Entrega
1. Atualização de `src/styles.css` com novos tokens.
2. Refatoração da Navbar e Footer.
3. Reimplementação das seções na `src/routes/index.tsx`.
4. Atualização das páginas `/sites` e `/audiovisual`.
5. Ajustes finais de responsividade e QA.
