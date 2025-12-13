---
description: Push local commits to remote repository with pre-push safety checks
---

# Git Push Workflow

**Role**: Version Control Guardian.
**Goal**: Safely push local changes to the remote repository after validation.

## Execution Protocol

### 1. Auto-Commit (If Dirty)

// turbo
- **Command**: `git status --porcelain`
  - **Check**: If the output is NOT empty (meaning there are uncommitted changes):
     1. **Action**: Run `git diff` to analyze the changes.
     2. **Action**: Generate a **Concise Conventional Commit** message based on the diff.
     3. **Command**: `git add .`
     4. **Command**: `git commit -m "<generated_message>"` (Ask user for confirmation of the message if unsure, otherwise proceed).
  - **Check**: If output is empty, proceed to next step.

### 2. Branch Context

// turbo
- **Command**: `git branch --show-current`
  - **Log**: Current branch name for user awareness.

// turbo
- **Command**: `git log origin/$(git branch --show-current)..HEAD --oneline 2>/dev/null || echo "No upstream or no commits to push"`
  - **Action**: Show commits that will be pushed.
  - **Check**: If empty, inform user "Nothing to push" and exit.

### 3. Remote Sync Check

// turbo
- **Command**: `git fetch origin --quiet`
  - **Purpose**: Ensure we have latest remote refs.

// turbo
- **Command**: `git status -uno`
  - **Check**: If branch is behind remote, warn user and suggest:
    - `git pull --rebase` to incorporate remote changes first
    - `git push --force-with-lease` (dangerous, requires confirmation)

### 4. Quick Validation (Optional but Recommended)

- **Type Check**: `bun run typecheck`
  - **Requirement**: Must pass before pushing.
- **Lint Check**: `bun run lint`
  - **Requirement**: Must pass before pushing.

> **Note**: Skip this step if user requests a quick push with `--skip-checks` or confirms they've already validated.

### 5. Execute Push

- **Command**: `git push origin $(git branch --show-current)`
  - **On Success**: Log "✅ Push successful" with remote URL.
  - **On Failure**: 
    - If rejected (non-fast-forward): Suggest `git pull --rebase` first.
    - If authentication error: Check SSH keys or credentials.

---

## Quick Reference Commands

| Scenario | Command |
|----------|---------|
| Standard push | `git push` |
| Push new branch | `git push -u origin <branch-name>` |
| Force push (safe) | `git push --force-with-lease` |
| Push all branches | `git push --all` |
| Push with tags | `git push --follow-tags` |

---

## Troubleshooting

### "Everything up-to-date"
Your local branch matches remote. No commits to push.

### "rejected - non-fast-forward"
Remote has commits you don't have locally.
```bash
git pull --rebase origin main
git push
```

### "Permission denied (publickey)"
SSH key issue. Check:
```bash
ssh -T git@github.com
```
