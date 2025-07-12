
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { supabase } from '@/integrations/supabase/client';

interface OrganizationSpecificStatsProps {
  organizationId: string;
}

export const OrganizationSpecificStats: React.FC<OrganizationSpecificStatsProps> = ({ organizationId }) => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['organization-specific-stats', organizationId],
    queryFn: async () => {
      const [responsesResult, sessionsResult, membersResult] = await Promise.all([
        supabase
          .from('feedback_responses')
          .select('id, created_at, score')
          .eq('organization_id', organizationId),
        supabase
          .from('feedback_sessions')
          .select('id, status, created_at, total_score')
          .eq('organization_id', organizationId),
        supabase
          .from('organization_users')
          .select('id, created_at, status')
          .eq('organization_id', organizationId)
      ]);

      return {
        responses: responsesResult.data || [],
        sessions: sessionsResult.data || [],
        members: membersResult.data || []
      };
    },
    enabled: !!organizationId
  });

  if (isLoading) {
    return <div className="p-8">Loading organization statistics...</div>;
  }

  const activeSessions = stats?.sessions.filter((s: any) => s.status === 'active').length || 0;
  const completedSessions = stats?.sessions.filter((s: any) => s.status === 'completed').length || 0;
  const activeMembers = stats?.members.filter((m: any) => m.status === 'active').length || 0;

  // Monthly response trends
  const monthlyData = stats?.responses.reduce((acc: any[], response: any) => {
    const month = new Date(response.created_at).toLocaleString('default', { month: 'short', year: '2-digit' });
    const existing = acc.find(item => item.month === month);
    if (existing) {
      existing.responses++;
    } else {
      acc.push({ month, responses: 1 });
    }
    return acc;
  }, []) || [];

  // Session completion trends
  const sessionTrends = stats?.sessions.reduce((acc: any[], session: any) => {
    const month = new Date(session.created_at).toLocaleString('default', { month: 'short', year: '2-digit' });
    const existing = acc.find(item => item.month === month);
    if (existing) {
      existing.sessions++;
      if (session.status === 'completed') {
        existing.completed++;
      }
    } else {
      acc.push({ 
        month, 
        sessions: 1, 
        completed: session.status === 'completed' ? 1 : 0 
      });
    }
    return acc;
  }, []) || [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Organization Analytics</h2>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Responses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.responses.length || 0}</div>
            <p className="text-sm text-gray-600">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Active Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{activeSessions}</div>
            <p className="text-sm text-gray-600">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Completed Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{completedSessions}</div>
            <p className="text-sm text-gray-600">Total completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{activeMembers}</div>
            <p className="text-sm text-gray-600">Active members</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Response Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="responses" fill="#007ACE" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Session Completion Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={sessionTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="sessions" stroke="#007ACE" strokeWidth={2} name="Total Sessions" />
                <Line type="monotone" dataKey="completed" stroke="#10b981" strokeWidth={2} name="Completed" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
