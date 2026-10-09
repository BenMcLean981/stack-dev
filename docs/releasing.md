# Releasing

Merging the **Version Packages** PR publishes to npm. The Release workflow runs
on every push to `main`: if changesets are pending it opens or updates that PR,
and if none are pending it publishes.

## Authentication: move off `NPM_TOKEN`

Today the workflow publishes with a stored `NPM_TOKEN`. That is worth getting
rid of, because npm caps granular write tokens at **90 days** and there is no
way to renew one — you can only create a replacement. When it lapses, every
publish fails with a misleading error:

```
E404 Not Found - PUT https://registry.npmjs.org/@stack-dev%2fcli
'@stack-dev/cli@0.4.0' is not in this registry.
```

`E404` on a `PUT` means **unauthorized**, not missing. npm answers 404 so it
does not leak whether a package exists. If every package fails at once and some
of them have published before, the credential is the problem.

### Trusted publishing (OIDC) is the fix

The trust relationship is between npm and this repository plus the workflow
file, and each publish authenticates with a short-lived token minted during the
run. Once validated it does not expire, there is no secret in the repository,
and publishes get provenance attestation.

The workflow is already set up for it: `id-token: write`, `setup-node@v6`, and
an npm upgrade step, because Node 22 bundles npm 10 and trusted publishing
needs 11.5.1 or newer.

What remains is per package, on npmjs.com → the package → Settings → Trusted
Publisher → GitHub Actions:

| Field               | Value          |
| ------------------- | -------------- |
| Organization / user | `BenMcLean981` |
| Repository          | `stack-dev`    |
| Workflow filename   | `release.yml`  |
| Environment         | leave empty    |

Do this for all seven published packages:

- `@stack-dev/cli`
- `@stack-dev/core`
- `@stack-dev/oxfmt-config`
- `@stack-dev/oxlint-config`
- `@stack-dev/typescript-config`
- `@stack-dev/react-css`
- `@stack-dev/react-styled-components`

Two constraints that bite if you do not plan for them:

1. **A configuration you have not published through expires after 48 hours.**
   It becomes permanent only after one successful OIDC publish. So configure
   all seven and then release, rather than configuring and walking away.
2. **OIDC cannot perform a package's first publish.** A package must already
   exist on npm before you can give it a trusted publisher.

Once a release has gone out through OIDC, delete the `NPM_TOKEN` secret and its
line in `release.yml`. Nothing is left to expire.

## Adding a new package to the monorepo

Because of constraint 2 above, a brand new package needs one publish that does
not come from CI. No token is needed — npm supports interactive login:

```bash
npm login                       # session based, nothing stored in the repo
cd configs/my-new-config
npm publish --access public
```

Then configure its trusted publisher as above, and CI handles every release
after that. Some people publish a `0.0.0` placeholder instead, configure trust,
let CI publish the first real version, and deprecate the placeholder.

## If a release fails

The workflow opens an issue labeled `release-failure` with a link to the run, so
a dead release is visible rather than silent.

Recovery is usually just re-running it. `changeset publish` skips versions that
are already on npm and publishes the rest, so re-running after fixing the cause
is safe. Versions are not consumed by a failed publish.

Note that **CI never runs on the Version Packages PR**: GitHub does not trigger
workflows for pull requests opened by `GITHUB_TOKEN`, which is what the
changesets action uses. To check that commit before merging it:

```bash
git worktree add --detach /tmp/release-check origin/changeset-release/main
cd /tmp/release-check
pnpm install --frozen-lockfile   # what the workflow runs
pnpm build && pnpm check-types && pnpm lint && pnpm format:check && pnpm test
git worktree remove --force /tmp/release-check
```
