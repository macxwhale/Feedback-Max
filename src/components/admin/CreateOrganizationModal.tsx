import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CreateOrganizationData } from '@/services/organizationService.types';

interface CreateOrganizationModalProps {
  onClose: () => void;
  onSubmit: (data: CreateOrganizationData) => void;
}

export const CreateOrganizationModal: React.FC<CreateOrganizationModalProps> = ({
  onClose,
  onSubmit
}) => {
  const [formData, setFormData] = useState<CreateOrganizationData>({
    name: '',
    slug: '',
    domain: '',
    logo_url: '',
    primary_color: '#007ACE',
    secondary_color: '#073763',
    plan_type: 'starter',
    trial_ends_at: '',
    billing_email: '',
    max_responses: 100,
    features_config: undefined,
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [featuresOverride, setFeaturesOverride] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.slug) {
      return;
    }
    let customFeatures = undefined;
    try {
      if (featuresOverride.trim()) customFeatures = JSON.parse(featuresOverride);
    } catch (err) {
      alert("Invalid JSON in Feature Overrides!");
      return;
    }
    onSubmit({
      ...formData,
      features_config: customFeatures,
      trial_ends_at: formData.trial_ends_at ? new Date(formData.trial_ends_at).toISOString() : undefined
    });
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Create New Organization</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Organization Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Enter organization name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="slug">URL Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="url-friendly-name"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Will be accessible at /{formData.slug}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="domain">Custom Domain</Label>
                <Input
                  id="domain"
                  value={formData.domain}
                  onChange={(e) => setFormData(prev => ({ ...prev, domain: e.target.value }))}
                  placeholder="feedback.yourcompany.com"
                />
              </div>
              
              <div>
                <Label htmlFor="billing_email">Billing Email</Label>
                <Input
                  id="billing_email"
                  type="email"
                  value={formData.billing_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, billing_email: e.target.value }))}
                  placeholder="billing@company.com"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="logo_url">Logo URL</Label>
              <Input
                id="logo_url"
                value={formData.logo_url}
                onChange={(e) => setFormData(prev => ({ ...prev, logo_url: e.target.value }))}
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="primary_color">Primary Color</Label>
                <Input
                  id="primary_color"
                  type="color"
                  value={formData.primary_color}
                  onChange={(e) => setFormData(prev => ({ ...prev, primary_color: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="secondary_color">Secondary Color</Label>
                <Input
                  id="secondary_color"
                  type="color"
                  value={formData.secondary_color}
                  onChange={(e) => setFormData(prev => ({ ...prev, secondary_color: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="max_responses">Max Responses</Label>
                <Input
                  id="max_responses"
                  type="number"
                  value={formData.max_responses}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_responses: parseInt(e.target.value) || 100 }))}
                  min="1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="plan_type">Plan Type / Tier</Label>
              <select
                id="plan_type"
                value={formData.plan_type}
                onChange={(e) => setFormData(prev => ({ ...prev, plan_type: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="starter">Starter</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>

            <div>
              <Label htmlFor="trial_ends_at">Trial Ends At</Label>
              <Input
                id="trial_ends_at"
                type="datetime-local"
                value={formData.trial_ends_at || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, trial_ends_at: e.target.value }))}
                placeholder="Trial end date"
              />
            </div>

            <div>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setShowAdvanced(s => !s)}
              >
                {showAdvanced
                  ? "Hide Feature Overrides"
                  : "Show Feature Overrides (Advanced)"}
              </Button>
              {showAdvanced && (
                <div className="mt-2 space-y-1">
                  <Label htmlFor="features_override">Feature Overrides (JSON)</Label>
                  <textarea
                    id="features_override"
                    className="w-full min-h-[120px] border rounded p-2 font-mono text-xs"
                    placeholder='e.g. { "analytics": true, "modules": {"settings": false} }'
                    value={featuresOverride}
                    onChange={(e) => setFeaturesOverride(e.target.value)}
                  />
                  <p className="text-xs text-gray-500">Advanced: Override plan tier settings on a per-feature basis.</p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                Create Organization
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
