import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { ChatCohere, CohereEmbeddings } from '@langchain/cohere';
import { ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { toLangChainModel } from '../lib/modelMapping.js';

/**
 * Service de gestion multi-provider LLM
 * Supporte : OpenAI, Anthropic, Cohere, Google Gemini
 */
export class LLMProvider {

  /**
   * Crée une instance de chat model selon le provider
   * @param {string} provider - 'openai', 'anthropic', 'cohere', 'google'
   * @param {object} config - Configuration du provider
   * @returns {ChatModel} Instance du chat model
   */
  static getChatModel(provider, config) {
    const temperature = config.temperature || 0.7;

    // Convertir le modèle vers le format LangChain si nécessaire
    const chatModel = config.models?.chat || this.getDefaultChatModel(provider);
    const langchainModel = toLangChainModel(provider, chatModel);

    console.log(`[LLMProvider] Provider: ${provider}, Input model: ${chatModel}, LangChain model: ${langchainModel}`);

    switch (provider) {
      case 'openai':
        if (!config.apiKey) {
          throw new Error('OpenAI API key is required');
        }
        return new ChatOpenAI({
          apiKey: config.apiKey,
          model: langchainModel,
          temperature,
          streaming: false,
        });

      case 'anthropic':
        if (!config.apiKey) {
          throw new Error('Anthropic API key is required');
        }
        return new ChatAnthropic({
          apiKey: config.apiKey,
          model: langchainModel,
          temperature,
        });

      case 'cohere':
        if (!config.apiKey) {
          throw new Error('Cohere API key is required');
        }
        return new ChatCohere({
          apiKey: config.apiKey,
          model: langchainModel,
          temperature,
        });

      case 'google':
        if (!config.apiKey) {
          throw new Error('Google API key is required');
        }
        return new ChatGoogleGenerativeAI({
          apiKey: config.apiKey,
          model: langchainModel,
          temperature,
        });

      default:
        throw new Error(`Provider ${provider} not supported. Supported: openai, anthropic, cohere, google`);
    }
  }

  /**
   * Crée une instance d'embeddings selon le provider
   * @param {string} provider - 'openai', 'cohere', 'google'
   * @param {object} config - Configuration du provider
   * @returns {Embeddings} Instance des embeddings
   */
  static getEmbeddings(provider, config) {
    switch (provider) {
      case 'openai':
        if (!config.apiKey) {
          throw new Error('OpenAI API key is required');
        }
        return new OpenAIEmbeddings({
          apiKey: config.apiKey,
          model: config.models?.embedding || 'text-embedding-3-small',
        });

      case 'cohere':
        if (!config.apiKey) {
          throw new Error('Cohere API key is required');
        }
        return new CohereEmbeddings({
          apiKey: config.apiKey,
          model: config.models?.embedding || 'embed-multilingual-v3.0',
        });

      case 'google':
        if (!config.apiKey) {
          throw new Error('Google API key is required');
        }
        return new GoogleGenerativeAIEmbeddings({
          apiKey: config.apiKey,
          model: config.models?.embedding || 'text-embedding-004',
        });

      default:
        throw new Error(`Embeddings for ${provider} not supported. Supported: openai, cohere, google`);
    }
  }

  /**
   * Vérifie si un provider supporte les embeddings
   * @param {string} provider - Provider à vérifier
   * @returns {boolean}
   */
  static supportsEmbeddings(provider) {
    return ['openai', 'cohere', 'google'].includes(provider);
  }

  /**
   * Liste des providers disponibles
   * @returns {object}
   */
  static getAvailableProviders() {
    return {
      chat: ['openai', 'anthropic', 'cohere', 'google'],
      embeddings: ['openai', 'cohere', 'google'],
    };
  }

  /**
   * Obtient le modèle de chat par défaut pour un provider
   * @param {string} provider
   * @returns {string}
   */
  static getDefaultChatModel(provider) {
    const defaults = this.getDefaultModels(provider);
    return defaults?.chat || 'gpt-4o';
  }

  /**
   * Obtient les modèles par défaut pour un provider
   * @param {string} provider
   * @returns {object}
   */
  static getDefaultModels(provider) {
    const defaults = {
      openai: {
        chat: 'gpt-4o',
        embedding: 'text-embedding-3-small',
      },
      anthropic: {
        chat: 'claude-3-5-sonnet-20241022',
      },
      cohere: {
        chat: 'command-r-plus',
        embedding: 'embed-multilingual-v3.0',
      },
      google: {
        chat: 'gemini-1.5-pro',
        embedding: 'text-embedding-004',
      },
    };

    return defaults[provider] || {};
  }
}
