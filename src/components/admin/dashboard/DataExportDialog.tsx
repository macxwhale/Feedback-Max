
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, FileText, FileSpreadsheet, Calendar } from 'lucide-react';
import { useAnalyticsTableData } from '@/hooks/useAnalyticsTableData';
import { toast } from 'sonner';

interface DataExportDialogProps {
  organizationId: string;
  trigger?: React.ReactNode;
}

export const DataExportDialog: React.FC<DataExportDialogProps> = ({
  organizationId,
  trigger
}) => {
  const [open, setOpen] = useState(false);
  const [exportType, setExportType] = useState<'csv' | 'json'>('csv');
  const [dateRange, setDateRange] = useState<'all' | '30d' | '7d'>('30d');
  const [includeData, setIncludeData] = useState({
    responses: true,
    sessions: true,
    questions: true,
    analytics: true
  });
  const [isExporting, setIsExporting] = useState(false);

  const { data: analyticsData } = useAnalyticsTableData(organizationId);

  const handleExport = async () => {
    if (!analyticsData) {
      toast.error('No data available to export');
      return;
    }

    setIsExporting(true);
    
    try {
      const exportData: any = {};
      
      // Include selected data types
      if (includeData.analytics) {
        exportData.summary = analyticsData.summary;
        exportData.trendData = analyticsData.trendData;
      }
      
      if (includeData.questions) {
        exportData.questions = analyticsData.questions;
      }
      
      if (includeData.sessions) {
        exportData.sessionMetrics = {
          totalSessions: analyticsData.summary.total_sessions,
          completedSessions: analyticsData.summary.completed_sessions,
          completionRate: analyticsData.summary.overall_completion_rate,
          averageScore: analyticsData.summary.avg_score
        };
      }

      // Generate timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      
      if (exportType === 'csv') {
        // Convert to CSV format
        const csvData = [
          ['Export Date', new Date().toISOString()],
          ['Organization ID', organizationId],
          ['Date Range', dateRange],
          [''],
          ['Summary Metrics'],
          ['Metric', 'Value', 'Description'],
          ['Total Questions', analyticsData.summary.total_questions, 'Active questions in organization'],
          ['Total Responses', analyticsData.summary.total_responses, 'All responses collected'],
          ['Total Sessions', analyticsData.summary.total_sessions, 'All feedback sessions'],
          ['Completed Sessions', analyticsData.summary.completed_sessions, 'Successfully completed sessions'],
          ['Completion Rate', `${analyticsData.summary.overall_completion_rate}%`, 'Session completion percentage'],
          ['User Satisfaction', `${analyticsData.summary.user_satisfaction_rate}%`, 'Users rating 4+ stars'],
          ['Average Score', analyticsData.summary.avg_score, 'Average session score'],
          ['Growth Rate', `${analyticsData.summary.growth_rate}%`, 'Month-over-month growth'],
          ['Response Rate', `${analyticsData.summary.response_rate}%`, 'Response collection efficiency'],
          [''],
          ['Question Performance'],
          ['Question', 'Category', 'Responses', 'Completion Rate', 'Avg Score', 'Trend']
        ];

        // Add question data
        analyticsData.questions.forEach(q => {
          csvData.push([
            q.question_text,
            q.category,
            q.total_responses.toString(),
            `${q.completion_rate}%`,
            q.avg_score.toString(),
            q.trend
          ]);
        });

        const csvContent = csvData.map(row => 
          row.map(cell => `"${cell.toString().replace(/"/g, '""')}"`).join(',')
        ).join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `analytics-export-${timestamp}.csv`;
        link.click();
        URL.revokeObjectURL(url);
      } else {
        // JSON export
        const jsonContent = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `analytics-export-${timestamp}.json`;
        link.click();
        URL.revokeObjectURL(url);
      }
      
      toast.success('Export completed successfully');
      setOpen(false);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export Data</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5" />
            <span>Export Analytics Data</span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="export-type">Export Format</Label>
            <Select value={exportType} onValueChange={(value: 'csv' | 'json') => setExportType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4" />
                    <span>CSV (Excel compatible)</span>
                  </div>
                </SelectItem>
                <SelectItem value="json">
                  <div className="flex items-center space-x-2">
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>JSON (Raw data)</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date-range">Date Range</Label>
            <Select value={dateRange} onValueChange={(value: 'all' | '30d' | '7d') => setDateRange(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Include Data Types</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="analytics"
                  checked={includeData.analytics}
                  onCheckedChange={(checked) => 
                    setIncludeData(prev => ({ ...prev, analytics: checked as boolean }))
                  }
                />
                <Label htmlFor="analytics" className="text-sm">Analytics Summary</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="questions"
                  checked={includeData.questions}
                  onCheckedChange={(checked) => 
                    setIncludeData(prev => ({ ...prev, questions: checked as boolean }))
                  }
                />
                <Label htmlFor="questions" className="text-sm">Question Performance</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sessions"
                  checked={includeData.sessions}
                  onCheckedChange={(checked) => 
                    setIncludeData(prev => ({ ...prev, sessions: checked as boolean }))
                  }
                />
                <Label htmlFor="sessions" className="text-sm">Session Metrics</Label>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? 'Exporting...' : 'Export Data'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
