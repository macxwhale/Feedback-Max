
import React from 'react';
import { MetricCard } from './MetricCard';
import { LucideIcon } from 'lucide-react';
import { StatsCardSkeleton } from '@/components/ui/loading-skeleton';

interface StatCard {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  suffix?: string;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
  previousValue?: number | string;
  secondaryMetrics?: Array<{
    label: string;
    value: string | number;
    trend?: 'up' | 'down' | 'neutral';
  }>;
  status?: 'normal' | 'warning' | 'critical' | 'success';
  actionLabel?: string;
  onAction?: () => void;
}

interface StatsCardsProps {
  cards: StatCard[];
  isLoading?: boolean;
  className?: string;
  onCardAction?: (cardTitle: string) => void;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ 
  cards, 
  isLoading = false,
  className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6",
  onCardAction
}) => {
  if (isLoading) {
    return (
      <div className={className}>
        {Array.from({ length: cards.length || 6 }).map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className={className}>
      {cards.map((card) => (
        <MetricCard
          key={card.title}
          title={card.title}
          value={`${card.value}${card.suffix || ''}`}
          previousValue={card.previousValue ? `${card.previousValue}${card.suffix || ''}` : undefined}
          change={card.trend ? {
            value: card.trend.value,
            period: card.trend.label,
            trend: card.trend.isPositive ? 'up' : 'down'
          } : undefined}
          secondaryMetrics={card.secondaryMetrics}
          icon={card.icon}
          status={card.status}
          actionLabel={card.actionLabel}
          onAction={card.onAction || (onCardAction ? () => onCardAction(card.title) : undefined)}
        />
      ))}
    </div>
  );
};
