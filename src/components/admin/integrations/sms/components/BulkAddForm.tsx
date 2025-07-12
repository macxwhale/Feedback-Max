
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface BulkAddFormProps {
  bulkNumbers: string;
  onBulkNumbersChange: (value: string) => void;
  onBulkAdd: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

export const BulkAddForm: React.FC<BulkAddFormProps> = ({
  bulkNumbers,
  onBulkNumbersChange,
  onBulkAdd,
  onCancel,
  isLoading
}) => {
  return (
    <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
      <div>
        <Label htmlFor="bulk-numbers">Bulk Add Phone Numbers</Label>
        <Textarea
          id="bulk-numbers"
          value={bulkNumbers}
          onChange={(e) => onBulkNumbersChange(e.target.value)}
          placeholder="Enter phone numbers, one per line. Format: +1234567890 or +1234567890,John Doe"
          rows={6}
        />
        <p className="text-xs text-muted-foreground mt-2">
          Format: One phone number per line. Optionally add name after comma.
        </p>
      </div>
      <div className="flex gap-2">
        <Button onClick={onBulkAdd} disabled={isLoading}>
          Add All Numbers
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
};
