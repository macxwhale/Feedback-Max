
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOrganization } from '@/hooks/useOrganization';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Upload, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { PhoneNumberForm } from './components/PhoneNumberForm';
import { BulkAddForm } from './components/BulkAddForm';
import { PhoneNumbersList } from './components/PhoneNumbersList';

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
        <PhoneNumberForm
          phoneNumber={newPhoneNumber}
          name={newName}
          onPhoneNumberChange={setNewPhoneNumber}
          onNameChange={setNewName}
          onSubmit={handleAddPhoneNumber}
          isLoading={addPhoneNumberMutation.isPending}
        />

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowBulkAdd(!showBulkAdd)}
          >
            <Upload className="w-4 h-4 mr-2" />
            Bulk Add
          </Button>
        </div>

        {showBulkAdd && (
          <BulkAddForm
            bulkNumbers={bulkNumbers}
            onBulkNumbersChange={setBulkNumbers}
            onBulkAdd={handleBulkAdd}
            onCancel={() => setShowBulkAdd(false)}
            isLoading={bulkAddMutation.isPending}
          />
        )}

        <PhoneNumbersList
          phoneNumbers={phoneNumbers || []}
          onDelete={(id) => deletePhoneNumberMutation.mutate(id)}
          isDeleting={deletePhoneNumberMutation.isPending}
        />
      </CardContent>
    </Card>
  );
};
