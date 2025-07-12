
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

export const FormConfig: React.FC = () => {
  const [newQuestionType, setNewQuestionType] = useState({
    name: '',
    displayName: '',
    description: '',
    supportsOptions: false,
    supportsScale: false
  });
  
  const { toast } = useToast();

  const handleCreateQuestionType = async () => {
    // Implementation for creating new question type
    toast({
      title: "Question type created",
      description: "New question type has been added successfully",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Form Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Create New Question Type</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Type Name</Label>
              <Input
                id="name"
                value={newQuestionType.name}
                onChange={(e) => setNewQuestionType(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., rating-scale"
              />
            </div>
            <div>
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={newQuestionType.displayName}
                onChange={(e) => setNewQuestionType(prev => ({ ...prev, displayName: e.target.value }))}
                placeholder="e.g., Rating Scale"
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newQuestionType.description}
                onChange={(e) => setNewQuestionType(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe this question type..."
              />
            </div>
          </div>
          <Button className="mt-4" onClick={handleCreateQuestionType}>
            Create Question Type
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
