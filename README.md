# Portfolio

bun commands:

```bash
bun dev     # starts the development server
bun format  # formats the code
```

env commands:

```bash
set -a      # variable export
source .env # load environment variables
set +a      # variable export disable
```

vercel commands:

```bash
vercel deploy # deploys to preview
vercel --prod # deploys to production
```

git commands:

```bash
# delete local merged branches
git branch --merged | grep -v '\*' | xargs -n 1 git branch -d

# prune origin deleted branches
git remote prune origin
```
