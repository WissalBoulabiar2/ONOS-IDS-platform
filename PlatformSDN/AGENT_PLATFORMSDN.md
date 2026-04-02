# Agent PlatformSDN Guide

Document de reference pour les prochaines sessions de travail sur PlatformSDN.

Ce fichier complete `README.md`.

Ordre de lecture recommande:

1. `README.md`
2. `AGENT_PLATFORMSDN.md`

## 1. Identite du projet

PlatformSDN est une plateforme web de supervision, d'observabilite et d'orchestration SDN autour du controleur ONOS.

Stack actuelle:

- frontend `Next.js 15` + `React 19`
- backend `Express`
- base `PostgreSQL`
- auth `JWT` + `bcrypt`
- mode degrade possible via `backend/dev-store.json` et `pg-mem`

## 2. Carte produit par page

### `/dashboard` - Centre d'exploitation

Objectif:

- fournir une vue executive temps reel de tout le reseau

Deja en place:

- etat du controleur ONOS
- noeuds du cluster
- applications actives
- sante applicative via `/applications/{name}/health`
- hosts decouverts
- intents resumes
- charge des liens via `/statistics/flows/link`
- incidents recents
- chatbot local d'assistance
- widget AI flottant pour ouvrir le chatbot

Prochaines ameliorations:

- top liens les plus charges avec normalisation enrichie
- cartes `mastership`
- metrics JVM / memoire via `/system` ou `/metrics`
- widgets IMR
- widgets VPLS actifs

APIs ONOS cibles:

- `GET /onos/v1/system`
- `GET /onos/v1/cluster`
- `GET /onos/v1/applications`
- `GET /onos/v1/applications/{name}/health`
- `GET /onos/v1/devices`
- `GET /onos/v1/hosts`
- `GET /onos/v1/statistics/ports`
- `GET /onos/v1/statistics/flows/link`
- `GET /onos/v1/intents/minisummary`

### `/topology` - Topologie live

Objectif:

- visualisation interactive du graphe reseau ONOS en temps reel

Deja en place:

- lecture directe ONOS
- hosts
- liens
- filtres
- layouts
- labels
- auto-refresh

Prochaines ameliorations:

- mode `hierarchy` pour topologies spine-leaf
- filtre `hosts / infrastructure / inactive only`
- mode `path analysis` avec `/paths/{src}/{dst}` et `/paths/{src}/{dst}/disjoint`
- coloration des liens par charge
- affichage des regions ONOS
- drill-down node -> ports -> flows -> intents
- panneau `Mastership`
- overlay `Intent`
- overlay `Services`
- action admin pour activer ou desactiver un port

### `/flows` - Gestion des flows OpenFlow

Objectif:

- lire, creer et supprimer des regles de flux ONOS

Deja en place:

- `GET /flows`
- `POST /flows/:deviceId`
- `DELETE /flows/:deviceId/:flowId`

Prochaines ameliorations:

- filtres par `deviceId`, `appId`, `state`, `tableId`
- duplication d'une flow existante
- formulaire avance match + action
- pages dediees `groups`, `meters`, `flowobjectives`

APIs ONOS cibles:

- `GET /onos/v1/flows/pending`
- `GET /onos/v1/flows/application/{appId}`
- `GET /onos/v1/flows/table/{tableId}`
- `GET /onos/v1/groups/{deviceId}`
- `POST /onos/v1/groups/{deviceId}`
- `GET /onos/v1/meters/{deviceId}`
- `POST /onos/v1/meters/{deviceId}`

### `/alerts` - Centre d'alertes

Objectif:

- detecter, afficher, acquitter et historiser les alertes reseau

Deja en place:

- detection backend
- historique PostgreSQL
- resolution d'alerte

Prochaines ameliorations:

- accuse de reception utilisateur distinct de "resolve"
- correlation enrichie device / link / flow / host
- WebSocket temps reel

### `/services` - Gestion VPLS

Objectif:

- creer et gerer des services VPLS depuis l'interface

Deja en place:

- liste VPLS
- creation
- suppression
- ajout d'interfaces
- suppression d'interfaces

API VPLS de reference:

- `GET /onos/vpls`
- `POST /onos/vpls`
- `GET /onos/vpls/{vplsName}`
- `DELETE /onos/vpls/{vplsName}`
- `POST /onos/vpls/interfaces/{vplsName}`
- `DELETE /onos/vpls/interface/{vplsName}/{interfaceName}`

Prochaines ameliorations:

- etat du service par site
- validation enrichie des formulaires
- correlation VPLS -> devices -> alertes

### `/intent-monitor` - a creer

Objectif:

- monitorer les intents reseau et declencher du re-routage

API IMR de reference:

- `GET /onos/v1/imr/monitoredIntents`
- `GET /onos/v1/imr/monitoredIntents/{id}/{name}`
- `GET /onos/v1/imr/intentStats`
- `GET /onos/v1/imr/intentStats/{id}/{name}`
- `GET /onos/v1/imr/intentStats/{id}/{name}/{intentKey}`
- `POST /onos/v1/imr/reRouteIntents`

La page devra afficher:

- liste des intents monitores
- endpoints `inElements / outElements`
- flows associes a chaque intent
- bouton de re-routage
- comparaison avant / apres re-routage

### `/controller-ops` - a creer

Objectif:

- administrer le cluster ONOS, les applications, le mastership et la configuration reseau

Sous-sections cibles:

- cluster
- mastership
- applications
- configuration reseau
- diagnostics

APIs importantes:

