# PlatformSDN - Refactoring Architecture & Design System

## 🎯 Vision Globale
Transformer la plateforme actuelle en solution **enterprise-grade** pour la gestion/supervision SDN ONOS avec:
- **Architecture modulaire** et maintenable
- **Design system cohérent** à travers toute l'UI
- **Navigation optimisée** pour power users
- **Intégration ONOS complète** exploitant toutes les APIs disponibles

---

## 📊 Analyse de l'État Actuel

### ✅ Points Forts
- Stack moderne (Next.js 15, React 19, Tailwind CSS, Radix UI)
- Connexion établie avec ONOS APIs
- Gestion d'authentification en place
- Pages fonctionnelles (Dashboard, Topology, Devices, Flows, etc.)

### ❌ Points à Améliorer
1. **Navigation mono-directionnelle** - Navbar horizontale insuffisante pour arborescence complexe
2. **Layout incohérent** - Applications de styles disparates
3. **Design disparate** - Pas de design system unifié
4. **Pages volumineuses** - Peu de réutilisabilité de composants
5. **Manque de structure** - Pas de distinction claire entre sections critiques
6. **UX pour techniciens** - Pas optimisé pour supervision temps réel

---

## 🏗️ Nouvelle Architecture Proposée

### 1. Layout Principal avec Sidebar

```
┌─────────────────────────────────────────────────┐
│         Header / Navbar (Sticky)                │
│  Logo │ Breadcrumb │ Search │ Alerts │ User     │
├──────┬───────────────────────────────────────────┤
│      │                                           │
│      │  MAIN CONTENT                             │
│ Side │  (Responsive grid, avec padding)          │
│ bar  │                                           │
│      │  - Dynamique selon la section             │
│ (Col │  - Dark mode support                      │
│ laps-│  - ScrollArea pour footer sticky          │
│ ible)│                                           │
│      │                                           │
└──────┴───────────────────────────────────────────┘
```

**Sidebar Structure:**
```
├─ 📊 Dashboard
├─ 🌐 Network
│  ├─ Topology
│  ├─ Devices
│  ├─ Links
│  └─ Hosts
├─ 🔌 Services
│  ├─ Intents
│  ├─ Flows
│  ├─ VPLS
│  └─ Optical
├─ ⚙️  Configuration
│  ├─ Network Config
│  ├─ Device Settings
│  └─ Applications
├─ 📊 Monitoring
│  ├─ Cluster Status
│  ├─ Metrics
│  ├─ Statistics
│  └─ Performance
├─ 🚨 Alerts & Incidents
│  ├─ Active Alerts
│  └─ Alert History
├─ 👥 Administration (Admin only)
│  ├─ Users
│  ├─ Roles & Permissions
│  └─ Audit Logs
└─ ⚙️  Settings
   ├─ User Preferences
   ├─ Notifications
   └─ About / Help
```

### 2. Design System Unifié

#### Color Palette (Inspired by Cisco & ONOS)
```
Primary: Cyan (#06b6d4) - Main actions, highlights
Secondary: Slate (#1e293b) - Backgrounds, borders
Success: Emerald (#10b981) - Active, operational
Warning: Amber (#f59e0b) - Caution, degraded
Critical: Rose (#ef4444) - Alerts, errors
Info: Sky (#0ea5e9) - Information, hints
```

#### Component Hierarchy
```
Foundation
├─ Colors & Typography
├─ Spacing & Layout
└─ Border radius & Shadows

Components
├─ Basic (Button, Badge, Input, etc.)
├─ Containers (Card, Section, Panel)
├─ Data (Table, Chart, List, Tree)
├─ Navigation (Sidebar, Breadcrumb, Tabs)
└─ Feedback (Alert, Toast, Loading)

Patterns
├─ Empty state
├─ Error boundary
├─ Loading skeleton
├─ Not found
└─ Permission denied
```

### 3. Struktura de Dossiers

