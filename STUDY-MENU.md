# Study page client menu

All study entry URLs require `?acceso=MPL`; without it they redirect to Google.

- `/files?acceso=MPL`: fake study shell; fetches `/app-core` (Worker requires the flag/referer).
- `/next/voltan/`: Voltan single-file loader (Worker `horizon-next`); the recommended client.
- `/next/`: Horizon 26.3 Rust build.
- `/horizon/`: older Horizon build.

Menu:
- **Voltan 26.3** — recommended. The loader seeds `Study` (`wss://playmc.jonurres.best`) in the launcher, the `Study Server` resource pack (11.2 MB) and low Chromebook options (`renderDistance:2`, fast graphics, no clouds, 60 FPS), then writes the 160 MB Voltan client.
- **Legacy 1.12.2** — old Eaglercraft client.
- **Horizon 26.3 (Rust)** — the previous client.

Voltan opens inside an `about:blank` popup/iframe, like the other games. The loader's `document.write` keeps the study origin so localStorage/IndexedDB (server list, pack, options) reach the game. The pack is deduplicated to one entry on every load.