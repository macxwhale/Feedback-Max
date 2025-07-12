
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const AdminStats: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [orgsResult, responsesResult, sessionsResult, usersResult] = await Promise.all([
        supabase.from('organizations').select('id, plan_type, is_active, created_at'),
        supabase.from('feedback_responses').select('id, created_at, organization_id'),
        supabase.from('feedback_sessions').select('id, status, created_at, organization_id'),
        supabase.from('admin_users').select('id, created_at'),
      ]);

      return {
        organizations: orgsResult.data || [],
        responses: responsesResult.data || [],
        sessions: sessionsResult.data || [],
        adminUsers: usersResult.data || []
      };
    }
  });

  if (isLoading) {
    return <div className="p-8">Loading statistics...</div>;
  }

  const organizationStats = stats?.organizations.reduce((acc: any, org: any) => {
    acc.total++;
    if (org.is_active) acc.active++;
    acc.plans[org.plan_type || 'free'] = (acc.plans[org.plan_type || 'free'] || 0) + 1;
    return acc;
  }, { total: 0, active: 0, plans: {} }) || { total: 0, active: 0, plans: {} };

  const planData = Object.entries(organizationStats.plans).map(([plan, count]) => ({
    name: plan.toUpperCase(),
    value: count as number,
    color: plan === 'free' ? '#gray' : plan === 'pro' ? '#10b981' : '#8b5cf6'
  }));

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

  const organizationGrowth = stats?.organizations.reduce((acc: any[], org: any) => {
    const month = new Date(org.created_at).toLocaleString('default', { month: 'short', year: '2-digit' });
    const existing = acc.find(item => item.month === month);
    if (existing) {
      existing.organizations++;
    } else {
      acc.push({ month, organizations: 1 });
    }
    return acc;
  }, []) || [];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">System Statistics</h2>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Organizations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{organizationStats.total}</div>
            <p className="text-sm text-green-600">{organizationStats.active} active</p>
          </CardContent>
        </Card>

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
            <div className="text-3xl font-bold">
              {stats?.sessions.filter((s: any) => s.status === 'active').length || 0}
            </div>
            <p className="text-sm text-gray-600">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">System Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.adminUsers.length || 0}</div>
            <p className="text-sm text-gray-600">Admin users</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Plan Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={planData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {planData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Organization Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={organizationGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="organizations" stroke="#007ACE" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

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
    </div>
  );
};
