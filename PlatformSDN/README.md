# PlatformSDN

Plateforme web de supervision, d'observabilite et d'orchestration SDN autour du controleur ONOS.

Ce README est la reference principale du projet.

Regle de travail:
- a chaque amelioration importante frontend, backend, base de donnees, auth ou integration ONOS, ce fichier doit etre mis a jour
- quand on reprend le projet apres une pause, on recommence ici
- avant chaque session importante, lire aussi `AGENT_PLATFORMSDN.md`
- `AGENT_PLATFORMSDN.md` contient la vision produit cible, les routes backend a ajouter et l'ordre recommande des prochaines evolutions

## 1. Etat rapide

### Ce que la plateforme fait deja

- frontend Next.js 15 / React 19 avec interface SDN moderne
- backend Express connecte a ONOS et a PostgreSQL
- authentification JWT avec bcrypt
- utilisateur admin par defaut cree automatiquement si PostgreSQL est disponible
- mode degrade possible pour la demo si PostgreSQL n'est pas encore disponible
- stockage local de developpement pour users et alerts si PostgreSQL est indisponible
- base embarquee `pg-mem` si PostgreSQL ne peut pas demarrer sur la machine
- panneau admin minimal pour creer des utilisateurs
- routes frontend protegees
- routes backend metier protegees
- dashboard enrichi avec vue controller / cluster / applications / hosts / intents / incidents
- chatbot frontend local modernise dans le dashboard avec widget flottant AI
- dashboard enrichi avec runtime controller, snapshot mastership et top link hotspots
- dashboard enrichi avec metrics controller ONOS et resume VPLS actif
- `devices` branche au backend
- `dashboard` branche au backend
- `topology` branchee au backend reel
- `flows` branchee au backend reel avec lecture, creation et suppression
- `alerts` branchee au backend reel avec moteur de detection et historique PostgreSQL
- `services` ajoutee pour exploiter VPLS depuis ONOS

### Ce qui manque encore

- widgets dashboard encore a ajouter: mastership, top liens charges, metrics JVM, IMR, VPLS
- page `intent-monitor`
- page `controller-ops`
- ack utilisateur distinct dans `alerts`
- WebSocket temps reel pour `alerts`
- forgot password reel
- changement de mot de passe
- audit trail des connexions et actions admin
- modularisation du backend
- exploitation progressive de toutes les APIs ONOS avancees

## 2. Journal du projet

### Mise a jour du 1 avril 2026

- ajout d'une vraie couche d'authentification
  - login backend JWT
  - verification du token cote backend
  - mots de passe hashes avec bcrypt
  - admin par defaut `admin@sdn.local / admin123`
  - panneau admin users
- redesign puis simplification de la page `login`
  - ecran plus sobre, plus simple et plus corporate
  - logo `Alliance` charge depuis `public/images/Alliance.png`
  - logo affiche au-dessus du formulaire login
  - suppression du lien `forgot password` dans l'ecran principal
- `/` redirige maintenant vers `/dashboard`
- `topology` utilise maintenant `GET /api/topology`
- `flows` utilise maintenant:
  - `GET /api/flows`
  - `POST /api/flows/:deviceId`
  - `DELETE /api/flows/:deviceId/:flowId`
- `alerts` utilise maintenant:
  - `GET /api/alerts`
  - `POST /api/alerts/:id/resolve`
- `dashboard` utilise maintenant aussi:
  - `GET /api/dashboard/overview`
  - `GET /api/dashboard/link-load`
  - exploitation de `/applications/{name}/health`
  - chatbot frontend local pour guider l'operateur
- `dashboard/overview` expose maintenant aussi:
  - resume runtime controller derive de `/system`
  - snapshot `mastership` sur un echantillon de devices ONOS
  - resume `metrics` derive de `/metrics`
  - resume VPLS derive de `/onos/vpls`
- le dashboard affiche maintenant aussi:
  - runtime controller
  - snapshot mastership
  - top link hotspots tries par telemetrie
  - controller metrics
  - active VPLS services
- le chatbot du dashboard a ete redesign en widget flottant plus moderne
  - ouverture via une icone `AI`
  - panneau conversationnel en overlay
  - style glassmorphism plus moderne
