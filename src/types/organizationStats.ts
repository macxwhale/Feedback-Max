
export interface OrganizationStats {
  total_questions: number;
  total_responses: number;
  total_sessions: number;
  completed_sessions: number;
  active_members: number;
  avg_session_score: number;
  recent_activity: Array<{
    type: string;
    created_at: string;
    status: string;
  }>;
  growth_metrics?: {
    sessions_this_month: number;
    sessions_last_month: number;
    growth_rate: number;
  };
}
