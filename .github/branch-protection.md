# Branch Protection Rules

This document describes the branch protection rules that should be configured in GitHub for the Skones Security Management App repository.

## Main Branch Protection

### Branch Name: `main`

**Require pull request reviews before merging:**
- ✅ Require pull request reviews before merging
- ✅ Require code reviews: 2
- ✅ Require review from code owners
- ✅ Dismiss stale pull request approvals when new commits are pushed
- ✅ Require approval of the most recent reviewable push

**Require status checks to pass before merging:**
- ✅ Require branches to be up to date before merging
- ✅ Require status checks to pass before merging:
  - `security-scan`
  - `lint`
  - `test`
  - `build`
  - `dependency-check`
  - `code-quality`

**Require signed commits:**
- ✅ Require signed commits

**Require conversation resolution before merging:**
- ✅ Require all conversations on code to be resolved before merging

**Require deployments to succeed before merging:**
- ✅ Require deployments to succeed before merging
- Deployment environment: `production`

**Restrict who can push to matching branches:**
- ✅ Restrict who can push to matching branches
- Allow: Administrators only

**Allow force pushes:**
- ❌ Do not allow force pushes

**Allow deletions:**
- ❌ Do not allow deletions

## Develop Branch Protection

### Branch Name: `develop`

**Require pull request reviews before merging:**
- ✅ Require pull request reviews before merging
- ✅ Require code reviews: 1
- ✅ Require review from code owners
- ✅ Dismiss stale pull request approvals when new commits are pushed

**Require status checks to pass before merging:**
- ✅ Require branches to be up to date before merging
- ✅ Require status checks to pass before merging:
  - `security-scan`
  - `lint`
  - `test`
  - `build`

**Require signed commits:**
- ✅ Require signed commits

**Require conversation resolution before merging:**
- ✅ Require all conversations on code to be resolved before merging

**Allow force pushes:**
- ❌ Do not allow force pushes

**Allow deletions:**
- ❌ Do not allow deletions

## Staging Branch Protection

### Branch Name: `staging`

**Require pull request reviews before merging:**
- ✅ Require pull request reviews before merging
- ✅ Require code reviews: 1
- ✅ Dismiss stale pull request approvals when new commits are pushed

**Require status checks to pass before merging:**
- ✅ Require branches to be up to date before merging
- ✅ Require status checks to pass before merging:
  - `security-scan`
  - `lint`
  - `test`
  - `build`

**Allow force pushes:**
- ❌ Do not allow force pushes

**Allow deletions:**
- ❌ Do not allow deletions

## How to Configure in GitHub

1. Go to your repository settings
2. Navigate to **Branches** section
3. Click **Add rule** for each branch
4. Configure the settings as described above
5. Click **Create** to save the rule

## Bypass Rules

Only administrators can bypass these rules in emergency situations. When bypassing:
1. Document the reason in a comment
2. Create an issue to track the bypass
3. Review and merge the changes as soon as possible
4. Notify the team about the bypass

## Code Owner Configuration

Create a `CODEOWNERS` file in the root directory to specify required reviewers:

```
# Default owners for everything in the repo
* @owner1 @owner2

# Security-related files
lib/encryption.ts @security-lead
lib/security.ts @security-lead
lib/secure-storage.ts @security-lead
.github/workflows/ @devops-lead

# Configuration files
app.config.ts @tech-lead
package.json @tech-lead
tsconfig.json @tech-lead

# Documentation
*.md @tech-lead
SECURITY.md @security-lead
```

## Enforcement

These branch protection rules ensure:
- ✅ Code quality through linting and testing
- ✅ Security through automated scans
- ✅ Code review process with multiple reviewers
- ✅ Signed commits for audit trail
- ✅ Deployment verification before production
- ✅ Prevention of accidental deletions or force pushes

## Monitoring

Monitor branch protection compliance:
1. Check GitHub Actions workflow results
2. Review pull request reviews and approvals
3. Verify deployment status checks
4. Audit signed commits
5. Review bypass events (if any)

## Updates to This Policy

When updating branch protection rules:
1. Update this documentation
2. Notify the team
3. Create a GitHub issue to track the change
4. Get approval from team leads
5. Apply the changes
6. Document the reason for the change
