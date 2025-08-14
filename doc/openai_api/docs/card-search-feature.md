# 🔍 Recherche dans les cartes texte - Angel AI

## 📋 Vue d'ensemble

Angel dispose maintenant de **fonctions intelligentes** qui lui permettent d'accéder automatiquement au contenu de vos cartes texte. Cette fonctionnalité utilise les **Function Calls** d'OpenAI pour que l'IA puisse rechercher dans vos données quand c'est nécessaire, de façon **transparente** et **automatique**.

## ✨ Fonctionnement

### 🤖 Intelligence automatique
- **Pas d'activation manuelle** : Angel décide lui-même quand chercher dans vos cartes
- **Détection contextuelle** : Analyse vos questions pour déterminer si vous faites référence à du contenu stocké
- **Recherche transparente** : L'utilisateur ne voit que la réponse finale, la recherche se fait en arrière-plan

### 🔧 Fonctions disponibles
- **`search_text_cards`** : Recherche intelligente dans toutes vos cartes texte
- **Recherche sémantique** avec scoring de pertinence
- **Extraits contextuels** formatés pour l'IA
- **Limitation automatique** des résultats

## 🚀 Utilisation

### Exemples de questions qui déclenchent la recherche
```
"Que contiennent mes notes de réunion ?"
"J'ai écrit quelque chose sur React, peux-tu me le rappeler ?"
"Quelles sont mes idées pour le projet ?"
"Résume mes notes sur l'architecture"
"Y a-t-il des informations sur les API dans mes cartes ?"
```

### Exemples qui ne déclenchent PAS la recherche
```
"Comment faire une boucle en JavaScript ?" (question générale)
"Quelle est la météo aujourd'hui ?" (information externe)
"Explique-moi les promesses en JS" (connaissance générale)
```

## 🔧 Architecture technique

### 🗂️ Structure des services
```
src/services/
├── aiFunctions.ts     # Gestionnaire des fonctions IA
├── cardSearch.ts      # Service de recherche dans les cartes
└── chat.ts           # Service de chat existant

src/lib/
└── openai.ts         # API OpenAI avec function calling
```

### 🔄 Flux de fonctionnement

1. **Utilisateur pose une question**
2. **Angel analyse** le contexte et décide s'il faut chercher dans les cartes
3. **Fonction appelée** automatiquement si nécessaire
4. **Recherche exécutée** dans les cartes texte
5. **Résultats intégrés** dans la réponse d'Angel
6. **Réponse finale** basée sur les données trouvées

### 📋 Définition de la fonction

```typescript
{
  name: "search_text_cards",
  description: "Search for content within user's text cards on their WeBoard. Use when user asks about content that might be stored in their personal notes.",
  parameters: {
    query: {
      type: "string",
      description: "Search keywords or phrases from user's question"
    }
  }
}
```

## 🎯 Avantages de cette approche

### ✅ Pour l'utilisateur
- **Expérience fluide** : Pas de boutons à activer
- **Intelligence contextuelle** : Angel sait quand chercher
- **Réponses enrichies** : Basées sur vos propres données
- **Transparence** : Pas de complexité technique visible

### ✅ Pour le développement
- **Architecture modulaire** : Service séparé pour les fonctions
- **Extensibilité** : Facile d'ajouter de nouvelles fonctions
- **Maintenance** : Code organisé et réutilisable
- **Performance** : Recherche seulement quand nécessaire

## 🔍 Service de recherche

### Algorithme de pertinence
- **Occurrences multiples** : +10 points par occurrence
- **Début de texte** : +5 points si trouvé dans les 50 premiers caractères  
- **Correspondance exacte** : +5 points pour les mots entiers
- **Limitation** : Top 5 résultats maximum

### Format des résultats pour l'IA
```
J'ai trouvé 2 carte(s) texte correspondant à votre recherche :

=== Carte 1 ===
Board: Mon Board Principal
Position: x=100, y=200
Contenu: [Contenu complet de la carte]
---

=== Carte 2 ===
Board: Notes Projet
Position: x=300, y=150
Contenu: [Contenu complet de la carte]
---
```

## 🛠️ Ajout de nouvelles fonctions

### 1. Créer la fonction dans `aiFunctions.ts`
```typescript
// Ajouter dans getFunctionDefinitions()
{
  type: "function",
  function: {
    name: "nouvelle_fonction",
    description: "Description de la fonction",
    parameters: { /* schéma JSON */ }
  }
}

// Ajouter dans executeFunction()
case 'nouvelle_fonction':
  return await monService.maMethode(args);
```

### 2. Implémenter la logique métier
```typescript
// Créer le service correspondant
export const monService = {
  async maMethode(args: any): Promise<string> {
    // Logique de la fonction
    return "Résultat formaté pour l'IA";
  }
};
```

## 🧪 Test de la fonctionnalité

### Créer des cartes de test
1. Créez des cartes texte avec du contenu varié
2. Notez différents sujets (projets, recettes, notes, etc.)
3. Testez avec des questions naturelles

### Questions de test
```
"Que contiennent mes notes sur le projet WeBoard ?"
"J'ai écrit une recette quelque part, peux-tu la retrouver ?"
"Quelles sont mes idées pour les vacances ?"
"Résume ce que j'ai noté sur l'apprentissage automatique"
```

### Debug
- Surveillez la console pour les logs de fonction calls
- Vérifiez que les fonctions sont appelées au bon moment
- Testez avec différents types de questions

## 📈 Prochaines fonctions prévues

1. **Recherche dans les cartes de liens** (métadonnées)
2. **Accès aux données Kanban** (tâches, statuts)
3. **Analyse des analytics** (statistiques du board)
4. **Gestion des boards** (création, modification)
5. **Recherche dans l'historique de chat**

---

**Angel AI** - Assistant intelligent avec accès à vos données WeBoard
