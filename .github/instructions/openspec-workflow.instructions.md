---
applyTo: "**"
---

# OpenSpec workflow

- Read `openspec/config.yaml` before planning or coding. It is the only place for stack, conventions, and domain.
- Use `/opsx-explore`, `/opsx-propose`, `/opsx-apply`, `/opsx-update`, `/opsx-sync`, `/opsx-archive` instead of a fixed designer→dev→qa→review chain.
- Invoke `ui-designer`, `developer`, `qa-tester`, or `tech-reviewer` only when the current change has work for that role.
- If the change has UI, `qa-tester` uses Playwright CLI: one batched report per pass; MUST-fix to developer; unspecified visuals to the user. Max 3 QA passes.
- Max two retries per role outside the QA cycle, then ask the user.
- Do not put product rules in agents, `AGENTS.md`, or this file.
