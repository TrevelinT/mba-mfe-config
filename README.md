# @trevelint/mfe-config

Shared Tailwind v4 theme tokens for MFE shell and remotes. Font faces live in each consumer (`public/fonts` + `@font-face` with that app’s Pages base) so the package does not hardcode a single host path.

## Usage

```css
/* remote */
@import "tailwindcss" prefix(product); /* cart: prefix(cart); buy-box: prefix(buybox) */
@import "@trevelint/mfe-config/tailwind/theme";
@source "./**/*.{tsx,ts}";

/* shell — no prefix */
@import "tailwindcss";
@import "@trevelint/mfe-config/tailwind/theme";
@source "./**/*.{tsx,ts}";
```

Each consumer declares `@trevelint/mfe-config` in `dependencies`.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run changeset` | Add a changeset (semver bump + notes) |
| `npm run version-packages` | Apply pending changesets (used by Release CI) |
| `npm run release` | `npm publish` to GitHub Packages + GitHub tag `vX.Y.Z` |

## CI

[GitHub Actions](https://docs.github.com/en/actions) ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) runs on push to `main`, on pull request open/sync, and on demand via **Run workflow** (`workflow_dispatch`). It installs dependencies and runs `npm publish --dry-run`.

## Release

Versions are managed with [Changesets](https://github.com/changesets/changesets). Include a changeset in any PR that should bump the version:

```sh
npm run changeset
```

### What happens on `main`

1. Merge the feature PR (with changesets) to `main`.
2. **CI** runs. Only if it succeeds does **Release** ([`.github/workflows/release.yml`](.github/workflows/release.yml)) start.
3. Release opens or updates a **Version Packages** PR.
4. Review and merge that PR when you want to cut a version.
5. CI runs again. On success, Release runs `npm run release`: publishes `@trevelint/mfe-config` to GitHub Packages and creates tag/release `v{version}` from `CHANGELOG.md`.

Do not push `v*` tags by hand. The first bump after this infrastructure lands should be an explicit changeset (for example `0.1.0`).

## Consumer install (GitHub Packages)

**Consumer `package.json`:**

```json
"@trevelint/mfe-config": "0.0.1"
```

**Consumer `.npmrc` (committed, no token):**

```
@trevelint:registry=https://npm.pkg.github.com
```

**Local install:** PAT with `read:packages` in `~/.npmrc`:

```
@trevelint:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=ghp_xxxxxxxx
```

Then `npm ci` in each MFE repo.

**Consumer CI** (before `npm ci`):

```yaml
permissions:
  contents: read
  packages: read

- uses: actions/setup-node@v7
  with:
    node-version-file: package.json
    cache: npm
    registry-url: https://npm.pkg.github.com
    scope: "@trevelint"
- run: npm ci
  env:
    NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

If cross-repo package read fails, use an org PAT: `secrets.MFE_CONFIG_READ_TOKEN`.

### Local theme iteration

```bash
cd /path/to/mba-mfe-config && npm link
cd /path/to/mba-mfe-product && npm link @trevelint/mfe-config
```

Unlink before opening a PR that relies on registry installs.
