#!/bin/bash

# Script pour lancer le backend SDN

echo "🚀 Démarrage du Backend SDN Platform..."
echo "=================================================="

# Vérifier si les dépendances sont installées
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
fi

# Créer le fichier .env s'il n'existe pas
if [ ! -f "backend/.env" ]; then
    echo "⚙️  Création du fichier .env..."
    cp backend/.env.example backend/.env
    echo "✅ Fichier .env créé. Modifiez-le si nécessaire."
fi

# Lancer le serveur
echo ""
echo "✅ Le serveur démarre sur le port 5000..."
echo "📡 Assurez-vous que ONOS tourne sur localhost:8181"
echo ""

node backend/server.js
