# Redesign da Seção "Nossa História" - MAXEASE Digital

Este plano detalha o redesenho editorial da seção "Sobre" (Nossa História) para transformá-la em uma peça de apresentação premium, integrando a fotografia real do fundador com elementos geométricos e tipografia refinada.

## Mudanças

### Visual e Estrutura
- **Composição Editorial:** Transição do layout simples "foto/texto" para uma grade assimétrica (aprox. 55% visual, 45% conteúdo) com sobreposição controlada.
- **Protagonismo da Fotografia:** A imagem do fundador (Henrique Castro) será ampliada, verticalizada e integrada a um bloco geométrico azul MaxEase deslocado para criar profundidade.
- **Placa do Fundador:** Substituição da identificação simples por uma placa editorial em Navy profundo sobreposta à foto.
- **Hierarquia de Texto:** 
    - Headline grande com quebra de linha estratégica e destaque em uma palavra.
    - Introdução com peso maior.
    - Manifesto final com borda lateral azul, separando-o do corpo de texto comum.
- **Textura de Fundo:** Adição do elemento tipográfico "MAXEASE" em escala monumental com opacidade ultrabaixa (2-4%).
- **Fundo:** Mantido branco/off-white para contraste e alternância de ritmo na página.

### Animações (Framer Motion)
- **Entrada da Foto:** Efeito de reveal vertical com máscara e translação suave (translateY).
- **Entrada do Bloco Azul:** Escalonamento e translação lateral sutis, criando profundidade.
- **Stagger de Conteúdo:** Sequência coordenada: Bloco Azul -> Foto -> Eyebrow -> Headline -> Parágrafos -> Manifesto.
- **Microinteração:** Zoom sutil (1.015x) na foto ao passar o mouse, mantendo o container estático.

### Responsividade
- **Mobile:** Reorganização para fluxo vertical garantindo legibilidade da placa do fundador e preservando o elemento azul sem gerar overflow lateral.
- **Tablet:** Ajuste automático para coluna única se a largura comprimir excessivamente os textos.

## Detalhes Técnicos
- **Cores:** Navy profundo (#071426), Azul MaxEase (#155EEF), Branco/Off-white (#FFFFFF / #F8FAFC).
- **Tipografia:** Space Grotesk (Headings), Inter (Corpo).
- **Componentes:** Atualização da função `About` em `src/routes/index.tsx`.
- **Assets:** Reutilização de `aboutImg` (`src/assets/henrique-castro.jpg.asset.json`).
- **Acessibilidade:** Suporte a `prefers-reduced-motion` para desativar transformações e máscaras de reveal.

---

**Arquivos afetados:**
- `src/routes/index.tsx`
