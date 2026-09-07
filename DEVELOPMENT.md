# Registro de uso de IA

## Como comecei

Antes de abrir qualquer ferramenta de IA, escrevi a especificação completa do projeto: stack, arquitetura de pastas, modelo de dados, regras de negócio e o que ficaria de fora do escopo. Esse arquivo (`orion-prompt.mdc`) foi minha forma de pensar o problema antes de delegar a implementação - decisões como usar SQLite em vez de Postgres, separar `responsavel_id` de `criado_por_id` na tabela de demandas, ou não usar decorators no backend, foram tomadas por mim, não sugeridas pela IA.

## Ferramentas usadas

- **Cursor + Grok**: geração inicial do projeto, a partir da especificação acima.
- **Gemini / Antigravity**: resolução de problemas pontuais e menores ao longo do desenvolvimento.
- **Caveman**: skill que reduz o volume de tokens trocados com o agente, mantendo código e comandos exatos.
- **Ponytail**: skill que evita over-engineering, fazendo a IA preferir a solução mais simples que resolve o problema em vez de abstrações desnecessárias.

A combinação de Caveman e Ponytail foi intencional: uma cuida do "quanto" a IA fala, a outra do "quanto" ela constrói. Isso ajudou a manter o código do jeito que pedi na especificação - simples, sem camadas extras, legível por um dev júnior.

## Processo de revisão

Depois que o código era gerado, passava por dois filtros: leitura linha a linha (principalmente nas camadas de auth, service e repository, onde erros passam mais despercebidos) e testes manuais rodando a aplicação via Docker.

Teve pelo menos um ponto no backend, entre autenticação, regras de negócio e acesso ao banco, em que o que a IA entregou não bateu exatamente com o que eu tinha especificado, e precisei ajustar manualmente até ficar de acordo com o comportamento esperado.

## O que ficou comigo

- Definição de arquitetura e modelo de dados
- Decisões de escopo (o que entrar e o que deixar de fora)
- Revisão de código e testes funcionais
- Correções pontuais onde a IA se desviou da especificação

## Conclusão

A IA acelerou bastante a escrita do código, mas o projeto só saiu correto porque a especificação foi bem definida antes e porque revisei o que foi gerado. Sem esses dois pontos, o resultado teria saído genérico ou fora do que a demanda pedia.