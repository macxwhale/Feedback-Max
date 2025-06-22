
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PhoneNumberManagement } from '../PhoneNumberManagement';
import { SmsCampaigns } from '../SmsCampaigns';

export const SmsManagementTabs: React.FC = () => {
  return (
    <div className="mt-6">
      <Tabs defaultValue="phone-numbers" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="phone-numbers">Phone Numbers</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
        </TabsList>
        
        <TabsContent value="phone-numbers" className="mt-6">
          <PhoneNumberManagement />
        </TabsContent>
        
        <TabsContent value="campaigns" className="mt-6">
          <SmsCampaigns />
        </TabsContent>
      </Tabs>
    </div>
  );
};
