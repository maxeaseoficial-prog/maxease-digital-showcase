# Redesign da Seção Confiança - MaxEase Digital

Redesenhar a seção de prova social (Confiança) para uma estética editorial premium, minimalista e tecnológica, focando em tipografia forte, métricas impactantes e um marquee infinito de clientes.

## Alterações Propostas

### 1. Estrutura e Estilo Visual
- **Fundo:** Manterá o branco puro conforme solicitado.
- **Identidade:** Uso do azul MaxEase (`#155EEF`) para destaques e métricas.
- **Hierarquia:** Eyebrow "CONFIANÇA" -> Título Editorial -> Métricas Tipográficas -> Marquee de Clientes.

### 2. Componente de Métricas (Redesenho Completo)
- **Remoção:** Retirada total da métrica "+2 Anos de Experiência".
- **Foco:** "+1000 Conteúdos Entregues" e "+10 Empresas Atendidas".
- **Sombra Tipográfica:** Implementação de um efeito de profundidade usando o próprio número em escala gigante (1.5x-2x), com opacidade extremamente baixa, parcialmente cortado dentro do container da métrica.
- **Count-up:** Animação de contagem de 0 ao valor final (1.5s) ao entrar no viewport, mantendo o símbolo "+" estático.

### 3. Área de Clientes (Marquee Infinito)
- **Movimento:** Transição de grade estática para marquee contínuo (Direita para Esquerda).
- **Seamless Loop:** Duplicação dos itens para garantir que o reinício seja imperceptível.
- **Visual dos Cards:** Logos em suas cores originais dentro de containers brancos/off-white com bordas suaves e arredondadas (16-20px).
- **Interação:** Pausa suave no hover (desktop) e movimento automático no mobile.
- **Fade:** Efeito de máscara nas extremidades para desaparecimento suave das logos.

### 4. Animações e Motion
- **Entrada:** Revelação sequencial (stagger) dos elementos da seção com `translateY` e `opacity` suaves usando Framer Motion.
- **Reduced Motion:** Respeito à preferência do sistema, simplificando ou removendo animações se solicitado.

## Detalhes Técnicos
- **Arquivo:** `src/routes/index.tsx` (modificação da função `Clients` e componentes auxiliares).
- **Bibliotecas:** Framer Motion (já em uso).
- **CSS:** Tailwind CSS v4 para estilização e máscaras de gradiente.

## Testes e Validação
- Verificação de ausência de scroll horizontal.
- Validação do loop infinito sem saltos.
- Testes em Mobile, Tablet e Desktop.
- Verificação da remoção da métrica de anos de experiência.
- Garantia de que as logos mantêm cores originais e proporções corretas.
