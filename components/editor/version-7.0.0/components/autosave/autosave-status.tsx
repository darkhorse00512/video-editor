import React, { useState, useEffect } from 'react';

interface AutosaveStatusProps {
  /**
   * Last time an autosave was performed (timestamp)
   */
  lastSaveTime?: number | null;
  
  /**
   * Whether an autosave is currently in progress
   */
  isSaving?: boolean;
}

/**
 * Component that displays the current autosave status
 */
export const AutosaveStatus: React.FC<AutosaveStatusProps> = ({
  lastSaveTime,
  isSaving = false
}) => {
  const [visible, setVisible] = useState(false);
  
  // Show status when saving starts or a new save completes
  useEffect(() => {
    if (isSaving || lastSaveTime) {
      setVisible(true);
      
      // Hide status after 3 seconds
      const timer = setTimeout(() => {
        setVisible(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isSaving, lastSaveTime]);
  
  // Format the last save time
  const formattedTime = lastSaveTime 
    ? new Date(lastSaveTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';
  
  // Don't render anything if not visible
  if (!visible) {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-3 py-2 rounded-md shadow-md text-sm flex items-center space-x-2 transition-opacity duration-300">
      {isSaving ? (
        <>
          <svg className="animate-spin h-4 w-4 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Autosaving...</span>
        </>
      ) : (
        <>
          <svg className="h-4 w-4 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Autosaved at {formattedTime}</span>
        </>
      )}
    </div>
  );
};
