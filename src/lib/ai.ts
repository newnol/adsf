import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

export type AIModel = 'openai' | 'gemini';

export interface AISettings {
  model: AIModel;
  apiKey: string;
}

export async function parseTransactionWithAI(
  text: string,
  settings: AISettings
): Promise<{
  amount: number;
  category: string;
  type: 'income' | 'expense';
  description: string;
}> {
  const prompt = `Parse the following text into a transaction. Extract the amount, category (e.g., groceries, rent, salary, food, transport, entertainment), and determine if it's income or expense. Format the response as JSON.

Text: "${text}"

Expected format:
{
  "amount": number,
  "category": "category_name",
  "type": "income|expense",
  "description": "original_text"
}`;

  try {
    if (settings.model === 'openai') {
      const openai = new OpenAI({
        apiKey: settings.apiKey,
        dangerouslyAllowBrowser: true
      });

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
      });

      return JSON.parse(response.choices[0].message.content || '{}');
    } else {
      const genAI = new GoogleGenerativeAI(settings.apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      const result = await model.generateContent(prompt);
      const response = result.response;
      return JSON.parse(response.text());
    }
  } catch (error) {
    console.error('AI parsing error:', error);
    // Fallback to simple parsing
    const amount = parseFloat(text.match(/\$?(\d+(\.\d{1,2})?)/)?.[1] || '0');
    const isIncome = text.toLowerCase().includes('earned') || 
                    text.toLowerCase().includes('received') ||
                    text.toLowerCase().includes('salary');
    
    const categories = ['groceries', 'rent', 'salary', 'food', 'transport', 'entertainment'];
    const category = categories.find(cat => text.toLowerCase().includes(cat)) || 'other';

    return {
      amount,
      category,
      type: isIncome ? 'income' : 'expense',
      description: text
    };
  }
}