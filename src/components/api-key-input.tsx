// Component for inputting and validating API keys from different providers
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, CheckCircle2, ChevronDown } from "lucide-react";
import { useAppContext } from "@/context/app-context";
import { AIService } from "@/lib/ai-service";

interface ApiKeyInputProps {
  onValidated: () => void;
}

const AI_PROVIDERS = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'Gemini 1.5 Flash API',
    placeholder: 'Enter your Gemini API key',
    helpUrl: 'https://ai.google.dev/',
    color: 'from-blue-500 to-purple-600'
  },
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT-4, GPT-3.5 Turbo',
    placeholder: 'Enter your OpenAI API key',
    helpUrl: 'https://platform.openai.com/api-keys',
    color: 'from-green-500 to-emerald-600'
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    description: 'DeepSeek Chat API',
    placeholder: 'Enter your DeepSeek API key',
    helpUrl: 'https://platform.deepseek.com/',
    color: 'from-orange-500 to-red-600'
  }
];

export default function ApiKeyInput({ onValidated }: ApiKeyInputProps) {
  const { setApiKey, apiKey: savedApiKey, selectedProvider, setSelectedProvider } = useAppContext();
  const [apiKey, setApiKeyLocal] = useState<string>(savedApiKey || "");
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [showProviderDropdown, setShowProviderDropdown] = useState(false);
  
  const currentProvider = AI_PROVIDERS.find(p => p.id === selectedProvider);
  
  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKeyLocal(e.target.value);
    setIsValid(null);
    setErrorMessage("");
  };
  
  const validateApiKey = async () => {
    if (!apiKey.trim()) {
      setErrorMessage(`Please enter your ${currentProvider?.name} API key`);
      return;
    }
    
    setIsValidating(true);
    setErrorMessage("");
    
    try {
      const aiService = new AIService({
        apiKey: apiKey,
        provider: selectedProvider as 'gemini' | 'openai' | 'deepseek'
      });
      
      const isValidKey = await aiService.validateApiKey();
      
      setIsValid(isValidKey);
      
      if (isValidKey) {
        setApiKey(apiKey);
        onValidated();
      } else {
        setErrorMessage(`Invalid ${currentProvider?.name} API key. Please check and try again.`);
      }
    } catch (error) {
      setIsValid(false);
      setErrorMessage(`Failed to validate ${currentProvider?.name} API key. Please try again.`);
      console.error("API key validation error:", error);
    } finally {
      setIsValidating(false);
    }
  };
  
  return (
    <div className="space-y-4">
      {/* Provider Selection */}
      <div className="space-y-2">
        <Label>AI Provider</Label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowProviderDropdown(!showProviderDropdown)}
            className="w-full flex items-center justify-between p-3 bg-background border border-input rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${currentProvider?.color}`}></div>
              <div className="text-left">
                <div className="font-medium">{currentProvider?.name}</div>
                <div className="text-xs text-muted-foreground">{currentProvider?.description}</div>
              </div>
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform ${showProviderDropdown ? 'rotate-180' : ''}`} />
          </button>
          
          {showProviderDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-full left-0 right-0 mt-1 bg-background border border-input rounded-md shadow-lg z-10"
            >
              {AI_PROVIDERS.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => {
                    setSelectedProvider(provider.id);
                    setShowProviderDropdown(false);
                    setIsValid(null);
                    setErrorMessage("");
                  }}
                  className="w-full flex items-center gap-3 p-3 hover:bg-accent hover:text-accent-foreground transition-colors text-left"
                >
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${provider.color}`}></div>
                  <div>
                    <div className="font-medium">{provider.name}</div>
                    <div className="text-xs text-muted-foreground">{provider.description}</div>
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </div>
      </div>
      
      {/* API Key Input */}
      <div className="space-y-2">
        <Label htmlFor="api-key">{currentProvider?.name} API Key</Label>
        <div className="flex gap-2">
          <Input
            id="api-key"
            type="password"
            placeholder={currentProvider?.placeholder}
            value={apiKey}
            onChange={handleApiKeyChange}
            className="flex-1"
          />
          <Button
            onClick={validateApiKey}
            disabled={isValidating}
            size="icon"
          >
            {isValidating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isValid ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <span>→</span>
            )}
          </Button>
        </div>
      </div>
      
      {isValid === false && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        </motion.div>
      )}
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-sm text-muted-foreground"
      >
        <p>
          To use this application, you need a {currentProvider?.name} API key.
          You can get one from the{" "}
          <a
            href={currentProvider?.helpUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-2"
          >
            {currentProvider?.name} Platform
          </a>
          .
        </p>
      </motion.div>
    </div>
  );
}