# Contributing to VibeCodex 🚀

First off, thank you for considering contributing to VibeCodex! It's people like you that make VibeCodex such a great tool.

## 1. Where do I go from here?

If you've noticed a bug or have a feature request, make sure to check our [Issues](../../issues) to see if someone else has already created a ticket. If not, go ahead and [make one](../../issues/new)!

## 2. Fork & create a branch

If this is something you think you can fix, then [fork VibeCodex](https://help.github.com/articles/fork-a-repo) and create a branch with a descriptive name.

A good branch name would be (where issue #325 is the ticket you're working on):

```sh
git checkout -b 325-add-new-template
```

## 3. Local Development

1. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/vibecodex.git
   cd vibecodex
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Link the package locally so you can easily test the CLI command:
   ```bash
   npm link
   ```
4. Now you can run `vibecodex` (or `vibecode`) anywhere on your machine and it will execute the code from your local branch!

## 4. Making Changes

VibeCodex consists of two main parts:
- **CLI Source Code (`/src` and `/bin`)**: Logic for prompts, GitHub integration, Vercel deployments, etc.
- **Templates (`/templates`)**: The raw App Router and Expo files that get copied over.

If you are updating templates, please ensure that:
1. The code builds successfully!
2. You follow standard best practices (like placing server/client boundaries correctly in Next.js).
3. The aesthetic stays premium. We use glassmorphism, nice gradients, and smooth animations.

## 5. Commit Guidelines

Try to keep your commits atomic and descriptive. We recommend following [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/):

- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `chore:` for updating dependencies or build tasks

Example:
`feat(cli): add support for custom python backend templates`

## 6. Submit a Pull Request

When you're ready:
1. Push your branch to your fork.
2. Open a Pull Request against the `main` branch of VibeCodex.
3. Provide a clear description of the problem you solved or the feature you added. 

We will review it as soon as possible! Thank you again!
