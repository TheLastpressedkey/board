import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: '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',
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