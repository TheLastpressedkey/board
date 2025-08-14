import { cardSearch } from './cardSearch';

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
