import React, { useState, useEffect } from 'react';
import { BarChart, PieChart, Activity, Layout, FileText, Loader2, GripHorizontal, X } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { StatCard } from './StatCard';
import { ChartCard } from './ChartCard';
import { analytics } from '../../../services/analytics';

interface AnalyticsProps {
  onClose: () => void;
  onDragStart?: (e: React.MouseEvent) => void;
}

interface Stats {
  boards: any[];
  kanbanBoards: any[];
}

export function Analytics({ onClose, onDragStart }: AnalyticsProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { themeColors } = useTheme();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await analytics.getBoardsStats();
      setStats(data);
    } catch (err) {
      console.error('Error loading analytics:', err);
      setError('Échec du chargement des données analytiques');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-gray-900 rounded-lg overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full bg-gray-900 rounded-lg overflow-hidden">
        <div className="flex-1 flex items-center justify-center text-red-400">
          {error}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  // Calcul des statistiques
  const totalBoards = stats.boards.length;
  const totalCards = stats.boards.reduce((sum, board) => sum + (board.cards?.length || 0), 0);
  const avgCardsPerBoard = totalBoards > 0 ? totalCards / totalBoards : 0;

  // Calcul des cartes par type
  const cardsByType = stats.boards.reduce((acc, board) => {
    board.cards?.forEach(card => {
      const type = card.type.replace('app-', '');
      const typeLabels: Record<string, string> = {
        text: 'Texte',
        link: 'Lien',
        calculator: 'Calculatrice',
        clock: 'Horloge',
        calendar: 'Calendrier',
        todolist: 'Liste de tâches',
        rss: 'Flux RSS',
        kanban: 'Tableau Kanban',
        analytics: 'Analytiques'
      };
      const label = typeLabels[type] || type;
      acc[label] = (acc[label] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  // Calcul des tableaux par nombre de cartes
  const boardsByCardCount = stats.boards.reduce((acc, board) => {
    const count = board.cards?.length || 0;
    const range = Math.floor(count / 5) * 5;
    const key = `${range}-${range + 4} cartes`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calcul des statistiques Kanban
  const kanbanStats = stats.kanbanBoards.reduce((acc, board) => {
    board.kanban_tasks?.forEach((task: any) => {
      // Comptage par statut
      const statusLabels: Record<string, string> = {
        todo: 'À faire',
        inProgress: 'En cours',
        done: 'Terminé'
      };
      const status = statusLabels[task.status] || task.status;
      acc.byStatus[status] = (acc.byStatus[status] || 0) + 1;

      // Comptage par priorité
      const priorityLabels: Record<string, string> = {
        low: 'Basse',
        medium: 'Moyenne',
        high: 'Haute'
      };
      const priority = priorityLabels[task.priority] || task.priority;
      acc.byPriority[priority] = (acc.byPriority[priority] || 0) + 1;
    });
    return acc;
  }, { byStatus: {}, byPriority: {} } as { byStatus: Record<string, number>, byPriority: Record<string, number> });

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-lg overflow-hidden">
      {/* En-tête */}
      <div 
        className="p-4 border-b border-gray-700/50"
        style={{ backgroundColor: themeColors.menuBg }}
      >
        <div className="flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-grab active:cursor-grabbing"
            onMouseDown={onDragStart}
          >
            <GripHorizontal className="w-5 h-5 text-gray-500" />
            <Activity 
              className="w-5 h-5"
              style={{ color: themeColors.primary }}
            />
            <h2 className="text-lg font-semibold text-white">Analytiques</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-700/50 rounded-lg transition-colors"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Contenu */}
      <div className="flex-1 overflow-y-auto analytics-scrollbar p-4 space-y-4">
        {/* Métriques clés */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            icon={Layout}
            title="Total Tableaux"
            value={totalBoards}
            color={themeColors.primary}
          />
          <StatCard
            icon={FileText}
            title="Total Cartes"
            value={totalCards}
            color={themeColors.primary}
          />
          <StatCard
            icon={BarChart}
            title="Moy. Cartes/Tableau"
            value={avgCardsPerBoard.toFixed(1)}
            color={themeColors.primary}
          />
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ChartCard
            title="Cartes par Type"
            icon={PieChart}
            data={cardsByType}
            type="pie"
            color={themeColors.primary}
          />
          <ChartCard
            title="Tableaux par Nombre de Cartes"
            icon={BarChart}
            data={boardsByCardCount}
            type="bar"
            color={themeColors.primary}
          />
        </div>

        {/* Statistiques Kanban */}
        {Object.keys(kanbanStats.byStatus).length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ChartCard
              title="Tâches par Statut"
              icon={PieChart}
              data={kanbanStats.byStatus}
              type="pie"
              color={themeColors.primary}
            />
            <ChartCard
              title="Tâches par Priorité"
              icon={BarChart}
              data={kanbanStats.byPriority}
              type="bar"
              color={themeColors.primary}
            />
          </div>
        )}
      </div>
    </div>
  );
}
