# PlatformSDN

Plateforme web centralisee de supervision et de configuration SDN basee sur le controleur ONOS.

Ce projet a pour objectif de fournir une interface moderne pour:
- visualiser la topologie reseau SDN
- surveiller les equipements, ports, liens et flow rules
- centraliser les alertes et l'etat du reseau
- preparer l'administration reseau via une interface web plutot que via le terminal
- evoluer ensuite vers une integration complete avec backend, ONOS et base de donnees

Le projet est actuellement dans une phase frontend avancee, avec une base backend Node.js/Express deja en place pour la connexion a ONOS.

## 1. Vision du projet

Dans une architecture SDN, le plan de controle est separe du plan de donnees. ONOS joue ici le role de controleur central, tandis que cette plateforme web agit comme couche de supervision, d'observabilite et, a terme, de configuration.

L'idee est de proposer une application unique ou un administrateur peut:
- voir l'etat global du reseau
- afficher la topologie en temps reel
- explorer les devices et leurs ports
- consulter les flow rules OpenFlow
- suivre les alertes
- configurer des regles de flux depuis une interface claire

## 2. Objectifs

Les objectifs principaux du projet sont:
- centraliser la supervision du reseau SDN dans une interface web
- simplifier l'exploitation d'ONOS
- offrir une visualisation intuitive de la topologie
- preparer la gestion des flux et des politiques reseau
- introduire l'historique, les alertes et la persistance des donnees dans les prochaines iterations

## 3. Etat actuel du projet

### Fonctionnalites frontend deja mises en place

- `Dashboard` avec vue globale du reseau
- `Topology` avec carte interactive Cytoscape
- `Devices` avec inventaire et details de devices
- `Flows` avec vue de gestion des flow rules
- `Alerts` avec centre de supervision des incidents
- `Configuration` avec page de parametres SDN / ONOS
- `Login` et `Register` revisites pour le contexte SDN
- navigation globale refaite pour une plateforme reseau

### Backend deja present

Le backend expose deja plusieurs endpoints REST pour ONOS:
- `GET /api/health`
- `GET /api/devices`
- `GET /api/topology`
- `GET /api/flows`
- `POST /api/flows/:deviceId`
- `GET /api/devices/:deviceId/ports`

### Limitations actuelles

- une partie du frontend utilise encore des donnees mockees
- le frontend n'est pas encore totalement branche au backend reel
- PostgreSQL n'est pas encore integre
- l'authentification JWT n'est pas encore implemente
- les alertes temps reel via WebSocket ne sont pas encore branchees
- le backend actuel reste monolithique et doit encore etre modularise

## 4. Architecture cible

L'architecture visee du projet est la suivante:

```text
Utilisateur / Administrateur
        |
        v
Frontend Next.js 15 + React 19
        |
        v
Backend Node.js / Express
        |
        +--> ONOS REST API
        |
        +--> PostgreSQL (historique, alertes, utilisateurs, configuration)
        |
        +--> WebSocket / temps reel
```

### Role de chaque couche

#### Frontend

Le frontend fournit:
- les dashboards de supervision
- la visualisation topologique
- les pages de gestion SDN
- l'UX d'administration reseau

#### Backend

Le backend joue le role de couche intermediaire:
- communication avec ONOS
- formatage des donnees
- exposition d'une API frontend
- futur support d'authentification, historique et alertes temps reel

#### ONOS

ONOS est la source des donnees temps reel:
- devices
- topologie
- liens
- ports
- flow rules

#### Base de donnees

La base de donnees sera utilisee pour:
- l'historique des metriques
- la persistance des alertes
- les comptes utilisateurs
- les roles
- les configurations sauvegardees

## 5. Stack technique

### Frontend

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS 4
- Radix UI
- Lucide React
- Cytoscape.js
- next-themes
- React Hook Form
- Zod
- Recharts
- Zustand

### Backend

- Node.js
- Express
- Axios
- Cors
- Dotenv

### Integrations prevues ou deja preparees

- ONOS REST API
- Socket.IO client
- React Query
- PostgreSQL

## 6. Outils utilises

