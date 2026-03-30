import express from 'express';

const router = express.Router();

/**
 * POST /api/llm/models
 * Fetch available models from a provider using the API key
 */
router.post('/models', async (req, res) => {
  try {
    const { provider, apiKey } = req.body;

    if (!provider || !apiKey) {
      return res.status(400).json({ error: 'Provider and API key are required' });
    }

    let models = [];

    switch (provider) {
      case 'openai': {
        const response = await fetch('https://api.openai.com/v1/models', {
          headers: {
            'Authorization': `Bearer ${apiKey}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch OpenAI models');
        }

        const data = await response.json();
        // Filter to only include chat models
        models = data.data
          .filter(model =>
            model.id.includes('gpt-4') ||
            model.id.includes('gpt-3.5') ||
            model.id.includes('o1') ||
            model.id.includes('o3')
          )
          .map(model => ({
            id: model.id,
            name: model.id,
            created: model.created
          }))
          .sort((a, b) => b.created - a.created);
        break;
      }

      case 'anthropic': {
        const response = await fetch('https://api.anthropic.com/v1/models', {
          headers: {
            'anthropic-version': '2023-06-01',
            'X-Api-Key': apiKey
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch Anthropic models');
        }

        const data = await response.json();
        models = data.data.map(model => ({
          id: model.id,
          name: model.display_name || model.id,
          created: model.created_at ? new Date(model.created_at).getTime() : 0
        }))
        .sort((a, b) => b.created - a.created);
        break;
      }

      case 'google': {
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models', {
          headers: {
            'x-goog-api-key': apiKey
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch Google models');
        }

        const data = await response.json();
        // Filter to only include Gemini models
        models = data.models
          .filter(model =>
            model.name.includes('gemini') &&
            model.supportedGenerationMethods?.includes('generateContent')
          )
          .map(model => ({
            id: model.name.replace('models/', ''),
            name: model.displayName || model.name.replace('models/', ''),
            created: 0
          }));
        break;
      }

      default:
        return res.status(400).json({ error: 'Unsupported provider' });
    }

    res.json({ success: true, models });
  } catch (error) {
    console.error('Error fetching models:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch models'
    });
  }
});

export default router;
