# Study page client menu

The live study page is the Cloudflare Pages project `gvox` (direct upload).
All study entry URLs require `?acceso=MPL`; without it they redirect to Google.

- `/files?acceso=MPL`: fake study shell; fetches `/app-core`.
- `/app-core`: Worker `gvox-app-core` (requires the flag or a `/files?acceso=MPL` referer).
- `/next/`: Worker `horizon-next`; updated Rust client; opens in `about:blank`.
- `/horizon/`: Worker `horizon-router`.

Menu: Estable actual (1.12.2 optimizado), Legacy 1.12.2, Horizon 26.3 (Rust)
`/next/` repaired. The Rust option opens an about:blank popup with an iframe
`/next/?acceso=MPL`; it uses pkg-st because about:blank cannot be isolated.
