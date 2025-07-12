
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOrganization } from '@/hooks/useOrganization';
import { getApiKeys, createApiKey, updateApiKeyStatus } from '@/services/apiKeysService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format, formatDistanceToNow } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { KeyRound, PlusCircle, Copy, Check, Power, PowerOff, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const CopyableKey = ({ apiKey }: { apiKey: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    toast({ title: 'API Key Copied!', description: 'The key has been copied to your clipboard.' });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2 p-3 bg-secondary rounded-md">
      <code className="text-sm font-mono break-all">{apiKey}</code>
      <Button variant="ghost" size="icon" onClick={handleCopy}>
        {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  );
};


export const ApiManagement: React.FC = () => {
    const { organization } = useOrganization();
    const queryClient = useQueryClient();
    const [newKeyName, setNewKeyName] = useState('');
    const [generatedKey, setGeneratedKey] = useState<string | null>(null);

    const queryKey = ['apiKeys', organization?.id];

    const { data: apiKeys, isLoading } = useQuery({
        queryKey,
        queryFn: () => getApiKeys(organization!.id),
        enabled: !!organization,
    });

    const createMutation = useMutation({
        mutationFn: (keyName: string) => createApiKey(organization!.id, keyName),
        onSuccess: (newKey) => {
            toast({ title: "API Key Created", description: "Make sure to copy your key. You won't see it again." });
            setGeneratedKey(newKey);
            setNewKeyName('');
            queryClient.invalidateQueries({ queryKey });
        },
        onError: (error) => {
            toast({ title: "Error", description: error.message, variant: 'destructive' });
        }
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ keyId, status }: { keyId: string; status: 'active' | 'inactive' }) => updateApiKeyStatus(keyId, status),
        onSuccess: () => {
            toast({ title: "Status Updated" });
            queryClient.invalidateQueries({ queryKey });
        },
        onError: (error) => {
            toast({ title: "Error", description: error.message, variant: 'destructive' });
        }
    });

    const handleCreateKey = (e: React.FormEvent) => {
      e.preventDefault();
      if (newKeyName.trim() && organization) {
        createMutation.mutate(newKeyName.trim());
      }
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><KeyRound /> API Keys</CardTitle>
                <CardDescription>Manage API keys for programmatic access to your organization's data.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleCreateKey} className="flex items-center gap-2 mb-6">
                    <Input 
                        placeholder="New key name (e.g., 'SMS Integration')"
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                        disabled={createMutation.isPending}
                    />
                    <Button type="submit" disabled={!newKeyName.trim() || createMutation.isPending}>
                        {createMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                        Create Key
                    </Button>
                </form>

                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Key Prefix</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Last Used</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell colSpan={6}><Skeleton className="h-8 w-full" /></TableCell>
                                    </TableRow>
                                ))
                            ) : apiKeys && apiKeys.length > 0 ? (
                                apiKeys.map(key => (
                                    <TableRow key={key.id}>
                                        <TableCell className="font-medium">{key.key_name}</TableCell>
                                        <TableCell><code>{key.key_prefix}...</code></TableCell>
                                        <TableCell>
                                            <Badge variant={key.status === 'active' ? 'default' : 'secondary'}>
                                                {key.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{key.last_used_at ? `${formatDistanceToNow(new Date(key.last_used_at))} ago` : 'Never'}</TableCell>
                                        <TableCell>{format(new Date(key.created_at), 'MMM d, yyyy')}</TableCell>
                                        <TableCell className="text-right">
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" disabled={updateStatusMutation.isPending}>
                                                        {key.status === 'active' ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This will {key.status === 'active' ? 'deactivate' : 'activate'} the API key. 
                                                            {key.status === 'active' ? ' Applications using it will lose access.' : ' Applications will regain access.'}
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => updateStatusMutation.mutate({ keyId: key.id, status: key.status === 'active' ? 'inactive' : 'active' })}>
                                                            Continue
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                                        No API keys created yet.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <Dialog open={!!generatedKey} onOpenChange={(open) => !open && setGeneratedKey(null)}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>API Key Created Successfully</DialogTitle>
                            <DialogDescription>
                                Please copy this key and store it securely. You will not be able to see it again.
                            </DialogDescription>
                        </DialogHeader>
                        <CopyableKey apiKey={generatedKey || ''} />
                        <DialogFooter>
                            <DialogClose asChild>
                                <Button>Close</Button>
                            </DialogClose>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
};
