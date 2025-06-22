
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PhoneNumberManagement } from '../PhoneNumberManagement';
import { SmsCampaigns } from '../SmsCampaigns';

export const SmsManagementTabs: React.FC = () => {
  return (
    <div className="w-full mt-6">
      <Tabs defaultValue="phone-numbers" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="phone-numbers" className="flex-1">Phone Numbers</TabsTrigger>
          <TabsTrigger value="campaigns" className="flex-1">Campaigns</TabsTrigger>
        </TabsList>
        
        <TabsContent value="phone-numbers" className="w-full mt-0">
          <div className="w-full">
            <PhoneNumberManagement />
          </div>
        </TabsContent>
        
        <TabsContent value="campaigns" className="w-full mt-0">
          <div className="w-full">
            <SmsCampaigns />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
