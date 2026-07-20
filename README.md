# Stack-Dev Workspace

An opinionated, high-velocity TypeScript monorepo manager built on `pnpm` and the oxc toolchain (`oxlint`, `tsdown`) with TypeScript 7. This workspace provides the scaffolding for building shared libraries, React components, and CLI tools with minimal configuration overhead.

---

## ⚡ Quick Start

### 1. Install the CLI
To manage this workspace, install the `@stack-dev/cli` globally via npm:

```bash
npm install -g @stack-dev/cli
```

### 2. Create a New Workspace
Generate a new workspace using the `stack create` command:

```bash
stack create my-new-project
```

### 3. Generate Packages
Inside the workspace, use the `stack g` command to create different types of modules:

```bash
# Generate a vanilla TypeScript library
stack g my-utils --type library

# Generate a React library with Styled Components
stack g ui-kit --type react --style styled-components

# Generate a Vite + React application
stack g web-app --type vite
```

---

## 🛠 Commands

| Command                       | Alias | Description                                  |
|-------------------------------|-------|----------------------------------------------|
| `stack create <name>`         |       | Initialize a new workspace                  |
| `stack g <name>`              |       | Generate a new package, app, or config      |
| `stack link [name]`           | `l`   | Link a local workspace package to the current directory |
| `stack unlink [name]`         | `u`   | Remove a local package link                 |

---

## 🏗 Project Structure

This workspace is organized as follows:

- `packages/*`: Shared libraries and configuration packages.
- `apps/*`: Deployment targets such as Vite apps, CLIs, etc.
- `configs/*`: Shared oxlint, Prettier, and TypeScript configuration files.

---

## 🔧 Development Workflow

### Building
To build the workspace, run:

```bash
pnpm run build
```

### Running Locally
To run a compiled build:

```bash
pnpm start
```

For development, run in watch mode:

```bash
pnpm run build --watch
```

---

## 🛠 Smart Linking with CLI

The `@stack-dev/cli` provides intelligent linking for local packages in your workspace:

- **Interactively link a package**:
  ```bash
  stack link
  ```

- **Link as a `devDependency`**:
  ```bash
  stack link @stack-dev/core --dev
  ```

To unlink a package:

```bash
stack unlink
```

---

## Documentation

Visit the individual package directories (e.g., `packages/cli` or `apps`) for more specific details about their usage and configuration.