import { cardSearch } from './cardSearch';
import { cardCreation } from './cardCreation';

/**
 * Service de gestion des fonctions disponibles pour l'IA
 */
export class AIFunctionService {
  
  /**
   * Définitions des fonctions disponibles pour OpenAI
   */
  static getFunctionDefinitions() {
    return [
      {
        type: "function" as const,
        function: {
          name: "search_text_cards",
          description: "Search for content within the user's text cards on their WeBoard. Use this when the user asks questions about content that might be stored in their personal notes, cards, or documents.",
          parameters: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "The search query to find content in text cards. Should be specific keywords or phrases from the user's question."
              }
            },
            required: ["query"],
            additionalProperties: false
          },
          strict: true
        }
      },
      {
        type: "function" as const,
        function: {
          name: "search_link_cards",
          description: "Search for links within the user's link cards on their WeBoard. Use this when the user asks about websites, URLs, or web resources they might have saved.",
          parameters: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "The search query to find links. Can search in titles, descriptions, or URLs of saved link cards."
              }
            },
            required: ["query"],
            additionalProperties: false
          },
          strict: true
        }
      },
      {
        type: "function" as const,
        function: {
          name: "create_card",
          description: "Create a new card on the user's current WeBoard. Use this when the user asks to create, add, or generate content for their board. The card will be positioned automatically on the current board.",
          parameters: {
            type: "object",
            properties: {
              type: {
                type: "string",
                enum: ["text", "link"],
                description: "The type of card to create. Currently supports 'text' for text cards and 'link' for link cards."
              },
              content: {
                type: "string",
                description: "The content of the card. For text cards, this is the text content. For link cards, this should be the URL."
              },
              title: {
                type: ["string", "null"],
                description: "Optional title for the card. If not provided, a title will be auto-generated based on the content. Use null if no title is needed."
              },
              position: {
                type: ["object", "null"],
                properties: {
                  x: {
                    type: "number",
                    description: "X coordinate for card placement."
                  },
                  y: {
                    type: "number", 
                    description: "Y coordinate for card placement."
                  }
                },
                required: ["x", "y"],
                additionalProperties: false,
                description: "Optional position for the card. Use null for automatic positioning."
              }
            },
            required: ["type", "content", "title", "position"],
            additionalProperties: false
          },
          strict: true
        }
      }
    ];
  }

  /**
   * Exécute une fonction appelée par l'IA
   */
  static async executeFunction(functionName: string, args: any): Promise<string> {
    try {
      switch (functionName) {
        case 'search_text_cards':
          const searchResults = await cardSearch.searchTextCards(args.query);
          return cardSearch.formatResultsForAI(searchResults);
          
        case 'search_link_cards':
          const linkResults = await cardSearch.searchLinkCards(args.query);
          return cardSearch.formatLinkResultsForAI(linkResults);
          
        case 'create_card':
          const creationResult = await cardCreation.createCardByType(
            args.type,
            args.content,
            args.title || undefined, // Convertir null en undefined
            args.position || undefined // Convertir null en undefined
          );
          return cardCreation.formatCreationResultForAI(creationResult);
          
        default:
          throw new Error(`Unknown function: ${functionName}`);
      }
    } catch (error) {
      console.error(`Error executing function ${functionName}:`, error);
      return `Erreur lors de l'exécution de la fonction ${functionName}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`;
    }
  }

  /**
   * Traite les tool calls d'une réponse OpenAI
   */
  static async processToolCalls(toolCalls: any[]): Promise<any[]> {
    const toolResults = [];
    
    for (const toolCall of toolCalls) {
      if (toolCall.function) {
        const result = await this.executeFunction(
          toolCall.function.name, 
          JSON.parse(toolCall.function.arguments)
        );
        
        toolResults.push({
          role: 'tool',
          content: result,
          tool_call_id: toolCall.id
        });
      }
    }
    
    return toolResults;
  }
}