- ajout du guide produit et agent `AGENT_PLATFORMSDN.md`
  - objectifs page par page
  - routes backend ONOS encore a brancher
  - priorites produit alignees pour les prochaines iterations
- navigation amelioree
  - suppression du doublon `Admin` / `Admin Panel`
  - acces admin garde via l'entree `Users`
  - navbar rendue plus responsive sur ecrans intermediaires et mobiles
  - bande de navigation horizontale adaptee sur tablette
- timing dashboard ameliore
  - cycle de refresh plus stable
  - protection contre les requetes qui se chevauchent
  - affichage `last sync` relatif
- `services` utilise maintenant:
  - `GET /api/services/vpls`
  - `POST /api/services/vpls`
  - `DELETE /api/services/vpls/:name`
  - `POST /api/services/vpls/:name/interfaces`
  - `DELETE /api/services/vpls/:name/interfaces/:interfaceName`
- le backend peut maintenant demarrer avec une BD embarquee `pg-mem` si PostgreSQL externe est indisponible
- si PostgreSQL ne demarre pas, le backend utilise maintenant `backend/dev-store.json`
- `README.md` devient le journal central du projet
- verification effectuee:
  - `npm run build` passe avec `dashboard`, `topology`, `flows`, `alerts`, `services`, `login`, `admin/users`
  - un mode degrade de login admin est disponible si PostgreSQL n'est pas encore pret

## 3. Rapport technique vs code actuel

Le PDF `rapport_sdn_final.pdf` reste utile comme vision cible, mais le code reel a evolue.

| Sujet | Rapport PDF | Repo actuel |
| --- | --- | --- |
| Frontend | React 18 + Vite + React Router | Next.js 15 App Router + React 19 |
| Backend | Express + Prisma + Socket.io + node-cron | Express + `pg` + Axios + auth JWT |
| Auth | prevue | operationnelle |
| DB | PostgreSQL unique | PostgreSQL unique |
| Source live | ONOS REST API | ONOS REST API |
| UI | style Cisco / ONOS GUI | UI moderne Tailwind/Radix, login plus DNA-inspired |

Conclusion:
- le rapport est la vision cible
- ce README decrit l'etat reel du code

## 4. Architecture actuelle

```text
Utilisateur
   |
   v
Frontend Next.js 15
   |
   v
Backend Express
   |
   +--> ONOS REST API
   |
   +--> PostgreSQL
```

### Fonctionnement

- le frontend appelle le backend securise par JWT
- le backend lit ONOS en direct ou PostgreSQL si des donnees synchronisees existent
- PostgreSQL sert a la fois pour l'auth locale et pour le cache / historique reseau
- si PostgreSQL est indisponible, un mode degrade permet encore de tester l'interface avec l'admin par defaut
- si PostgreSQL reste indisponible, un stockage local de developpement prend le relais pour:
  - login
  - admin users
  - historique et resolution d'alertes
- si Docker/PostgreSQL externe ne peut pas demarrer, le backend essaie aussi une BD embarquee `pg-mem`

## 5. Modes de donnees

### Mode 1 - Backend live ONOS

- source principale des donnees temps reel
- utilise `axios` vers ONOS
- la topologie live doit maintenant venir en priorite de ce mode

### Mode 2 - PostgreSQL cache / historique

- permet de servir des donnees si la base contient deja des snapshots
- utile pour les stats, historiques et futurs rapports
- la topologie live ne doit plus etre prioritaire sur ce mode sauf demande explicite

### Mode 3 - Mock local

- encore present sur certaines pages non encore branchees
- sert seulement de support UX temporaire

### Mode 4 - Local store de developpement

- fichier: `backend/dev-store.json`
- active automatiquement si PostgreSQL est indisponible
- persiste users et alerts pour continuer la demo sans DB

### Mode 5 - Embedded database

- moteur: `pg-mem`
- active automatiquement si PostgreSQL externe est indisponible
- permet au backend de rester dans un vrai mode base de donnees meme sans Docker

## 6. Pages frontend actuelles

