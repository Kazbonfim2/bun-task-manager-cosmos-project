### Lucas B. de Jesus, 07/09/2026

# Registro de Decisões Técnicas e Uso de Inteligência Artificial

## Como comecei

Embora o escopo do projeto fosse relativamente simples, alguns cuidados precisavam ser tomados para que a implementação pudesse ser entregue em um tempo hábil.

Uma preocupação surgiu após a leitura dos documentos e das especificações do teste: não havia garantia de que a aplicação não pudesse ser utilizada futuramente por um cliente ou por mais de um usuário. Por isso, procurei evitar decisões que resolvessem apenas o problema imediato, mas que dificultassem uma possível evolução do projeto.

Minha primeira ação foi **interpretar os requisitos** e, a partir deles, **definir um modelo de banco de dados adequado**. A modelagem foi feita antes da implementação, utilizando também ferramentas online com recursos visuais, como o **dbdiagram.io**.

Com uma ideia inicial do modelo de dados, comecei a definir a stack e a estrutura da aplicação. Apesar de ter mais experiência com manutenção de aplicações em **PHP**, decidi utilizar **JavaScript/TypeScript** no backend, principalmente pela agilidade de desenvolvimento e pela familiaridade com o ecossistema.

Inicialmente considerei utilizar **Node.js**. Durante esse processo, levei em consideração que TypeScript não possui execução nativa no runtime e normalmente exige uma etapa adicional de configuração ou ferramentas para transpilar ou executar o código.

Por esse motivo, escolhi utilizar o **Bun** como runtime. Além da compatibilidade com o ecossistema JavaScript, o Bun possui suporte integrado para execução de TypeScript e ferramentas que simplificam parte da configuração inicial do projeto.

Após definir a stack, comecei a estruturar a arquitetura da aplicação. Optei por uma **organização baseada em responsabilidades**, utilizando arquivos com sufixos descritivos e uma separação em camadas.

A estrutura principal foi organizada entre:

* Rotas
* Controladores
* Serviços
* Repositórios

A intenção dessa organização foi manter uma separação clara entre as responsabilidades da aplicação, sem adicionar abstrações desnecessárias para o tamanho do projeto.

## Definição inicial do projeto

Antes de iniciar a geração de código com ferramentas de IA, defini os principais aspectos da aplicação. Isso incluiu decisões relacionadas à **stack**, **arquitetura de pastas**, **modelo de dados**, **regras de negócio** e **limitações de escopo**.

Essas definições foram utilizadas como contexto para orientar a implementação. Algumas decisões importantes foram tomadas antes da utilização da IA, principalmente relacionadas à estrutura do banco de dados, organização do backend e funcionalidades que deveriam ou não fazer parte da entrega.

**A IA foi utilizada como uma ferramenta para acelerar a implementação, e não como responsável pelas decisões principais da arquitetura.**

## Ferramentas de IA utilizadas

Durante o desenvolvimento, foram utilizadas diferentes ferramentas de IA para finalidades específicas.

* **Cursor + Grok:** utilizados principalmente durante a geração inicial da estrutura e implementação do projeto, utilizando como base a especificação previamente definida.

* **Gemini / Antigravity:** utilizados para resolver problemas mais pontuais encontrados durante o desenvolvimento.

* **Caveman:** utilizado para reduzir o volume de contexto e respostas desnecessárias durante a interação com agentes de IA, mantendo as instruções mais objetivas.

* **Ponytail:** utilizado para evitar soluções excessivamente complexas e incentivar implementações mais simples e adequadas ao escopo do projeto.

A utilização dessas ferramentas teve como objetivo acelerar tarefas repetitivas, geração de código e resolução de problemas específicos, sem transferir completamente as decisões técnicas para a IA.

## Processo de desenvolvimento e revisão

Após a geração ou alteração de código com auxílio de IA, o resultado passava por **revisão**.

A revisão foi feita principalmente através da leitura do código e da validação do comportamento da aplicação. As partes que receberam maior atenção foram aquelas relacionadas à **autenticação**, **regras de negócio** e **acesso ao banco de dados**, pois erros nessas áreas poderiam afetar diretamente o funcionamento da aplicação.

Também foram realizados **testes manuais** com a aplicação sendo executada através do **Docker**.

Durante o desenvolvimento, houve situações em que a implementação gerada pela IA não correspondia exatamente ao comportamento definido inicialmente. Nesses casos, o código foi revisado e ajustado manualmente até que estivesse de acordo com a especificação e com o comportamento esperado.

## Decisões que permaneceram sob minha responsabilidade

Mesmo utilizando IA durante o desenvolvimento, as principais decisões do projeto permaneceram sob minha responsabilidade.

Entre elas:

* **Definição da arquitetura da aplicação;**
* **Escolha da stack utilizada;**
* **Modelagem inicial do banco de dados;**
* **Definição das regras de negócio;**
* **Decisões relacionadas ao escopo;**
* **Definição do que deveria ou não ser implementado;**
* **Revisão do código gerado;**
* **Testes funcionais da aplicação;**
* **Correção de implementações que não correspondiam ao comportamento esperado.**

## Uso da IA durante o desenvolvimento

A principal utilização da IA foi como **aceleradora do processo de desenvolvimento**.

Ela foi utilizada para auxiliar na geração de código, criação de estruturas iniciais, resolução de problemas e implementação de partes repetitivas da aplicação.

Entretanto, a utilização da IA também exigiu revisão. Em alguns casos, o código gerado precisava ser ajustado, simplificado ou corrigido para seguir as decisões tomadas anteriormente.

Por esse motivo, a qualidade da especificação inicial foi importante para orientar as ferramentas utilizadas e reduzir interpretações incorretas dos requisitos.

## Sobre o uso de IA

A utilização de ferramentas de IA acelerou significativamente o processo de desenvolvimento, principalmente na criação da estrutura inicial e na implementação de partes repetitivas.

No entanto, **a IA não substituiu as decisões técnicas do projeto**. A definição inicial da arquitetura, do modelo de dados, das regras de negócio e do escopo foi necessária para orientar a implementação.

Além disso, o código gerado precisou ser revisado e validado durante o desenvolvimento.

## Conclusão

Ao longo do projeto, seu uso contribuiu diretamente para tornar o processo de desenvolvimento mais ágil, permitindo maior foco nas decisões técnicas, na estrutura da aplicação e na validação dos resultados. Dessa forma, **a IA foi incorporada ao processo de desenvolvimento como uma ferramenta de apoio à implementação e à tomada de decisões, potencializando a produtividade sem substituir a responsabilidade técnica sobre o projeto.**