import OpenAI from 'openai';

// Vérification de la présence de la clé API (local avec VITE_ ou Vercel sans VITE_)
const apiKey = import.meta.env.VITE_OPENAI_API_KEY || import.meta.env.OPENAI_API_KEY;

if (!apiKey) {
  throw new Error('OpenAI API key is not defined. Please set VITE_OPENAI_API_KEY (local) or OPENAI_API_KEY (Vercel) in environment variables');
}

const openai = new OpenAI({
  apiKey: apiKey,
  dangerouslyAllowBrowser: true
});

export async function getChatCompletion(messages: { role: 'user' | 'assistant' | 'system'; content: string }[]) {
  try {
    const completion = await openai.chat.completions.create({
      messages,
      model: "gpt-4o",
      store: true,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error getting chat completion:', error);
    throw error;
  }
}