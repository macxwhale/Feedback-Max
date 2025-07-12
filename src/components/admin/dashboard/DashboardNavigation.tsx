
interface DashboardNavigationProps {
  setActiveTab: (tab: string) => void;
}

export const useDashboardNavigation = ({ setActiveTab }: DashboardNavigationProps) => {
  const handleNavigate = (url: string) => {
    // Simple URL to tab mapping
    if (url.includes('members')) setActiveTab('members');
    else if (url.includes('questions')) setActiveTab('questions');
    else if (url.includes('feedback')) setActiveTab('feedback');
    else if (url.includes('inbox')) setActiveTab('inbox');
    else if (url.includes('settings')) setActiveTab('settings');
  };

  const getTabLabel = (tabId: string) => {
    const tabMap: Record<string, string> = {
      overview: 'Overview',
      members: 'Members',
      feedback: 'Feedback Analytics',
      inbox: 'Feedback Inbox',
      questions: 'Questions Management',
      settings: 'Settings'
    };
    return tabMap[tabId] || 'Dashboard';
  };

  const handleQuickActions = {
    onCreateQuestion: () => setActiveTab('questions'),
    onViewSettings: () => setActiveTab('settings'),
    onInviteUser: () => { /* Functionality removed */ },
    onExportData: () => { /* Functionality removed */ },
  };

  return {
    handleNavigate,
    getTabLabel,
    handleQuickActions
  };
};
