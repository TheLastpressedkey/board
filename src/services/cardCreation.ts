import { database } from './database';
import { createCard } from '../utils/cardUtils';
import { fetchLinkMetadata } from '../utils/linkUtils';

/**
 * Service de création de cartes pour l'IA
 */
export const cardCreation = {
  
  /**
   * Crée une nouvelle carte de texte
   */
  async createTextCard(content: string, title?: string, position?: { x: number; y: number }): Promise<{ success: boolean; message: string; cardId?: string }> {
    try {
      // Valider le contenu
      if (!content || typeof content !== 'string' || content.trim().length === 0) {
        return {
          success: false,
          message: "Contenu manquant ou invalide pour la carte de texte."
        };
      }

      // Vérifier que l'utilisateur est authentifié
      const boards = await database.getBoards();
      if (!boards || boards.length === 0) {
        return {
          success: false,
          message: "Aucun board disponible. Veuillez vous connecter ou créer un board."
        };
      }

      // Trouver le board principal ou le premier board disponible
      const mainBoard = boards.find(b => b.isMainBoard) || boards[0];
      
      // Déterminer la position de la nouvelle carte
      const cardPosition = position || this.getNextAvailablePosition(mainBoard);
      
      // Créer la nouvelle carte de texte
      const newCard = createCard('text', cardPosition, content.trim(), {
        width: 300,
        height: 200
      });

      // Ajouter un titre si fourni
      if (title) {
        newCard.metadata = { title };
      }

      // Ajouter la carte au board
      const updatedCards = [...(mainBoard.cards || []), newCard];
      await database.saveCards(mainBoard.id, updatedCards);

      const previewContent = content.length > 50 ? content.substring(0, 50) + '...' : content;
      
      return {
        success: true,
        message: `Carte de texte créée avec succès sur le board "${mainBoard.name}". Contenu: "${previewContent}"`,
        cardId: newCard.id
      };

    } catch (error) {
      console.error('Error creating text card:', error);
      return {
        success: false,
        message: `Erreur lors de la création de la carte de texte: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      };
    }
  },

  /**
   * Crée une nouvelle carte de lien avec les métadonnées automatiquement récupérées
   */
  async createLinkCard(url: string, title?: string, description?: string, position?: { x: number; y: number }): Promise<{ success: boolean; message: string; cardId?: string }> {
    try {
      // Valider l'URL
      if (!url || typeof url !== 'string') {
        return {
          success: false,
          message: "URL manquante ou invalide."
        };
      }

      // Vérifier que l'URL est valide
      try {
        new URL(url);
      } catch {
        return {
          success: false,
          message: "Format d'URL invalide. Veuillez fournir une URL valide (http:// ou https://)."
        };
      }

      // Vérifier que l'utilisateur est authentifié
      const boards = await database.getBoards();
      if (!boards || boards.length === 0) {
        return {
          success: false,
          message: "Aucun board disponible. Veuillez vous connecter ou créer un board."
        };
      }

      // Trouver le board principal ou le premier board disponible
      const mainBoard = boards.find(b => b.isMainBoard) || boards[0];
      
      // Déterminer la position de la nouvelle carte
      const cardPosition = position || this.getNextAvailablePosition(mainBoard);
      
      // Récupérer les métadonnées du lien si pas fournies
      let metadata;
      try {
        if (title && description) {
          // Utiliser les métadonnées fournies
          metadata = { title, description };
        } else {
          // Récupérer automatiquement les métadonnées
          metadata = await fetchLinkMetadata(url);
          
          // Utiliser les données fournies en priorité
          if (title) metadata.title = title;
          if (description) metadata.description = description;
        }
      } catch (error) {
        console.warn('Impossible de récupérer les métadonnées automatiquement:', error);
        metadata = { 
          title: title || 'Lien sans titre', 
          description: description || ''
        };
      }

      // Créer la nouvelle carte
      const newCard = createCard('link', cardPosition, url, {
        width: 300,
        height: 200
      });
      newCard.metadata = metadata;

      // Ajouter la carte au board
      const updatedCards = [...(mainBoard.cards || []), newCard];
      await database.saveCards(mainBoard.id, updatedCards);

      return {
        success: true,
        message: `Carte de lien créée avec succès sur le board "${mainBoard.name}". Titre: "${metadata.title}"`,
        cardId: newCard.id
      };

    } catch (error) {
      console.error('Error creating link card:', error);
      return {
        success: false,
        message: `Erreur lors de la création de la carte de lien: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      };
    }
  },

  /**
   * Crée une nouvelle carte selon le type spécifié (fonction générique pour l'IA)
   */
  async createCardByType(
    type: 'text' | 'link', 
    content: string, 
    title?: string, 
    position?: { x: number; y: number }
  ): Promise<{ success: boolean; message: string; cardId?: string }> {
    try {
      switch (type) {
        case 'text':
          return await this.createTextCard(content, title, position);
        
        case 'link':
          return await this.createLinkCard(content, title, undefined, position);
        
        default:
          return {
            success: false,
            message: `Type de carte non supporté: ${type}. Types disponibles: text, link`
          };
      }
    } catch (error) {
      console.error('Error creating card by type:', error);
      return {
        success: false,
        message: `Erreur lors de la création de la carte: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      };
    }
  },

  /**
   * Trouve la prochaine position disponible sur le board
   */
  getNextAvailablePosition(board: { cards?: Array<{ position: { x: number; y: number }; dimensions?: { width: number; height: number } }> }): { x: number; y: number } {
    const cards = board.cards || [];
    const CARD_WIDTH = 300;
    const CARD_HEIGHT = 200;
    const MARGIN = 20;
    const SIDEBAR_WIDTH = 100;

    // Si pas de cartes, commencer en haut à gauche après la sidebar
    if (cards.length === 0) {
      return { x: SIDEBAR_WIDTH + MARGIN, y: MARGIN };
    }

    // Trouver la position la plus à droite et la plus en bas
    let maxX = SIDEBAR_WIDTH;
    let maxY = 0;
    
    cards.forEach(card => {
      const cardRight = card.position.x + (card.dimensions?.width || CARD_WIDTH);
      const cardBottom = card.position.y + (card.dimensions?.height || CARD_HEIGHT);
      
      if (cardRight > maxX) maxX = cardRight;
      if (cardBottom > maxY) maxY = cardBottom;
    });

    // Essayer de placer à droite de la dernière carte
    const rightPosition = { x: maxX + MARGIN, y: MARGIN };
    
    // Si trop loin à droite (largeur d'écran approximative), aller à la ligne suivante
    if (rightPosition.x > 1200) {
      return { x: SIDEBAR_WIDTH + MARGIN, y: maxY + MARGIN };
    }
    
    return rightPosition;
  },

  /**
   * Formate le résultat de création pour l'IA
   */
  formatCreationResultForAI(result: { success: boolean; message: string; cardId?: string }): string {
    if (result.success) {
      return `✅ ${result.message}`;
    } else {
      return `❌ ${result.message}`;
    }
  }
};