| Route | Etat actuel | Source des donnees | Commentaire |
| --- | --- | --- | --- |
| `/` | redirection | `/dashboard` | suppression de l'ancien double dashboard |
| `/dashboard` | backend live | backend + ONOS live | KPIs, charts, cluster, apps, hosts, intents, incidents, export PDF |
| `/devices` | presque pret prod | backend + fallback mock | bonne base inventaire reseau |
| `/topology` | backend live | ONOS direct | topologie reelle ONOS avec hosts, filtres et layouts |
| `/flows` | backend live | backend live | GET/POST/DELETE reels vers ONOS |
| `/alerts` | backend live | backend + PostgreSQL + ONOS derive | alertes detectees et historisees |
| `/services` | backend live | ONOS VPLS REST | creation et gestion VPLS |
| `/configuration` | statique | frontend | centre de config / cadrage |
| `/login` | auth reelle | backend auth | JWT + bcrypt + design pro |
| `/register` | UI seule | mock | a fusionner plus tard avec admin users |
| `/forgot-password` | UI seule | mock | backend a faire |
| `/contact` | UI seule | mock | futur support / ticketing |
| `/admin/users` | operationnel | backend auth + DB | creation users par admin |

## 7. Backend API actuelle

### Auth

| Route | Methode | Role |
| --- | --- | --- |
| `/api/auth/login` | `POST` | connexion JWT |
| `/api/auth/me` | `GET` | profil utilisateur courant |
| `/api/users` | `GET` | liste des users, admin seulement |
| `/api/users` | `POST` | creation de user, admin seulement |

### SDN Core

| Route | Methode | Role |
| --- | --- | --- |
| `/api/health` | `GET` | sante backend / ONOS / DB |
| `/api/devices` | `GET` | inventaire des devices |
| `/api/devices/:deviceId/ports` | `GET` | ports d'un device |
| `/api/topology` | `GET` | noeuds + liens, supporte `?source=onos|database|auto` |
| `/api/flows` | `GET` | liste des flows |
| `/api/flows/:deviceId` | `POST` | creation d'une flow ONOS |
| `/api/flows/:deviceId/:flowId` | `DELETE` | suppression d'une flow ONOS |
| `/api/alerts` | `GET` | feed d'alertes reel |
| `/api/alerts/:id/resolve` | `POST` | resolution d'une alerte |
| `/api/dashboard/stats` | `GET` | KPI dashboard |
| `/api/dashboard/overview` | `GET` | vue controller, cluster, applications, hosts, intents |
| `/api/dashboard/link-load` | `GET` | telemetrie charge lien |
| `/api/services/vpls` | `GET` | liste VPLS |
| `/api/services/vpls` | `POST` | creation VPLS |
| `/api/services/vpls/:name` | `DELETE` | suppression VPLS |
| `/api/services/vpls/:name/interfaces` | `POST` | ajout interface VPLS |
| `/api/services/vpls/:name/interfaces/:interfaceName` | `DELETE` | suppression interface VPLS |
| `/api/metrics/devices` | `GET` | metrics agregees par device |
| `/api/metrics/port-history/:deviceId/:port` | `GET` | historique d'un port |

### Logique actuelle

- `health` et `auth/login` restent publics
- le reste des routes `/api/*` est protege par JWT
- les mots de passe sont hashes avec bcrypt
- un admin par defaut est initialise au demarrage si la DB est accessible
- pour les flows, le backend passe maintenant aussi `appId` vers ONOS
- si PostgreSQL est indisponible:
  - auth bascule sur `backend/dev-store.json`
  - `GET/POST /api/users` restent utilisables
  - `GET /api/alerts` et `POST /api/alerts/:id/resolve` restent persistants
- les alertes sont maintenant derivees automatiquement depuis:
  - disponibilite controller
  - devices indisponibles
  - liens inactifs
  - ports enabled mais non live
  - flows en etat pending

## 8. Base PostgreSQL actuelle

Tables principales:

- `users`
- `devices`
- `ports`
- `port_metrics`
- `topology_links`
- `flows`
- `device_metrics`
- `sync_log`
- `alerts`

### Ce que cela permet deja

- auth locale securisee
- gestion des roles `admin`, `operator`, `viewer`
- cache d'inventaire ONOS
- historique ports
- historique flows
- base du futur moteur d'alertes

### Ce qui manque encore

- audit des connexions
- password reset tokens
- historique plus riche des incidents
- snapshots `hosts`, `groups`, `meters`, `intents`, `applications`, `cluster`

## 9. Arborescence utile

