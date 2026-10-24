# Third-party notices

## Product-Manager-Skills (deanpeters)

This project mounts [deanpeters/Product-Manager-Skills](https://github.com/deanpeters/Product-Manager-Skills) as a git submodule at `vendor/product-manager-skills` and copies its `skills/` (plus `commands/` wrappers) into `bot/skills/` for Agent SDK discovery. Synced copies are build artifacts (gitignored); the submodule remains the source of truth.

- **License:** Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0). Full text: `vendor/product-manager-skills/LICENSE` and https://creativecommons.org/licenses/by-nc-sa/4.0/
- **Attribution:** Product Manager Skills by Dean Peters and contributors.
- **Allowed here:** Personal / day-job use of the skills pack with this agent.
- **Not allowed:** Relicensing or selling the skills pack itself. If you productize commercially, switch to an Apache/MIT PM skills pack or obtain permission.

Upstream: https://github.com/deanpeters/Product-Manager-Skills

To refresh:

```bash
git submodule update --init --recursive
git -C vendor/product-manager-skills pull origin main
node scripts/sync-pm-skills.mjs
```