Le projet utilise ou prepare les outils suivants:
- Git et GitHub pour le versioning
- GitHub Actions avec `.github/workflows/release.yml`
- Next.js App Router
- PostCSS avec `@tailwindcss/postcss`
- hooks React personnalises pour la simulation des donnees SDN
- services API dedies pour la future connexion frontend-backend

## 7. Structure du projet

```text
PlatformSDN/
|-- app/
|   |-- page.tsx                  # Dashboard
|   |-- topology/page.tsx         # Carte topologique
|   |-- devices/page.tsx          # Inventaire reseau
|   |-- flows/page.tsx            # Gestion des flow rules
|   |-- alerts/page.tsx           # Centre d'alertes
|   |-- configuration/page.tsx    # Parametres plateforme / ONOS
|   |-- login/page.tsx            # Connexion operateur
|   |-- register/page.tsx         # Provisioning utilisateur
|   |-- contact/page.tsx          # Support operateur
|   |-- forgot-password/page.tsx  # Recuperation de mot de passe
|   |-- layout.tsx                # Layout principal
|   |-- globals.css               # Styles globaux
|
|-- components/
|   |-- navigation.tsx            # Navigation principale
|   |-- TopologyMap.tsx           # Graphe Cytoscape
|   |-- ui/                       # Composants UI reutilisables
|
|-- hooks/
|   |-- sdn-hooks.ts              # Hooks frontend (mock / simulation)
|
|-- lib/
|   |-- types.ts                  # Types metier SDN
|   |-- mock-data.ts              # Donnees mockees
|
|-- services/
|   |-- api.ts                    # Service frontend pour le backend
|
|-- backend/
|   |-- server.js                 # API Express vers ONOS
|   |-- README.md                 # Doc backend
|
|-- package.json
|-- next.config.mjs
|-- postcss.config.mjs
|-- QUICK_START.md
|-- README.md
```

## 8. Pages principales du frontend

### Dashboard

Le dashboard presente:
- la sante globale du reseau
- les KPI SDN
- un resume topologique
- l'activite recente
- l'etat de supervision

### Topology

La page topology permet:
- d'afficher le graphe reseau
- de selectionner un noeud
- de lire les informations du noeud selectionne
- de preparer l'integration des details ONOS

### Devices

La page devices permet:
- d'afficher la liste des equipements
- de voir leur statut
- de consulter les ports associes
- de preparer une vue d'inventaire reseau exploitable

### Flows

La page flows permet:
- de lister les flow rules
- de visualiser `device`, `priority`, `state`, `match`, `action`, `app`
- de preparer la creation de nouvelles regles

### Alerts

La page alerts permet:
- de suivre les incidents reseau
- de filtrer les alertes par etat et severite
- de centraliser la lecture operationnelle des evenements

### Configuration

La page configuration permet:
- de preparer les parametres ONOS
- de definir les parametres de collecte
- de fixer la politique d'alertes
- de poser les bases de la future integration backend / base de donnees

## 9. Installation

### Prerequis

- Node.js 18+ recommande
- npm
- ONOS accessible si vous voulez tester le backend reel

### Installation des dependances

```bash
npm install
```

## 10. Lancement du projet

### Frontend

```bash
npm run dev
```

Par defaut, Next.js demarre sur `http://localhost:3000`.
Si ce port est deja occupe, il choisira automatiquement un autre port libre.

### Backend

```bash
npm run backend
```

Le backend demarre par defaut sur `http://localhost:5000`.

## 11. Variables d'environnement

### Frontend

