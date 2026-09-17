# Correção da rolagem em páginas HTML publicadas

## Implementação
- Ajustar somente `src/routes/$slug.tsx` para que o documento incorporado tenha contexto de origem compatível com bibliotecas de animação e rolagem.
- Tornar o iframe um viewport fixo e isolado, evitando que o contêiner externo participe da rolagem ou altere sua altura.
- Preservar scripts, animações, seleção automática entre HTML desktop/mobile e a proteção do sandbox.

## Validação
- Testar uma página HTML longa em desktop e celular, incluindo rolagem, recarregamento e execução de scripts.
- Confirmar compilação sem erros e ausência de regressões no console.

## Entrega
- Manter a alteração restrita à rota pública de páginas customizadas.
- Registrar a mudança no histórico do projeto; a sincronização com o GitHub conectado será feita pelo ambiente do projeto.
