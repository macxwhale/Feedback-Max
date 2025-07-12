
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageSquare, 
  Send, 
  Brain, 
  TrendingUp,
  Users,
  AlertCircle,
  Lightbulb,
  BarChart3
} from 'lucide-react';

interface ConversationalAnalyticsProps {
  organizationId: string;
}

export const ConversationalAnalytics: React.FC<ConversationalAnalyticsProps> = ({
  organizationId
}) => {
  const [query, setQuery] = useState('');
  const [conversation, setConversation] = useState([
    {
      id: 1,
      type: 'user',
      message: 'What are the main issues customers are facing?',
      timestamp: '10:30 AM'
    },
    {
      id: 2,
      type: 'ai',
      message: 'Based on the latest feedback data, the top 3 customer issues are:\n\n1. **Long wait times** (mentioned in 34% of negative feedback)\n2. **Product availability** (mentioned in 28% of feedback)\n3. **Staff responsiveness** (mentioned in 22% of feedback)\n\nWould you like me to analyze any specific aspect in more detail?',
      timestamp: '10:30 AM',
      insights: [
        { type: 'trend', text: 'Wait times increased 15% this month' },
        { type: 'action', text: 'Recommend implementing callback system' }
      ]
    },
    {
      id: 3,
      type: 'user',
      message: 'Show me the trend for customer satisfaction over the last 3 months',
      timestamp: '10:32 AM'
    },
    {
      id: 4,
      type: 'ai',
      message: 'Here\'s the customer satisfaction trend for the last 3 months:\n\n📈 **Satisfaction Trend Analysis:**\n- **Month 1**: 3.8/5 (baseline)\n- **Month 2**: 4.1/5 (+7.9% improvement)\n- **Month 3**: 4.2/5 (+2.4% improvement)\n\n**Key Insights:**\n- Overall upward trend (+10.5% total improvement)\n- Satisfaction peaked mid-Month 2 after implementing staff training\n- Slight plateau in Month 3 suggests need for new initiatives\n\n**Recommendations:**\n- Continue staff training programs\n- Focus on reducing wait times for next improvement boost',
      timestamp: '10:32 AM',
      insights: [
        { type: 'success', text: '10.5% improvement over 3 months' },
        { type: 'warning', text: 'Growth rate slowing in Month 3' }
      ]
    }
  ]);

  const [isLoading, setIsLoading] = useState(false);

  const quickQuestions = [
    'What are the top customer complaints this week?',
    'How is our satisfaction score trending?',
    'Which department needs immediate attention?',
    'What improvements should we prioritize?',
    'Show me customer sentiment analysis',
    'Compare this month vs last month performance'
  ];

  const handleSendQuery = async () => {
    if (!query.trim()) return;

    const userMessage = {
      id: conversation.length + 1,
      type: 'user' as const,
      message: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setConversation(prev => [...prev, userMessage]);
    setQuery('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(query);
      setConversation(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 2000);
  };

  const generateAIResponse = (userQuery: string) => {
    const responses = {
      'complaints': {
        message: 'The top customer complaints this week are:\n\n1. **Service Speed** (42% of complaints)\n   - Average wait time: 8.5 minutes\n   - Target: 5 minutes\n   - Impact: High\n\n2. **Product Knowledge** (31% of complaints)\n   - Staff training completion: 67%\n   - Recommended action: Additional training sessions\n\n3. **System Downtime** (27% of complaints)\n   - 3 incidents this week\n   - Total downtime: 45 minutes\n   - Next maintenance: Scheduled for weekend',
        insights: [
          { type: 'critical', text: 'Service speed complaints up 23%' },
          { type: 'action', text: 'Schedule staff training for next week' }
        ]
      },
      'default': {
        message: `I've analyzed your query about "${userQuery}". Here are the key insights:\n\n📊 **Current Status:**\n- Customer satisfaction: 4.2/5\n- Response rate: 87%\n- Average resolution time: 2.3 days\n\n💡 **Recommendations:**\n- Focus on the top 3 issues identified\n- Implement suggested improvements\n- Monitor trends weekly\n\nWould you like me to dive deeper into any specific area?`,
        insights: [
          { type: 'info', text: 'Analysis based on latest 247 responses' },
          { type: 'trend', text: 'Overall satisfaction trending upward' }
        ]
      }
    };

    const responseKey = userQuery.toLowerCase().includes('complaint') ? 'complaints' : 'default';
    const response = responses[responseKey];

    return {
      id: conversation.length + 2,
      type: 'ai' as const,
      message: response.message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      insights: response.insights
    };
  };

  const handleQuickQuestion = (question: string) => {
    setQuery(question);
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trend': return <TrendingUp className="w-4 h-4" />;
      case 'action': return <Lightbulb className="w-4 h-4" />;
      case 'success': return <BarChart3 className="w-4 h-4" />;
      case 'warning': return <AlertCircle className="w-4 h-4" />;
      case 'critical': return <AlertCircle className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'action': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">AI Analytics Assistant</h2>
        <Badge variant="outline" className="flex items-center space-x-1">
          <Brain className="w-4 h-4" />
          <span>Powered by AI</span>
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5" />
                <span>Analytics Conversation</span>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-[450px] p-4">
                <div className="space-y-4">
                  {conversation.map(msg => (
                    <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] p-3 rounded-lg ${
                        msg.type === 'user' 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <div className="whitespace-pre-wrap text-sm">{msg.message}</div>
                        <div className="text-xs mt-2 opacity-75">{msg.timestamp}</div>
                        
                        {msg.type === 'ai' && msg.insights && (
                          <div className="mt-3 space-y-2">
                            {msg.insights.map((insight, index) => (
                              <div key={index} className={`p-2 rounded border text-xs ${getInsightColor(insight.type)}`}>
                                <div className="flex items-center space-x-1">
                                  {getInsightIcon(insight.type)}
                                  <span>{insight.text}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 text-gray-900 p-3 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <span className="text-sm">AI is analyzing your question...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
            
            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask me anything about your customer feedback..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendQuery()}
                  className="flex-1"
                />
                <Button onClick={handleSendQuery} disabled={!query.trim() || isLoading}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions & Insights */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {quickQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-left h-auto p-3"
                    onClick={() => handleQuickQuestion(question)}
                  >
                    <span className="text-xs">{question}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Capabilities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Trend Analysis</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="text-sm">Customer Segmentation</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Lightbulb className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm">Smart Recommendations</span>
                </div>
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-purple-600" />
                  <span className="text-sm">Predictive Analytics</span>
                </div>
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span className="text-sm">Risk Detection</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-2 bg-green-50 border border-green-200 rounded text-xs">
                  <div className="flex items-center space-x-1 text-green-700">
                    <TrendingUp className="w-3 h-3" />
                    <span>Satisfaction up 5% this week</span>
                  </div>
                </div>
                <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                  <div className="flex items-center space-x-1 text-yellow-700">
                    <AlertCircle className="w-3 h-3" />
                    <span>Response time increased 12%</span>
                  </div>
                </div>
                <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                  <div className="flex items-center space-x-1 text-blue-700">
                    <Lightbulb className="w-3 h-3" />
                    <span>New improvement opportunity identified</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