```text
PlatformSDN/
|-- app/
|-- components/
|-- hooks/
|-- lib/
|-- services/
|-- backend/
|   |-- server.js
|   |-- .env.example
|-- docker-compose.yml
|-- init-db.sql
|-- middleware.ts
|-- README.md
```

## 10. Reprendre le projet rapidement

1. Lire ce README
2. Verifier `.env.local` et `backend/.env`
3. Demarrer PostgreSQL
4. Demarrer le backend
5. Demarrer le frontend
6. Se connecter avec l'admin par defaut
7. Ouvrir `/dashboard`, `/topology`, `/flows`, `/alerts`, `/services`, `/admin/users`

Important:
- ouvrir le site sur `http://localhost:3000/login`
- ne pas ouvrir `http://localhost:5000` pour l'interface
- le port `5000` correspond au backend API

## 11. Installation

### Prerequis

- Node.js 18+
- npm
- ONOS accessible
- Docker Desktop optionnel mais recommande pour PostgreSQL

### Install

```bash
npm install
```

## 12. Configuration

### Frontend

```bash
copy .env.local.example .env.local
```

Exemple:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Backend

```bash
copy backend/.env.example backend/.env
```

Variables importantes:

```env
ONOS_HOST=localhost
ONOS_PORT=8181
ONOS_USER=karaf
ONOS_PASSWORD=karaf

PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

DB_HOST=localhost
DB_PORT=5432
DB_USER=sdnuser
DB_PASSWORD=sdnpass123
DB_NAME=sdn_platform

JWT_SECRET=change-me-platformsdn-secret
JWT_EXPIRES_IN=8h
BCRYPT_SALT_ROUNDS=10

DEFAULT_ADMIN_FULL_NAME=DNA Center Admin
DEFAULT_ADMIN_USERNAME=admin
DEFAULT_ADMIN_EMAIL=admin@sdn.local
DEFAULT_ADMIN_PASSWORD=admin123

ENABLE_AUTO_SYNC=false
SYNC_INTERVAL_MS=5000
```

## 13. Lancement

### Base

```bash
docker compose up -d
```

Note:
- sur cette machine, Docker Desktop indique actuellement `hasNoVirtualization=true`
- cela bloque le demarrage de PostgreSQL via Docker
- la plateforme reste tout de meme testable grace au local store

### Demarrage recommande

```bash
npm run start:platform
```

Verification rapide:

```bash
npm run status:platform
```

URLs utiles:
- frontend: `http://localhost:3000/login`
- backend health: `http://localhost:5000/api/health`

### Backend

```bash
npm run backend
```

### Frontend

```bash
npm run dev
```

## 14. Ce que le projet doit faire avec ONOS

La plateforme doit exploiter progressivement les modules ONOS, pas seulement quelques endpoints.

### Dashboard / Executive View

APIs a exploiter:
- `/system`
- `/cluster`
- `/applications`
- `/applications/{name}/health`
- `/devices`
- `/hosts`
- `/statistics/ports`
- `/statistics/flows/link`
- `/intents/minisummary`

Ameliorations recommandees pour `/dashboard`:
- deja en place:
  - carte controller
  - cluster nodes
  - applications
  - premier niveau de sante applicative via `/applications/{name}/health`
  - hosts discovered
  - incidents recents
  - badge source des donnees
  - premiere lecture de la charge des liens via `/statistics/flows/link`
- prochaines ameliorations:
  - top liens les plus charges avec normalisation plus riche
  - sante detaillee des applications avec score plus propre
  - cartes `mastership`
  - carte `controller memory / JVM` si exposee par `/system` ou `/metrics`
  - widgets IMR et VPLS

### Topology

APIs a exploiter:
- `/topology`
- `/links`
- `/hosts`
- `/paths/{src}/{dst}`
- `/paths/{src}/{dst}/disjoint`
- `/regions`

Etat actuel:
- `topology` est branchee au backend reel et doit maintenant lire ONOS en direct par defaut

Prochaines ameliorations:
- details de lien
- details d'hotes
- calcul de chemins
- regions
- coloration par charge et sante
- comparaison ONOS live vs DB cache seulement comme mode optionnel

