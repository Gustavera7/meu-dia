# Meu Dia — sistema pessoal de saude, performance e desenvolvimento

MVP pessoal. Roda no navegador do celular e pode ser instalado na tela inicial
como aplicativo. Todos os dados ficam no proprio aparelho, sem servidor.

O ciclo do produto e um so:

**Planejar → Executar → Registrar → Aprender → Ajustar o proximo dia.**

## Como rodar

```bash
npm install
npm run dev
```

Abra `http://localhost:5173`. Para usar no celular na mesma rede, o comando ja
sobe com `--host`: use o endereco de rede que o terminal mostra.

Para instalar no celular: abra o endereco no navegador e escolha
"Adicionar a tela de inicio".

## O que existe hoje

| Area | O que faz |
| --- | --- |
| Onboarding | 7 passos que geram rotina de treino, refeicoes, habitos e rotinas |
| Meu Dia | Tudo do dia em cards, com marcacao direta |
| Treino | Rotina semanal gerada por objetivo, tempo, nivel e equipamento |
| Nutricao | Refeicoes recorrentes, troca por enjoo, receitas rapidas |
| Motor | Sessao diaria de 5 a 12 min com modo guiado e cronometro |
| Habitos | Proprios ou sugeridos, com historico de 7 dias |
| Rotinas | Manha e noite editaveis, encaixadas no tempo disponivel |
| Leitura | Meta diaria, livros e registro por minutos e paginas |
| Check-in | Seis respostas rapidas que alimentam o dia seguinte |
| Seu amanha | Plano do proximo dia com o motivo de cada ajuste |
| Pilares | Consistencia por area, sem linguagem clinica |
| Perfil | Edicao total, ligar/desligar areas, backup e sincronizacao |
| Metas | Objetivos com data marcada que apertam a rotina ate passarem |
| Relatorio | Pontos fortes e pontos a melhorar, a qualquer momento |
| Planos prescritos | Cadastrar o que nutricionista ou personal passou |

## Arquitetura

Separacao rigida por camada. Nada de baixo conhece nada de cima.

```
src/
  core/        tipos do dominio, datas, ids, rotulos    (sem React)
  domain/      regras de negocio                        (sem React)
    training/      catalogo de exercicios + gerador de rotina
    nutrition/     alimentos, refeicoes, motor de troca, receitas
    motor/         drills + gerador de sessao
    habits/        sementes e criacao de habitos
    routines/      montagem de rotina por tempo disponivel
    pillars/       definicao dos pilares
    goals/         metas com prazo e suas fases
    prescriptions/ planos de nutricionista e personal
    report/        analise do historico em linguagem comum
    planning/      plano do dia, adaptacao e progresso
  data/        persistencia, fusao e sincronizacao
    adapters/      local e nuvem, atras de uma interface unica
    merge.ts       juncao entre aparelhos, registro a registro
    sync.ts        orquestracao: puxar, juntar, enviar
  state/       reducer, contexto, hooks e seletores
  ui/          componentes e telas                      (so React)
```

Regras que valem para evoluir sem quebrar:

- `core/` e `domain/` sao puros: funcoes que recebem estado e devolvem dados.
  Da para testar sem navegador e reaproveitar num backend depois.
- Toda leitura e escrita passa por `data/storage.ts`. Trocar localStorage por
  IndexedDB ou por uma API significa reescrever so esse arquivo.
- `data/storage.ts` ja tem versao de estado e ponto de migracao (`MIGRATIONS`).
- O motor de adaptacao vive em `domain/planning/adaptation.ts` e devolve
  ajustes com codigo, mensagem e motivo. Trocar as regras por IA depois e
  substituir esse arquivo mantendo o mesmo contrato.
- Catalogos (`exercises.ts`, `foods.ts`, `drills.ts`, `recipes.ts`) sao dados.
  Crescem sem tocar em logica.

## O motor de adaptacao

Depois do check-in, o app le os ultimos dias e ajusta o proximo:

