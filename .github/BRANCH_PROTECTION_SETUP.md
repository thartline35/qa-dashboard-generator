# GitHub Branch Protection Setup Guide

This guide explains how to set up branch protection rules that require CI checks to pass before deploying to production.

## Required Status Checks

The following status checks must pass before merging to `main` branch:

1. **Lint Check** - Ensures code follows linting standards
2. **Test Suite** - Runs all tests to verify functionality
3. **Build Verification** - Verifies the project builds successfully
4. **Production Deployment Checks** - Comprehensive production readiness checks

## Setting Up Branch Protection Rules

### Step 1: Navigate to Repository Settings

1. Go to your GitHub repository
2. Click on **Settings** (top menu)
3. Click on **Branches** (left sidebar)

### Step 2: Add Branch Protection Rule

1. Under "Branch protection rules", click **Add rule** or **Add branch protection rule**
2. In the "Branch name pattern" field, enter: `main` (or `master` if that's your default branch)

### Step 3: Configure Protection Settings

Enable the following settings:

#### Required Status Checks

1. ✅ Check **"Require status checks to pass before merging"**
2. ✅ Check **"Require branches to be up to date before merging"**
3. ✅ Check **"Require conversation resolution before merging"** (optional but recommended)

4. Under "Status checks that are required", select:
   - ✅ **Lint Check**
   - ✅ **Test Suite**
   - ✅ **Build Verification**
   - ✅ **Production Deployment Checks / production-checks**

#### Additional Protection (Recommended)

- ⚠️ **"Require pull request reviews before merging"** (optional)
  - Required approving reviews: `1` (or `0` if you're working solo)
  - Dismiss stale pull request approvals when new commits are pushed: `✅`
  - **Note:** If you're the only contributor, you can set this to `0` to allow merging your own PRs
  
- ✅ **"Require linear history"** (optional, for cleaner git history)

- ✅ **"Do not allow bypassing the above settings"** (prevents admin override)

- ✅ **"Restrict who can push to matching branches"** (optional, limit to specific teams/users)

### Step 4: Save the Rule

Click **"Create"** or **"Save changes"** at the bottom of the page.

## Workflow Files

The repository includes the following GitHub Actions workflows:

### `.github/workflows/ci.yml`
- Runs on pull requests and pushes to main
- Performs: Lint, Test, Build, and Verify checks
- Must pass before merging

### `.github/workflows/production-deployment.yml`
- Runs on pull requests and pushes to main
- Comprehensive production readiness checks
- Must pass before merging

## Testing the Setup

1. Create a pull request to the `main` branch
2. You should see the status checks running
3. The PR will be blocked from merging until all checks pass
4. Once all checks pass, the PR can be merged

## Troubleshooting

### Checks Not Showing Up

If the status checks don't appear:
1. Make sure the workflow files are in `.github/workflows/`
2. Push a commit to trigger the workflows
3. Go to **Actions** tab to see if workflows are running
4. Wait for workflows to complete at least once before they appear in branch protection

### Checks Failing

If checks are failing:
1. Click on the failed check to see details
2. Review the error messages
3. Fix issues locally and push again
4. All checks must pass before merging

### Bypassing Checks (Not Recommended)

If you need to bypass checks (not recommended for production):
1. Only repository admins can do this if "Do not allow bypassing" is disabled
2. Go to branch settings and temporarily disable the rule
3. Re-enable immediately after

## Best Practices

1. ✅ Always run checks locally before pushing:
   ```bash
   npm run build
   npm test
   ```

2. ✅ Fix linting issues before pushing:
   ```bash
   npx eslint src/ --ext .js,.jsx
   ```

3. ✅ Keep your branch up to date:
   ```bash
   git pull origin main
   ```

4. ✅ Review all check results before merging PRs

5. ✅ Never bypass checks for production deployments

## Additional Resources

- [GitHub Branch Protection Documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

