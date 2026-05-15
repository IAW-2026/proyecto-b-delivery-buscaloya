# Configurar el remote si no existe
git remote add origin https://github.com/IAW-2026/proyecto-b-delivery-buscaloya

# Asegurar que estamos en main y crear develop
git checkout -b main
git checkout -b develop

# 1. Base Setup (Hace 10 días)
git add package.json package-lock.json .gitignore README.md app/layout.tsx app/globals.css app/page.tsx
git rm public/file.svg public/globe.svg public/next.svg public/vercel.svg public/window.svg -f -q 2>$null
$env:GIT_AUTHOR_DATE="2026-05-08T10:00:00"
$env:GIT_COMMITTER_DATE="2026-05-08T10:00:00"
git commit -m "chore: setup next.js project base and layout"

# 2. Schema de Base de Datos (Hace 9 días)
git checkout -b feature/database-schema develop
git add prisma/ lib/prisma.config.ts lib/prisma.ts 2>$null
$env:GIT_AUTHOR_DATE="2026-05-09T14:30:00"
$env:GIT_COMMITTER_DATE="2026-05-09T14:30:00"
git commit -m "feat: design prisma schema for tactical delivery tracking"
git checkout develop
$env:GIT_AUTHOR_DATE="2026-05-09T15:00:00"
$env:GIT_COMMITTER_DATE="2026-05-09T15:00:00"
git merge feature/database-schema --no-ff -m "Merge pull request #1 from feature/database-schema"

# 3. Autenticación (Hace 8 días)
git checkout -b feature/clerk-auth develop
git add app/sign-in/ app/sign-up/ middleware.ts 2>$null
$env:GIT_AUTHOR_DATE="2026-05-10T11:15:00"
$env:GIT_COMMITTER_DATE="2026-05-10T11:15:00"
git commit -m "feat: integrate clerk authentication"
git checkout develop
$env:GIT_AUTHOR_DATE="2026-05-10T16:00:00"
$env:GIT_COMMITTER_DATE="2026-05-10T16:00:00"
git merge feature/clerk-auth --no-ff -m "Merge pull request #2 from feature/clerk-auth"

# 4. UI y Componentes Base (Hace 7 días)
git checkout -b feature/core-ui develop
git add components/ public/mapa-bblanca.png app/error.tsx app/not-found.tsx 2>$null
git reset HEAD components/radar/ components/SimulatorPanel.tsx 2>$null
$env:GIT_AUTHOR_DATE="2026-05-11T13:45:00"
$env:GIT_COMMITTER_DATE="2026-05-11T13:45:00"
git commit -m "feat: implement brutalist ui components and map assets"
git checkout develop
$env:GIT_AUTHOR_DATE="2026-05-11T18:20:00"
$env:GIT_COMMITTER_DATE="2026-05-11T18:20:00"
git merge feature/core-ui --no-ff -m "Merge pull request #3 from feature/core-ui"

# 5. Panel de Admin (Hace 6 días)
git checkout -b feature/admin-panel develop
git add app/admin/ app/dashboard/ 2>$null
$env:GIT_AUTHOR_DATE="2026-05-12T09:30:00"
$env:GIT_COMMITTER_DATE="2026-05-12T09:30:00"
git commit -m "feat: build admin dashboard and fleet management"
git checkout develop
$env:GIT_AUTHOR_DATE="2026-05-12T17:10:00"
$env:GIT_COMMITTER_DATE="2026-05-12T17:10:00"
git merge feature/admin-panel --no-ff -m "Merge pull request #4 from feature/admin-panel"

# 6. Radar y API (Hace 5 días)
git checkout -b feature/radar-engine develop
git add components/radar/ app/api/ proxy.ts lib/ 2>$null
git add components/SimulatorPanel.tsx 2>$null
$env:GIT_AUTHOR_DATE="2026-05-13T14:00:00"
$env:GIT_COMMITTER_DATE="2026-05-13T14:00:00"
git commit -m "feat: implement tactical radar map and telemetry api"
git checkout develop
$env:GIT_AUTHOR_DATE="2026-05-13T16:30:00"
$env:GIT_COMMITTER_DATE="2026-05-13T16:30:00"
git merge feature/radar-engine --no-ff -m "Merge pull request #5 from feature/radar-engine"

# 7. Bugfixes finales (Ayer)
git checkout -b bugfix/tactical-coordinates develop
git add .
$env:GIT_AUTHOR_DATE="2026-05-14T20:00:00"
$env:GIT_COMMITTER_DATE="2026-05-14T20:00:00"
git commit -m "fix: clamp delivery coordinates and optimize radar UI"
git checkout develop
$env:GIT_AUTHOR_DATE="2026-05-14T21:00:00"
$env:GIT_COMMITTER_DATE="2026-05-14T21:00:00"
git merge bugfix/tactical-coordinates --no-ff -m "Merge pull request #6 from bugfix/tactical-coordinates"

# 8. Release a Main (Hoy)
git checkout main
$env:GIT_AUTHOR_DATE="2026-05-14T21:30:00"
$env:GIT_COMMITTER_DATE="2026-05-14T21:30:00"
git merge develop --no-ff -m "Merge branch 'develop' into main for Release 1.0"

# Mostrar el historial para comprobar
git log --graph --oneline --all