Creer un fichier `.env.local` a la racine:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_ONOS_HOST=localhost
NEXT_PUBLIC_ONOS_PORT=8181
```

### Backend

Creer un fichier `backend/.env`:

```env
ONOS_HOST=localhost
ONOS_PORT=8181
ONOS_USER=karaf
ONOS_PASSWORD=karaf
PORT=5000
```

## 12. API backend disponible

### Health check

```http
GET /api/health
```

### Devices

```http
GET /api/devices
GET /api/devices/:deviceId/ports
```

### Topology

```http
GET /api/topology
```

### Flows

```http
GET /api/flows
POST /api/flows/:deviceId
```

## 13. Logique frontend actuelle

Aujourd'hui, le frontend fonctionne avec deux modes:

### Mode mock

Le mode principal actuel repose sur:
- `lib/mock-data.ts`
- `hooks/sdn-hooks.ts`

Cela permet d'avancer rapidement sur:
- l'UX
- le design
- la structure des pages
- les types metier

### Mode integration backend

Le service `services/api.ts` prepare deja les appels vers:
- le health check
- les devices
- les ports
- la topologie
- les flows

L'etape suivante sera de brancher progressivement les pages frontend sur ces endpoints reels.

## 14. Roadmap du projet

### Phase 1 - Frontend SDN

- [x] Nettoyage du template initial
- [x] Refonte de la navigation
- [x] Dashboard SDN
- [x] Topology page
- [x] Devices page
- [x] Flows page
- [x] Alerts page
- [x] Configuration page
- [x] Login / Register adaptes au contexte SDN
- [x] Nettoyage complet des pages marketing heritees
- [ ] Harmonisation finale des mocks et types

### Phase 2 - Integration backend

- [x] Mise en place d'un backend Express minimal
- [x] Connexion REST de base a ONOS
- [x] Endpoints devices / topology / flows / ports
- [ ] Branchement progressif du frontend sur l'API reelle
- [ ] Gestion robuste des erreurs reseau
- [ ] Couche de services backend plus modulaire

### Phase 3 - ONOS et observabilite

- [ ] Synchronisation reelle avec ONOS
- [ ] Recuperation de statistiques ports / liens
- [ ] Creation / suppression complete de flow rules
- [ ] Detection d'incidents reseau
- [ ] Rafraichissement temps reel

### Phase 4 - Base de donnees et securite

- [ ] Integration PostgreSQL
- [ ] Modele utilisateurs / roles
- [ ] Authentification JWT
- [ ] Historique des evenements et metriques
- [ ] Persistance des alertes
- [ ] Configuration sauvegardee

### Phase 5 - Industrialisation

- [ ] Tests unitaires
- [ ] Tests d'integration
- [ ] CI/CD complete
- [ ] Documentation API plus detaillee
- [ ] Deploiement

## 15. Challenges techniques connus

### Cache Next.js en developpement sous Windows / OneDrive

Pendant le developpement, des erreurs de chunks Next.js peuvent apparaitre si le projet est lance depuis un dossier synchronise par OneDrive. Pour reduire ce risque, le cache webpack de developpement a ete desactive dans `next.config.mjs`.

Si l'application s'affiche en HTML brut ou si des erreurs `Cannot find module './xxx.js'` apparaissent:
- arreter le serveur
- supprimer ou renommer le dossier `.next`
- relancer `npm run dev`
- faire un hard refresh dans le navigateur

### Hydration mismatch

Certaines pages affichant l'heure courante peuvent produire un mismatch SSR/CSR si une valeur temps reel est rendue differemment entre serveur et client. Il faut eviter de rendre directement des timestamps variables au premier rendu serveur.

## 16. Ameliorations recommandees

Les prochaines ameliorations recommandees sont:
- brancher `dashboard`, `devices`, `topology`, `flows` et `alerts` sur l'API backend
- modulariser `backend/server.js`
- introduire des DTO ou types partages frontend/backend
- ajouter des tests sur les endpoints critiques
- integrer PostgreSQL et Prisma ou un ORM equivalent
- ajouter WebSocket pour les alertes temps reel

## 17. Positionnement du projet

Ce projet ne se limite pas a un simple site vitrine. Il s'agit d'une plateforme de supervision SDN orientee exploitation reseau. Le frontend a ete fortement refait pour raconter une vraie vision produit autour:
- de la centralisation
- de la visualisation
- de la gestion des equipements
- de la gestion des flows
- de la lecture operationnelle des alertes

## 18. Commandes utiles

### Lancer le frontend

```bash
npm run dev
```

### Lancer le backend

```bash
npm run backend
```

### Construire le projet

```bash
npm run build
```

### Lancer en production

```bash
npm run start
```

## 19. Auteur et evolution

Le projet a ete transforme a partir d'une base Next.js initiale pour devenir une plateforme SDN centree supervision reseau. La direction actuelle est clairement orientee:
- frontend SDN complet
- backend ONOS
- persistance future
- exploitation reseau centralisee

## 20. Licence

Voir le fichier `LICENSE`.
