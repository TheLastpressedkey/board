# Configuration Backend SSH Terminal

## 🚀 Démarrage Local

### 1. Installer les dépendances backend

```bash
cd backend
npm install
```

### 2. Configurer les variables d'environnement

Copier `.env.example` vers `.env`:

```bash
cp .env.example .env
```

Le fichier `.env` contient:
```env
PORT=3002
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### 3. Démarrer le backend

```bash
# Dans le dossier backend/
npm start
```

Le serveur démarre sur `http://localhost:3002`

### 4. Démarrer le frontend

```bash
# À la racine du projet
npm run dev
```

Le frontend démarre sur `http://localhost:5173`

### 5. Tester

1. Ouvrir http://localhost:5173
2. Ouvrir l'App Store
3. Installer "SSH Terminal"
4. Ajouter un host SSH
5. Se connecter!

---

## 🌐 Déploiement sur Render.com

### Prérequis
- Compte GitHub (✓ déjà fait)
- Compte Render.com (gratuit)

### Étapes de déploiement

#### 1. Créer un compte Render.com

Aller sur [render.com](https://render.com) et créer un compte (connectez-vous avec GitHub).

#### 2. Créer un nouveau Web Service

1. Cliquer sur "New +" en haut à droite
2. Sélectionner "Web Service"
3. Connecter votre repository GitHub `board`
4. Render détectera automatiquement le repo

#### 3. Configuration du service

Remplir les champs:

- **Name**: `weboard-backend` (ou un nom de votre choix)
- **Region**: Choisir la région la plus proche
- **Branch**: `main`
- **Root Directory**: `backend` ⚠️ **IMPORTANT**
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Instance Type**: `Free` ✓

#### 4. Variables d'environnement

Dans la section "Environment", ajouter:

```
FRONTEND_URL=https://votre-app.vercel.app
NODE_ENV=production
```

⚠️ Remplacer `votre-app.vercel.app` par votre URL Vercel réelle.

#### 5. Créer le service

Cliquer sur "Create Web Service" - Le déploiement démarre!

#### 6. Obtenir l'URL du backend

Une fois déployé, vous obtiendrez une URL comme:
```
https://weboard-backend.onrender.com
```

#### 7. Configurer le frontend

**Option 1: Variable d'environnement Vercel**

Dans Vercel Dashboard → Settings → Environment Variables:
```
VITE_BACKEND_URL=https://weboard-backend.onrender.com
```

**Option 2: Fichier .env local (pour dev)**

```env
VITE_BACKEND_URL=https://weboard-backend.onrender.com
```

#### 8. Redéployer le frontend

Push sur GitHub ou redéployer manuellement sur Vercel.

---

## ⚠️ Important - Plan Gratuit Render

Le plan gratuit Render a ces limitations:

- **Sleep après inactivité**: Le service s'endort après 15 minutes sans requête
- **Premier démarrage**: ~30-60 secondes pour se réveiller
- **Ensuite**: Instantané pendant l'utilisation
- **750 heures/mois**: Suffisant pour usage professionnel (~25h/jour)

**Impact sur SSH Terminal**:
- La première connexion SSH du jour peut prendre 30-60 secondes
- Les connexions suivantes sont instantanées
- Acceptable car terminal SSH = usage ponctuel

---

## 🔒 Sécurité

### En production

1. **CORS**: Limiter les origins autorisées dans `server.js`:
```javascript
cors: {
  origin: "https://votre-app.vercel.app",  // Pas de wildcard!
  methods: ["GET", "POST"]
}
```

2. **HTTPS**: Render fournit automatiquement HTTPS (✓)

3. **Credentials**:
   - ❌ Ne jamais commit `.env`
   - ✓ Stocker dans Render Environment Variables
   - 🔐 Les credentials SSH sont transmis via WebSocket chiffré

4. **Rate Limiting** (optionnel):
   - Ajouter `express-rate-limit` si nécessaire
   - Limiter connexions SSH par IP

---

## 🐛 Troubleshooting

### Backend ne démarre pas
```bash
cd backend
npm install
node server.js
```

Vérifier les logs d'erreur.

### Frontend ne se connecte pas au backend

1. Vérifier `VITE_BACKEND_URL` dans `.env`
2. Vérifier que le backend tourne
3. Vérifier la console browser pour erreurs CORS

### Connexion SSH échoue

1. Vérifier credentials (host, username, password/key)
2. Vérifier port SSH (défaut: 22)
3. Vérifier firewall du serveur distant
4. Tester avec un client SSH normal d'abord

### Render service "sleep"

C'est normal avec le plan gratuit. Solutions:

1. **Accepter le délai** (30-60s première connexion)
2. **Upgrader à Hobby plan** ($7/mois) pour pas de sleep
3. **Ping service** toutes les 10 minutes (mais contre TOS)

---

## 📝 Architecture

```
User Browser (Vercel)
       ↓ WebSocket
Backend (Render.com)
       ↓ SSH
Serveur distant
```

**Technologies:**
- Frontend: React + xterm.js + socket.io-client
- Backend: Express + Socket.IO + ssh2
- Déploiement: Vercel (frontend) + Render (backend)

---

## ✅ Checklist finale

- [ ] Backend déployé sur Render
- [ ] URL backend récupérée
- [ ] Variable `VITE_BACKEND_URL` configurée dans Vercel
- [ ] Frontend redéployé
- [ ] Test connexion SSH réussie
- [ ] CORS configuré en production

**Prêt à utiliser! 🎉**
