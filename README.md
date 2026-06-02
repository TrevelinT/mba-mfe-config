# @mfe/config

Shared Tailwind v4 theme tokens for MFE shell and remotes.

## Usage

```css
/* remote */
@import "tailwindcss" prefix(product); /* cart: prefix(cart); buy-box: prefix(buybox) */
@import "@mfe/config/tailwind/theme";
@source "./**/*.{tsx,ts}";

/* shell — no prefix */
@import "tailwindcss";
@import "@mfe/config/tailwind/theme";
@source "./**/*.{tsx,ts}";
```

Each consumer declares `@mfe/config` in `devDependencies`.

## Distribution

### Option A — GitHub Packages (recommended)

**First-time setup**

1. Push this repo to GitHub (`your-org/mfe-config`).
2. Tag and publish: `git tag v1.0.0 && git push origin v1.0.0` (triggers [publish.yml](.github/workflows/publish.yml)).
3. In each consumer (shell, product, cart, buy-box), with a PAT in `~/.npmrc`: `npm install @mfe/config@1.0.0` and commit the updated `package-lock.json`.

Until step 3, `npm ci` in consumers will not resolve `@mfe/config` from the registry. Use `npm link` for local work (see below).

**Release:** push a version tag (`v1.0.0`, `v1.0.1`, …). The [publish workflow](.github/workflows/publish.yml) runs `npm publish` to `https://npm.pkg.github.com`.

**Consumer `package.json`:**

```json
"@mfe/config": "1.0.0"
```

**Consumer `.npmrc` (committed, no token):**

```
@mfe:registry=https://npm.pkg.github.com
```

**Local install:** PAT with `read:packages` in `~/.npmrc`:

```
@mfe:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=ghp_xxxxxxxx
```

Then `npm ci` in each MFE repo.

**Consumer CI** (before `npm ci`):

```yaml
permissions:
  contents: read
  packages: read

- uses: actions/setup-node@v6
  with:
    node-version-file: package.json
    cache: npm
    registry-url: https://npm.pkg.github.com
    scope: "@mfe"
- run: npm ci
  env:
    NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

If cross-repo package read fails, use an org PAT: `secrets.MFE_CONFIG_READ_TOKEN`.

### Option B — Git URL (no registry)

**Release:** tag only — no `npm publish`.

```bash
git tag v1.0.0 && git push origin v1.0.0
```

**Consumer `package.json`:**

```json
"@mfe/config": "git+https://github.com/your-org/mfe-config.git#v1.0.0"
```

Local dev with SSH:

```json
"@mfe/config": "git+ssh://git@github.com/your-org/mfe-config.git#v1.0.0"
```

**Consumer CI:** ensure git can read the private config repo (no registry `.npmrc`). See the MFE config distribution plan for git credential options.

### Local theme iteration

```bash
cd /path/to/mfe-config && npm link
cd /path/to/mfe-product && npm link @mfe/config
```

Unlink before opening a PR that relies on Option A or B installs.

## Versioning

1. Change `tailwind/theme.css`.
2. **Option A:** `npm version patch` → push tag `v*`.
3. **Option B:** new tag `v1.0.1`.
4. Bump `@mfe/config` in shell, product, cart, buy-box (same version everywhere).
5. Rebuild remotes for federated CSS.