```
PlatformSDN/
├─ app/
│  ├─ layout.tsx                    (Root layout avec sidebar)
│  ├─ page.tsx                      (Redirect vers /dashboard)
│  ├─ login/
│  ├─ register/
│  ├─ (authenticated)/              (Group layout)
│  │  ├─ layout.tsx                 (Layout avec sidebar)
│  │  ├─ dashboard/
│  │  ├─ network/
│  │  │  ├─ topology/
│  │  │  ├─ devices/
│  │  │  ├─ links/
│  │  │  └─ hosts/
│  │  ├─ services/
│  │  │  ├─ intents/
│  │  │  ├─ flows/
│  │  │  ├─ vpls/
│  │  │  └─ optical/
│  │  ├─ configuration/
│  │  ├─ monitoring/
│  │  ├─ alerts/
│  │  └─ admin/              (Protected by role)
│  └─ not-found.tsx
│
├─ components/
│  ├─ layout/
│  │  ├─ app-header.tsx
│  │  ├─ app-sidebar.tsx
│  │  ├─ breadcrumb.tsx
│  │  ├─ user-menu.tsx
│  │  └─ notifications-panel.tsx
│  │
│  ├─ ui/                     (Base components from shadcn/ui)
│  ├─ common/                 (Project-specific components)
│  │  ├─ section-header.tsx   (Header avec titre, description, actions)
│  │  ├─ stat-card.tsx        (Metric display)
│  │  ├─ status-badge.tsx     (Device/Link status visualization)
│  │  ├─ device-card.tsx
│  │  ├─ flow-rules-table.tsx
│  │  └─ topologymap.tsx
│  │
│  ├─ forms/                  (Formulaires réutilisables)
│  ├─ dialogs/                (Modals)
│  └─ theme/
│     ├─ theme-provider.tsx
│     └─ theme-toggle.tsx
│
├─ lib/
│  ├─ api-client.ts           (Axios instance, interceptors)
│  ├─ onos-handlers.ts        (Helpers pour ONOS API)
│  ├─ types.ts
│  ├─ utils.ts
│  ├─ constants.ts            (Routes, colors, etc.)
│  └─ hooks/
│     ├─ useNetwork.ts
│     ├─ useDevices.ts
│     ├─ useFlows.ts
│     ├─ useMetrics.ts
│     └─ useAlert.ts
│
├─ services/
│  ├─ api.ts                  (Base API calls)
│  ├─ onos/
│  │  ├─ topology.ts
│  │  ├─ devices.ts
│  │  ├─ flows.ts
│  │  ├─ intents.ts
│  │  ├─ applications.ts
│  │  ├─ statistics.ts
│  │  ├─ configuration.ts
│  │  └─ cluster.ts
│  └─ database/               (PostgreSQL cache)
│
├─ hooks/
│  ├─ useAuth.ts
│  ├─ usePagination.ts
│  ├─ useSorting.ts
│  ├─ useFilters.ts
│  ├─ useRealTime.ts          (WebSocket/polling)
│  └─ useExport.ts
│
├─ store/
│  ├─ auth.store.ts           (Zustand)
│  ├─ network.store.ts
│  ├─ ui.store.ts
│  └─ notifications.store.ts
│
├─ middleware/
│  ├─ auth.ts
│  └─ logger.ts
│
├─ public/
│  ├─ images/
│  ├─ icons/
│  └─ logos/
│
├─ styles/
│  ├─ globals.css
│  ├─ variables.css           (Design tokens)
│  └─ animations.css
│
└─ tailwind.config.ts          (Configuration centralisée)
```

### 4. Pages & Workflows

#### Dashboard
- **KPI widgets** avec metrics temps réel
- **Quick actions** pour tâches communes
- **Alerts feed** actif
- **Network health snapshot**
- **Recent changes** timeline

#### Network > Topology
- **Interactive map** avec controls (zoom, pan, layout)
- **Node filtering** par type/status
- **Link visualization** avec capacité/load
- **Context menu** sur nodes/edges
- **Detail panel** pour inspections

#### Network > Devices
- **List view** comme table interactive
- **Filters** par type, status, manufacturer
- **Bulk actions** (activate, reboot, updates)
- **Drill-down** vers device details
- **Port management** modal

#### Services > Flows
- **Flow table** avec stats (hit count, bytes, duration)
- **Add flow** modal avec UI avancée
- **Edit flow** inline ou modal
- **Delete avec confirmation**
- **Export flows** (JSON, CSV)

#### Configuration
- **Network config** editor YANG/JSON
- **Device settings** per type
- **Applications manager**
- **IP address pools management**

#### Monitoring > Metrics
- **Time-series graphs** (Recharts)
- **Custom dashboards** avec widgets
- **Export reports** (PDF)
- **Alerts configuration**