Idees concretes pour ameliorer la topologie:
- ajouter un mode de layout `hierarchy` pour les topologies spine-leaf
- afficher les ports sur les liens uniquement au survol pour eviter la surcharge visuelle
- ajouter un filtre `hosts / infrastructure / inactive only`
- ajouter un mode `path analysis` base sur `/paths/{src}/{dst}`
- colorer les liens avec `/statistics/flows/link`
- afficher les regions ONOS avec `/regions`
- permettre un `drill-down` node -> ports -> flows -> intents
- ajouter un panneau `Applications actives` base sur `/applications` pour lier la topo aux apps ONOS
- ajouter un panneau `Mastership` base sur `/mastership/{deviceId}/master` et `/mastership/{deviceId}/role`
- ajouter un panneau `Configuration` base sur `/configuration` et `/network/configuration`
- ajouter un volet `Intent overlays` base sur `/intents`, `/intents/minisummary` et IMR
- ajouter un volet `Services overlays` pour VPLS et multicast avec `/vpls` et `/mcast`
- ajouter un mode `Operations` pour activer/desactiver un port via `/devices/{id}/portstate/{port_id}`

### Flow Engineering

APIs a exploiter:
- `/flows`
- `/flowobjectives`
- `/nextobjectives`
- `/groups`
- `/meters`

Etat actuel:
- `GET /flows` branche
- `POST /flows/:deviceId` branche
- `DELETE /flows/:deviceId/:flowId` branche

Prochaines ameliorations:
- filtres par `deviceId`, `appId`, `state`, `tableId`
- duplication d'une flow
- formulaire avance match / action
- pages `groups`, `meters`, `flowobjectives`

### Intent And IMR

Swagger IMR fourni:
- `/imr/monitoredIntents`
- `/imr/intentStats`
- `/imr/reRouteIntents`

Idee produit:
- page `Intent Monitor`
- page `Reroute Center`
- vue `Intent -> Related flows`
- comparaison avant/apres reroute

### VPLS And Services

Swagger VPLS fourni:
- `GET /onos/vpls`
- `POST /onos/vpls`
- `GET /onos/vpls/{vplsName}`
- `DELETE /onos/vpls/{vplsName}`
- `POST /onos/vpls/interfaces/{vplsName}`
- `DELETE /onos/vpls/interface/{vplsName}/{interfaceName}`

Idee produit:
- page `Services` deja ajoutee
- creation d'un VPLS deja branchee
- ajout/suppression interfaces deja branche
- prochaines etapes:
  - etat du service par site
  - validation plus riche des formulaires
  - correlation VPLS <-> devices <-> alerts

### Network Configuration And Operations

APIs a exploiter:
- `/network/configuration`
- `/configuration`
- `/applications`
- `/cluster`
- `/mastership`
- `/diagnostics`
- `/keys`

Idee produit:
- page `Controller Operations`
- page `Applications`
- page `Cluster & Mastership`
- page `Network Config`
- page `Device Keys`

## 15. Idee de plateforme complete

Pages cibles a construire:

1. `Dashboard`
2. `Devices`
3. `Topology`
4. `Flows`
5. `Alerts`
6. `Services` pour VPLS / Multicast
7. `Intent Monitor` pour IMR / Intents
8. `Controller Operations`
9. `Applications`
10. `Admin Users`

## 16. Priorites d'amelioration recommandees

### Priorite 1

- enrichir encore `/dashboard`
- ajouter des cartes `mastership`
- ajouter les metrics ONOS globales via `/system` et `/metrics`
- ajouter une vue plus exploitable des hotspots reseau
- ajouter des widgets IMR et VPLS actifs

### Priorite 2

- ameliorer `/alerts`
- ajouter ack utilisateur
- ajouter historique plus riche
- ajouter correlation device / link / flow / host

### Priorite 3

- ameliorer `/flows`
- filtres
- duplication
- edition plus riche
- ajout des `groups`, `meters`, `flowobjectives`

### Priorite 4

- creer `Intent Monitor` pour IMR
- creer `Controller Operations` pour cluster/mastership/applications/diagnostics
- enrichir `Services` pour VPLS
- ajouter etat par site
- ajouter formulaires mieux validates

### Priorite 5

- modulariser `backend/server.js` en:
  - `routes/`
  - `services/`
  - `auth/`
  - `onos/`
  - `db/`
  - `sync/`

## 17. Changements deja faits dans cette iteration

