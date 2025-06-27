
import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Code, Zap } from 'lucide-react';

interface FlaskWrapperToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  isLoading?: boolean;
}

export const FlaskWrapperToggle: React.FC<FlaskWrapperToggleProps> = ({
  enabled,
  onToggle,
  isLoading = false
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="w-5 h-5" />
          SMS Integration Method
        </CardTitle>
        <CardDescription>
          Choose between direct Africa's Talking integration or Flask wrapper API
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="flask-wrapper" className="text-base">
              Use Flask Wrapper API
            </Label>
            <p className="text-sm text-muted-foreground">
              {enabled 
                ? "Using Flask wrapper for SMS delivery" 
                : "Using direct Africa's Talking integration"
              }
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="flask-wrapper" className="text-sm text-muted-foreground">
              Direct
            </Label>
            <Switch
              id="flask-wrapper"
              checked={enabled}
              onCheckedChange={onToggle}
              disabled={isLoading}
            />
            <Label htmlFor="flask-wrapper" className="text-sm text-muted-foreground">
              Flask
            </Label>
            {enabled && <Zap className="w-4 h-4 text-orange-500" />}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