#### Alerts
- **Active alerts list** (filterable, searchable)
- **Alert timeline**
- **Acknowledge/resolve** workflows
- **Alert routing rules**

---

## 🎨 Key Design Decisions

### 1. **Sidebar Navigation**
- **Always visible** desktop (can be collapsed)
- **Mobile drawer** sur petits écrans
- **Icons + labels** pour clarté
- **Current section highlighted**
- **Nested menu items** avec expand/collapse

### 2. **Header Sticky**
- **Logo/brand** à gauche
- **Breadcrumb** au centre (responsive)
- **Search bar** pour quick navigation
- **Alerts bell** avec badge count
- **User menu** à droite (name, role, logout)

### 3. **Content Area**
- **Max-width constraint** pour lisibilité
- **Responsive grid layout**
- **Consistent padding** (px-4, py-6 etc.)
- **Sections clearly delimited** avec borders/bg

### 4. **Color Usage**
- **Cyan** - Primary interactions, active states
- **Slate/White** - Backgrounds, structure
- **Emerald** - Success, online, active
- **Rose** - Critical alerts, errors
- **Amber** - Warnings, pending
- **Sky** - Info, secondary actions

### 5. **Typography**
- **Montserrat** - Headers, branding
- **Open Sans** - Body text, UI
- **Monospace** - Device IDs, IPs, code

---

## 🔌 ONOS Integration Points

L'app doit exposer facilement tous les ONOS REST APIs:

### Tier 1: Core Management
```
GET /applications           → Apps page list
GET /cluster                → Cluster status
GET /system                 → System info
POST /configuration         → Settings
```

### Tier 2: Network Data
```
GET /topology               → Topology viewer
GET /devices                → Device inventory
GET /links                  → Link information
GET /hosts                  → Host discovery
```

### Tier 3: Flow Management
```
GET /flows                  → Flow rules viewer
POST /flows                 → Add new flow
DELETE /flows/{id}          → Delete flow
GET /groups                 → Group rules
GET /meters                 → Meter rules
```

### Tier 4: Advanced
```
GET /intents                → Intent viewer
POST /intents               → Create intent
GET /statistics             → Real-time metrics
GET /vpls                   → VPLS services
GET /optical                → Optical networks
```

---

## 📋 Implementation Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Sidebar layout components
- [ ] Design system CSS (colors, typography, spacing)
- [ ] App header & navigation
- [ ] Protected routes group layout
- [ ] Custom hooks (useNetwork, useDevices, etc.)

### Phase 2: Dashboard Redesign (Week 2-3)
- [ ] Refactor dashboard page
- [ ] New widget components
- [ ] Real-time data subscriptions
- [ ] Export functionality

### Phase 3: Network Pages (Week 3-4)
- [ ] Topology redesign
- [ ] Devices management page
- [ ] Links/Hosts pages
- [ ] Advanced filters

### Phase 4: Services & Configuration (Week 4-5)
- [ ] Intents/Flows UI
- [ ] Configuration editor
- [ ] VPLS services management
- [ ] Optical networking pages

### Phase 5: Monitoring & Alerts (Week 5-6)
- [ ] Metrics/stats dashboards
- [ ] Alerts management
- [ ] Cluster monitoring
- [ ] Performance optimization

### Phase 6: Polish & Admin (Week 6-7)
- [ ] Admin pages (users, roles, audit)
- [ ] Settings page
- [ ] Dark mode refinement
- [ ] Performance optimization
- [ ] Mobile responsiveness polish
- [ ] Documentation

---

## 🚀 Deliverables

1. **Updated file structure** ✓
2. **New layout components** (Header, Sidebar, Breadcrumb)
3. **Design system** (Colors, Components, Patterns)
4. **Refactored pages** (modularized)
5. **New service layer** (ONOS API handlers)
6. **Enhanced hooks** (Data fetching, real-time)
7. **Documentation** (Architecture, component usage)

---

## ✅ Success Criteria

- [ ] **Modern, cohesive UI** across all pages
- [ ] **Responsive** on mobile, tablet, desktop
- [ ] **ONOS APIs fully leveraged**
- [ ] **Performance**: LCP < 2.5s, FID < 100ms
- [ ] **100% type-safe** (TypeScript)
- [ ] **Dark mode fully supported**
- [ ] **Admin features working**
- [ ] **Real-time updates** operational
