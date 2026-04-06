# Rapport de Projet de Fin d'Études
## Mise en place d'un réseau SDN intelligent utilisant l'IA pour l'optimisation et la sécurité du trafic

---

**Étudiant :** —  
**Encadrant :** —  
**Établissement :** —  
**Année universitaire :** 2025–2026  
**Date :** Avril 2026

---

## Résumé exécutif

Ce projet de fin d'études propose la conception et l'implémentation d'un **réseau SDN intelligent** combinant le contrôleur ONOS, la simulation réseau avec Mininet/OVS, et deux modèles d'intelligence artificielle (Random Forest et XGBoost) pour la détection d'attaques réseau en temps réel. L'ensemble est exposé via une **plateforme web centralisée** inspirée de Cisco DNA Center, permettant à un ingénieur réseau de superviser, diagnostiquer et configurer l'infrastructure depuis une interface unique.

Le projet couvre trois axes complémentaires : l'infrastructure SDN (contrôleur, switches virtuels, routeur Cisco CSR1000V), l'intelligence artificielle appliquée à la sécurité réseau, et le développement d'une plateforme de gestion complète.

---

## Table des matières

1. [Contexte et problématique](#1-contexte-et-problématique)
2. [Objectifs du projet](#2-objectifs-du-projet)
3. [État d'avancement global](#3-état-davancement-global)
4. [Architecture générale du système](#4-architecture-générale-du-système)
5. [Partie I — Infrastructure SDN](#5-partie-i--infrastructure-sdn)
6. [Partie II — Intelligence artificielle](#6-partie-ii--intelligence-artificielle)
7. [Partie III — Plateforme centralisée](#7-partie-iii--plateforme-centralisée)
8. [Stack technique complet](#8-stack-technique-complet)
9. [Structure du projet](#9-structure-du-projet)
10. [Base de données](#10-base-de-données)
11. [Pages et fonctionnalités de la plateforme](#11-pages-et-fonctionnalités-de-la-plateforme)
12. [API et intégrations](#12-api-et-intégrations)
13. [Déploiement et infrastructure](#13-déploiement-et-infrastructure)
14. [Plan de développement](#14-plan-de-développement)
15. [Résultats attendus](#15-résultats-attendus)

---

## 1. Contexte et problématique

Les réseaux informatiques traditionnels sont rigides, difficiles à administrer et peu adaptés aux environnements modernes. Ils offrent une visibilité limitée sur l'état global du trafic et ne permettent pas une détection rapide des anomalies, des congestions ou des attaques réseau.

Le **Software Defined Networking (SDN)** répond à cette rigidité en découplant le plan de contrôle du plan de données. Le contrôleur SDN dispose d'une vue globale du réseau et peut programmer dynamiquement les équipements. Cependant, même avec un SDN, la détection d'attaques et l'optimisation du routage nécessitent encore une intervention humaine dans les architectures classiques.

Ce projet vise à pallier ce manque en ajoutant une couche d'**Intelligence Artificielle** au-dessus du SDN, ainsi qu'une **interface centralisée** permettant à un opérateur réseau de tout superviser et configurer depuis un seul tableau de bord.

---

## 2. Objectifs du projet

### Objectif général

Concevoir et mettre en œuvre un réseau SDN intelligent capable d'analyser le trafic réseau en temps réel, d'optimiser automatiquement le routage et de renforcer la sécurité du réseau à l'aide de techniques d'Intelligence Artificielle, le tout accessible via une interface graphique centralisée.

### Objectifs spécifiques

**Infrastructure SDN :**
- Déployer ONOS comme contrôleur SDN sur Ubuntu Server
- Simuler un réseau avec Mininet et Open vSwitch
- Intégrer un routeur Cisco CSR1000V (VM) pour démontrer le support multi-vendeurs
- Programmer les équipements via le protocole OpenFlow 1.3

**Intelligence Artificielle :**
- Générer un dataset réel de trafic réseau depuis Mininet (trafic bénin + attaques simulées)
- Entraîner deux modèles ML : Random Forest et XGBoost
- Déployer un serveur FastAPI comme pont Java (ONOS) ↔ Python (modèles IA)
- Détecter automatiquement les attaques DDoS, port scanning et anomalies
- Réagir automatiquement en injectant des règles de blocage dans ONOS

**Plateforme centralisée :**
- Développer une interface web moderne (Next.js + React) inspirée de Cisco DNA Center
- Visualiser la topologie réseau en temps réel (graphe interactif Cytoscape.js)
- Superviser tous les équipements via ONOS (switches OVS, Cisco CSR1000V, tout équipement supporté)
- Intégrer un terminal SSH dans le navigateur pour l'accès CLI aux équipements
- Permettre la configuration réseau (règles de flux OpenFlow, VLAN, QoS, politiques de sécurité)
- Stocker l'historique des métriques et alertes dans PostgreSQL et InfluxDB

---

## 3. État d'avancement global

| Partie | Composant | Statut |
|--------|-----------|--------|
| **Infrastructure SDN** | ONOS installé sur VM Ubuntu | ✅ Fonctionnel |
| **Infrastructure SDN** | Mininet + Open vSwitch | ✅ Fonctionnel |
| **Infrastructure SDN** | Cisco CSR1000V (VM) | ✅ Déployé |
| **Infrastructure SDN** | Intégration ONOS ↔ Mininet/OVS | ✅ Fonctionnel |
| **Intelligence Artificielle** | Génération dataset (Mininet) | ✅ Terminé |
| **Intelligence Artificielle** | Prétraitement + StandardScaler | ✅ Terminé |
| **Intelligence Artificielle** | Entraînement Random Forest | ✅ Terminé |
| **Intelligence Artificielle** | Entraînement XGBoost | ✅ Terminé |
| **Intelligence Artificielle** | Cross-validation (K-Fold k=5) | ✅ Terminé |
| **Intelligence Artificielle** | Serveur FastAPI (predictor.py) | ✅ Terminé |
| **Intelligence Artificielle** | App ONOS Java (FlowStatsCollector) | ✅ Terminé |
| **Intelligence Artificielle** | Intégration ONOS → FastAPI → règles | ✅ Fonctionnel |
| **Plateforme web** | Frontend Next.js (Dashboard, Topologie, Devices, Flows, Alertes, Config) | ✅ Développé |
| **Plateforme web** | Backend Node.js/Express (35+ endpoints) | ✅ Fonctionnel |
| **Plateforme web** | Authentification JWT + RBAC | ✅ Fonctionnel |
| **Plateforme web** | Intégration ONOS REST API | ✅ Fonctionnel |
| **Plateforme web** | Page Applications ONOS | 🔄 En cours |
| **Plateforme web** | Terminal SSH (Xterm.js) | 🔄 En cours |
| **Plateforme web** | Service Python Flask (SSH proxy + métriques InfluxDB) | 🔄 Planifié |
| **Plateforme web** | InfluxDB (métriques time-series) | 🔄 Planifié |
| **Déploiement** | Docker Compose | ✅ Prêt |
| **Déploiement** | Kubernetes manifests | ✅ Prêt |

---

## 4. Architecture générale du système

```
┌──────────────────────────────────────────────────────────────────────────┐
│                        PLATEFORME CENTRALISÉE                             │
│                                                                           │
│  Dashboard · Topologie · Équipements · Terminal SSH · Config · Alertes   │
│                 Next.js 15 + React 19 + TypeScript                        │
│         Cytoscape.js · Recharts · Xterm.js · Socket.IO                   │
└────────────────────────┬─────────────────────────────────────────────────┘
                         │ HTTP REST + WebSocket
         ┌───────────────┴───────────────────┐
         │                                   │
┌────────▼──────────┐             ┌──────────▼──────────┐
│  Node.js/Express  │             │   Flask/Python       │
│  Backend principal│             │   Service IA + SSH   │
│  35+ endpoints    │             │   Paramiko + Celery  │
│  JWT · PostgreSQL │             │   InfluxDB writer    │
└────────┬──────────┘             └──────────┬──────────┘
         │                                   │
         │  REST API                         │  WebSocket SSH
         ▼                                   ▼
┌────────────────────────────────────────────────────────┐
│                    ONOS Controller                      │
│          Northbound REST API · OpenFlow southbound      │
│          NETCONF/YANG · OVSDB · P4Runtime               │
└──────────────────────┬─────────────────────────────────┘
                       │ OpenFlow 1.3
          ┌────────────┼────────────────┐
          │            │                │
   ┌──────▼───┐  ┌─────▼────┐  ┌───────▼──────┐
   │   OVS    │  │  Mininet │  │ Cisco CSR1000V│
   │ Switches │  │  Hosts   │  │    (VM)       │
   └──────────┘  └──────────┘  └──────────────┘
          │
          │ FlowStats (82 features) toutes les 2s
          ▼
┌──────────────────────┐     ┌─────────────────────────┐
│  ONOS App Java       │────▶│  FastAPI ML Server       │
│  FlowStatsCollector  │     │  predictor.py            │
│  OSGi bundle         │◀────│  RF + XGBoost (.pkl)     │
│  Inject DROP rules   │     │  decide_action()         │
└──────────────────────┘     └─────────────────────────┘
          │
          ▼
┌──────────────────────────────────────────────┐
│              STOCKAGE                         │
│  PostgreSQL : alertes, config, users, audit  │
│  InfluxDB   : métriques time-series          │
└──────────────────────────────────────────────┘
```

---

## 5. Partie I — Infrastructure SDN

### 5.1 Contrôleur ONOS

**ONOS (Open Network Operating System)** a été choisi comme contrôleur SDN après analyse comparative. Ses avantages principaux pour ce projet sont la maturité de son API REST northbound (utilisée par la plateforme et le module IA), le support natif de plusieurs protocoles southbound (OpenFlow, NETCONF/YANG, OVSDB, P4Runtime) permettant de gérer des équipements hétérogènes, son architecture modulaire OSGi qui facilite le développement d'applications Java personnalisées, et sa communauté active avec une documentation complète.

**Équipements supportés via ONOS :**

| Protocole | Équipements |
|-----------|-------------|
| OpenFlow 1.3 | Open vSwitch, switches OpenFlow-compatibles |
| NETCONF/YANG | Cisco IOS-XE (CSR1000V), Huawei VRP, Juniper |
| OVSDB | Gestion configuration OVS |
| P4Runtime | Switches programmables P4 |

**Configuration déployée :** ONOS tourne sur Ubuntu Server 22.04 LTS dans une VM dédiée. L'interface REST est accessible sur le port 8181. Le contrôleur gère la topologie Mininet et communique avec le routeur Cisco CSR1000V via l'interface de gestion.

### 5.2 Simulation réseau — Mininet + Open vSwitch

Mininet permet de créer des topologies réseau virtuelles réalistes. Open vSwitch (OVS) joue le rôle de switch programmable compatible OpenFlow. L'environnement permet de générer du trafic TCP/UDP réaliste pour l'entraînement des modèles IA, de simuler des attaques réseau (DDoS, port scanning) en environnement isolé, et de tester les réponses automatiques du système (injection de règles DROP).

### 5.3 Cisco CSR1000V

Le routeur virtuel **Cisco CSR1000V** (Cloud Services Router) est déployé dans une VM. Il dispose d'une interface web graphique (Cisco Web UI) accessible depuis le navigateur, permettant la visualisation des interfaces réseau (RX/TX en bits/sec), des protocoles de routage actifs (OSPF, EIGRP, Static Routing), des politiques de sécurité (AAA, ACL, NAT, VPN), et des ressources système (CPU, RAM, Flash). Ce routeur est utilisé pour démontrer que la plateforme supporte des équipements réels multi-vendeurs via ONOS, au-delà de la simulation Mininet.

---

## 6. Partie II — Intelligence artificielle

### 6.1 Démarche complète

```
Génération dataset (Mininet)
         │
         ▼
Prétraitement (StandardScaler)
         │
    ┌────┴────┐
    │         │
Random      XGBoost
Forest         │
    │         │
    └────┬────┘
         │
Cross-validation K-Fold (k=5)
         │
         ▼
Meilleur modèle → .pkl
         │
         ▼
FastAPI (predictor.py)
         │
         ▼
ONOS App Java (FlowStatsCollector)
         │
         ▼
Réponse automatique (DROP rule / alerte)
```

### 6.2 Dataset

Le dataset a été généré directement depuis l'environnement Mininet, ce qui lui confère un caractère réaliste par rapport aux datasets publics. Il contient **82 features** par flux réseau, extraites par le module `FlowStatsCollector.java` depuis les statistiques OVS (durée du flux, débits entrant/sortant, ratios TCP/UDP, flags, entropie de paquets, etc.). Le dataset comprend du trafic bénin (BENIGN) et plusieurs classes d'attaques simulées. La taille du jeu d'entraînement est de **12 240 flux**, découpés en 5 folds pour la cross-validation.

### 6.3 Prétraitement

**StandardScaler** est appliqué pour normaliser les features. La justification technique est la suivante : certaines features ont des plages très différentes (par exemple `flow_duration` varie de 0 à 10 000 000 µs, tandis que `has_sql_keyword` varie de 0 à 1). Sans normalisation, les modèles favorisent les grandes valeurs numériques. Le scaler est fitté **exclusivement sur le train set** puis appliqué au test set, pour éviter toute contamination de l'évaluation.

### 6.4 Modèles entraînés

**Random Forest** — ensemble d'arbres de décision construits en parallèle sur des sous-échantillons du dataset avec sélection aléatoire de features. Chaque arbre vote indépendamment et la classe majoritaire est retenue. Avantages : robustesse au bruit, interprétabilité via feature importance, peu sensible à l'overfitting.

**XGBoost** — algorithme de gradient boosting séquentiel où chaque arbre corrige les erreurs résiduelles du précédent, en minimisant une fonction de perte via descente de gradient. Avantages : haute précision, gestion native des valeurs manquantes, régularisation L1/L2 intégrée.

### 6.5 Cross-validation et validation

La cross-validation K-Fold (k=5) découpe le train set en 5 parties égales. Pour chaque fold, le modèle est entraîné sur 4 parties et évalué sur la 5e. Les métriques rapportées (accuracy, precision, recall, F1-score) sont moyennées sur les 5 folds. Cette approche permet de détecter l'overfitting et de comparer les deux modèles de manière fiable.

### 6.6 Architecture de déploiement — FastAPI

ONOS est écrit en Java et ne peut pas charger directement des modèles Python (.pkl). La solution adoptée est un serveur **FastAPI** en Python qui joue le rôle de pont :

```
ONOS App Java
  │  POST /predict (JSON, 82 features)
  ▼
FastAPI (Python)
  │  predictor.py charge model_rf.pkl / model_xgb.pkl
  │  StandardScaler.transform(features)
  │  Prédiction → {attack_type, confidence, action}
  ▼
ONOS reçoit la réponse JSON
  │
  ├── confidence > 85% → INSERT alerte + règle DROP dans ONOS
  ├── confidence 60-85% → INSERT alerte WARNING (pas de DROP)
  └── confidence < 60%  → ignorer (trop incertain)
```

Le fichier `schemas.py` valide la requête avant toute prédiction — si ONOS envoie 81 features au lieu de 82, le serveur refuse avec une erreur claire sans crasher.

### 6.7 Application ONOS Java — FlowStatsCollector

Un bundle **OSGi** déployé dans ONOS tourne en boucle toutes les **2 secondes**. À chaque itération : collecte des statistiques de flux actifs sur tous les switches (nombre de paquets, bytes, durée), transformation en 82 features numériques (`FlowStatsCollector.java`), envoi à FastAPI via HTTP POST, et en cas d'alerte avec confiance > 85%, injection d'une règle de flux DROP dans ONOS pour bloquer l'IP source.

---

## 7. Partie III — Plateforme centralisée

### 7.1 Concept et inspiration

La plateforme est conçue comme un **Network Management System (NMS)** centralisé, fonctionnellement inspiré de **Cisco DNA Center** : une interface unique permettant à un ingénieur réseau de surveiller et configurer toute son infrastructure, quel que soit le vendeur des équipements, grâce à l'abstraction fournie par ONOS.

L'IT user peut depuis cette plateforme : voir en temps réel l'état de tous ses équipements (switches OVS, routeurs Cisco, tout device géré par ONOS), visualiser la topologie réseau sous forme de graphe interactif avec état de chaque lien, recevoir des alertes automatiques générées par les modèles IA (DDoS, anomalies, port scanning), configurer les équipements (règles OpenFlow, VLAN, QoS, ACL), accéder à un terminal SSH directement dans le navigateur, et analyser l'historique des performances sur des périodes journalières et mensuelles.

### 7.2 Frontend — Next.js 15

Le frontend est une **Single Page Application** développée avec Next.js 15 (App Router), React 19 et TypeScript. Le design system utilise Tailwind CSS et les composants Radix UI. Les bibliothèques de visualisation principales sont Cytoscape.js pour la topologie réseau (spécialisé graphes réseau), Recharts pour les graphes de métriques (intégration React native), et Xterm.js pour le terminal SSH dans le navigateur.

**Pages développées :**

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | `/dashboard` | Vue synthétique : KPI, trafic, alertes, topologie réseau |
| Topologie | `/topology` | Graphe Cytoscape.js live, path analysis, métriques liens |
| Équipements | `/devices` | Inventaire, détail ports, métriques temps réel |
| Flux | `/flows` | CRUD règles OpenFlow, création et suppression |
| Applications | `/applications` | Apps ONOS avec activation/désactivation |
| Alertes | `/alerts` | Alertes réseau + alertes IA, historique, résolution |
| Terminal SSH | `/terminal` | Sessions SSH multiples via Xterm.js + Paramiko |
| Configuration | `/configuration` | Paramètres ONOS, politiques, QoS, audit log |
| Admin Users | `/admin/users` | Gestion utilisateurs et rôles |
| Services VPLS | `/services` | Gestion services Layer 2 VPLS |

### 7.3 Backend principal — Node.js/Express

Le backend Express expose **35+ endpoints REST** couvrant l'authentification JWT, la gestion des utilisateurs avec RBAC (admin/operator/viewer), la topologie ONOS (devices, links, hosts, paths), les flux OpenFlow (CRUD), les alertes (création, résolution, historique), les métriques réseau, les services VPLS, et les applications ONOS. Il implémente un cache in-memory (TTL 30-60s) pour limiter les appels à ONOS et un mécanisme de synchronisation automatique toutes les 5 secondes.

La persistance est assurée par **PostgreSQL** avec un mode fallback pg-mem (embarqué) et un store local JSON pour le développement sans base de données.

### 7.4 Service Python Flask — IA + SSH + Métriques

Un microservice Python Flask complète le backend Node.js pour les fonctionnalités qui nécessitent Python : le proxy SSH (Paramiko → terminal browser), la collecte périodique de métriques (Celery + Beat → InfluxDB), et l'intégration avec FastAPI ML (alertes IA → PostgreSQL).

```
Browser (Xterm.js)
  │ WebSocket
Flask Socket.IO
  │ Paramiko SSH
Équipement réseau (Cisco, OVS, Linux)
```

---

## 8. Stack technique complet

### Frontend

| Technologie | Version | Rôle |
|-------------|---------|------|
| Next.js | 15.2.4 | Framework React SSR/SPA |
| React | 19 | UI components |
| TypeScript | 5.x | Typage statique |
| Tailwind CSS | 3.x | Design system utilitaire |
| Radix UI | latest | Composants accessibles |
| Cytoscape.js | 3.x | Visualisation topologie réseau |
| Recharts | 2.x | Graphes métriques |
| Xterm.js | 5.x | Terminal SSH dans le browser |
| Socket.IO Client | 4.x | WebSocket alertes temps réel |
| Axios | 1.x | Client HTTP avec JWT interceptors |

### Backend principal

| Technologie | Version | Rôle |
|-------------|---------|------|
| Node.js | 20.x | Runtime JavaScript |
| Express | 4.18 | Framework API REST |
| PostgreSQL | 15 | Base de données principale |
| pg | 8.20 | Client PostgreSQL Node.js |
| JWT + bcryptjs | latest | Authentification sécurisée |
| pg-mem | 2.x | Fallback PostgreSQL embarqué |

### Service Python (IA + SSH + Métriques)

| Technologie | Version | Rôle |
|-------------|---------|------|
| Flask | 3.x | Framework web Python |
| Flask-SocketIO | 5.x | WebSocket SSH proxy |
| Paramiko | 3.x | Client SSH Python |
| Celery | 5.x | Tâches asynchrones périodiques |
| Redis | 7.x | Broker Celery |
| influxdb-client | 3.x | Écriture métriques time-series |
| SQLAlchemy | 2.x | ORM PostgreSQL |
| FastAPI | 0.x | Serveur inférence ML |
| Scikit-learn | 1.x | Random Forest + StandardScaler |
| XGBoost | 2.x | Gradient boosting |

### Infrastructure SDN

| Technologie | Rôle |
|-------------|------|
| ONOS | Contrôleur SDN (northbound REST, southbound OpenFlow/NETCONF) |
| Mininet | Simulation réseau (topologies virtuelles, génération trafic) |
| Open vSwitch (OVS) | Switch programmable OpenFlow |
| Cisco CSR1000V | Routeur virtuel (VM) — démonstration multi-vendeurs |
| Ubuntu Server 22.04 | OS de base |

### Stockage

| Base | Type | Données |
|------|------|---------|
| PostgreSQL 15 | Relationnel | Alertes, configurations, utilisateurs, audit log, événements réseau |
| InfluxDB 2.x | Time-series | Débit par lien, latence, CPU/RAM devices, taux paquets |

### Déploiement

| Outil | Rôle |
|-------|------|
| Docker Compose | Orchestration locale (PostgreSQL + InfluxDB + Redis + services) |
| Kubernetes | Déploiement production (HPA, LoadBalancer, ConfigMaps, Secrets) |
| GitHub Actions | CI/CD (build, tests Jest, déploiement) |

---

## 9. Structure du projet

```
PLATFORM-SDN/
│
├── PlatformSDN/                          # Application principale Next.js
│   ├── app/                              # Pages Next.js (App Router)
│   │   ├── dashboard/page.tsx            # Vue globale réseau
│   │   ├── topology/page.tsx             # Topologie Cytoscape.js
│   │   ├── devices/page.tsx              # Inventaire équipements
│   │   ├── flows/page.tsx                # Gestion flux OpenFlow
│   │   ├── alerts/page.tsx               # Alertes réseau + IA
│   │   ├── applications/page.tsx         # Applications ONOS
│   │   ├── terminal/page.tsx             # Terminal SSH Xterm.js
│   │   ├── services/page.tsx             # Services VPLS
│   │   ├── configuration/page.tsx        # Configuration réseau
│   │   └── admin/users/page.tsx          # Gestion utilisateurs
│   │
│   ├── backend/                          # API Express Node.js
│   │   ├── server.js                     # Point d'entrée (35+ endpoints)
│   │   ├── controllers/                  # Logique métier
│   │   ├── routes/                       # Définition routes
│   │   ├── services/                     # Services ONOS, alertes
│   │   ├── middleware/                   # JWT, CORS, rate limiting
│   │   └── init-db.sql                   # Schéma PostgreSQL
│   │
│   └── components/                       # 50+ composants React
│       ├── layout/                       # Shell, Header, Sidebar
│       ├── ui/                           # Primitives Radix UI
│       ├── TopologyMap.tsx               # Cytoscape.js
│       └── DeviceTable.tsx               # Tableau équipements
│
├── python-service/                       # Microservice Python
│   ├── app.py                            # Flask app factory
│   ├── ssh_proxy.py                      # WebSocket SSH + Paramiko
│   ├── tasks/                            # Celery tasks (métriques)
│   └── influx_writer.py                  # Écriture InfluxDB
│
├── ml-server/                            # FastAPI ML (déjà développé)
│   ├── main.py                           # Serveur FastAPI
│   ├── predictor.py                      # Chargement modèles .pkl
│   ├── schemas.py                        # Validation Pydantic (82 features)
│   ├── decide_action.py                  # Logique seuils confiance
│   └── models/
│       ├── model_rf.pkl                  # Random Forest entraîné
│       ├── model_xgb.pkl                 # XGBoost entraîné
│       └── scaler.pkl                    # StandardScaler fitté
│
├── onos-app/                             # Application ONOS Java
│   └── src/
│       └── FlowStatsCollector.java       # Bundle OSGi — collecte + envoi IA
│
├── mininet/                              # Scripts simulation
│   ├── topologies/                       # Topologies personnalisées
│   └── traffic_generator.py             # Génération trafic synthétique
│
├── k8s/                                  # Kubernetes manifests
│   ├── deployment.yaml
│   ├── postgres.yaml
│   └── configmaps/
│
├── docker-compose.yml                    # Stack complète locale
├── docker-compose.dev.yml               # Environnement développement
└── README.md
```

---

## 10. Base de données

### PostgreSQL — tables principales

```sql
-- Utilisateurs et authentification
users (id, username, email, password_hash, role, last_login, created_at)
-- role: 'admin' | 'operator' | 'viewer'

-- Inventaire équipements
devices (id, onos_device_id, hostname, ip_address, device_type,
         vendor, model, ssh_host, ssh_port, ssh_username, status)

-- Alertes IA (Random Forest / XGBoost)
alerts (id, timestamp, device_id, src_ip, dst_ip, attack_type,
        model_used, confidence, action_taken, flow_rule_id, severity,
        resolved, resolved_at, notes)
-- attack_type: 'DDoS' | 'PortScan' | 'Anomaly' | 'BENIGN'
-- action_taken: 'DROP' | 'INSPECT' | 'PASS'

-- Règles de flux OpenFlow
flows (id, timestamp, onos_rule_id, device_id, priority,
       src_ip, dst_ip, src_port, dst_port, protocol, action,
       created_by, reason, active)

-- Événements réseau (topologie)
network_events (id, timestamp, event_type, device_id, port_id, detail, severity)
-- event_type: 'link_up' | 'link_down' | 'device_added' | 'port_down'

-- Log de configuration (audit)
config_audit (id, timestamp, user_id, action, device_id,
              old_value, new_value, status, error_msg)

-- Métriques ports (historique)
port_metrics (id, device_id, port_number, timestamp,
              rx_bytes, tx_bytes, rx_packets, tx_packets)

-- Journal synchronisation ONOS
sync_log (id, timestamp, operation, status, detail)
```

### InfluxDB — mesures time-series

```
Measurement: link_metrics
  Tags:    device_id, port_id
  Fields:  rx_bits_per_sec, tx_bits_per_sec, utilization_pct,
           rx_packets, tx_packets, rx_errors
  Interval: toutes les 5 secondes

Measurement: device_metrics
  Tags:    device_id, vendor, type
  Fields:  cpu_utilization, memory_used_pct, active_flows, active_ports
  Interval: toutes les 10 secondes

Measurement: flow_stats
  Tags:    device_id, flow_id
  Fields:  packet_count, byte_count, duration_sec
  Interval: toutes les 10 secondes
```

---

## 11. Pages et fonctionnalités de la plateforme

### Dashboard

Le dashboard est la vue centrale de la plateforme. Il affiche en temps réel quatre indicateurs clés (devices online/total, flux actifs, ports live, alertes ouvertes) avec des mini-graphes d'évolution (sparklines). Un graphe de trafic RX/TX par device, la distribution des types d'équipements, les alertes récentes avec niveau de sévérité, et les liens les plus chargés complètent la vue. Un indicateur de santé globale (vert/orange/rouge) synthétise l'état du réseau en un coup d'œil.

### Topologie réseau

La page topologie affiche un graphe interactif Cytoscape.js qui se met à jour toutes les 5 secondes depuis l'API ONOS. Les nœuds représentent les équipements (switch, router, host) avec des couleurs indiquant leur état (vert = up, rouge = down). Les liens changent de couleur selon leur charge (vert nominal, orange saturé, rouge critique). Un clic sur un nœud ouvre un panneau de détail avec les ports live et les métriques RX/TX. La fonctionnalité de path analysis calcule le chemin optimal entre deux équipements via l'API ONOS et le met en évidence sur le graphe.

### Équipements

Liste filtrée de tous les équipements avec statut, ports, métriques. Un clic ouvre un modal détail avec l'historique des métriques sur 1h/24h/7j/30j.

### Flux OpenFlow

CRUD complet sur les règles de flux ONOS. Formulaire de création (device, priorité, IP source/destination, port, protocole, action). Tableau des règles actives avec statut (ADDED/PENDING), match summary, action summary. Suppression directe depuis ONOS.

### Applications ONOS

Liste de toutes les applications ONOS (actives et installées) avec recherche, filtrage, et possibilité d'activer ou désactiver chaque application. Un expand par ligne affiche la description, les features et les dépendances (required apps).

### Terminal SSH

Terminal CLI complet dans le navigateur via Xterm.js. Support de sessions multiples simultanées (un onglet par équipement). Connexion possible à n'importe quel device SSH (OVS via Mininet, Cisco CSR1000V, Linux host). Des boutons de commandes rapides prédéfinies (`show interfaces`, `show ip route`, `show running-config`, `show version`, `show ip ospf neighbor`) accélèrent le diagnostic. L'architecture est Browser → WebSocket → Flask → Paramiko SSH → Équipement.

### Alertes et IA

Tableau des alertes provenant de deux sources : les alertes réseau générées depuis l'état ONOS (device offline, link down, port dégradé) et les alertes IA injectées par FastAPI ML (DDoS, port scanning, anomalies). Filtres par sévérité, type, période, statut (ouvert/résolu). Statistiques visuelles (graphes 30 jours, distribution par type). Bouton de résolution avec notes.

### Configuration

Formulaires pour créer des règles de flux OpenFlow, configurer les paramètres ONOS (URL, credentials, timeout), gérer les politiques d'alerte (seuils), et activer/désactiver la collecte de métriques. Audit log de toutes les modifications avec utilisateur, date et résultat.

---

## 12. API et intégrations

### Endpoints ONOS utilisés

```
GET  /onos/v1/devices                    → inventaire équipements
GET  /onos/v1/devices/{id}/ports         → ports d'un device
GET  /onos/v1/links                      → liens actifs
GET  /onos/v1/hosts                      → hôtes détectés
GET  /onos/v1/topology                   → topologie globale
GET  /onos/v1/paths/{src}/{dst}          → chemin optimal
GET  /onos/v1/flows                      → toutes les règles de flux
GET  /onos/v1/flows/{deviceId}           → flux d'un device
POST /onos/v1/flows/{deviceId}           → créer une règle
DELETE /onos/v1/flows/{deviceId}/{flowId}→ supprimer une règle
GET  /onos/v1/statistics/ports           → statistiques par port
GET  /onos/v1/statistics/flows           → statistiques flux
GET  /onos/v1/applications               → applications installées
POST /onos/v1/applications/{id}/activate → activer une app
POST /onos/v1/applications/{id}/deactivate → désactiver
GET  /onos/v1/cluster                    → état cluster ONOS
GET  /onos/v1/metrics                    → métriques contrôleur
```

### Flux de données temps réel

**Chemin d'une métrique réseau :**
```
OVS/ONOS → Celery task (toutes 5s) → InfluxDB → API Flask → React (graphe)
                                               → Socket.IO → React (live)
```

**Chemin d'une alerte IA :**
```
OVS (flux actifs) → ONOS App Java (FlowStatsCollector, toutes 2s)
  → FastAPI /predict → {attack_type, confidence, action}
  → Flask : INSERT PostgreSQL alerts
  → Flask : POST ONOS /flows (règle DROP si confidence > 85%)
  → Flask : Socket.IO emit new_alert
  → React : toast notification + badge rouge sur device
```

**Chemin d'un événement topologie :**
```
Mininet link_down → ONOS topology event
  → Celery task (toutes 10s) → PostgreSQL network_events
  → Socket.IO emit topology_update
  → React Cytoscape.js : lien devient rouge
```

---

## 13. Déploiement et infrastructure

### Docker Compose (local)

```yaml
services:
  postgres:    # PostgreSQL 15 — port 5432
  influxdb:    # InfluxDB 2.x — port 8086
  redis:       # Redis 7 — port 6379
  backend:     # Node.js/Express — port 5000
  frontend:    # Next.js — port 3000
  python-svc:  # Flask + Celery — port 5001
  ml-server:   # FastAPI ML — port 8000
```

### Variables d'environnement clés

```bash
# Bases de données
DATABASE_URL=postgresql://user:pass@localhost:5432/sdn_platform
INFLUX_URL=http://localhost:8086
INFLUX_TOKEN=<token>
REDIS_URL=redis://localhost:6379

# ONOS
ONOS_URL=http://localhost:8181/onos/v1
ONOS_USER=onos
ONOS_PASS=rocks

# JWT
JWT_SECRET=<clé_secrète_longue>
JWT_EXPIRY=8h

# ML Server
ML_API_URL=http://localhost:8000
```

### Tests et qualité

Le projet inclut une suite de tests Jest couvrant les services et routes backend (70%+ coverage), les composants React et hooks personnalisés, et les flux d'authentification. L'intégration continue est configurée via GitHub Actions.

---

## 14. Plan de développement

### Phase 1 — Backend fondation ✅ Terminé
Infrastructure ONOS + Mininet, modèles IA entraînés, FastAPI ML opérationnel, backend Node.js avec 35+ endpoints, authentification JWT.

### Phase 2 — Plateforme frontend ✅ Terminé
Dashboard, Topologie (Cytoscape.js), Devices, Flows, Alerts, Configuration, Admin Users, Services VPLS.

### Phase 3 — Nouvelles pages 🔄 En cours
Page Applications ONOS (tableau avec activation/désactivation), page Terminal SSH (Xterm.js multi-sessions, commandes rapides).

### Phase 4 — Service Python Flask 📋 Planifié
Proxy SSH WebSocket (Paramiko), collecte métriques périodique (Celery → InfluxDB), intégration alertes IA → PostgreSQL → Socket.IO.

### Phase 5 — Tests et démonstration 📋 Planifié
Scénario complet : simulation attaque DDoS depuis Mininet → détection RF/XGBoost → alerte temps réel sur plateforme → règle DROP automatique → normalisation. Démonstration topologie dynamique : link down → graphe mis à jour automatiquement. Démonstration terminal SSH → Cisco CSR1000V : `show ip route`, `show interfaces`. Tests de performance (latence pipeline IA < 2s, 100 flux/s).

---

## 15. Résultats attendus

À la fin du projet, la plateforme devra démontrer les capacités suivantes :

**Surveillance temps réel :** un ingénieur réseau peut voir en moins de 5 secondes si un équipement tombe en panne ou si un lien est saturé, depuis n'importe quel navigateur.

**Détection automatique d'attaques :** le système détecte une attaque DDoS simulée en moins de 2 secondes (cycle de collecte FlowStatsCollector) et injecte automatiquement une règle de blocage dans ONOS sans intervention humaine.

**Diagnostic à distance :** l'IT user peut ouvrir un terminal SSH vers le routeur Cisco CSR1000V depuis le dashboard et exécuter `show ip route`, `show interfaces` ou toute commande CLI sans sortir de la plateforme.

**Historique et analyse :** les métriques réseau sont archivées dans InfluxDB et consultables sur des périodes journalières et mensuelles via les graphes de la plateforme.

**Configuration centralisée :** toute modification de configuration (règle de flux, politique de sécurité) est tracée dans l'audit log avec l'identité de l'opérateur, la date et le résultat de l'opération.

---

## Annexe — Commandes de démarrage

```bash
# Démarrer toute la stack (recommandé)
docker-compose up -d

# Frontend seul (développement)
cd PlatformSDN && npm run dev

# Backend Node.js
npm run backend

# Service Python
cd python-service && python app.py

# ML Server FastAPI
cd ml-server && uvicorn main:app --reload --port 8000

# Celery worker
celery -A tasks worker --loglevel=info

# Vérification santé
curl http://localhost:5000/api/health
```

---

*Document préparé dans le cadre du Projet de Fin d'Études*  
*Mise en place d'un réseau SDN intelligent utilisant l'IA pour l'optimisation et la sécurité du trafic*  
*Avril 2026*

 