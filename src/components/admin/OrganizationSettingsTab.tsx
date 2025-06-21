
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Palette } from 'lucide-react';

interface OrganizationSettingsTabProps {
  organization: {
    id: string;
    name: string;
    slug: string;
    primary_color: string;
    secondary_color: string;
    feedback_header_title?: string;
    feedback_header_subtitle?: string;
    welcome_screen_title?: string;
    welcome_screen_description?: string;
    thank_you_title?: string;
    thank_you_message?: string;
    sms_enabled?: boolean;
    sms_sender_id?: string;
    is_active?: boolean;
  };
}

export const OrganizationSettingsTab: React.FC<OrganizationSettingsTabProps> = ({ organization }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: organization.name || '',
    primary_color: organization.primary_color || '#007ACE',
    secondary_color: organization.secondary_color || '#073763',
    feedback_header_title: organization.feedback_header_title || 'Customer Feedback',
    feedback_header_subtitle: organization.feedback_header_subtitle || 'We value your feedback',
    welcome_screen_title: organization.welcome_screen_title || 'Welcome',
    welcome_screen_description: organization.welcome_screen_description || 'Please share your feedback with us',
    thank_you_title: organization.thank_you_title || 'Thank You!',
    thank_you_message: organization.thank_you_message || 'Your feedback has been submitted successfully',
    sms_enabled: organization.sms_enabled || false,
    sms_sender_id: organization.sms_sender_id || '',
    is_active: organization.is_active !== false,
  });

  const updateOrganizationMutation = useMutation({
    mutationFn: async (updatedData: typeof formData) => {
      const { data, error } = await supabase
        .from('organizations')
        .update(updatedData)
        .eq('id', organization.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Settings Updated',
        description: 'Organization settings have been saved successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['organization'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: 'Failed to update organization settings. Please try again.',
        variant: 'destructive',
      });
      console.error('Error updating organization:', error);
    },
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateOrganizationMutation.mutate(formData);
  };

  const resetForm = () => {
    setFormData({
      name: organization.name || '',
      primary_color: organization.primary_color || '#007ACE',
      secondary_color: organization.secondary_color || '#073763',
      feedback_header_title: organization.feedback_header_title || 'Customer Feedback',
      feedback_header_subtitle: organization.feedback_header_subtitle || 'We value your feedback',
      welcome_screen_title: organization.welcome_screen_title || 'Welcome',
      welcome_screen_description: organization.welcome_screen_description || 'Please share your feedback with us',
      thank_you_title: organization.thank_you_title || 'Thank You!',
      thank_you_message: organization.thank_you_message || 'Your feedback has been submitted successfully',
      sms_enabled: organization.sms_enabled || false,
      sms_sender_id: organization.sms_sender_id || '',
      is_active: organization.is_active !== false,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Organization Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Organization Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter organization name"
                  />
                </div>
                <div>
                  <Label htmlFor="slug">Organization Slug</Label>
                  <Input
                    id="slug"
                    value={organization.slug}
                    className="bg-gray-50"
                    readOnly
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    The slug cannot be changed after creation
                  </p>
                </div>
              </div>
            </div>

            {/* Brand Colors */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Brand Colors</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="primary_color">Primary Color</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="primary_color"
                      type="color"
                      value={formData.primary_color}
                      onChange={(e) => handleInputChange('primary_color', e.target.value)}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={formData.primary_color}
                      onChange={(e) => handleInputChange('primary_color', e.target.value)}
                      placeholder="#007ACE"
                      className="flex-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="secondary_color">Secondary Color</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="secondary_color"
                      type="color"
                      value={formData.secondary_color}
                      onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={formData.secondary_color}
                      onChange={(e) => handleInputChange('secondary_color', e.target.value)}
                      placeholder="#073763"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Feedback Form Text */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Feedback Form Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="feedback_header_title">Header Title</Label>
                  <Input
                    id="feedback_header_title"
                    value={formData.feedback_header_title}
                    onChange={(e) => handleInputChange('feedback_header_title', e.target.value)}
                    placeholder="Customer Feedback"
                  />
                </div>
                <div>
                  <Label htmlFor="feedback_header_subtitle">Header Subtitle</Label>
                  <Input
                    id="feedback_header_subtitle"
                    value={formData.feedback_header_subtitle}
                    onChange={(e) => handleInputChange('feedback_header_subtitle', e.target.value)}
                    placeholder="We value your feedback"
                  />
                </div>
              </div>
            </div>

            {/* Welcome Screen */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Welcome Screen</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="welcome_screen_title">Welcome Title</Label>
                  <Input
                    id="welcome_screen_title"
                    value={formData.welcome_screen_title}
                    onChange={(e) => handleInputChange('welcome_screen_title', e.target.value)}
                    placeholder="Welcome"
                  />
                </div>
                <div>
                  <Label htmlFor="thank_you_title">Thank You Title</Label>
                  <Input
                    id="thank_you_title"
                    value={formData.thank_you_title}
                    onChange={(e) => handleInputChange('thank_you_title', e.target.value)}
                    placeholder="Thank You!"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="welcome_screen_description">Welcome Description</Label>
                <Textarea
                  id="welcome_screen_description"
                  value={formData.welcome_screen_description}
                  onChange={(e) => handleInputChange('welcome_screen_description', e.target.value)}
                  placeholder="Please share your feedback with us"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="thank_you_message">Thank You Message</Label>
                <Textarea
                  id="thank_you_message"
                  value={formData.thank_you_message}
                  onChange={(e) => handleInputChange('thank_you_message', e.target.value)}
                  placeholder="Your feedback has been submitted successfully"
                  rows={3}
                />
              </div>
            </div>

            {/* SMS Settings */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">SMS Configuration</h3>
              <div className="flex items-center space-x-2">
                <Switch
                  id="sms_enabled"
                  checked={formData.sms_enabled}
                  onCheckedChange={(checked) => handleInputChange('sms_enabled', checked)}
                />
                <Label htmlFor="sms_enabled">Enable SMS Feedback Collection</Label>
              </div>
              {formData.sms_enabled && (
                <div>
                  <Label htmlFor="sms_sender_id">SMS Sender ID</Label>
                  <Input
                    id="sms_sender_id"
                    value={formData.sms_sender_id}
                    onChange={(e) => handleInputChange('sms_sender_id', e.target.value)}
                    placeholder="Enter SMS sender ID"
                  />
                </div>
              )}
            </div>

            {/* Organization Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Organization Status</h3>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleInputChange('is_active', checked)}
                />
                <Label htmlFor="is_active">Organization Active</Label>
              </div>
              <p className="text-sm text-gray-500">
                Inactive organizations cannot collect feedback
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-6 border-t">
              <Button 
                type="button" 
                variant="outline" 
                onClick={resetForm}
                disabled={updateOrganizationMutation.isPending}
              >
                Reset Changes
              </Button>
              <Button 
                type="submit" 
                disabled={updateOrganizationMutation.isPending}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {updateOrganizationMutation.isPending ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
