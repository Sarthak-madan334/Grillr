Use the repository-level [local development guide](../docs/local-development.md). The verified frontend setup is:

```powershell
npm ci
Copy-Item .env.example .env.local
npm run dev -- --hostname 127.0.0.1 --port 3000
```

Other verified checks are:

```powershell
npm test
npm run lint
npm run build
```
