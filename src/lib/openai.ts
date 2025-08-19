import OpenAI from 'openai';
import { AIFunctionService } from '../services/aiFunctions';

// Vérification de la présence de la clé API (local avec VITE_ ou Vercel sans VITE_)
const apiKey = import.meta.env.VITE_OPENAI_API_KEY || import.meta.env.OPENAI_API_KEY;

if (!apiKey) {
  throw new Error('OpenAI API key is not defined. Please set VITE_OPENAI_API_KEY (local) or OPENAI_API_KEY (Vercel) in environment variables');
}

const openai = new OpenAI({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true
});

export async function getChatCompletion(
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[], 
  useWebSearch: boolean = false
) {
  try {
    console.log('🔍 Debug - API Key present:', !!apiKey);
    console.log('🔍 Debug - API Key format:', apiKey ? `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}` : 'No key');
    console.log('🔍 Debug - Use web search:', useWebSearch);
    console.log('🔍 Debug - Messages count:', messages.length);

    // Validation basique de la clé API
    if (!apiKey || !apiKey.startsWith('sk-')) {
      throw new Error('Format de clé API OpenAI invalide. La clé doit commencer par "sk-"');
    }

    if (useWebSearch) {
      console.log('🌐 Using web search with Responses API...');
      
      // Test avec une requête simple d'abord
      const response = await openai.responses.create({
        model: "gpt-4o",
        tools: [{ type: "web_search_preview" }],
        input: messages[messages.length - 1].content,
        store: true,
      });

      console.log('✅ Web search response received');
      return response.output_text;
    } else {
      console.log('💬 Using Chat Completions...');
      
      // Test d'authentification avec une requête simple d'abord
      await openai.chat.completions.create({
        messages: [{ role: 'user', content: 'Hello' }],
        model: "gpt-4o",
        max_tokens: 10,
        store: false, // Désactiver le stockage pour les tests
      });

      console.log('✅ Basic authentication successful');
      
      // Si ça marche, utiliser la version complète avec les tools
      const tools = AIFunctionService.getFunctionDefinitions();
      
      const completion = await openai.chat.completions.create({
        messages,
        model: "gpt-4o",
        tools,
        store: true,
      });

      console.log('✅ Full chat completion received');
      const message = completion.choices[0].message;
      
      // Vérifier s'il y a des tool calls
      if (message.tool_calls && message.tool_calls.length > 0) {
        console.log('🔧 Processing tool calls:', message.tool_calls.length);
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

        console.log('✅ Final completion with tools received');
        return finalCompletion.choices[0].message.content;
      }

      return message.content;
    }
  } catch (error: any) {
    console.error('❌ Detailed error in getChatCompletion:', {
      error,
      message: error?.message,
      status: error?.status,
      code: error?.code,
      type: error?.type,
      response: error?.response?.data || error?.response
    });
    
    // Gestion spécifique des erreurs OpenAI
    if (error?.code === 'internal_error' || error?.type === 'auth_subrequest_error') {
      throw new Error('Erreur d\'authentification OpenAI. Vérifiez que votre clé API est valide et active.');
    }
    
    if (error?.status === 401 || error?.message?.includes('401') || error?.message?.includes('Unauthorized')) {
      throw new Error('Clé API OpenAI invalide ou expirée. Vérifiez votre clé dans le fichier .env');
    }
    
    if (error?.status === 429 || error?.message?.includes('429')) {
      throw new Error('Limite de requêtes API atteinte. Veuillez réessayer plus tard');
    }
    
    if (error?.status === 403 || error?.message?.includes('403')) {
      throw new Error('Accès refusé. Vérifiez les permissions de votre clé API OpenAI');
    }
    
    if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
      throw new Error('Erreur de connexion. Vérifiez votre connexion internet');
    }

    if (error?.message?.includes('API key')) {
      throw new Error('Problème avec la clé API OpenAI. Vérifiez qu\'elle est correcte et active');
    }
    
    // Erreur générique mais plus informative
    throw new Error(`Erreur OpenAI: ${error?.message || 'Erreur inconnue'}`);
  }
}