- `GET /onos/v1/cluster`
- `GET /onos/v1/cluster/{id}`
- `GET /onos/v1/mastership/{deviceId}/master`
- `GET /onos/v1/mastership/{deviceId}/role`
- `GET /onos/v1/mastership/{deviceId}/local`
- `PUT /onos/v1/mastership`
- `GET /onos/v1/mastership/{deviceId}/relinquish`
- `GET /onos/v1/mastership`
- `GET /onos/v1/applications`
- `GET /onos/v1/applications/{name}`
- `GET /onos/v1/applications/{name}/health`
- `POST /onos/v1/applications/{name}/active`
- `DELETE /onos/v1/applications/{name}/active`
- `GET /onos/v1/network/configuration`
- `POST /onos/v1/network/configuration`
- `GET /onos/v1/configuration`
- `GET /onos/v1/diagnostics`

### `/configuration` - Centre de configuration OVS

Objectif:

- permettre a l'operateur de configurer les switchs OVS depuis l'interface

Sections cibles:

- parametres de connexion ONOS lus depuis le backend
- configuration reseau ONOS via `POST /onos/v1/network/configuration`
- gestion des `device keys`
- etat du backend via `/api/health`

### `/admin/users` - Gestion des utilisateurs

Deja en place:

- liste des users
- creation par l'admin
- roles `admin / operator / viewer`

Reste a faire:

- changement de mot de passe
- audit trail des connexions et actions admin
- `forgot-password` reel avec tokens PostgreSQL

## 3. Routes backend a ajouter

Routes backend recommandees a implementer pour completer la plateforme:

| Route backend                    | Methode    | Appel ONOS                                   |
| -------------------------------- | ---------- | -------------------------------------------- |
| `/api/cluster`                   | `GET`      | `GET /onos/v1/cluster`                       |
| `/api/mastership/:deviceId`      | `GET`      | `GET /onos/v1/mastership/{deviceId}/role`    |
| `/api/intents`                   | `GET`      | `GET /onos/v1/intents`                       |
| `/api/intents/:appId/:key`       | `DELETE`   | `DELETE /onos/v1/intents/{appId}/{key}`      |
| `/api/imr/monitoredIntents`      | `GET`      | `GET /onos/v1/imr/monitoredIntents`          |
| `/api/imr/intentStats`           | `GET`      | `GET /onos/v1/imr/intentStats`               |
| `/api/imr/reRouteIntents`        | `POST`     | `POST /onos/v1/imr/reRouteIntents`           |
| `/api/groups/:deviceId`          | `GET`      | `GET /onos/v1/groups/{deviceId}`             |
| `/api/groups/:deviceId`          | `POST`     | `POST /onos/v1/groups/{deviceId}`            |
| `/api/meters/:deviceId`          | `GET`      | `GET /onos/v1/meters/{deviceId}`             |
| `/api/meters/:deviceId`          | `POST`     | `POST /onos/v1/meters/{deviceId}`            |
| `/api/applications`              | `GET`      | `GET /onos/v1/applications`                  |
| `/api/applications/:name/active` | `POST`     | `POST /onos/v1/applications/{name}/active`   |
| `/api/applications/:name/active` | `DELETE`   | `DELETE /onos/v1/applications/{name}/active` |
| `/api/network/configuration`     | `GET/POST` | `GET/POST /onos/v1/network/configuration`    |
| `/api/paths/:src/:dst`           | `GET`      | `GET /onos/v1/paths/{src}/{dst}`             |
| `/api/regions`                   | `GET`      | `GET /onos/v1/regions`                       |
| `/api/statistics/ports`          | `GET`      | `GET /onos/v1/statistics/ports`              |

## 4. Priorites d'amelioration

Ordre recommande:

1. enrichir `/dashboard`
2. ameliorer `/alerts`
3. ameliorer `/flows`
4. creer `intent-monitor` et `controller-ops`
5. modulariser `backend/server.js`

Details:

### Priorite 1 - Dashboard

- cartes `mastership`
- metrics JVM / memoire
- top liens les plus charges
- widgets IMR
- widgets VPLS

### Priorite 2 - Alerts

- ack utilisateur
- correlation enrichie
- WebSocket temps reel

### Priorite 3 - Flows

- filtres
- duplication
- groups
- meters
- formulaire avance

### Priorite 4 - Nouvelles pages

- `intent-monitor`
- `controller-ops`
- enrichissements VPLS et operations ONOS autour des nouvelles pages

### Priorite 5 - Backend

Modulariser `backend/server.js` en:

- `routes/`
- `services/`
- `auth/`
- `onos/`
- `db/`
- `sync/`

## 5. Regles de travail pour l'agent

- lire `README.md` au debut de chaque session importante
- lire `AGENT_PLATFORMSDN.md` pour la vision produit cible
- apres chaque amelioration importante frontend, backend, DB, auth ou ONOS, mettre a jour la doc concernee
- ne jamais exposer les secrets dans les logs ou les reponses API
- proteger toutes les routes `/api/*` par JWT sauf `/api/health` et `/api/auth/login`
- si PostgreSQL est indisponible, conserver la bascule automatique vers `dev-store.json` ou `pg-mem`
- utiliser `http://localhost:3000/login` pour l'interface web
- ne pas utiliser le port `5000` comme interface utilisateur

## 6. Point de depart recommande pour la prochaine implementation

Le meilleur point d'entree produit est maintenant:

1. enrichir `/dashboard` avec `mastership`, `system`, `metrics`, `top links`, `IMR`, `VPLS`
2. brancher les routes backend correspondantes
3. mettre a jour `README.md` apres chaque lot livre
