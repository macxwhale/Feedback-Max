
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOrganization } from '@/hooks/useOrganization';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { Plus, Trash2, Upload, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const PhoneNumberManagement: React.FC = () => {
  const { organization } = useOrganization();
  const queryClient = useQueryClient();
  const [newPhoneNumber, setNewPhoneNumber] = useState('');
  const [newName, setNewName] = useState('');
  const [bulkNumbers, setBulkNumbers] = useState('');
  const [showBulkAdd, setShowBulkAdd] = useState(false);

  const { data: phoneNumbers, isLoading } = useQuery({
    queryKey: ['sms-phone-numbers', organization?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sms_phone_numbers')
        .select('*')
        .eq('organization_id', organization!.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!organization?.id
  });

  const addPhoneNumberMutation = useMutation({
    mutationFn: async ({ phoneNumber, name }: { phoneNumber: string; name?: string }) => {
      const { data, error } = await supabase
        .from('sms_phone_numbers')
        .insert({
          organization_id: organization!.id,
          phone_number: phoneNumber.trim(),
          name: name?.trim() || null
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: "Phone number added successfully" });
      setNewPhoneNumber('');
      setNewName('');
      queryClient.invalidateQueries({ queryKey: ['sms-phone-numbers', organization?.id] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error adding phone number", 
        description: error.message, 
        variant: 'destructive' 
      });
    }
  });

  const bulkAddMutation = useMutation({
    mutationFn: async (phoneNumbers: Array<{ phoneNumber: string; name?: string }>) => {
      const { data, error } = await supabase
        .from('sms_phone_numbers')
        .insert(
          phoneNumbers.map(({ phoneNumber, name }) => ({
            organization_id: organization!.id,
            phone_number: phoneNumber.trim(),
            name: name?.trim() || null
          }))
        );
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({ title: "Phone numbers added successfully" });
      setBulkNumbers('');
      setShowBulkAdd(false);
      queryClient.invalidateQueries({ queryKey: ['sms-phone-numbers', organization?.id] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error adding phone numbers", 
        description: error.message, 
        variant: 'destructive' 
      });
    }
  });

  const deletePhoneNumberMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('sms_phone_numbers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Phone number removed successfully" });
      queryClient.invalidateQueries({ queryKey: ['sms-phone-numbers', organization?.id] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error removing phone number", 
        description: error.message, 
        variant: 'destructive' 
      });
    }
  });

  const handleAddPhoneNumber = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhoneNumber.trim()) return;
    
    addPhoneNumberMutation.mutate({
      phoneNumber: newPhoneNumber,
      name: newName
    });
  };

  const handleBulkAdd = () => {
    const lines = bulkNumbers.split('\n').filter(line => line.trim());
    const phoneNumbers = lines.map(line => {
      const parts = line.split(',').map(p => p.trim());
      return {
        phoneNumber: parts[0],
        name: parts[1] || undefined
      };
    }).filter(item => item.phoneNumber);

    if (phoneNumbers.length === 0) {
      toast({ 
        title: "No valid phone numbers found", 
        description: "Please enter at least one phone number",
        variant: 'destructive' 
      });
      return;
    }

    bulkAddMutation.mutate(phoneNumbers);
  };

  const formatPhoneNumber = (phoneNumber: string) => {
    // Simple formatting for display
    if (phoneNumber.startsWith('+')) return phoneNumber;
    return `+${phoneNumber}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Phone Numbers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Phone Numbers ({phoneNumbers?.length || 0})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add Single Phone Number */}
        <form onSubmit={handleAddPhoneNumber} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="phone-number">Phone Number *</Label>
              <Input
                id="phone-number"
                value={newPhoneNumber}
                onChange={(e) => setNewPhoneNumber(e.target.value)}
                placeholder="+1234567890"
                required
              />
            </div>
            <div>
              <Label htmlFor="name">Name (Optional)</Label>
              <Input
                id="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="John Doe"
              />
            </div>
            <div className="flex items-end">
              <Button 
                type="submit" 
                disabled={addPhoneNumberMutation.isPending}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Number
              </Button>
            </div>
          </div>
        </form>

        {/* Bulk Add Toggle */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowBulkAdd(!showBulkAdd)}
          >
            <Upload className="w-4 h-4 mr-2" />
            Bulk Add
          </Button>
        </div>

        {/* Bulk Add Form */}
        {showBulkAdd && (
          <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
            <div>
              <Label htmlFor="bulk-numbers">Bulk Add Phone Numbers</Label>
              <Textarea
                id="bulk-numbers"
                value={bulkNumbers}
                onChange={(e) => setBulkNumbers(e.target.value)}
                placeholder="Enter phone numbers, one per line. Format: +1234567890 or +1234567890,John Doe"
                rows={6}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Format: One phone number per line. Optionally add name after comma.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleBulkAdd}
                disabled={bulkAddMutation.isPending}
              >
                Add All Numbers
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowBulkAdd(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Phone Numbers List */}
        {phoneNumbers && phoneNumbers.length > 0 ? (
          <div className="space-y-2">
            <h4 className="font-medium">Registered Phone Numbers</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {phoneNumbers.map((phone) => (
                <div key={phone.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{formatPhoneNumber(phone.phone_number)}</div>
                    {phone.name && (
                      <div className="text-sm text-muted-foreground">{phone.name}</div>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={phone.status === 'active' ? 'default' : 'secondary'}>
                        {phone.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Added {new Date(phone.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deletePhoneNumberMutation.mutate(phone.id)}
                    disabled={deletePhoneNumberMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center p-8 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No phone numbers added yet.</p>
            <p className="text-sm">Add phone numbers to start sending SMS campaigns.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
