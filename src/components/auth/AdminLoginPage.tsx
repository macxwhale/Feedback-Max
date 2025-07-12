
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from './AuthWrapper';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Shield, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const { error } = await signIn(email, password);
    
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      // Wait for authentication to complete and then check admin status
      try {
        // Get the current session to ensure user is authenticated
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Check if user is an admin using the security definer function
          const { data: isAdmin, error: adminError } = await supabase
            .rpc('get_current_user_admin_status');
          
          if (adminError) {
            console.error('Error checking admin status:', adminError);
            setError('Failed to verify admin privileges');
            setLoading(false);
            return;
          }
          
          if (isAdmin) {
            toast({
              title: "Welcome back, Admin!",
              description: "You have been signed in successfully.",
            });
            navigate('/admin');
          } else {
            setError('Access denied. This login is for system administrators only.');
            // Sign out the user since they don't have admin privileges
            await supabase.auth.signOut();
          }
        } else {
          setError('Authentication failed. Please try again.');
        }
      } catch (err) {
        console.error('Error during admin verification:', err);
        setError('Failed to verify admin privileges');
      }
      
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <Link 
          to="/" 
          className="inline-flex items-center text-slate-300 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
        
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="text-center">
            <div className="mx-auto bg-red-100 w-16 h-16 rounded-full flex items-center justify-center text-red-600 mb-4">
              <Shield className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">
              System Administrator
            </CardTitle>
            <p className="text-slate-400">
              Sign in to access the admin dashboard
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-slate-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                  placeholder="admin@example.com"
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-slate-300">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                  placeholder="Enter your password"
                />
              </div>
              {error && (
                <Alert className="bg-red-900 border-red-700">
                  <AlertDescription className="text-red-200">{error}</AlertDescription>
                </Alert>
              )}
              <Button 
                type="submit" 
                className="w-full bg-red-600 hover:bg-red-700" 
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In as Admin'}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-slate-400 text-sm">
                Not an admin? <Link to="/auth" className="text-blue-400 hover:text-blue-300">User Login</Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
