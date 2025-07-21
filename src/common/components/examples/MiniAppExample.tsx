import React from 'react';
import { useMiniApp } from '@/common/utils/useMiniApp';

/**
 * Example component demonstrating how to use the useMiniApp hook
 * This can be used as a reference for other components that need mini app detection
 */
export const MiniAppExample: React.FC = () => {
  const { isInMiniApp, isLoading, error } = useMiniApp();

  if (isLoading) {
    return <div>Checking mini app context...</div>;
  }

  if (error) {
    return <div>Error detecting mini app: {error.message}</div>;
  }

  return (
    <div>
      <h3>Mini App Detection Result:</h3>
      <p>Is in Mini App: {isInMiniApp ? 'Yes' : 'No'}</p>
      
      {isInMiniApp ? (
        <div>
          <p>🎉 Running in Farcaster Mini App context!</p>
          <p>Features like PWA install should be hidden.</p>
        </div>
      ) : (
        <div>
          <p>🌐 Running in regular web browser context</p>
          <p>Full web app features are available.</p>
        </div>
      )}
    </div>
  );
};

export default MiniAppExample;
