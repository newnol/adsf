import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { Transaction } from '../types';
import { Settings } from './Settings';
import { AIModel, parseTransactionWithAI } from '../lib/ai';

type Props = {
  onTransactionAdd: (transaction: Omit<Transaction, 'id' | 'created_at' | 'user_id'>) => void;
};

export function ChatInterface({ onTransactionAdd }: Props) {
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [model, setModel] = useState<AIModel>('openai');
  const [apiKey, setApiKey] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || isProcessing || !apiKey) {
      if (!apiKey) {
        toast.error('Please enter an API key in settings');
      }
      return;
    }

    setIsProcessing(true);
    try {
      const transaction = await parseTransactionWithAI(message, {
        model,
        apiKey
      });
      
      onTransactionAdd(transaction);
      setMessage('');
    } catch (error) {
      console.error('Error processing message:', error);
      toast.error('Failed to process message');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Add Transaction</h2>
        <Settings
          model={model}
          apiKey={apiKey}
          onModelChange={setModel}
          onApiKeyChange={setApiKey}
        />
      </div>
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell me about your transaction (e.g., 'I spent $50 on groceries')"
          className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isProcessing}
        />
        <button
          type="submit"
          disabled={isProcessing || !apiKey}
          className="p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}