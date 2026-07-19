---
'@stack-dev/cli': patch
---

Fixed `PackageJSON` dropping `peerDependencies` when adding or removing a dependency, and fixed `devDependencies` being sorted to the end of a formatted `package.json` instead of into its intended position.
