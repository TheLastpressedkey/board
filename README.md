# WeBoard - Dashboard Personnel Interactif

![WeBoard](https://img.shields.io/badge/WeBoard-v2.0-blue.svg)
![React](https://img.shields.io/badge/React-18.x-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6.svg)
![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38bdf8.svg)

WeBoard est un tableau de bord personnel moderne et interactif qui permet de gérer vos tâches, projets et communications dans un seul endroit. Avec une interface élégante et des fonctionnalités avancées, WeBoard transforme votre productivité.

## ✨ Fonctionnalités Principales

### 🎨 **Interface Moderne**
- Design responsive et adaptatif
- 10+ thèmes personnalisables (Océan, Coucher de soleil, Forêt, Cyberpunk, etc.)
- Interface glisser-déposer intuitive
- Animations fluides et transitions

### 📊 **Applications Intégrées**
- **📋 Kanban** : Gestion de projets avec colonnes personnalisables
- **📧 Email** : Envoi d'emails avec SMTP ou PHP mail
- **📁 File Manager** : Gestionnaire de fichiers avec upload et prévisualisation
- **📊 Analytics** : Statistiques et métriques détaillées
- **💬 Chatbot** : Assistant IA intégré
- **📅 Calendar** : Calendrier avec événements
- **🧮 Calculator** : Calculatrice avancée
- **✅ Todo List** : Liste de tâches
- **📝 Document Editor** : Éditeur de documents
- **🕒 Clock** : Horloge et minuteur
- **📊 Table** : Tableaux de données
- **📡 RSS** : Lecteur de flux RSS

### 🔧 **Fonctionnalités Avancées**
- **Authentification** : Système d'utilisateurs avec Supabase
- **Configuration Email** : Paramètres SMTP personnalisables
- **Thèmes Adaptatifs** : Interface qui s'adapte à vos préférences
- **Stockage Cloud** : Synchronisation avec Supabase
- **API Backend** : Communication avec serveur PHP

## 🚀 Installation

### Prérequis
- Node.js 18+ 
- npm ou yarn
- Compte Supabase (pour l'authentification et la base de données)

### Configuration

1. **Cloner le repository**
```bash
git clone https://github.com/votre-username/board.git
cd board
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration de l'environnement**
Créer un fichier `.env.local` :
```env
# Configuration Supabase
VITE_SUPABASE_URL=votre_supabase_url
VITE_SUPABASE_ANON_KEY=votre_supabase_anon_key

# Configuration API Backend (optionnel)
VITE_API_BASE_URL=https://votre-backend.com

# Configuration des uploads
VITE_MAX_FILE_SIZE=52428800
VITE_ALLOWED_EXTENSIONS=jpg,jpeg,png,gif,pdf,doc,docx,txt,zip,rar,mp4,mp3,wav
```

4. **Démarrer le serveur de développement**
```bash
npm run dev
```

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **React 18** avec hooks et context
- **TypeScript** pour la sécurité des types
- **Tailwind CSS** pour le styling
- **Vite** pour le build et le développement
- **Lucide React** pour les icônes

### Base de Données (Supabase)
- **PostgreSQL** avec Row Level Security
- **Authentification** intégrée
- **Stockage** pour les fichiers
- **Real-time** pour les mises à jour

### Services
- **Email Service** : Envoi d'emails via SMTP/PHP mail
- **File Manager** : Gestion de fichiers avec API backend
- **AI Service** : Intégration chatbot
- **Analytics** : Suivi des métriques

## 📁 Structure du Projet

```
src/
├── components/           # Composants React
│   ├── Apps/            # Applications intégrées
│   ├── Auth/            # Authentification
│   ├── Board/           # Tableau principal
│   ├── Card/            # Composants de cartes
│   └── UserSettings/    # Paramètres utilisateur
├── contexts/            # Contexts React (Thème, etc.)
├── hooks/              # Hooks personnalisés
├── services/           # Services API
├── types/              # Types TypeScript
└── utils/              # Utilitaires
```

## 🎨 Thèmes Disponibles

- **Default** : Rose moderne
- **Ocean** : Bleu océan
- **Sunset** : Orange coucher de soleil
- **Forest** : Vert forêt
- **Purple** : Violet élégant
- **Cyberpunk** : Cyan futuriste
- **Minimal** : Noir et blanc
- **Dark Blue** : Bleu sombre
- **Emerald** : Vert émeraude
- **Rose** : Rose pastel

## 🔧 Configuration Backend (Optionnel)

Le projet peut fonctionner avec un backend PHP pour certaines fonctionnalités avancées (File Manager, Email). Le backend n'est pas inclus dans ce repository pour des raisons de sécurité.

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🙏 Remerciements

- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/)
- [Lucide Icons](https://lucide.dev/)
- [Vite](https://vitejs.dev/)

---

Développé avec ❤️ par TheLastpressedkey
- Option pour supprimer des messages individuels
- Bouton pour effacer tout l'historique
- Meilleure gestion de l'affichage sur mobile
- Intégration avec les statistiques du tableau pour des réponses contextuelles

## 🔧 Améliorations Techniques

### Base de Données
- Nouvelle table `chat_messages` pour la persistance des conversations
- Optimisation des requêtes avec nouveaux index
- Amélioration des politiques de sécurité (RLS)
- Meilleure gestion des relations entre les tables

### Interface Utilisateur
- Nouvelle barre de défilement personnalisée pour une meilleure expérience
- Optimisation des performances de rendu
- Meilleure gestion des états de chargement
- Support amélioré pour les appareils mobiles

### Sécurité
- Renforcement des politiques d'accès aux données
- Meilleure gestion des erreurs et des cas limites
- Protection accrue des données utilisateur

## 🐛 Corrections de Bugs
- Correction de l'initialisation du chatbot
- Amélioration de la gestion des messages de bienvenue
- Correction des problèmes de défilement dans les composants
- Optimisation des performances de glisser-déposer

## 📱 Améliorations Mobile
- Interface adaptative pour tous les composants
- Meilleure gestion des interactions tactiles
- Optimisation de l'affichage sur petits écrans
- Boutons et contrôles adaptés aux appareils mobiles

## 🔜 Prochaines Étapes
- Ajout de nouveaux types de graphiques dans Analytics
- Amélioration des fonctionnalités de filtrage des tâches Kanban
- Extension des capacités d'analyse du chatbot
- Nouvelles options de personnalisation des tableaux
