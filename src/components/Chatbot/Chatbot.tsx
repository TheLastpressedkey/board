import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Loader2, Pencil, Plus } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { getChatCompletion } from '../../lib/openai';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot' | 'system';
  timestamp: Date;
  showCreateCard?: boolean;
}

interface ChatbotProps {
  onClose: () => void;
  onCreateCard?: (position: { x: number; y: number }, type: string, content: string) => void;
}

const SYSTEM_PROMPT = `You are Angel, an advanced AI assistant with expertise in software development, design, and creative problem-solving. Your personality traits include:

- Friendly and approachable, always maintaining a positive and encouraging tone
- Professional yet warm in your communication style
- Patient and thorough in your explanations
- Proactive in suggesting improvements or alternatives
- Creative in finding solutions to complex problems

Your core responsibilities:
1. Help users with software development questions and challenges
2. Provide guidance on best practices and design patterns
3. Assist with debugging and problem-solving
4. Offer creative suggestions for UI/UX improvements
5. Support users in learning new technologies and concepts

Guidelines:
- Always provide clear, actionable advice
- Break down complex topics into understandable steps
- Use examples when helpful
- Be honest about limitations
- Maintain a consistent, helpful demeanor

Remember: You're not just an AI, you're a trusted development partner named Angel.`;

export function Chatbot({ onClose, onCreateCard }: ChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'system',
      text: SYSTEM_PROMPT,
      sender: 'system',
      timestamp: new Date()
    },
    {
      id: '1',
      text: "Hello! I'm Angel, your AI assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { themeColors } = useTheme();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleCreateCard = (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (message && onCreateCard) {
      const position = {
        x: Math.random() * 500 + 100,
        y: Math.random() * 300 + 100
      };
      onCreateCard(position, 'text', message.text);
      
      // Update message to hide the create card button
      setMessages(prev => prev.map(m => 
        m.id === messageId ? { ...m, showCreateCard: false } : m
      ));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const chatMessages = [
        { role: 'system' as const, content: SYSTEM_PROMPT },
        ...messages
          .filter(msg => msg.sender !== 'system')
          .map(msg => ({
            role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
            content: msg.text
          })),
        { role: 'user' as const, content: input }
      ];

      const response = await getChatCompletion(chatMessages);

      const botMessage: Message = {
        id: crypto.randomUUID(),
        text: response || "I'm sorry, I couldn't process your request.",
        sender: 'bot',
        timestamp: new Date(),
        showCreateCard: true
      };

      setMessages(prev => [...prev, botMessage]);

      // Create a text card automatically if in edit mode
      if (isEditMode && onCreateCard && response) {
        const position = {
          x: Math.random() * 500 + 100,
          y: Math.random() * 300 + 100
        };
        onCreateCard(position, 'text', response);
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        text: "I'm sorry, I encountered an error. Please try again.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="fixed right-4 bottom-20 w-96 h-[600px] bg-gray-900 rounded-lg shadow-xl flex flex-col overflow-hidden z-50 border border-gray-700/50"
      style={{ backdropFilter: 'blur(12px)' }}
    >
      {/* Header */}
      <div 
        className="flex items-center justify-between px-4 py-3 border-b border-gray-700/50"
        style={{ backgroundColor: themeColors.menuBg }}
      >
        <div className="flex items-center gap-2">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${themeColors.primary}20` }}
          >
            <Bot className="w-5 h-5" style={{ color: themeColors.primary }} />
          </div>
          <div>
            <span className="font-medium text-white">Angel</span>
            <div className="text-xs text-gray-400">AI Development Assistant</div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.filter(msg => msg.sender !== 'system').map((message) => (
          <div
            key={message.id}
            className={`flex items-start gap-3 ${
              message.sender === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <div 
              className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                message.sender === 'bot' 
                  ? 'bg-gradient-to-br from-pink-500/20 to-purple-500/20' 
                  : 'bg-gradient-to-br from-gray-700 to-gray-600'
              }`}
            >
              {message.sender === 'bot' ? (
                <Bot className="w-4 h-4" style={{ color: themeColors.primary }} />
              ) : (
                <User className="w-4 h-4 text-white" />
              )}
            </div>
            <div
              className={`px-4 py-3 rounded-lg max-w-[80%] ${
                message.sender === 'user'
                  ? 'bg-gray-700/50 text-white rounded-br-none'
                  : 'bg-gray-800/50 text-gray-100 rounded-bl-none'
              }`}
              style={{ backdropFilter: 'blur(8px)' }}
            >
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.text}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[10px] text-gray-400">
                  {message.timestamp.toLocaleTimeString()}
                </span>
                {message.sender === 'bot' && message.showCreateCard && (
                  <button
                    onClick={() => handleCreateCard(message.id)}
                    className="flex items-center gap-1 text-xs hover:bg-gray-700/50 px-2 py-1 rounded transition-colors"
                    style={{ color: themeColors.primary }}
                  >
                    <Plus className="w-3 h-3" />
                    Create Card
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-gray-400">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span className="text-sm">Angel is thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form 
        onSubmit={handleSubmit}
        className="p-4 border-t border-gray-700/50"
        style={{ backgroundColor: themeColors.menuBg }}
      >
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsEditMode(!isEditMode)}
            className={`p-2 rounded-lg transition-colors ${
              isEditMode 
                ? 'bg-gray-700/80 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
            title={isEditMode ? 'Edit mode enabled - Responses will create text cards' : 'Edit mode disabled'}
          >
            <Pencil className="w-4 h-4" />
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isEditMode ? "Ask Angel to create content..." : "Ask Angel anything..."}
              className="w-full px-4 py-2 bg-gray-700/50 text-white rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 pr-12"
              style={{ '--tw-ring-color': themeColors.primary } as React.CSSProperties}
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-white transition-colors disabled:opacity-50 hover:bg-gray-600/50"
              style={{ color: themeColors.primary }}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
