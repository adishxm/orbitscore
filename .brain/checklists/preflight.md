# Preflight checklist

Run these checks before taking a task:

- [ ] `git status` is understood and current work is not overwritten.
- [ ] `.brain/state.json` has been read.
- [ ] The task dependencies are complete.
- [ ] The task owner and reviewer are known.
- [ ] No secrets are present in the working tree.
- [ ] The current package verification baseline is known.
- [ ] The task's allowed files and acceptance checks are understood.

Baseline commands:

```bash
cd apps/api && pytest -q
python -m app.verification
cd ../..
npm test
npm run typecheck
npm run build
```
