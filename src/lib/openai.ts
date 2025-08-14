import OpenAI from 'openai';
import { AIFunctionService } from '../services/aiFunctions';

const openai = new OpenAI({
  apiKey: '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',
  dangerouslyAllowBrowser: true
});

export async function getChatCompletion(
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[], 
  useWebSearch: boolean = false
) {
  try {
    if (useWebSearch) {
      // Utiliser l'API Responses avec recherche web seulement
      const response = await openai.responses.create({
        model: "gpt-4o",
        tools: [{ type: "web_search_preview" }],
        input: messages[messages.length - 1].content,
        store: true,
      });

      return response.output_text;
    } else {
      // Utiliser Chat Completions avec les fonctions AI toujours disponibles
      const tools = AIFunctionService.getFunctionDefinitions();

      const completion = await openai.chat.completions.create({
        messages,
        model: "gpt-4o",
        tools,
        store: true,
      });

      const message = completion.choices[0].message;
      
      // Vérifier s'il y a des tool calls
      if (message.tool_calls && message.tool_calls.length > 0) {
        // Construire la conversation avec les tool calls
        const conversationWithTools: any[] = [
          ...messages,
          {
            role: 'assistant',
            content: message.content,
            tool_calls: message.tool_calls
          }
        ];

        // Traiter les tool calls
        const toolResults = await AIFunctionService.processToolCalls(message.tool_calls);
        conversationWithTools.push(...toolResults);

        // Faire un deuxième appel avec les résultats
        const finalCompletion = await openai.chat.completions.create({
          messages: conversationWithTools,
          model: "gpt-4o",
          tools,
          store: true,
        });

        return finalCompletion.choices[0].message.content;
      }

      return message.content;
    }
  } catch (error) {
    console.error('Error getting chat completion:', error);
    throw error;
  }
}