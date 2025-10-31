import React, { useState, useEffect } from 'react';
import { BarChart, PieChart, Activity, Layout, FileText, Loader2, GripHorizontal, X } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { useCardTheme } from '../../../contexts/CardThemeContext';
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
  const { currentCardTheme } = useCardTheme();
  const isTerminalTheme = currentCardTheme.id === 'terminal';

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

  const bgMain = isTerminalTheme ? 'rgb(0, 0, 0)' : 'rgb(17, 24, 39)';
  const bgHeader = isTerminalTheme ? 'rgb(0, 0, 0)' : themeColors.menuBg;
  const textColor = isTerminalTheme ? 'rgb(255, 255, 255)' : 'white';
  const textMuted = isTerminalTheme ? 'rgba(255, 255, 255, 0.5)' : 'rgb(156, 163, 175)';
  const borderColor = isTerminalTheme ? 'rgba(255, 255, 255, 0.3)' : 'rgba(55, 65, 81, 0.5)';
  const iconColor = isTerminalTheme ? 'rgb(255, 255, 255)' : themeColors.primary;

  if (loading) {
    return (
      <div className="flex flex-col h-full rounded-lg overflow-hidden" style={{ backgroundColor: bgMain }}>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: textMuted }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full rounded-lg overflow-hidden" style={{ backgroundColor: bgMain }}>
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
    <div className="flex flex-col h-full rounded-lg overflow-hidden" style={{ backgroundColor: bgMain }}>
      {/* En-tête */}
      <div
        className="p-4"
        style={{ backgroundColor: bgHeader, borderBottom: `1px solid ${borderColor}` }}
      >
        <div className="flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-grab active:cursor-grabbing"
            onMouseDown={onDragStart}
          >
            <GripHorizontal className="w-5 h-5" style={{ color: textMuted }} />
            <Activity
              className="w-5 h-5"
              style={{ color: iconColor }}
            />
            <h2 className="text-lg font-semibold" style={{ color: textColor }}>Analytiques</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg transition-colors"
            onMouseDown={(e) => e.stopPropagation()}
            style={{ color: textMuted }}
          >
            <X className="w-5 h-5" />
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
            color={iconColor}
            isTerminalTheme={isTerminalTheme}
          />
          <StatCard
            icon={FileText}
            title="Total Cartes"
            value={totalCards}
            color={iconColor}
            isTerminalTheme={isTerminalTheme}
          />
          <StatCard
            icon={BarChart}
            title="Moy. Cartes/Tableau"
            value={avgCardsPerBoard.toFixed(1)}
            color={iconColor}
            isTerminalTheme={isTerminalTheme}
          />
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ChartCard
            title="Cartes par Type"
            icon={PieChart}
            data={cardsByType}
            type="pie"
            color={iconColor}
            isTerminalTheme={isTerminalTheme}
          />
          <ChartCard
            title="Tableaux par Nombre de Cartes"
            icon={BarChart}
            data={boardsByCardCount}
            type="bar"
            color={iconColor}
            isTerminalTheme={isTerminalTheme}
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
              color={iconColor}
              isTerminalTheme={isTerminalTheme}
            />
            <ChartCard
              title="Tâches par Priorité"
              icon={BarChart}
              data={kanbanStats.byPriority}
              type="bar"
              color={iconColor}
              isTerminalTheme={isTerminalTheme}
            />
          </div>
        )}
      </div>
    </div>
  );
}