# GitHub Actions Workflows

This directory contains GitHub Actions workflows that run automatically on pull requests and pushes to the main branch.

## Workflows

### 1. CI Checks (`.github/workflows/ci.yml`)

Runs comprehensive checks on every pull request and push to main:

- **Lint Check** - Validates code style and catches errors
- **Test Suite** - Runs all tests to ensure functionality
- **Build Verification** - Ensures the project builds successfully
- **Production Readiness Check** - Final verification before deployment

### 2. Production Deployment Checks (`.github/workflows/production-deployment.yml`)

Runs comprehensive production readiness checks:

- Full linting validation
- Complete test suite execution
- Production build verification
- Security vulnerability checks
- Build size verification

## Status Checks

These workflows create status checks that must pass before:
- Merging pull requests to `main`
- Deploying to production

The following status checks are created:
1. `Lint Check`
2. `Test Suite`
3. `Build Verification`
4. `Production Deployment Checks / production-checks`

## Setting Up Required Status Checks

To require these checks before merging, see: [BRANCH_PROTECTION_SETUP.md](./BRANCH_PROTECTION_SETUP.md)

## Viewing Workflow Runs

1. Go to your repository on GitHub
2. Click the **Actions** tab
3. View workflow runs and their results

## Local Testing

Before pushing, you can run these checks locally:

```bash
# Install dependencies
npm ci

# Run linting
npx eslint src/ --ext .js,.jsx

# Run tests
npm test

# Build project
npm run build
```

## Troubleshooting

### Workflows Not Running

- Ensure workflow files are in `.github/workflows/`
- Check that workflows are enabled in repository settings
- Verify the branch names match (main vs master)

### Checks Failing

- Review the error output in the Actions tab
- Run checks locally to debug
- Fix issues and push again

