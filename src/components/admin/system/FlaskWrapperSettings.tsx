
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Settings, Save, TestTube } from 'lucide-react';

export const FlaskWrapperSettings: React.FC = () => {
  const [flaskUrl, setFlaskUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    loadFlaskUrl();
  }, []);

  const loadFlaskUrl = async () => {
    try {
      console.log('Loading Flask wrapper URL...');
      const { data, error } = await supabase
        .from('system_settings')
        .select('setting_value')
        .eq('setting_key', 'flask_sms_wrapper_base_url')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading Flask URL:', error);
        toast({
          title: "Error",
          description: "Failed to load Flask wrapper URL",
          variant: "destructive"
        });
        return;
      }

      console.log('Flask URL loaded:', data?.setting_value);
      setFlaskUrl(data?.setting_value || '');
    } catch (error) {
      console.error('Error loading Flask URL:', error);
    } finally {
      setInitialLoad(false);
    }
  };

  const saveFlaskUrl = async () => {
    setLoading(true);
    try {
      console.log('Saving Flask wrapper URL:', flaskUrl);
      
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          setting_key: 'flask_sms_wrapper_base_url',
          setting_value: flaskUrl.trim(),
          description: 'Base URL for the Flask SMS wrapper API'
        }, {
          onConflict: 'setting_key'
        });

      if (error) {
        console.error('Error saving Flask URL:', error);
        throw error;
      }

      console.log('Flask URL saved successfully');
      toast({
        title: "Success",
        description: "Flask wrapper URL saved successfully"
      });
    } catch (error) {
      console.error('Error saving Flask URL:', error);
      toast({
        title: "Error",
        description: `Failed to save Flask wrapper URL: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    if (!flaskUrl.trim()) {
      toast({
        title: "Error",
        description: "Please enter a Flask wrapper URL first",
        variant: "destructive"
      });
      return;
    }

    setTesting(true);
    try {
      const testUrl = flaskUrl.trim().replace(/\/$/, '') + '/health';
      console.log('Testing Flask connection to:', testUrl);
      
      const response = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Flask test response:', response.status, response.statusText);

      if (response.ok) {
        toast({
          title: "Success",
          description: "Flask wrapper API is reachable"
        });
      } else {
        toast({
          title: "Warning",
          description: `Flask wrapper returned status: ${response.status}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error testing Flask connection:', error);
      toast({
        title: "Error",
        description: "Failed to connect to Flask wrapper API. Check the URL and try again.",
        variant: "destructive"
      });
    } finally {
      setTesting(false);
    }
  };

  if (initialLoad) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Flask SMS Wrapper Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-10 bg-gray-200 rounded mb-4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Flask SMS Wrapper Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="flask-url">Flask Wrapper Base URL</Label>
          <Input
            id="flask-url"
            type="url"
            placeholder="http://localhost:5000 or https://your-flask-api.com"
            value={flaskUrl}
            onChange={(e) => setFlaskUrl(e.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            The base URL for your Flask SMS wrapper API (without trailing slash)
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={saveFlaskUrl}
            disabled={loading}
            className="flex-1"
          >
            <Save className="w-4 h-4 mr-2" />
            {loading ? 'Saving...' : 'Save URL'}
          </Button>
          
          <Button
            onClick={testConnection}
            disabled={testing || !flaskUrl.trim()}
            variant="outline"
          >
            <TestTube className="w-4 h-4 mr-2" />
            {testing ? 'Testing...' : 'Test Connection'}
          </Button>
        </div>

        {flaskUrl && (
          <div className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">
            <p className="font-medium">Expected endpoints:</p>
            <ul className="mt-1 space-y-1">
              <li>• POST {flaskUrl}/send-sms - Send SMS messages</li>
              <li>• GET {flaskUrl}/health - Health check (optional)</li>
            </ul>
            <p className="mt-2 font-medium">Required headers:</p>
            <ul className="mt-1 space-y-1">
              <li>• Content-Type: application/json</li>
              <li>• X-Signature: HMAC-SHA256 signature for verification</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
