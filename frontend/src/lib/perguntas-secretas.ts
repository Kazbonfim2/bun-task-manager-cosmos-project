export const PERGUNTAS_SECRETAS = [
  "Qual era o nome do seu primeiro animal de estimação?",
  "Qual era o nome da sua primeira escola?",
  "Qual é o nome da cidade onde você nasceu?",
  "Qual era o seu apelido de infância?",
  "Qual era o nome do seu personagem favorito na infância?",
  "Qual foi o primeiro lugar que você visitou nas férias?",
  "Qual é o nome do seu filme favorito?",
  "Qual era sua matéria favorita na escola?",
] as const;

export const ITENS_PERGUNTAS_SECRETAS = PERGUNTAS_SECRETAS.map((pergunta) => ({
  value: pergunta,
  label: pergunta,
}));
