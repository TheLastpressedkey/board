import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Loader2, Pencil, Plus, Trash2, Settings, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { getChatCompletion } from '../../lib/openai';
import { analytics } from '../../services/analytics';
import { chat } from '../../services/chat';
import { ai } from '../../services/ai';

interface ChatbotProps {
  onClose: () => void;
  onCreateCard?: (position: { x: number; y: number }, type: string, content: string) => void;
}

const DEFAULT_SYSTEM_PROMPT = `Vous êtes Angel, un assistant IA expert avec une expertise en développement logiciel, design et résolution créative de problèmes.

🔹 Instructions pour le formatage des réponses avec du code :

1. Format des blocs de code :
   - Encadrer le code avec des balises spéciales :
   ###debut_code###
   // Le code ici
   ###fin_code###

2. Structure des réponses avec code :
   - Introduction claire du code
   - Bloc de code bien formaté
   - Explications après le code si nécessaire
   - Exemple :
     Voici une fonction pour calculer la factorielle :
     ###debut_code###
     function factorial(n) {
       if (n <= 1) return 1;
       return n * factorial(n - 1);
     }
     ###fin_code###
     Cette fonction utilise la récursion pour...

3. Pour les Custom Apps WeBoard :
   - Toujours inclure les sections dans cet ordre :
     1. Styles CSS
     2. Structure HTML
     3. Code JavaScript
     4. Documentation d'utilisation

🔹 Structure requise pour une Custom App :
1. Le code doit être en JavaScript pur (pas de JSX/React)
2. L'app s'exécute dans un environnement sandbox (iframe)
3. Point d'entrée : <div id="app">
4. Les styles doivent être inclus via des balises <style>
5. Le code doit être auto-exécuté

🔸 API WeBoard disponible dans l'environnement sandbox :
window.weboardAPI = {
  storage: {
    get: (key) => // Récupère une valeur stockée
    set: (key, value) => // Stocke une valeur de manière persistante
  },
  ui: {
    showNotification: (message) => // Affiche une notification
  }
}

🔹 Template de base pour une Custom App :
###debut_code###
// Styles CSS de l'application
const styles = \`
  .app-container {
    padding: 20px;
    /* Autres styles */
  }
  /* Styles spécifiques */
\`;

// Structure HTML de base
document.getElementById('app').innerHTML = \`
  <style>\${styles}</style>
  <div class="app-container">
    <!-- Structure HTML -->
  </div>
\`;

// Fonction d'initialisation
async function initApp() {
  try {
    // Configuration des écouteurs d'événements
    setupEventListeners();
    
    // Chargement des données initiales
    await loadData();
    
    // Autres initialisations...
  } catch (error) {
    console.error('Error:', error);
    weboardAPI.ui.showNotification('Error: ' + error.message);
  }
}

// Fonction de nettoyage
function cleanup() {
  // Supprimer les écouteurs d'événements
  // Arrêter les intervalles
  // Nettoyer les ressources
}

// Écouteur pour le nettoyage
window.addEventListener('unload', cleanup);

// Démarrage de l'application
initApp();
###fin_code###

🔸 Bonnes pratiques pour les Custom Apps :
1. Gestion des erreurs :
   - Utiliser try/catch
   - Afficher des messages d'erreur via weboardAPI.ui.showNotification
   - Logger les erreurs dans la console

2. Performance :
   - Éviter les boucles infinies
   - Nettoyer les intervalles et timeouts
   - Optimiser les manipulations DOM

3. Sécurité :
   - Valider les entrées utilisateur
   - Échapper le HTML dynamique
   - Ne pas utiliser eval() ou new Function()

4. UX/UI :
   - Feedback visuel pour les actions
   - États de chargement
   - Messages d'erreur clairs
   - Design responsive

5. Code :
   - Bien commenter le code
   - Nommer clairement les variables/fonctions
   - Structurer logiquement le code
   - Utiliser const/let (pas de var)

🔹 Restrictions et limites :
1. Interdictions :
   - Pas de bibliothèques externes
   - Pas d'accès au DOM parent
   - Pas de eval() ou new Function()
   - Pas de manipulation de window.parent

2. Limitations :
   - Sandbox restrictif
   - Pas d'accès réseau direct
   - Storage limité
   - Pas de Web Workers

Pour les questions sur les tableaux, cartes ou tâches :
1. Pour les questions sur les tableaux, cartes ou tâches :
   - Soyez direct et concis
   - Commencez par "À partir des données à ma disposition, je constate que..."
   - Fournissez les chiffres exacts demandés
   - N'expliquez pas votre processus sauf si demandé
   - Maintenez un ton professionnel

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

function Message({ message, onDelete, onCreateCard }: { 
  message: ChatMessage; 
  onDelete: () => void;
  onCreateCard?: (id: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  const { themeColors } = useTheme();

  const parseMessageContent = (content: string) => {
    const parts = [];
    let currentIndex = 0;
    
    const codeBlockRegex = /###debut_code###([\s\S]*?)###fin_code###/g;
    let match;
    
    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > currentIndex) {
        parts.push({
          type: 'text',
          content: content.slice(currentIndex, match.index)
        });
      }
      
      parts.push({
        type: 'code',
        content: match[1].trim()
      });
      
      currentIndex = match.index + match[0].length;
    }
    
    if (currentIndex < content.length) {
      parts.push({
        type: 'text',
        content: content.slice(currentIndex)
      });
    }
    
    return parts;
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const messageParts = parseMessageContent(message.content);

  return (
    <div className={`flex items-start gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
        message.sender === 'bot' 
          ? 'bg-gradient-to-br from-pink-500/20 to-purple-500/20' 
          : 'bg-gradient-to-br from-gray-700 to-gray-600'
      }`}>
        {message.sender === 'bot' ? (
          <Bot className="w-4 h-4" style={{ color: themeColors.primary }} />
        ) : (
          <User className="w-4 h-4 text-white" />
        )}
      </div>
      <div className={`group px-4 py-3 rounded-lg w-full md:max-w-[80%] ${
        message.sender === 'user'
          ? 'bg-gray-700/50 text-white rounded-br-none'
          : 'bg-gray-800/50 text-gray-100 rounded-bl-none'
      }`} style={{ backdropFilter: 'blur(8px)' }}>
        {messageParts.map((part, index) => (
          part.type === 'code' ? (
            <div key={index} className="relative mt-2 mb-2">
              <div className="absolute right-2 top-2">
                <button
                  onClick={() => handleCopyCode(part.content)}
                  className="p-1.5 rounded bg-gray-700/50 hover:bg-gray-600/50 transition-colors"
                  title="Copy code"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>
              <pre className="bg-gray-900/50 p-4 rounded-lg overflow-x-auto">
                <code className="text-sm font-mono text-gray-200">
                  {part.content}
                </code>
              </pre>
            </div>
          ) : (
            <p key={index} className="text-sm whitespace-pre-wrap leading-relaxed break-words">
              {part.content}
            </p>
          )
        ))}
        <div className="mt-2 flex items-center justify-between">
          <span className="text-[10px] text-gray-400">
            {message.createdAt.toLocaleTimeString()}
          </span>
          <div className="flex items-center gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
            {message.sender === 'bot' && onCreateCard && (
              <button
                onClick={() => onCreateCard(message.id)}
                className="flex items-center gap-1 text-xs hover:bg-gray-700/50 px-2 py-1 rounded transition-colors"
                style={{ color: themeColors.primary }}
              >
                <Plus className="w-3 h-3" />
                <span className="hidden md:inline">Créer une carte</span>
              </button>
            )}
            <button
              onClick={onDelete}
              className="flex items-center gap-1 text-xs hover:bg-gray-700/50 px-2 py-1 rounded transition-colors text-red-400"
            >
              <Trash2 className="w-3 h-3" />
              <span className="hidden md:inline">Supprimer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Chatbot({ onClose, onCreateCard }: ChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [systemPrompt, setSystemPrompt] = useState<string | null>(null);
  const [useCustomPrompt, setUseCustomPrompt] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { themeColors } = useTheme();
  const [isInitialized, setIsInitialized] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    loadChatHistory();
    loadSystemPrompt();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadSystemPrompt = async () => {
    try {
      const customPrompt = await ai.getSystemPrompt();
      setSystemPrompt(customPrompt);
    } catch (error) {
      console.error('Error loading system prompt:', error);
    }
  };

  const loadChatHistory = async () => {
    try {
      const history = await chat.getHistory();
      setMessages(history);

      if (history.length === 0 && !isInitialized) {
        const welcomeMessage = await chat.saveMessage(WELCOME_MESSAGE, 'bot');
        setMessages([welcomeMessage]);
        setIsInitialized(true);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
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
      console.error('Error deleting message:', error);
    }
  };

  const handleDeleteAllMessages = async () => {
    try {
      await chat.deleteAllMessages();
      setMessages([]);
    } catch (error) {
      console.error('Error deleting all messages:', error);
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
        console.error('Error getting board stats:', error);
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

      const userMessage = await chat.saveMessage(input, 'user');
      setMessages(prev => [...prev, userMessage]);
      setInput('');

      const enrichedMessage = await enrichMessageWithBoardData(input);
      
      const chatMessages = [
        { 
          role: 'system' as const, 
          content: useCustomPrompt ? (systemPrompt || DEFAULT_SYSTEM_PROMPT) : DEFAULT_SYSTEM_PROMPT
        },
        ...messages
          .filter(msg => msg.sender !== 'system')
          .map(msg => ({
            role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
            content: msg.content
          })),
        { role: 'user' as const, content: enrichedMessage }
      ];

      const response = await getChatCompletion(chatMessages);

      const botMessage = await chat.saveMessage(
        response || "Je suis désolé, je n'ai pas pu traiter votre demande.",
        'bot'
      );

      setMessages(prev => [...prev, botMessage]);

      if (isEditMode && onCreateCard && response) {
        const position = {
          x: Math.random() * 500 + 100,
          y: Math.random() * 300 + 100
        };
        onCreateCard(position, 'text', response);
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
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
      className={`fixed inset-x-4 md:right-4 md:left-auto md:w-96 bg-gray-900 rounded-lg shadow-xl flex flex-col overflow-hidden z-50 border border-gray-700/50 transition-all duration-300 ease-in-out ${
        isMinimized 
          ? 'bottom-4 h-16' 
          : 'bottom-20 h-[80vh] md:h-[600px]'
      }`}
      style={{ backdropFilter: 'blur(12px)' }}
    >
      <div 
        className={`flex items-center justify-between px-4 py-3 border-b border-gray-700/50 cursor-pointer group ${
          isMinimized ? 'border-b-0' : ''
        }`}
        onClick={() => setIsMinimized(!isMinimized)}
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
          {!isMinimized && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setUseCustomPrompt(!useCustomPrompt);
                }}
                className={`p-2 rounded-lg transition-colors ${
                  useCustomPrompt ? 'bg-gray-700/50' : 'hover:bg-gray-700/50'
                }`}
                title={useCustomPrompt ? "Utiliser le prompt par défaut" : "Utiliser le prompt personnalisé"}
              >
                <Settings className="w-4 h-4 text-gray-400" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteAllMessages();
                }}
                className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
                title="Effacer l'historique"
              >
                <Trash2 className="w-4 h-4 text-gray-400" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(!isMinimized);
            }}
            className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
          >
            {isMinimized ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 analytics-scrollbar">
            {isLoadingHistory ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
              </div>
            ) : (
              messages.filter(msg => msg.sender !== 'system').map((message) => (
                <Message
                  key={message.id}
                  message={message}
                  onDelete={() => handleDeleteMessage(message.id)}
                  onCreateCard={onCreateCard ? handleCreateCard : undefined}
                />
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
        </>
      )}
    </div>
  );
}
