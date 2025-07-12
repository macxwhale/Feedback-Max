
import React from 'react';

interface FeedbackErrorBoundaryProps {
  orgLoading: boolean;
  orgError: string | null;
  organization: any;
}

export const FeedbackErrorBoundary: React.FC<FeedbackErrorBoundaryProps> = ({
  orgLoading,
  orgError,
  organization
}) => {
  if (orgLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (orgError || !organization) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-orange-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Organization Not Found</h2>
          <p className="text-gray-600 mb-4">
            {orgError || 'The requested organization could not be found or is not active.'}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return null;
};
