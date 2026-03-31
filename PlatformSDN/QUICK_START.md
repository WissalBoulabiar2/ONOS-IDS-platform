# 🚀 SDN Platform - Quick Start Guide

## ✅ Vous avez maintenant:

**Frontend** (Next.js 15 + React 19 + Tailwind CSS)
- ✅ Dashboard avec Health Score, KPIs, Quick Actions
- ✅ Topologie interactive (Cytoscape.js)
- ✅ Gestion des équipements, flows, alertes
- ✅ Dark mode & Light mode
- ✅ Inspiré Cisco vManage & DNA Center

**Backend** (Node.js + Express)
- ✅ API REST proxy vers ONOS
- ✅ Endpoints: /devices, /topology, /flows, /ports
- ✅ CORS configuré
- ✅ Gestion d'erreurs

---

## 📋 Configuration (5 minutes)

### Étape 1: Créer les fichiers de configuration

```bash
cd PlatformSDN

# Frontend config
cp .env.local.example .env.local

# Backend config
cp backend/.env.example backend/.env
```

### Étape 2: Éditez `backend/.env`

```env
ONOS_HOST=localhost
ONOS_PORT=8181
ONOS_USER=karaf
ONOS_PASSWORD=karaf
PORT=5000
```

### Étape 3: Attendre l'installation des dépendances

Les dépendances backend s'installent en arrière-plan. Vérifiez:

```bash
# Vérifier que express est installé
cd PlatformSDN
npm list express
```

---

## 🎮 Lancer les Services

### Option A: Deux terminals (Recommandé)

**Terminal 1 - Frontend** (Port 3007):
```bash
cd PlatformSDN
npm run dev
```

**Terminal 2 - Backend** (Port 5000):
```bash
cd PlatformSDN
npm run backend
```

### Option B: Concurrently (si npm package concurrent est installé)

```bash
npm install -D concurrently

# Ajouter au package.json:
"dev:all": "concurrently \"npm run dev\" \"node backend/server.js\""

# Puis:
npm run dev:all
```

---

## 🧪 Tester la Connexion

### Vérifier le Backend

```bash
# Health check
curl http://localhost:5000/api/health

# Résultat attendu:
# {"status":"OK","message":"SDN Platform Backend is running"}
```

### Vérifier la Connexion ONOS

```bash
# Tester ONOS directement (si disponible)
curl -u karaf:karaf http://localhost:8181/onos/v1/devices

# Depuis le backend via le proxy
curl http://localhost:5000/api/devices
```

---

## 📍 URLs Importantes

| Service | URL | Status |
|---------|-----|---------|
| **Frontend** | http://localhost:3007 | ✅ Running |
| **Backend API** | http://localhost:5000/api | ⏳ Starting |
| **ONOS Controller** | http://localhost:8181 | ❓ Check ONOS |
| **API Health** | curl http://localhost:5000/api/health | Test |

---

## 🔌 Sans ONOS (Mode Mock)

Si vous **n'avez pas ONOS installé**, vous pouvez utiliser les mock data:

**Dans `backend/server.js`, remplacez les appels ONOS par des données mock**:

```javascript
// Au lieu de:
const response = await onos.get('/devices')

// Utilisez:
const mockDevices = {
  devices: [
    { id: 'of:0000000000000001', type: 'SWITCH', available: true, ... }
  ]
}
return res.json(mockDevices)
```

---

## 🐛 Troubleshooting

### Erreur: "Port 5000/3007 already in use"

```bash
# Trouvez le processus
lsof -i :5000
# Tuez-le
kill -9 <PID>
```

### Erreur: "Cannot connect to ONOS"

- ✅ ONOS doit tourner sur localhost:8181
- ✅ Vérifiez les identifiants (karaf/karaf)
- ✅ Firewall n'en bloque pas l'accès

### Erreur: "Dependencies not installed"

```bash
cd PlatformSDN
npm install --legacy-peer-deps
```

---

## 📚 Fichiers Importants

- `PlatformSDN/backend/server.js` - Serveur Express
- `PlatformSDN/backend/.env.example` - Configuration template
- `PlatformSDN/services/api.ts` - Client API
- `PlatformSDN/app/page.tsx` - Dashboard principal
- `PlatformSDN/components/` - Composants réutilisables

---

## 🎯 Prochaines Étapes (Week 2)

- [ ] Intégrer PostgreSQL pour l'historique
- [ ] Ajouter WebSocket pour les mises à jour temps réel
- [ ] Implémenter la collecte automatique (toutes les 30s)
- [ ] Ajouter l'authentification JWT
- [ ] Créer les pages detail des équipements

---

**Êtes-vous prêt ? Lancez le frontend et le backend !** 🚀
