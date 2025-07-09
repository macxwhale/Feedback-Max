
import React from 'react';
import { H2, Body } from '@/components/ui/typography';
import { SessionTrendsChart } from './charts/SessionTrendsChart';
import { AnalyticsTable } from './AnalyticsTable';
import { AnalyticsInsights } from './AnalyticsInsights';
import { useDashboardData } from './DashboardDataProvider';

export const DashboardCharts: React.FC = () => {
  const { stats, analyticsData, isLoading } = useDashboardData();

  return (
    <>
      {/* Enhanced Trend Analysis Chart */}
      <div className="bg-gradient-to-br from-white via-orange-50/30 to-amber-50/20 backdrop-blur-sm rounded-xl p-8 shadow-xl border-2 border-orange-100/50 ring-1 ring-black/5">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <H2 className="text-2xl font-bold text-gray-900 tracking-tight">Trend Analysis</H2>
            <Body className="text-gray-600 font-medium">Comprehensive performance metrics over time</Body>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-sm"></div>
            <span className="text-sm font-semibold text-gray-700">Live Data</span>
          </div>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-6 shadow-lg border border-gray-100">
          <SessionTrendsChart isLoading={isLoading} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Enhanced Analytics Dashboard Table */}
        <div className="bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/10 backdrop-blur-sm rounded-xl shadow-xl border-2 border-blue-100/50 ring-1 ring-black/5 overflow-hidden">
          <div className="p-8 border-b border-blue-100/60 bg-gradient-to-r from-blue-50/50 to-indigo-50/30">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <H2 className="text-xl font-bold text-gray-900">Analytics Dashboard</H2>
                <Body className="text-gray-600 text-sm">Detailed performance breakdown</Body>
              </div>
              <div className="px-4 py-2 bg-blue-100/80 rounded-full">
                <span className="text-sm font-bold text-blue-800">
                  {analyticsData?.summary?.total_responses || 0} Responses
                </span>
              </div>
            </div>
          </div>
          <div className="p-6">
            <AnalyticsTable 
              questions={analyticsData?.questions || []}
              categories={analyticsData?.categories || []}
              summary={analyticsData?.summary || {
                total_questions: stats?.total_questions ?? 0,
                total_responses: stats?.total_responses ?? 0,
                overall_avg_score: stats?.avg_session_score ?? 0,
                overall_completion_rate: stats?.completed_sessions && stats?.total_sessions 
                  ? Math.round((stats.completed_sessions / stats.total_sessions) * 100)
                  : 0
              }}
            />
          </div>
        </div>
        
        {/* Enhanced Analytics Insights */}
        <div className="bg-gradient-to-br from-white via-emerald-50/20 to-green-50/10 backdrop-blur-sm rounded-xl shadow-xl border-2 border-emerald-100/50 ring-1 ring-black/5 overflow-hidden">
          <div className="p-8 border-b border-emerald-100/60 bg-gradient-to-r from-emerald-50/50 to-green-50/30">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <H2 className="text-xl font-bold text-gray-900">Smart Insights</H2>
                <Body className="text-gray-600 text-sm">AI-powered performance analysis</Body>
              </div>
              <div className="px-4 py-2 bg-emerald-100/80 rounded-full">
                <span className="text-sm font-bold text-emerald-800">Live Analysis</span>
              </div>
            </div>
          </div>
          <div className="p-6">
            <AnalyticsInsights 
              stats={stats ? {
                total_questions: stats.total_questions,
                total_responses: stats.total_responses,
                total_sessions: stats.total_sessions,
                completed_sessions: stats.completed_sessions,
                active_members: stats.active_members,
                avg_session_score: stats.avg_session_score,
                growth_metrics: stats.growth_metrics || {
                  sessions_this_month: 0,
                  sessions_last_month: 0,
                  growth_rate: null
                }
              } : undefined}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </>
  );
};