- README centralise et mis a jour
- couche auth JWT + bcrypt ajoutee
- admin par defaut ajoute
- panneau admin users ajoute
- routes protegees ajoutees
- `/` redirige vers `/dashboard`
- `topology` branchee au backend reel
- `topology` force maintenant ONOS direct par defaut avec hosts et liens d'acces
- `topology` ajoute recherche, layouts, filtres d'affichage et controle auto-refresh
- `flows` branchee au backend reel avec creation et suppression reelles
- `alerts` branchee au backend reel avec resolution
- dashboard enrichi avec controller / cluster / applications / hosts / intents / link load / incidents
- chatbot dashboard redesign en widget flottant `AI`
- dashboard enrichi avec runtime controller, snapshot mastership et classement des hotspots liens
- dashboard enrichi avec metrics ONOS et resume VPLS actif
- `services` ajoutee pour VPLS
- `configuration` alignee avec les valeurs backend actuelles
- guide agent `AGENT_PLATFORMSDN.md` ajoute pour cadrer les prochaines sessions
- navbar restructuree pour eviter les debordements horizontaux

## 18. Limitations connues

- `backend/server.js` est encore monolithique
- `/alerts` est maintenant branchee, mais sans WebSocket temps reel
- PostgreSQL n'est pas demarrable ici tant que la virtualisation/Docker Linux n'est pas corrigee
- `/register` et `/forgot-password` restent des UI non branchees
- pas encore de WebSocket temps reel
- pas encore de vrai audit admin

## 19. Commandes utiles

```bash
npm install
npm run backend
npm run dev
npm run build
docker compose up -d
npm run start:platform
npm run status:platform
```

Note:
- `npm run start:platform` fait maintenant un `build` propre puis lance le frontend en mode production pour eviter les pages qui s'affichent en HTML brut quand les assets de `next dev` ne sont pas encore stables

## 20. Verification de cette iteration

- `npm run build` passe
- la page `/login` est branchee sur la vraie auth backend
- la page `/topology` charge maintenant ONOS en direct par defaut
- la page `/topology` supporte maintenant layouts, recherche, hosts et labels de liens
- la page `/flows` supporte lecture, creation et suppression reelles via ONOS
- la page `/alerts` charge maintenant les alertes backend reelles
- le dashboard charge maintenant la vue controller / cluster / applications / hosts / intents
- le dashboard charge maintenant aussi runtime controller, snapshot mastership et top hotspots liens
- le dashboard charge maintenant aussi metrics controller ONOS et resume VPLS
- la page `/services` charge maintenant les services VPLS
- le local store a ete teste avec:
  - login admin
  - creation d'utilisateur
  - resolution d'alerte

## 21. Fichiers les plus importants

- `README.md`
- `AGENT_PLATFORMSDN.md`
- `backend/server.js`
- `backend/.env.example`
- `services/api.ts`
- `components/auth-provider.tsx`
- `components/navigation.tsx`
- `app/login/page.tsx`
- `app/dashboard/page.tsx`
- `app/topology/page.tsx`
- `app/flows/page.tsx`
- `app/admin/users/page.tsx`
- `middleware.ts`
- `init-db.sql`
- `scripts/start-platform.ps1`
- `scripts/status-platform.ps1`

## 22. Suite recommandee

Ordre conseille maintenant:

1. enrichir encore `dashboard`
2. ameliorer `alerts`
3. ameliorer `flows`
4. creer `Intent Monitor` pour IMR
5. creer `Controller Operations`
6. enrichir `Services` pour VPLS
7. modulariser le backend

## 23. Conclusion

PlatformSDN n'est plus seulement une maquette frontend.

La base actuelle contient deja:
- une auth reelle
- une navigation protegee
- une topologie live
- une gestion live des flows
- un centre d'alertes backend
- une premiere gestion VPLS
- une base admin pour continuer a professionnaliser la plateforme

La suite logique est de transformer le dashboard en vrai centre d'exploitation et d'exploiter progressivement les modules Swagger ONOS: VPLS, IMR, applications, cluster, mastership, intents, meters, groups et configuration reseau.

## 24. Guide agent de reference

Le document `AGENT_PLATFORMSDN.md` complete ce README.

Il contient:
- la vision produit detaillee par page
- les APIs ONOS a exploiter ou finir de brancher
- les routes backend a ajouter
- les priorites d'implementation recommandees
- les regles de travail a suivre a chaque session
