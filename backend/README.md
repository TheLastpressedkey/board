# Weboard SSH Backend

Backend Node.js pour l'app Terminal SSH de Weboard.

## Technologies

- **Express.js** - Serveur HTTP
- **Socket.IO** - Communication WebSocket en temps réel
- **ssh2** - Client SSH pour Node.js
- **CORS** - Gestion des requêtes cross-origin

## Installation locale

```bash
cd backend
npm install
```

## Configuration

Copier `.env.example` vers `.env` et configurer:

```env
PORT=3001
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

## Démarrage local

```bash
# Mode développement
npm run dev

# Mode production
npm start
```

Le serveur démarre sur `http://localhost:3001`

## Déploiement sur Render.com

### 1. Préparer le repository

Le dossier `backend/` doit être à la racine du repo GitHub.

### 2. Créer un nouveau Web Service sur Render

1. Aller sur [render.com](https://render.com)
2. Cliquer sur "New +" → "Web Service"
3. Connecter votre repository GitHub
4. Configurer:
   - **Name**: `weboard-backend` (ou autre nom)
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

### 3. Variables d'environnement

Ajouter dans l'onglet "Environment":

```
FRONTEND_URL=https://votre-app.vercel.app
NODE_ENV=production
```

### 4. Déployer

Cliquer sur "Create Web Service" - le déploiement démarre automatiquement.

Une fois déployé, vous obtiendrez une URL comme:
`https://weboard-backend.onrender.com`

### 5. Configurer le frontend

Dans votre app React, mettre à jour l'URL backend:
```javascript
const BACKEND_URL = 'https://weboard-backend.onrender.com';
```

## API Endpoints

### GET /
Health check - retourne le statut du serveur

### POST /api/test-connection
Teste une connexion SSH

**Body:**
```json
{
  "host": "example.com",
  "port": 22,
  "username": "user",
  "password": "pass" // OU privateKey
}
```

### WebSocket Events

**Client → Server:**
- `ssh-connect` - Établir connexion SSH
- `ssh-input` - Envoyer commande au terminal
- `ssh-resize` - Redimensionner terminal

**Server → Client:**
- `ssh-status` - Statut de connexion
- `ssh-data` - Données du terminal
- `ssh-error` - Erreurs

## Sécurité

⚠️ **Important:**
- Ne jamais commit le fichier `.env`
- Utiliser HTTPS en production
- Limiter les CORS origins en production
- Implémenter rate limiting si nécessaire
