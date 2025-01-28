import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import { AIModel } from '../lib/ai';

interface Props {
  model: AIModel;
  apiKey: string;
  onModelChange: (model: AIModel) => void;
  onApiKeyChange: (apiKey: string) => void;
}

export function Settings({ model, apiKey, onModelChange, onApiKeyChange }: Props) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
      >
        <SettingsIcon className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg p-4 z-10">
          <h3 className="text-lg font-semibold mb-4">AI Settings</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                AI Model
              </label>
              <select
                value={model}
                onChange={(e) => onModelChange(e.target.value as AIModel)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="openai">OpenAI (GPT-3.5)</option>
                <option value="gemini">Google Gemini</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => onApiKeyChange(e.target.value)}
                placeholder={`Enter ${model === 'openai' ? 'OpenAI' : 'Gemini'} API key`}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div className="text-sm text-gray-500">
              {model === 'openai' ? (
                <p>Get your OpenAI API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600">platform.openai.com</a></p>
              ) : (
                <p>Get your Gemini API key from <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600">makersuite.google.com</a></p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}