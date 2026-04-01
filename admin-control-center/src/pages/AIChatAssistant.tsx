import React, { useState } from 'react';
import { sendMessage } from '../services/geminiService';
import { Send, Bot, User } from 'lucide-react';

export default function AIChatAssistant() {
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user' as const, text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const aiResponse = await sendMessage(input);
      setMessages((prev) => [...prev, { role: 'ai', text: aiResponse }]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prev) => [...prev, { role: 'ai', text: 'Sorry, I encountered an error.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">AI Agent Assistant</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'ai' && <Bot className="w-8 h-8 p-1.5 rounded-full bg-blue-100 text-blue-600" />}
            <div className={`p-4 rounded-2xl max-w-[80%] ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
              {msg.text}
            </div>
            {msg.role === 'user' && <User className="w-8 h-8 p-1.5 rounded-full bg-gray-200 text-gray-600" />}
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <Bot className="w-8 h-8 p-1.5 rounded-full bg-blue-100 text-blue-600" />
            <div className="p-4 rounded-2xl bg-gray-100 text-gray-500">Thinking...</div>
          </div>
        )}
      </div>
      <div className="p-6 border-t border-gray-200 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask about project management or strategic intelligence..."
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
        <button
          onClick={handleSend}
          disabled={isLoading}
          className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}
