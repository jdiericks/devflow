# Contributing to DevFlow

We love your input! We want to make contributing to DevFlow as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Project Structure

The project follows a modular structure:

- `src/components/`: Vue components
- `src/stores/`: Pinia state management
- `src/assets/`: Static assets
- `public/`: Public static files

## Development Guidelines

### Component Structure

- Use Vue 3 Composition API with `<script setup>`
- Keep components focused and single-responsibility
- Follow the existing component patterns:
  - `Dashboard.vue` for main views
  - `PageEditor.vue` for content editing
  - `TreeNode.vue` for tree structure
  - `MediaLibrary.vue` for media handling
  - `CalendarView.vue` for calendar features

### State Management

- Use Pinia stores for state management
- Follow the existing store patterns:
  - `node.js` for tree structure
  - `project.js` for project state
  - `auth.js` for authentication
  - `workspace.js` for workspace management
  - `media.js` for media handling

### Styling

- Use TailwindCSS for styling
- Follow the existing design patterns
- Maintain responsive design
- Use the existing color scheme and components

## We Develop with GitHub

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

## We Use [Github Flow](https://guides.github.com/introduction/flow/index.html)

Pull requests are the best way to propose changes to the codebase. We actively welcome your pull requests:

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

## Development Process

1. Clone the repository
2. Create a new branch for your feature/fix
3. Make your changes
4. Run tests and ensure they pass
5. Submit a pull request

## Code Style

- Use Vue 3 Composition API with `<script setup>`
- Follow the Vue.js style guide
- Use TypeScript for type safety
- Write meaningful commit messages
- Keep components small and focused
- Use TailwindCSS for styling
- Follow the existing file structure
- Maintain consistent naming conventions

## Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for formatting changes
- `refactor:` for code refactoring
- `test:` for adding tests
- `chore:` for maintenance tasks

## License

By contributing, you agree that your contributions will be licensed under its MIT License. 