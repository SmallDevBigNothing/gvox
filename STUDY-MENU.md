# Study page client menu

The live study page is the Cloudflare Pages project `gvox` (direct upload).
`/files?acceso=MPL` is a fake study shell; it fetches `/app-core`.

The live `/app-core` is shadowed by Worker `gvox-app-core`; the Worker fetches
`https://smalldevbignothing.github.io/horizon-web/next/app-core.b64`.

Menu:
- **Estable actual**: previous 1.12.2 optimized (recommended).
- **Legacy 1.12.2**: previous 1.12.2 stable.
- **Horizon 26.3 (Rust)** at `/next/`: repaired; it enters the world. If the
  resource-pack prompt appears, choose **No**.
