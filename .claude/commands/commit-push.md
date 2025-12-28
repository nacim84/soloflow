# Commit + Push Command

Create a clean, professional commit following best practices and push to remote repository.

## Task

Execute a complete Git commit and push workflow with best practices:

### Phase 1: Analysis (Gather Context)

Run these commands **in parallel** to understand the changes:

1. **Check repository state**:
   ```bash
   git status
   ```

2. **View detailed changes**:
   ```bash
   git diff
   ```

3. **Check recent commit style**:
   ```bash
   git log --oneline -5
   ```

4. **Check current branch**:
   ```bash
   git branch --show-current
   ```

### Phase 2: Commit Message Creation

Analyze all changes and create a commit message following these rules:

#### Conventional Commits Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types** (choose one):
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring (no functional change)
- `perf`: Performance improvement
- `style`: Code style/formatting (no logic change)
- `docs`: Documentation only
- `test`: Adding or updating tests
- `chore`: Maintenance tasks (deps, build, config)
- `ci`: CI/CD changes
- `build`: Build system changes

**Scope** (optional but recommended):
- Component, module, or area affected (e.g., `auth`, `api`, `ui`, `db`)

**Subject**:
- Lowercase, no period at end
- Imperative mood ("add" not "added" or "adds")
- Max 72 characters
- Clear and concise

**Body** (detailed explanation):
- Explain **WHY** the change was made, not **WHAT** (code shows what)
- Include:
  - Problem description
  - Solution approach
  - Technical details
  - Impact/consequences
- Use bullet points for multiple changes
- Wrap at 72 characters per line

**Footer** (optional):
- Breaking changes: `BREAKING CHANGE: description`
- Issue references: `Closes #123`, `Fixes #456`
- Co-authors: `Co-Authored-By: Name <email>`

### Phase 3: Staging

**CRITICAL CHECKS** before staging:

- ❌ **NEVER commit** `.env`, `.env.local`, credentials, secrets
- ❌ **NEVER commit** `node_modules/`, build artifacts
- ❌ **NEVER commit** personal config files unless intended
- ✅ **DO commit** source code, tests, docs
- ✅ **DO commit** `package.json`, `package-lock.json` if deps changed

**Stage files**:
```bash
git add <relevant-files>
```

Or stage all (use with caution):
```bash
git add .
```

### Phase 4: Commit

Use HEREDOC for proper formatting:

```bash
git commit -m "$(cat <<'EOF'
<type>(<scope>): <subject>

<detailed body explaining the changes>

<footer if needed>

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"
```

### Phase 5: Verification

After commit, verify:

```bash
git log -1 --stat
```

Check:
- ✅ Commit message is clear and well-formatted
- ✅ Correct files included
- ✅ No sensitive data committed

### Phase 6: Push

**IMPORTANT**: Check branch protection before pushing:

- ❌ **NEVER force push** to `main`/`master` without explicit user request
- ❌ **NEVER force push** to shared branches
- ✅ **DO push** to feature branches normally

**Push command**:
```bash
git push origin <branch-name>
```

Or if tracking is set:
```bash
git push
```

### Phase 7: Summary

Provide user with:
- Commit hash (short)
- Branch name
- Files changed count
- Insertions/deletions count
- Remote repository confirmation

## Error Handling

### If commit fails (pre-commit hook):
1. Check error message
2. Fix issues (linting, formatting, tests)
3. Re-add fixed files
4. Retry commit

### If push fails:
1. Check if remote is ahead: `git fetch && git status`
2. If behind: `git pull --rebase origin <branch>`
3. Resolve conflicts if any
4. Retry push

### If sensitive data detected:
1. **STOP immediately**
2. Unstage files: `git restore --staged <file>`
3. Add to `.gitignore`
4. Warn user

## Best Practices Checklist

Before committing, verify:

- [ ] Changes are related (atomic commit)
- [ ] Commit message follows conventional commits
- [ ] No secrets or credentials included
- [ ] Code compiles/builds successfully
- [ ] Tests pass (if applicable)
- [ ] No debug code (console.logs, debugger statements)
- [ ] Formatted according to project style

## Examples

### Example 1: New Feature

```bash
git commit -m "$(cat <<'EOF'
feat(auth): add OAuth Google authentication

Implemented Google OAuth login flow using Better Auth v1.4+.

Changes:
- Added Google provider configuration in lib/auth.ts
- Created OAuth callback handler in app/api/auth/[...all]/route.ts
- Updated login page with "Sign in with Google" button
- Auto-create organization for OAuth users on first login

Impact:
- Users can now register/login using their Google account
- Reduces friction in signup process
- Organization auto-created on first OAuth login

Closes #42

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"
```

### Example 2: Bug Fix

```bash
git commit -m "$(cat <<'EOF'
fix(ui): resolve theme toggle hydration error

Problem:
React hydration mismatch occurred because server rendered "Switch to dark mode"
but client rendered "Switch to light mode" due to localStorage theme difference.

Solution:
- Added mounted state using useState/useEffect pattern
- Server renders fixed button with generic text
- Client renders dynamic button after mounting
- Prevents text mismatch between SSR and client

Technical:
- useEffect detects client-side mounting
- Conditional render based on mounted state
- Button disabled until mounted to prevent premature interactions

Impact:
- No more hydration errors in console
- Smooth theme toggle experience
- Better perceived performance

Fixes #45

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"
```

### Example 3: Refactoring

```bash
git commit -m "$(cat <<'EOF'
refactor(db): extract common query patterns into utilities

Extracted repeated Drizzle query patterns into reusable utility functions
to improve code maintainability and reduce duplication.

Changes:
- Created lib/db/queries.ts with common patterns
- findUserByEmail(), findOrgBySlug(), getUserOrganizations()
- Updated 12 files to use new utilities
- Removed 150+ lines of duplicated query code

Benefits:
- Single source of truth for common queries
- Easier to optimize queries in one place
- Better type safety with shared types
- Reduced code duplication by 40%

No functional changes, all tests pass.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"
```

## Notes

- This command should be used after you've completed a logical unit of work
- For WIP commits on feature branches, simpler messages are acceptable
- For main/master branches, always use detailed commit messages
- Review changes carefully before committing - commits are permanent
- Use descriptive branch names: `feat/oauth-login`, `fix/hydration-error`, etc.
