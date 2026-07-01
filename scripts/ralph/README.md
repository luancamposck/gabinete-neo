# Ralph — Agente Autônomo de Implementação

Ralph é um agente autônomo que implementa user stories a partir de um PRD no formato JSON. Ele trabalha em loop, completando uma story por iteração.

## Como iniciar um novo Ralph loop

1. **Criar o PRD** — escreva o arquivo `.md` em `tasks/` descrevendo a feature (ou use o comando `/prd` para gerar)
2. **Converter para `prd.json`** — converta o PRD para o formato Ralph e substitua `scripts/ralph/prd.json`. Certifique-se que:
   - Todas as user stories tenham `passes: false`
   - O `branchName` seja único para a nova feature
3. **Resetar o `progress.txt`** — limpe o log anterior, mantendo apenas o cabeçalho:
   ```
   # Ralph Progress Log
   Started: <data>
   PRD: <nome do PRD>
   ---
   ```
4. **Iniciar o loop** — execute o Ralph (via `ralph.sh` ou o comando `/loop` com o agente)

> O Ralph cria a branch automaticamente se ela não existir, baseado no `branchName` do `prd.json`.

## Estrutura do `prd.json`

```json
{
  "project": "vexnew-pro",
  "branchName": "ralph/nome-da-feature",
  "description": "Resumo curto da feature a partir do título/introdução do PRD",
  "userStories": [
    {
      "id": "US-001",
      "title": "Título da story",
      "description": "Descrição da user story",
      "acceptanceCriteria": [
        "Critério 1",
        "Critério 2",
        "Typecheck passes"
      ],
      "priority": 1,
      "passes": false,
      "notes": ""
    }
  ]
}
```

## Arquivos

| Arquivo | Descrição |
|---------|-----------|
| `CLAUDE.md` | Instruções do agente Ralph |
| `prd.json` | PRD atual no formato JSON |
| `progress.txt` | Log de progresso do loop atual |
| `ralph.sh` | Script de execução do Ralph |
