
import React from 'react';

interface FluidBackgroundProps {
  variant?: 'light' | 'dark';
}

export const FluidBackground: React.FC<FluidBackgroundProps> = ({ variant = 'light' }) => {
  const isDark = variant === 'dark';
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Large fluid blob 1 */}
      <div 
        className={`absolute -top-40 -right-40 w-96 h-96 ${
          isDark 
            ? 'bg-gradient-to-br from-sunset-500/20 via-coral-500/15 to-golden-400/10' 
            : 'bg-gradient-to-br from-sunset-200/40 via-coral-200/30 to-golden-200/20'
        } rounded-full blur-3xl animate-blob`}
        style={{
          borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
          animationDelay: '0s'
        }}
      />
      
      {/* Medium fluid blob 2 */}
      <div 
        className={`absolute top-1/3 -left-32 w-80 h-80 ${
          isDark 
            ? 'bg-gradient-to-tr from-golden-400/15 via-sunset-500/20 to-coral-500/10' 
            : 'bg-gradient-to-tr from-golden-300/30 via-sunset-300/40 to-coral-300/20'
        } rounded-full blur-2xl animate-flow`}
        style={{
          borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%',
          animationDelay: '2s'
        }}
      />
      
      {/* Small fluid blob 3 */}
      <div 
        className={`absolute bottom-20 right-1/4 w-64 h-64 ${
          isDark 
            ? 'bg-gradient-to-bl from-coral-500/20 via-golden-400/15 to-sunset-500/10' 
            : 'bg-gradient-to-bl from-coral-200/35 via-golden-200/25 to-sunset-200/15'
        } rounded-full blur-2xl animate-float`}
        style={{
          borderRadius: '70% 30% 60% 40% / 40% 50% 60% 50%',
          animationDelay: '4s'
        }}
      />
      
      {/* Micro fluid elements */}
      <div 
        className={`absolute top-1/2 left-1/3 w-32 h-32 ${
          isDark 
            ? 'bg-gradient-to-r from-sunset-400/25 to-golden-400/20' 
            : 'bg-gradient-to-r from-sunset-200/50 to-golden-200/40'
        } rounded-full blur-xl animate-morph`}
        style={{ animationDelay: '1s' }}
      />
      
      <div 
        className={`absolute bottom-1/3 left-2/3 w-24 h-24 ${
          isDark 
            ? 'bg-gradient-to-l from-coral-400/20 to-sunset-400/15' 
            : 'bg-gradient-to-l from-coral-200/45 to-sunset-200/35'
        } rounded-full blur-lg animate-fluid-move`}
        style={{ animationDelay: '3s' }}
      />
      
      {/* Gradient overlay for depth */}
      <div 
        className={`absolute inset-0 ${
          isDark 
            ? 'bg-gradient-to-br from-transparent via-dark-warm-50/10 to-dark-warm-100/20' 
            : 'bg-gradient-to-br from-transparent via-white/10 to-warm-gray-50/20'
        }`}
      />
    </div>
  );
};
