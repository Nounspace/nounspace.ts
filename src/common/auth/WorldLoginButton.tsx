"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { MiniKit } from "@worldcoin/minikit-js";
import { toast } from "sonner";

import { Button } from "@/common/components/atoms/button";
import Spinner from "@/common/components/atoms/spinner";
import { useWorldMiniAppAuth } from "./useWorldMiniAppAuth";

type WorldLoginButtonProps = {
  className?: string;
  onError?: (error: Error) => void;
  onStart?: () => void;
  onSuccess?: () => void;
  showError?: boolean;
  errorMessage?: string;
};

export function WorldLoginButton({
  className,
  onError,
  onStart,
  onSuccess,
  showError = false,
  errorMessage,
}: WorldLoginButtonProps) {
  const { signInWithWorld, isReadyForWorldLogin, currentStatus, debugLogs } = useWorldMiniAppAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isInstalled, setIsInstalled] = useState<boolean | undefined>(undefined);
  const [retryCount, setRetryCount] = useState(0);
  const [showDebugPanel, setShowDebugPanel] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      setIsInstalled(false);
      return;
    }
    setIsInstalled(MiniKit.isInstalled());
  }, []);

  const buttonLabel = useMemo(() => {
    if (isSigningIn) {
      return "Connecting to World App...";
    }

    if (!isReadyForWorldLogin) {
      return "Preparing World App login...";
    }

    if (retryCount > 0) {
      return `Try Again (${retryCount} attempt${retryCount > 1 ? 's' : ''})`;
    }

    return "Continue with World App";
  }, [isReadyForWorldLogin, isSigningIn, retryCount]);

  const handleSignIn = useCallback(async () => {
    try {
      if (!isReadyForWorldLogin) {
        throw new Error("World App login is still initializing. Please try again.");
      }

      setIsSigningIn(true);
      onStart?.();
      await signInWithWorld();
      toast.success("Signed in with World App");
      setRetryCount(0); // Reset retry count on success
      onSuccess?.();
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      setRetryCount(prev => prev + 1);
      toast.error(err.message);
      onError?.(err);
    } finally {
      setIsSigningIn(false);
    }
  }, [isReadyForWorldLogin, signInWithWorld, onError, onStart, onSuccess]);

  if (!isInstalled) {
    return null;
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs text-gray-600">
          Status: <span className="font-mono">{currentStatus}</span>
        </div>
        <button
          onClick={() => setShowDebugPanel(!showDebugPanel)}
          className="text-xs text-blue-600 hover:text-blue-800 underline"
        >
          {showDebugPanel ? 'Hide' : 'Show'} Debug
        </button>
      </div>
      
      <Button
        className={className}
        variant="primary"
        color="primary"
        disabled={isSigningIn || !isReadyForWorldLogin}
        onClick={handleSignIn}
      >
        {isSigningIn && <Spinner className="w-4 h-4 mr-2" />}
        {buttonLabel}
      </Button>
      {showError && errorMessage && (
        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-800 font-medium">Login Error</p>
              <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
              {retryCount > 0 && (
                <p className="text-xs text-red-600 mt-1">
                  Attempt {retryCount} of 3. Please try again.
                </p>
              )}
              {retryCount >= 2 && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                  <p className="font-medium">Troubleshooting tips:</p>
                  <ul className="mt-1 list-disc list-inside space-y-1">
                    <li>Make sure World App is installed and up to date</li>
                    <li>Check that you have a stable internet connection</li>
                    <li>Try refreshing the page and logging in again</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {showDebugPanel && (
        <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-md">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-800">Debug Information</h4>
            <button
              onClick={() => setShowDebugPanel(false)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-2">
            <div className="text-xs">
              <span className="font-medium">Current Status:</span> 
              <span className="ml-1 font-mono text-blue-600">{currentStatus}</span>
            </div>
            
            <div className="text-xs">
              <span className="font-medium">Ready:</span> 
              <span className="ml-1">{isReadyForWorldLogin ? '✅' : '❌'}</span>
            </div>
            
            <div className="text-xs">
              <span className="font-medium">Installed:</span> 
              <span className="ml-1">{isInstalled ? '✅' : '❌'}</span>
            </div>
            
            <div className="text-xs">
              <span className="font-medium">Retry Count:</span> 
              <span className="ml-1">{retryCount}</span>
            </div>
            
            {debugLogs.length > 0 && (
              <div className="mt-3">
                <div className="text-xs font-medium text-gray-700 mb-2">Recent Logs:</div>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {debugLogs.map((log, index) => (
                    <div key={index} className="text-xs font-mono">
                      <span className="text-gray-500">[{log.timestamp}]</span>
                      <span className={`ml-1 ${
                        log.level === 'error' ? 'text-red-600' : 
                        log.level === 'warn' ? 'text-yellow-600' : 
                        'text-green-600'
                      }`}>
                        [{log.level.toUpperCase()}]
                      </span>
                      <span className="ml-1 text-gray-800">{log.message}</span>
                      {log.data && (
                        <div className="ml-4 text-gray-600">
                          {JSON.stringify(log.data, null, 2)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default WorldLoginButton;
