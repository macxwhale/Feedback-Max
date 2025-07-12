
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Settings, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface DashboardWidget {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
}

export const DashboardCustomization: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [widgets, setWidgets] = useState<DashboardWidget[]>([
    { id: 'stats', name: 'Statistics Cards', description: 'Key metrics overview', enabled: true },
    { id: 'activity', name: 'Live Activity Feed', description: 'Real-time activity updates', enabled: true },
    { id: 'analytics', name: 'Analytics Insights', description: 'AI-powered insights', enabled: true },
    { id: 'charts', name: 'Data Visualization', description: 'Charts and graphs', enabled: false },
    { id: 'export', name: 'Quick Export', description: 'Data export shortcuts', enabled: true },
    { id: 'notifications', name: 'Notification Center', description: 'Alert notifications', enabled: true }
  ]);
  
  const [settings, setSettings] = useState({
    autoRefresh: true,
    realTimeUpdates: true,
    compactView: false,
    darkMode: false
  });

  const { toast } = useToast();

  const toggleWidget = (id: string) => {
    setWidgets(prev => 
      prev.map(widget => 
        widget.id === id ? { ...widget, enabled: !widget.enabled } : widget
      )
    );
  };

  const handleSave = () => {
    // In a real implementation, save to user preferences
    toast({
      title: 'Settings Saved',
      description: 'Your dashboard customization has been saved.'
    });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          Customize
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Customize Dashboard</DialogTitle>
          <DialogDescription>
            Configure which widgets and features are visible on your dashboard.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Widget Visibility */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Dashboard Widgets</Label>
            <div className="space-y-3">
              {widgets.map((widget) => (
                <div key={widget.id} className="flex items-start justify-between space-x-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={widget.id}
                        checked={widget.enabled}
                        onCheckedChange={() => toggleWidget(widget.id)}
                      />
                      <Label htmlFor={widget.id} className="font-medium">
                        {widget.name}
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 ml-6">
                      {widget.description}
                    </p>
                  </div>
                  {widget.enabled ? (
                    <Eye className="w-4 h-4 text-green-500 mt-0.5" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-gray-400 mt-0.5" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Dashboard Settings */}
          <div className="space-y-4">
            <Label className="text-base font-medium">Dashboard Settings</Label>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-refresh">Auto Refresh</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically refresh data every minute
                  </p>
                </div>
                <Switch
                  id="auto-refresh"
                  checked={settings.autoRefresh}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, autoRefresh: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="real-time">Real-time Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Show live activity as it happens
                  </p>
                </div>
                <Switch
                  id="real-time"
                  checked={settings.realTimeUpdates}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, realTimeUpdates: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="compact">Compact View</Label>
                  <p className="text-sm text-muted-foreground">
                    Show more data in less space
                  </p>
                </div>
                <Switch
                  id="compact"
                  checked={settings.compactView}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, compactView: checked }))
                  }
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
