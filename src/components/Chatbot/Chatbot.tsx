import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Loader2, Pencil, Plus } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { getChatCompletion } from '../../lib/openai';
import { analytics } from '../../services/analytics';

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

Special Instructions for Board-Related Questions:
1. When answering questions about boards, cards, or tasks:
   - Be direct and concise in your responses
   - Start with "À partir des données à ma disposition, je constate que..." ou toute autre phrase qui s'en rapproche de maniere professionel.
   - Provide the exact numbers or statistics requested
   - Do not explain your calculation process unless specifically asked
   - Maintain a professional and courteous tone

2. For all other questions:
   - Provide detailed explanations
   - Use examples when helpful
   - Break down complex topics into steps

Remember:
- You communicate in French
- You're a trusted development partner named Angel
- Be honest about limitations
- Maintain a consistent, helpful demeanor`;

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
      text: "Bonjour ! Je suis Angel, votre assistant IA. Comment puis-je vous aider aujourd'hui ?",
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
      
      setMessages(prev => prev.map(m => 
        m.id === messageId ? { ...m, showCreateCard: false } : m
      ));
    }
  };

  const enrichMessageWithBoardData = async (message: string): Promise<string> => {
    if (message.toLowerCase().includes('board') || 
        message.toLowerCase().includes('tableau') || 
        message.toLowerCase().includes('lien') || 
        message.toLowerCase().includes('weboard') || 
        message.toLowerCase().includes('tâche')) {
      try {
        const stats = await analytics.getBoardsStats();
        return `voici la question de l'utilisateur : "${message}"

voici les données du tableau :
${JSON.stringify({
  boards: stats.boards.map(board => ({
    id: board.id,
    name: board.name,
    cardsCount: board.cards?.length || 0,
    cardTypes: board.cards?.reduce((acc, card) => {
      const type = card.type.replace('app-', '');
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  })),
  kanbanBoards: stats.kanbanBoards.map(board => ({
    id: board.id,
    tasksCount: board.kanban_tasks?.length || 0,
    tasksByStatus: board.kanban_tasks?.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    tasksByPriority: board.kanban_tasks?.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  }))
}, null, 2)}

à partir des données, réponds à la demande de l'utilisateur :`;
      } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        return message;
      }
    }
    return message;
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
      const enrichedMessage = await enrichMessageWithBoardData(input);
      
      const chatMessages = [
        { role: 'system' as const, content: SYSTEM_PROMPT },
        ...messages
          .filter(msg => msg.sender !== 'system')
          .map(msg => ({
            role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
            content: msg.text
          })),
        { role: 'user' as const, content: enrichedMessage }
      ];

      const response = await getChatCompletion(chatMessages);

      const botMessage: Message = {
        id: crypto.randomUUID(),
        text: response || "Je suis désolé, je n'ai pas pu traiter votre demande.",
        sender: 'bot',
        timestamp: new Date(),
        showCreateCard: true
      };

      setMessages(prev => [...prev, botMessage]);

      if (isEditMode && onCreateCard && response) {
        const position = {
          x: Math.random() * 500 + 100,
          y: Math.random() * 300 + 100
        };
        onCreateCard(position, 'text', response);
      }
    } catch (error) {
      console.error('Erreur lors de la réponse IA:', error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        text: "Je suis désolé, j'ai rencontré une erreur. Veuillez réessayer.",
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
      {/* En-tête */}
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
            <div className="text-xs text-gray-400">Assistant IA</div>
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
                    Créer une carte
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
            <span className="text-sm">Angel réfléchit...</span>
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
            title={isEditMode ? 'Mode édition activé - Les réponses créeront des cartes texte' : 'Mode édition désactivé'}
          >
            <Pencil className="w-4 h-4" />
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isEditMode ? "Demandez à Angel de créer du contenu..." : "Posez votre question à Angel..."}
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
