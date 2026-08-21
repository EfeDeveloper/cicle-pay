# AGENTS

Instrucciones portables para cualquier asistente (Cursor, GitHub Copilot, etc.).

## Contexto del producto

Stack, convenciones y dominio viven **solo** en [`openspec/config.yaml`](openspec/config.yaml). Léelo antes de diseñar, implementar, probar o revisar. No copies esas reglas a este archivo ni a los agentes.

## Flujo (OpenSpec manda)

No uses un pipeline fijo de roles. Elige el comando y, dentro de él, solo los roles que el change necesita.

| Intención | Comando |
|-----------|---------|
| Pensar / investigar | `/opsx-explore` |
| Planear un change | `/opsx-propose` |
| Ajustar artifacts existentes | `/opsx-update` |
| Implementar tasks | `/opsx-apply` |
| Volcar deltas a specs main | `/opsx-sync` |
| Cerrar un change hecho | `/opsx-archive` |

En Cursor los commands están en `.cursor/commands/`. En VS Code Copilot, los prompts están en `.github/prompts/`.

## Roles (invocar, no orquestar)

| Rol | Cuándo |
|-----|--------|
| `ui-designer` | El change toca UI. No escribe código. |
| `developer` | Hay tasks de implementación. |
| `qa-tester` | El change tiene UI. Playwright MCP. Un reporte por pasada; MUST-fix vs PREGUNTAR. |
| `tech-reviewer` | Al cerrar apply, con pruebas verdes o omitidas. Una vez. |

Copilot: `.github/agents/*.agent.md`. Cursor: `.cursor/agents/*.md`. Mismo oficio, frontmatter distinto.

Si un change no tiene UI, no llames a `ui-designer` ni a `qa-tester`. Ciclo QA: hasta 3 pasadas (lote MUST-fix → developer → re-test de fallos + humo). PREGUNTAR espera al usuario. Fuera de QA, máximo 2 reintentos por rol.

## Layout del repo

`.cursor/`, `.github/`, `.vscode/` y `openspec/` viven en la **raíz del git**, junto al código. No anides la app bajo una carpeta “proyecto” separada de los editores.
