import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { updateOrganization } from "@/services/organizationService";
import type { Organization } from "@/services/organizationService.types";
import { useToast } from "@/components/ui/use-toast";

interface EditOrganizationModalProps {
  open: boolean;
  onClose: () => void;
  organization: Organization;
  onSave: (org: Organization) => void; // Notify parent of update
}

export const EditOrganizationModal: React.FC<EditOrganizationModalProps> = ({
  open,
  onClose,
  organization,
  onSave
}) => {
  const [tab, setTab] = useState("basic");
  const [form, setForm] = useState({
    name: organization.name || "",
    slug: organization.slug || "",
    domain: organization.domain || "",
    logo_url: organization.logo_url || "",
    primary_color: organization.primary_color || "#007ACE",
    secondary_color: organization.secondary_color || "#073763",
    billing_email: organization.billing_email || "",
    max_responses: organization.max_responses || 100,
    plan_type: organization.plan_type || "starter",
    trial_ends_at: organization.trial_ends_at ? organization.trial_ends_at.substring(0, 16) : "",
    features_config: organization.features_config ? JSON.stringify(organization.features_config, null, 2) : "",
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  function handleInput(name: string, value: any) {
    setForm(f => ({ ...f, [name]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    let features_config_json = undefined;
    try {
      if (form.features_config.trim()) {
        features_config_json = JSON.parse(form.features_config);
      }
    } catch {
      toast({ title: "Invalid JSON in Features Config", variant: "destructive" });
      setSaving(false);
      return;
    }
    const updates: Partial<Organization> = {
      name: form.name,
      slug: form.slug,
      domain: form.domain,
      logo_url: form.logo_url,
      primary_color: form.primary_color,
      secondary_color: form.secondary_color,
      billing_email: form.billing_email,
      max_responses: Number(form.max_responses),
      plan_type: form.plan_type,
      trial_ends_at: form.trial_ends_at ? new Date(form.trial_ends_at).toISOString() : undefined,
      features_config: features_config_json,
    };
    const updated = await updateOrganization(organization.id, updates);
    setSaving(false);
    if (updated) {
      toast({ title: "Organization updated!" });
      onSave(updated);
      onClose();
    } else {
      toast({ title: "Failed to update organization", variant: "destructive" });
    }
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit Organization</DialogTitle>
        </DialogHeader>
        <Tabs value={tab} onValueChange={setTab} className="mt-2">
          <TabsList className="w-full grid grid-cols-3 mb-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="plan">Plan & Limits</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
          </TabsList>
          <form onSubmit={handleSave}>
            <TabsContent value="basic" className="space-y-3">
              <div>
                <Label>Name</Label>
                <Input value={form.name} onChange={e => handleInput("name", e.target.value)} required />
              </div>
              <div>
                <Label>Slug</Label>
                <Input value={form.slug} onChange={e => handleInput("slug", e.target.value)} required />
              </div>
              <div>
                <Label>Domain</Label>
                <Input value={form.domain} onChange={e => handleInput("domain", e.target.value)} />
              </div>
              <div>
                <Label>Logo URL</Label>
                <Input value={form.logo_url} onChange={e => handleInput("logo_url", e.target.value)} />
              </div>
              <div className="flex gap-2">
                <div>
                  <Label>Primary Color</Label>
                  <Input type="color" value={form.primary_color} onChange={e => handleInput("primary_color", e.target.value)} />
                </div>
                <div>
                  <Label>Secondary Color</Label>
                  <Input type="color" value={form.secondary_color} onChange={e => handleInput("secondary_color", e.target.value)} />
                </div>
              </div>
              <div>
                <Label>Billing Email</Label>
                <Input value={form.billing_email} onChange={e => handleInput("billing_email", e.target.value)} type="email" />
              </div>
            </TabsContent>
            <TabsContent value="plan" className="space-y-3">
              <div>
                <Label>Plan Type</Label>
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  value={form.plan_type}
                  onChange={e => handleInput("plan_type", e.target.value)}
                >
                  <option value="starter">Starter</option>
                  <option value="pro">Pro</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
              <div>
                <Label>Trial Ends At</Label>
                <Input type="datetime-local" value={form.trial_ends_at} onChange={e => handleInput("trial_ends_at", e.target.value)} />
              </div>
              <div>
                <Label>Max Responses</Label>
                <Input type="number" value={form.max_responses} min={1} onChange={e => handleInput("max_responses", e.target.value)} />
              </div>
            </TabsContent>
            <TabsContent value="features" className="space-y-3">
              <div>
                <Label>Features Config Override (JSON)</Label>
                <textarea
                  className="w-full font-mono border rounded min-h-[120px] p-2 text-xs"
                  value={form.features_config}
                  onChange={e => handleInput("features_config", e.target.value)}
                  placeholder={`{ "analytics": true, "modules": {"settings": false} }`}
                />
                <p className="text-xs text-gray-500">Advanced: Override default plan features.</p>
              </div>
            </TabsContent>
            <div className="flex justify-end gap-2 mt-6">
              <Button type="button" variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
