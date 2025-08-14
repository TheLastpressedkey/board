// Script de test pour la fonctionnalité de recherche dans les cartes
// Vous pouvez utiliser ce code dans la console du navigateur pour créer des cartes de test

async function createTestTextCards() {
  const testCards = [
    {
      content: "Notes de réunion projet WeBoard:\n- Implémenter la recherche dans les cartes\n- Ajouter function calling OpenAI\n- Améliorer l'interface utilisateur\n- Tests avec différents types de contenu",
      position: { x: 100, y: 100 }
    },
    {
      content: "Recette de cookies au chocolat:\n1. 200g de farine\n2. 100g de beurre\n3. 80g de sucre\n4. 2 œufs\n5. 150g de chocolat\nCuisson: 15min à 180°C",
      position: { x: 300, y: 200 }
    },
    {
      content: "Liste de courses:\n- Lait\n- Œufs\n- Fromage\n- Tomates\n- Salade\n- Pain\n- Yaourts\n- Pommes",
      position: { x: 500, y: 150 }
    },
    {
      content: "Idées pour les vacances d'été:\n- Voyage en Italie (Rome, Florence)\n- Randonnée dans les Alpes\n- Week-end à la mer\n- Visite des châteaux de la Loire\n- Road trip en Espagne",
      position: { x: 200, y: 350 }
    }
  ];

  console.log("Cartes de test créées conceptuellement. Pour les créer vraiment, utilisez l'interface WeBoard.");
  console.log("Exemples de questions à poser à Angel:");
  console.log("- 'Que contiennent mes notes de réunion ?'");
  console.log("- 'Quelle est ma recette de cookies ?'");
  console.log("- 'Qu'est-ce que j'ai noté pour mes vacances ?'");
  console.log("- 'Quels sont les ingrédients que j'ai listés ?'");
  
  return testCards;
}

// Exemples de requêtes de test
const testQueries = [
  "Que contiennent mes notes de réunion ?",
  "Quelle est ma recette de cookies au chocolat ?",
  "Qu'est-ce que j'ai noté pour mes vacances ?",
  "Quels ingrédients ai-je dans ma liste ?",
  "Cherche des informations sur WeBoard dans mes cartes",
  "Trouve-moi quelque chose sur la cuisine",
  "Y a-t-il des informations sur les voyages ?"
];

console.log("Script de test chargé. Utilisez createTestTextCards() pour voir les exemples.");
