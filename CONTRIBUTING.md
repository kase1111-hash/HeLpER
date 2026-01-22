# Contributing to HeLpER

Thank you for your interest in contributing to HeLpER! This document provides guidelines and instructions for contributing.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18 or later
- **Rust** (latest stable via [rustup](https://rustup.rs))
- **npm** (comes with Node.js)
- **Git**

For AI features (optional):
- [Ollama](https://ollama.ai) with a model like `llama3.2:3b`

### Development Setup

1. **Fork and clone the repository**

   ```bash
   git clone https://github.com/YOUR_USERNAME/HeLpER.git
   cd HeLpER
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Run in development mode**

   ```bash
   npm run tauri dev
   ```

   This starts both the Vite dev server and the Tauri application with hot-reload enabled.

### Windows Development

Windows users can use the provided batch scripts:

```batch
:: First-time setup
assemble-windows.bat

:: Start development server
startup-windows.bat

:: Build for production
build-windows.bat
```

## Development Workflow

### Branch Naming

Use descriptive branch names with a prefix:

- `feature/` - New features (e.g., `feature/export-to-pdf`)
- `fix/` - Bug fixes (e.g., `fix/calendar-navigation`)
- `docs/` - Documentation updates (e.g., `docs/api-reference`)
- `refactor/` - Code refactoring (e.g., `refactor/store-cleanup`)
- `test/` - Test additions or fixes (e.g., `test/weather-service`)

### Making Changes

1. Create a new branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes

3. Run the test suite:
   ```bash
   npm test
   ```

4. Check types:
   ```bash
   npm run check
   ```

5. Lint and format your code:
   ```bash
   npm run lint:fix
   npm run format
   ```

6. Commit your changes (see commit message guidelines below)

7. Push to your fork and open a pull request

### Code Style

This project uses automated formatting and linting:

- **ESLint** for JavaScript/TypeScript linting
- **Prettier** for code formatting
- **svelte-check** for Svelte component validation
- **rustfmt** for Rust code formatting
- **clippy** for Rust linting

Run all checks before submitting:

```bash
# TypeScript/Svelte
npm run lint
npm run format:check
npm run check

# Rust (from src-tauri directory)
cargo fmt --check
cargo clippy
```

### Commit Messages

Write clear, descriptive commit messages:

- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- Keep the first line under 72 characters
- Reference issues when applicable

**Good examples:**
- `Add calendar date picker UI`
- `Fix note auto-save timing issue`
- `Update documentation for NatLangChain integration`

**Structure for larger changes:**
```
Short summary (under 72 characters)

More detailed explanation if necessary. Wrap at 72 characters.
Explain the problem this commit solves and why this approach
was chosen.

Fixes #123
```

## Testing

### Running Tests

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run end-to-end tests
npm run test:e2e
```

### Writing Tests

- Place unit tests in `tests/` mirroring the `src/lib/` structure
- Place E2E tests in `e2e/`
- Use descriptive test names that explain the expected behavior
- Test both success and error cases

Example test structure:
```typescript
import { describe, it, expect } from 'vitest';

describe('featureName', () => {
  it('should handle expected input correctly', () => {
    // Arrange
    // Act
    // Assert
  });

  it('should throw error for invalid input', () => {
    // Test error cases
  });
});
```

## Pull Request Process

1. **Open an issue first** - For significant changes, please open an issue to discuss your proposed changes before starting work.

2. **Keep PRs focused** - Each pull request should address a single concern. Split larger changes into multiple PRs.

3. **Update documentation** - If your change affects user-facing features, update the relevant documentation in `docs/` or `README.md`.

4. **Add tests** - New features should include tests. Bug fixes should include a test that would have caught the bug.

5. **Pass CI checks** - All tests and linting must pass before merging.

6. **Request review** - Request a review from a maintainer once your PR is ready.

### PR Template

When opening a PR, include:

- **Summary** - Brief description of the changes
- **Related Issue** - Link to the related issue if applicable
- **Testing** - How you tested the changes
- **Screenshots** - For UI changes, include before/after screenshots

## Project Structure

Understanding the codebase structure will help you contribute effectively:

```
HeLpER/
├── src/                    # Svelte frontend
│   ├── components/         # UI components
│   └── lib/
│       ├── services/       # API and external service integrations
│       ├── stores/         # Svelte reactive stores
│       ├── utils/          # Helper functions
│       └── types.ts        # TypeScript type definitions
├── src-tauri/              # Rust backend
│   └── src/
│       ├── commands.rs     # Tauri IPC commands
│       ├── database.rs     # SQLite operations
│       └── *.rs            # Other backend modules
├── tests/                  # Unit tests
├── e2e/                    # End-to-end tests
└── docs/                   # Documentation
```

### Key Patterns

- **Frontend state** is managed via Svelte stores in `src/lib/stores/`
- **Backend communication** uses Tauri commands defined in `src-tauri/src/commands.rs`
- **Service layer** in `src/lib/services/` handles external API interactions

## Reporting Bugs

When reporting bugs, please include:

1. **Description** - Clear description of the bug
2. **Steps to reproduce** - Detailed steps to reproduce the issue
3. **Expected behavior** - What you expected to happen
4. **Actual behavior** - What actually happened
5. **Environment** - OS, version, and relevant configuration
6. **Screenshots/logs** - If applicable

## Feature Requests

For feature requests:

1. **Check existing issues** - Search to see if it's already been requested
2. **Describe the use case** - Explain why this feature would be useful
3. **Propose a solution** - If you have ideas on implementation

## Questions?

If you have questions about contributing, feel free to open an issue with the "question" label.

---

Thank you for contributing to HeLpER!
