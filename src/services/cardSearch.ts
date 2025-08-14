import { database } from './database';

export interface CardSearchResult {
  cardId: string;
  boardId: string;
  boardName: string;
  content: string;
  preview: string;
  position: {
    x: number;
    y: number;
  };
  cardType: 'text' | 'link';
  metadata?: {
    title?: string;
    description?: string;
    url?: string;
  };
}

export const cardSearch = {
  /**
   * Recherche dans le contenu de toutes les cartes texte de l'utilisateur
   */
  async searchTextCards(query: string): Promise<CardSearchResult[]> {
    try {
      // Récupérer tous les boards avec leurs cartes
      const boards = await database.getBoards();
      const results: CardSearchResult[] = [];
      const normalizedQuery = query.toLowerCase().trim();

      if (!normalizedQuery) {
        return results;
      }

      // Parcourir tous les boards et leurs cartes
      boards.forEach(board => {
        board.cards?.forEach(card => {
          // Ne chercher que dans les cartes texte
          if (card.type === 'text' && card.content) {
            const content = card.content.toLowerCase();
            
            // Vérifier si la requête est présente dans le contenu
            if (content.includes(normalizedQuery)) {
              // Créer un extrait autour du terme trouvé
              const preview = this.createPreview(card.content, query);
              
              results.push({
                cardId: card.id,
                boardId: board.id,
                boardName: board.name,
                content: card.content,
                preview,
                position: card.position,
                cardType: 'text'
              });
            }
          }
        });
      });

      // Limiter les résultats et les trier par pertinence
      return results
        .sort((a, b) => this.calculateRelevance(b.content, query) - this.calculateRelevance(a.content, query))
        .slice(0, 5); // Limiter à 5 résultats max
        
    } catch (error) {
      console.error('Error searching text cards:', error);
      return [];
    }
  },

  /**
   * Recherche dans le contenu de toutes les cartes de liens de l'utilisateur
   */
  async searchLinkCards(query: string): Promise<CardSearchResult[]> {
    try {
      // Récupérer tous les boards avec leurs cartes
      const boards = await database.getBoards();
      const results: CardSearchResult[] = [];
      const normalizedQuery = query.toLowerCase().trim();

      if (!normalizedQuery) {
        return results;
      }

      // Parcourir tous les boards et leurs cartes
      boards.forEach(board => {
        board.cards?.forEach(card => {
          // Ne chercher que dans les cartes de liens
          if (card.type === 'link' && card.metadata) {
            const title = (card.metadata.title || '').toLowerCase();
            const description = (card.metadata.description || '').toLowerCase();
            const url = (card.metadata.url || card.content || '').toLowerCase();
            
            // Vérifier si la requête est présente dans le titre, description ou URL
            if (title.includes(normalizedQuery) || 
                description.includes(normalizedQuery) || 
                url.includes(normalizedQuery)) {
              
              // Créer un extrait basé sur la correspondance trouvée
              let preview = '';
              if (title.includes(normalizedQuery)) {
                preview = card.metadata.title || '';
              } else if (description.includes(normalizedQuery)) {
                preview = this.createPreview(card.metadata.description || '', query);
              } else {
                preview = card.metadata.url || card.content || '';
              }
              
              results.push({
                cardId: card.id,
                boardId: board.id,
                boardName: board.name,
                content: card.content || '',
                preview,
                position: card.position,
                cardType: 'link',
                metadata: card.metadata
              });
            }
          }
        });
      });

      // Limiter les résultats et les trier par pertinence
      return results
        .sort((a, b) => this.calculateLinkRelevance(b, query) - this.calculateLinkRelevance(a, query))
        .slice(0, 5); // Limiter à 5 résultats max
        
    } catch (error) {
      console.error('Error searching link cards:', error);
      return [];
    }
  },

  /**
   * Récupère le contenu complet d'une carte de lien spécifique
   */
  async getLinkCardContent(cardId: string): Promise<{ content: string; metadata: any } | null> {
    try {
      const boards = await database.getBoards();
      
      for (const board of boards) {
        const card = board.cards?.find(c => c.id === cardId && c.type === 'link');
        if (card) {
          return {
            content: card.content || '',
            metadata: card.metadata || {}
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error getting link card content:', error);
      return null;
    }
  },

  /**
   * Récupère le contenu complet d'une carte texte spécifique
   */
  async getTextCardContent(cardId: string): Promise<string | null> {
    try {
      const boards = await database.getBoards();
      
      for (const board of boards) {
        const card = board.cards?.find(c => c.id === cardId && c.type === 'text');
        if (card) {
          return card.content || null;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error getting text card content:', error);
      return null;
    }
  },

  /**
   * Crée un extrait de texte autour du terme recherché
   */
  createPreview(content: string, query: string, maxLength: number = 200): string {
    const normalizedContent = content.toLowerCase();
    const normalizedQuery = query.toLowerCase();
    const queryIndex = normalizedContent.indexOf(normalizedQuery);

    if (queryIndex === -1) {
      // Si le terme n'est pas trouvé, retourner le début du contenu
      return content.length > maxLength 
        ? content.substring(0, maxLength) + '...'
        : content;
    }

    // Calculer la position de début et fin de l'extrait
    const halfLength = Math.floor(maxLength / 2);
    const start = Math.max(0, queryIndex - halfLength);
    const end = Math.min(content.length, start + maxLength);

    let preview = content.substring(start, end);
    
    // Ajouter des points de suspension si nécessaire
    if (start > 0) preview = '...' + preview;
    if (end < content.length) preview = preview + '...';

    return preview;
  },

  /**
   * Calcule un score de pertinence pour trier les résultats
   */
  calculateRelevance(content: string, query: string): number {
    const normalizedContent = content.toLowerCase();
    const normalizedQuery = query.toLowerCase();
    
    let score = 0;
    
    // Score de base pour la présence du terme
    const occurrences = (normalizedContent.match(new RegExp(normalizedQuery, 'g')) || []).length;
    score += occurrences * 10;
    
    // Bonus si le terme apparaît au début
    if (normalizedContent.indexOf(normalizedQuery) < 50) {
      score += 5;
    }
    
    // Bonus pour les correspondances exactes de mots
    const wordBoundaryRegex = new RegExp('\\b' + normalizedQuery + '\\b', 'g');
    const exactMatches = (normalizedContent.match(wordBoundaryRegex) || []).length;
    score += exactMatches * 5;
    
    return score;
  },

  /**
   * Calcule la pertinence d'un résultat de recherche de carte de lien
   */
  calculateLinkRelevance(result: CardSearchResult, query: string): number {
    const normalizedQuery = query.toLowerCase();
    let score = 0;
    
    if (result.metadata) {
      const title = (result.metadata.title || '').toLowerCase();
      const description = (result.metadata.description || '').toLowerCase();
      const url = (result.metadata.url || '').toLowerCase();
      
      // Bonus pour correspondance dans le titre (plus important)
      if (title.includes(normalizedQuery)) {
        score += 30;
        // Bonus supplémentaire si c'est au début du titre
        if (title.startsWith(normalizedQuery)) {
          score += 20;
        }
      }
      
      // Bonus pour correspondance dans la description
      if (description.includes(normalizedQuery)) {
        score += 15;
      }
      
      // Bonus pour correspondance dans l'URL
      if (url.includes(normalizedQuery)) {
        score += 10;
      }
      
      // Bonus pour les mots courts (plus précis)
      if (normalizedQuery.length <= 3) {
        score += 5;
      }
    }
    
    return score;
  },

  /**
   * Formate les résultats de recherche de cartes texte pour l'IA
   */
  formatResultsForAI(results: CardSearchResult[]): string {
    if (results.length === 0) {
      return "Aucune carte texte trouvée correspondant à votre recherche.";
    }

    const formattedResults = results.map((result, index) => {
      return `=== Carte ${index + 1} ===
Board: ${result.boardName}
Position: x=${result.position.x}, y=${result.position.y}
Contenu: ${result.content}
---`;
    }).join('\n\n');

    return `J'ai trouvé ${results.length} carte(s) texte correspondant à votre recherche :\n\n${formattedResults}`;
  },

  /**
   * Formate les résultats de recherche de cartes de liens pour l'IA
   */
  formatLinkResultsForAI(results: CardSearchResult[]): string {
    if (results.length === 0) {
      return "Aucune carte de lien trouvée correspondant à votre recherche.";
    }

    const formattedResults = results.map((result, index) => {
      const metadata = result.metadata || {};
      return `=== Lien ${index + 1} ===
Board: ${result.boardName}
Position: x=${result.position.x}, y=${result.position.y}
Titre: ${metadata.title || 'Sans titre'}
Description: ${metadata.description || 'Aucune description'}
URL: ${metadata.url || result.content || 'URL non disponible'}
---`;
    }).join('\n\n');

    return `J'ai trouvé ${results.length} carte(s) de lien correspondant à votre recherche :\n\n${formattedResults}`;
  }
};
