
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';

export const Header: React.FC = () => {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Heart className="h-4 w-4 text-white" aria-label="Pulsify pulse icon" />
            </div>
            <span className="text-xl font-bold text-gray-900">Pulsify</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/auth')}
              className="text-gray-600 hover:text-gray-900"
            >
              Sign in
            </Button>
            <Button 
              onClick={() => navigate('/auth')}
              className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/25"
            >
              Get started free
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => navigate('/admin/login')}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Admin
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
