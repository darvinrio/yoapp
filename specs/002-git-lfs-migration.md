# Git LFS Migration Spec

## Context

- Repository: `darvinrio/yoapp`
- Remote is empty (no branches pushed yet)
- Push failing with HTTP 400 — remote rejecting ~14 MB packfile
- 78 binary image files in `src/assets/blog-images/` (largest 1.9 MB each, total ~14 MB)
- One `.DS_Store` is tracked inside `blog-images`
- `node_modules/.package-lock.json` is tracked but negligible (92 KB)

## Goal

Migrate `src/assets/blog-images/` to Git LFS and clean up tracked artifacts so the initial push succeeds.

## Steps

### 1. Verify LFS available

```bash
git lfs install
```

### 2. Track image folder with LFS

```bash
git lfs track "src/assets/blog-images/**"
```

Creates `.gitattributes` with LFS filter entries for existing tracked files.

### 3. Rewrite history so already-tracked images become LFS pointers

```bash
git lfs migrate import --include="src/assets/blog-images/**" --include-ref=refs/heads/main
```

Updates the local `main` branch only. Safe because no remote refs exist yet.

### 4. Remove `.DS_Store` from git tracking

Ensure `.DS_Store` is in `.gitignore`, then:

```bash
git rm --cached src/assets/blog-images/.DS_Store
```

### 5. Verify

- `git diff --stat HEAD` — should show `.gitattributes` added, `.DS_Store` removed
- `git ls-files src/assets/blog-images/ | head` — should show LFS pointer files (~130 bytes)

### 6. Commit and push

```bash
git add .gitattributes
git commit -m "chore: migrate blog-images to git-lfs, remove DS_Store"
git push -u origin main
```

## Constraints / Notes

- GitHub Free includes 1 GB LFS storage + 1 GB/month bandwidth — 14 MB is well within limits
- Rewriting history is safe here because there are no remote branches or other contributors yet
- `node_modules/.package-lock.json` is tracked but only 92 KB — not causing the failure, do not touch
