# Study page client menu

The live study page is the Cloudflare Pages project `gvox` (direct upload).
`/files?acceso=MPL` is a fake study shell; it fetches `/app-core`, which is the
real hidden app.

The live `/app-core` is shadowed by Worker `gvox-app-core` (route
`study.676706767.xyz/app-core*`). The Worker fetches
`https://smalldevbignothing.github.io/horizon-web/next/app-core.b64`; that file
is generated from this `study-app-core.html` source and deployed in the
`horizon-web` `gh-pages` repo under `next/app-core.b64`.

Current menu:

- **Estable actual** — previous 1.12.2 optimized client (recommended).
- **Legacy 1.12.2** — previous 1.12.2 stable client.
- **Horizon 26.3 (Rust)** — `/next/`; **not recommended**: texture packs can
  crash it (observed `std::time` panic in the worker/render thread).

The new client is served by Worker `horizon-next` (route
`study.676706767.xyz/next*`) from the `horizon-web` `gh-pages` `next/` folder,
with COOP/COEP headers.
