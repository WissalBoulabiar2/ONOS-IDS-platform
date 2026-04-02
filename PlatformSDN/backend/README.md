# Backend SDN Platform - Documentation

## 🚀 Démarrage Rapide

### 1. Configuration ONOS

Avant de lancer le backend, assurez-vous que le contrôleur ONOS est en cours d'exécution:

```bash
# ONOS doit tourner sur localhost:8181
# Identifiants par défaut:
# Username: karaf
# Password: karaf
```

### 2. Configuration du Backend

Créez un fichier `.env` dans le dossier `backend/`:

```bash
cp backend/.env.example backend/.env
```

Éditez `backend/.env` avec vos paramètres ONOS:

```env
ONOS_HOST=localhost
ONOS_PORT=8181
ONOS_USER=karaf
ONOS_PASSWORD=karaf
PORT=5000
```

### 3. Lancer le Backend

**Option A: Directement avec Node.js**

```bash
cd PlatformSDN
node backend/server.js
```

**Option B: Avec le script shell** (Linux/Mac)

```bash
chmod +x run-backend.sh
./run-backend.sh
```

**Option C: En développement avec nodemon**

```bash
npm install -g nodemon
nodemon backend/server.js
```

Le serveur démarre sur **http://localhost:5000**

### 4. Identifiants de connexion

Le login backend utilise l'utilisateur admin par défaut défini dans `backend/.env`:

```env
DEFAULT_ADMIN_EMAIL=admin@sdn.local
DEFAULT_ADMIN_PASSWORD=<value from backend/.env>
```

Important:
- si `DEFAULT_ADMIN_PASSWORD` a été modifié dans `backend/.env`, `admin123` ne fonctionnera plus
- le backend lit cette valeur au démarrage et crée l'admin par défaut avec ce mot de passe

---

## 📡 API Endpoints

### Health Check

```
GET /api/health
```

Response:

```json
{
  "status": "OK",
  "message": "SDN Platform Backend is running"
}
```

### Récupérer les Équipements (Devices)

```
GET /api/devices
```

Response:

```json
{
  "total": 5,
  "devices": [
    {
      "id": "of:0000000000000001",
      "type": "SWITCH",
      "available": true,
      "manufacturer": "Cisco",
      "serialNumber": "XYZ123",
      "port": "1"
    }
  ]
}
```

### Récupérer la Topologie

```
GET /api/topology
```

Response:

```json
{
  "nodes": [...],
  "edges": [...],
  "clustering": [...]
}
```

### Récupérer les Flows (Règles)

```
GET /api/flows
```

Response:

```json
{
  "total": 15,
  "flows": [
    {
      "id": "12345",
      "deviceId": "of:0000000000000001",
      "priority": 40000,
      "state": "ADDED"
    }
  ]
}
```

### Créer une Nouvelle Règle de Flux

```
POST /api/flows/:deviceId
Body:
{
  "priority": 40000,
  "selector": {
    "criteria": [...]
  },
  "treatment": {
    "instructions": [...]
  }
}
```

### Récupérer les Ports d'un Équipement

```
GET /api/devices/:deviceId/ports
```

Response:

```json
{
  "deviceId": "of:0000000000000001",
  "total": 4,
  "ports": [
    {
      "portNumber": 1,
      "enabled": true,
      "live": true,
      "rxBytes": 1024000,
      "txBytes": 512000
    }
  ]
}
```

---

## 🔗 Intégration Frontend

Le frontend appelle les endpoints du backend via la variable d'environnement `NEXT_PUBLIC_API_URL`:

```typescript
// Dans les services frontend
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Exemple: Récupérer les devices
const response = await fetch(`${API_URL}/devices`);
```

---

## ⚠️ Troubleshooting

### Erreur: "Cannot connect to ONOS"

- ✅ Vérifiez que ONOS tourne sur `localhost:8181`
- ✅ Vérifiez les identifiants ONOS (défaut: karaf/karaf)
- ✅ Vérifiez que le firewall n'en bloque pas l'accès

### Erreur: "Port 5000 already in use"

```bash
# Sur Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Sur Linux/Mac
lsof -i :5000
kill -9 <PID>
```

### Le backend ne démarre pas

```bash
# Vérifiez que les dépendances sont installées
npm install --legacy-peer-deps

# Vérifiez qu'il y a du Node.js
node --version
```

---

## 📋 Prochaines Étapes

- [ ] Ajouter WebSocket pour les mises à jour temps réel
- [ ] Implémenter la collecte automatique des métriques (toutes les 30s)
- [ ] Ajouter l'authentification JWT
- [ ] Intégrer PostgreSQL pour l'historique
- [ ] Ajouter les tests unitaires
