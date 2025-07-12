
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Star, Gift } from 'lucide-react';

interface ScoreDisplayProps {
  averageScore: number;
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ averageScore }) => {
  const getScoreBadge = (score: number) => {
    if (score >= 80) return { icon: Trophy, label: 'Excellent!', color: 'bg-green-100 text-green-800' };
    if (score >= 60) return { icon: Star, label: 'Good!', color: 'bg-yellow-100 text-yellow-800' };
    return { icon: Gift, label: 'Thanks!', color: 'bg-blue-100 text-blue-800' };
  };

  const badge = getScoreBadge(averageScore);
  const BadgeIcon = badge.icon;

  return (
    <Card className="bg-gradient-to-r from-[#073763] to-[#007ACE] text-white">
      <CardContent className="p-6 text-center">
        <div className="flex items-center justify-center mb-4">
          <BadgeIcon className="h-12 w-12 mr-3" />
          <div>
            <h3 className="text-3xl font-bold">{averageScore}</h3>
            <p className="text-blue-200">Average Score</p>
          </div>
        </div>
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.color} bg-white`}>
          {badge.label}
        </div>
      </CardContent>
    </Card>
  );
};
