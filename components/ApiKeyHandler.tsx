import React, { useState, useEffect, useCallback } from 'react';
import Button from './Button';
import { MagicWandIcon } from './icons/MagicWandIcon';

interface ApiKeyHandlerProps {
  children: React.ReactNode;
  onReady: () => void;
}

const ApiKeyHandler: React.FC<ApiKeyHandlerProps> = ({ children, onReady }) => {
  const [apiKeyReady, setApiKeyReady] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkApiKey = useCallback(async () => {
    setChecking(true);
    setError(null);
    try {
      const apiBase = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_FFMPEG_API_BASE) as string | undefined;
      if (apiBase) {
        // Server-side AI configured; no client key required
        setApiKeyReady(true);
        onReady();
        return;
      }
      // Fallback for local development: if an environment API key is present, treat as ready
      const envApiKey = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY) || process.env.API_KEY || process.env.GEMINI_API_KEY;
      if (envApiKey) {
        setApiKeyReady(true);
        onReady();
        return;
      }

      if (window.aistudio && await window.aistudio.hasSelectedApiKey()) {
        setApiKeyReady(true);
        onReady();
      } else {
        setApiKeyReady(false);
      }
    } catch (e) {
      console.error("Error checking API key:", e);
      setError("Could not verify API key status. Please try again.");
      setApiKeyReady(false);
    } finally {
      setChecking(false);
    }
  }, [onReady]);

  useEffect(() => {
    checkApiKey();
  }, [checkApiKey]);

  const handleSelectKey = async () => {
    if (window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
        // Assume success and optimistically update UI to avoid race conditions.
        // A real app might re-check or handle API call failures gracefully.
        setApiKeyReady(true);
        onReady();
      } catch (e) {
        console.error("Error opening select key dialog:", e);
        setError("The API key selection dialog could not be opened.");
      }
    } else {
      setError("API selection utility is not available. Ensure VITE_GEMINI_API_KEY is set in .env.local.");
    }
  };

  if (checking) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-800/50 rounded-lg">
        <svg className="animate-spin h-8 w-8 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="mt-4 text-gray-300">Verifying API access...</p>
      </div>
    );
  }

  if (apiKeyReady) {
    return <>{children}</>;
  }

  return (
    <div className="p-8 text-center bg-gray-800 border border-gray-700 rounded-lg">
      <h3 className="text-xl font-bold text-white">AI Not Configured</h3>
      <p className="mt-2 text-gray-400">
        Server-side AI is not configured. For development without a server, you may select a client API key.
      </p>
      <div className="mt-6">
        <Button onClick={handleSelectKey} size="lg">
          <MagicWandIcon className="w-5 h-5 mr-2" />
          Select Client API Key (Dev Only)
        </Button>
      </div>
      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      <p className="mt-4 text-xs text-gray-500">
        For more information on billing, visit{' '}
        <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
          ai.google.dev/gemini-api/docs/billing
        </a>.
      </p>
    </div>
  );
};

export default ApiKeyHandler;
