import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { getChatCompletion } from '../../lib/openai';
import { analytics } from '../../services/analytics';
import { chat, ChatMessage } from '../../services/chat';

interface ChatbotProps {
  onClose: () => void;
  onCreateCard?: (position: { x: number; y: number }, type: string, content: string) => void;
}

const SYSTEM_PROMPT = `Vous êtes Angel, un assistant IA expert avec une expertise en développement logiciel, design et résolution créative de problèmes.

Instructions spéciales pour les questions relatives aux tableaux :
1. Pour les questions sur les tableaux, cartes ou tâches :
   - Soyez direct et concis dans vos réponses
   - Commencez par "À partir des données à ma disposition, je constate que..." ou toute autre phrase qui s'en rapproche de manière professionnelle
   - Fournissez les chiffres ou statistiques exactes demandées
   - N'expliquez pas votre processus de calcul sauf si on vous le demande
   - Maintenez un ton professionnel et courtois

2. Pour toutes les autres questions :
   - Fournissez des explications détaillées
   - Utilisez des exemples quand c'est utile
   - Décomposez les sujets complexes en étapes

N'oubliez pas :
- Vous communiquez en français
- Vous êtes un partenaire de développement de confiance nommé Angel
- Soyez honnête sur vos limites
- Maintenez une attitude serviable et cohérente`;

const WELCOME_MESSAGE = "Bonjour ! Je suis Angel, votre assistant IA. Comment puis-je vous aider aujourd'hui ?";

export function Chatbot({ onClose, onCreateCard }: ChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { themeColors } = useTheme();
  const [isInitialized, setIsInitialized] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    loadChatHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatHistory = async () => {
    try {
      const history = await chat.getHistory();
      setMessages(history);

      // Si l'historique est vide, ajouter le message de bienvenue
      if (history.length === 0 && !isInitialized) {
        const welcomeMessage = await chat.saveMessage(WELCOME_MESSAGE, 'bot');
        setMessages([welcomeMessage]);
        setIsInitialized(true);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleCreateCard = async (messageId: string) => {
    const message = messages.find(m => m.id === messageId);
    if (message && onCreateCard) {
      const position = {
        x: Math.random() * 500 + 100,
        y: Math.random() * 300 + 100
      };
      onCreateCard(position, 'text', message.content);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await chat.deleteMessage(messageId);
      setMessages(prev => prev.filter(m => m.id !== messageId));
    } catch (error) {
      console.error('Erreur lors de la suppression du message:', error);
    }
  };

  const handleDeleteAllMessages = async () => {
    try {
      await chat.deleteAllMessages();
      setMessages([]);
    } catch (error) {
      console.error('Erreur lors de la suppression des messages:', error);
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

    try {
      setIsLoading(true);

      // Save user message
      const userMessage = await chat.saveMessage(input, 'user');
      setMessages(prev => [...prev, userMessage]);
      setInput('');

      const enrichedMessage = await enrichMessageWithBoardData(input);
      
      const chatMessages = [
        { role: 'system' as const, content: SYSTEM_PROMPT },
        ...messages
          .filter(msg => msg.sender !== 'system')
          .map(msg => ({
            role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
            content: msg.content
          })),
        { role: 'user' as const, content: enrichedMessage }
      ];

      const response = await getChatCompletion(chatMessages);

      // Save bot response
      const botMessage = await chat.saveMessage(
        response || "Je suis désolé, je n'ai pas pu traiter votre demande.",
        'bot'
      );

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
      console.error('Erreur lors de la réponse IA:', error);
      const errorMessage = await chat.saveMessage(
        "Je suis désolé, j'ai rencontré une erreur. Veuillez réessayer.",
        'bot'
      );
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-x-4 bottom-20 md:right-4 md:left-auto md:w-96 h-[80vh] md:h-[600px] bg-gray-900 rounded-lg shadow-xl flex flex-col overflow-hidden z-50 border border-gray-700/50"
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
        <div className="flex items-center gap-2">
          <button
            onClick={handleDeleteAllMessages}
            className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
            title="Effacer l'historique"
          >
            <Trash2 className="w-4 h-4 text-gray-400" />
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 analytics-scrollbar">
        {isLoadingHistory ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        ) : (
          messages.filter(msg => msg.sender !== 'system').map((message) => (
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
                className={`group px-4 py-3 rounded-lg w-full md:max-w-[80%] ${
                  message.sender === 'user'
                    ? 'bg-gray-700/50 text-white rounded-br-none'
                    : 'bg-gray-800/50 text-gray-100 rounded-bl-none'
                }`}
                style={{ backdropFilter: 'blur(8px)' }}
              >
                <p className="text-sm whitespace-pre-wrap leading-relaxed break-words">{message.content}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[10px] text-gray-400">
                    {message.createdAt.toLocaleTimeString()}
                  </span>
                  <div className="flex items-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    {message.sender === 'bot' && (
                      <button
                        onClick={() => handleCreateCard(message.id)}
                        className="flex items-center gap-1 text-xs hover:bg-gray-700/50 px-2 py-1 rounded transition-colors"
                        style={{ color: themeColors.primary }}
                      >
                        <Plus className="w-3 h-3" />
                        <span className="hidden md:inline">Créer une carte</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteMessage(message.id)}
                      className="flex items-center gap-1 text-xs hover:bg-gray-700/50 px-2 py-1 rounded transition-colors text-red-400"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span className="hidden md:inline">Supprimer</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
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
            className={`hidden md:flex p-2 rounded-lg transition-colors ${
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