| Sinal | Ajuste |
| --- | --- |
| Energia ou sono baixos | Treino em versao leve (menos series, mesmos exercicios) |
| Energia 1 e sono baixo | Sem treino pesado, sessao motora restaurativa, dormir mais cedo |
| Estresse 4 ou 5 | Mais respiracao na rotina da noite |
| Alimentacao ruim | Refeicoes simples e receitas de ate 15 minutos |
| 3 dias sem leitura | Meta cai para 10 minutos |
| Semana abaixo da frequencia | Lembrete de treino no dia seguinte |

Cada ajuste aparece com o motivo. Nada acontece sem explicacao.

Regras que olham para tras so entram depois de alguns dias de uso: no primeiro
dia elas soariam como cobranca sem base.

## Personalizacao

Objetivos, treino, dieta, restricoes, horarios, foco motor, habitos e passos de
rotina sao editaveis em Perfil. Cada area do app pode ser desligada sem perder
os dados. O gerador nunca sugere alimento que voce marcou que nao gosta.

## Sincronizacao entre aparelhos

Nao existe servidor arbitrando. Cada aparelho guarda o estado inteiro e a
juncao acontece na leitura, REGISTRO A REGISTRO, pelo `updatedAt` mais recente.
Isso importa: marcar o treino no celular e criar um habito no computador
sobrevivem os dois. Trocar o estado inteiro pelo mais recente perderia um.

Tres decisoes sustentam isso:

1. **Lapides em vez de exclusao.** Apagar marca `deletedAt`. Sem isso, o outro
   aparelho ressuscitaria o registro na proxima juncao. Os seletores em
   `state/selectors.ts` filtram lapides para que nenhuma tela precise saber.
2. **A ordem e sempre puxar, juntar, enviar.** Enviar antes de ler
   sobrescreveria o outro aparelho.
3. **Sem leitura confirmada, nao se escreve.** Se a nuvem nao pode ser lida,
   o envio fica bloqueado e os dados seguem no aparelho. Publicar sem saber o
   que ja esta la e a forma mais facil de apagar dados de verdade.

Onde os dados moram depende de onde o app foi aberto:

| Contexto | Destino | Sincroniza |
| --- | --- | --- |
| `npm run dev` ou hospedagem propria | `localStorage` | Nao |
| Artifact publicado na sua conta | `data/estado.json` do proprio artifact | Sim |

No artifact, o app fica fixo em `index.html` e os dados vao para um arquivo
separado. Gravar publica uma versao so desse arquivo, entao a aba que grava
continua rodando e as outras recarregam com o dado novo. Envios sao agrupados:
cinco marcacoes seguidas viram uma ida so, e sair do app forca o envio.

Trocar por um servidor proprio no futuro e escrever um adaptador em
`data/adapters/`. O resto do app nao muda.

## Backup

Em Perfil, "Fazer backup" mostra tudo em JSON com um botao de copiar, e
"Restaurar backup" aceita o texto de volta. PIN de tela e opcional — e uma
tranca simples de uso pessoal, nao autenticacao de servidor.

## Planos de nutricionista e personal

Um plano prescrito e palavra de outra pessoa. O app pode lembrar, acompanhar
e aconselhar, mas **nunca reescreve** o que um profissional prescreveu:

- com plano ativo, o gerador interno sai de cena e vira reserva;
- o motor de adaptacao para de alterar series e refeicoes, e passa a mandar
  recado ("energia baixa, se puder pegue leve e avise seu personal");
- desativar devolve exatamente o que existia antes, sem perder nada.

Essa e a base do caminho para o produto B2B: o mesmo formato que voce preenche
hoje e o que um profissional preencheria pelo lado dele.

## Proximos passos naturais

1. Usar por algumas semanas e anotar o que atrapalha.
2. Historico e tendencias por pilar ao longo de meses.
3. Progressao de carga por exercicio a partir dos registros.
4. Camada de IA sobre a base de dados ja coletada, substituindo
   `adaptation.ts` sem mexer no resto.
5. Multiusuario: mesmo motor, perfis diferentes, e o lado do profissional
   preenchendo os planos prescritos direto para o cliente.
