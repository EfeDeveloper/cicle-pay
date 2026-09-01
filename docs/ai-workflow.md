# Flujo AI (OpenSpec + agentes)

Cómo está armado este repo y cómo copiarlo a otro proyecto.

## Regla de carpetas

Todo va en la **raíz del repositorio** (mismo nivel que el código y el manifesto del paquete):

```
repo/
  AGENTS.md
  openspec/          config, specs, changes
  .cursor/           commands, skills, rules, agents
  .github/           prompts, skills, agents, instructions
  .vscode/           extensions recomendadas
  src/               (o el árbol de tu app)
```

No crees un wrapper tipo `editors/` + `app/`. Cursor, Copilot y OpenSpec buscan estas carpetas en el git root / workspace root.

## Qué es portable vs qué se edita

| Copiar tal cual | Reescribir por producto |
|-----------------|-------------------------|
| `.github/agents/` | `openspec/config.yaml` (`context`, `rules`, `operations`) |
| `.cursor/agents/` | `openspec/specs/` |
| `.cursor/commands/` y `.cursor/skills/` | |
| `.github/prompts/` y `.github/skills/` | |
| `AGENTS.md` | |
| `.cursor/rules/openspec-workflow.mdc` | |
| `.github/instructions/openspec-workflow.instructions.md` | |

`openspec/config.yaml` es el **único** archivo de stack/dominio. Los agentes no nombran frameworks ni reglas de negocio.

## Cómo inicializar otro repo

1. En el git root: `openspec init --tools cursor,github-copilot --no-copilot-cloud`
2. Copia agentes, `AGENTS.md`, rule e instruction de este repo (o deja los commands/skills que genera el CLI y suma los 4 roles).
3. Reescribe `openspec/config.yaml` con el producto nuevo.
4. Sustituye `openspec/specs/` por las invariantes de ese dominio.
5. Reinicia el IDE para que cargue prompts y agentes.

## Cómo trabajar día a día

1. `/opsx-explore` si el problema está borroso.
2. `/opsx-propose` para artifacts (sin código).
3. Revisar proposal/specs/design/tasks.
4. `/opsx-apply` — invoca roles solo si el change los necesita. Con UI, `qa-tester` usa Playwright CLI (lote MUST-fix, PREGUNTAR al usuario, máx. 3 pasadas).
5. `/opsx-archive` cuando las tasks están hechas y las specs main al día.

## Por qué no hay Director

OpenSpec ya ordena propose → apply → archive. Un orquestador extra forzaba seis fases en cada fix. Los roles son especialistas, no un organigrama.
