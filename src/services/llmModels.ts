const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3002';

export interface LLMModel {
  id: string;
  name: string;
  created: number;
}

export const llmModelsService = {
  /**
   * Fetch available models from a provider using the API key
   */
  async fetchModels(provider: string, apiKey: string): Promise<LLMModel[]> {
    const response = await fetch(`${BACKEND_URL}/api/llm/models`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ provider, apiKey })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch models');
    }

    const data = await response.json();
    return data.models;
  }
};
