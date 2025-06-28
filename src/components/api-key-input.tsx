// Component for inputting and validating Gemini API key
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import { GeminiService } from "@/lib/gemini";
import { useAppContext } from "@/context/app-context";

interface ApiKeyInputProps {
  onValidated: () => void;
}

export default function ApiKeyInput({ onValidated }: ApiKeyInputProps) {
  const { setApiKey, apiKey: savedApiKey } = useAppContext();
  const [apiKey, setApiKeyLocal] = useState<string>(savedApiKey || "");
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  
  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKeyLocal(e.target.value);
    setIsValid(null);
    setErrorMessage("");
  };
  
  const validateApiKey = async () => {
    if (!apiKey.trim()) {
      setErrorMessage("Please enter your Gemini API key");
      return;
    }
    
    setIsValidating(true);
    setErrorMessage("");
    
    try {
      const geminiService = new GeminiService({ apiKey });
      const isValidKey = await geminiService.validateApiKey();
      
      setIsValid(isValidKey);
      
      if (isValidKey) {
        setApiKey(apiKey);
        onValidated();
      } else {
        setErrorMessage("Invalid API key. Please check and try again.");
      }
    } catch (error) {
      setIsValid(false);
      setErrorMessage("Failed to validate API key. Please try again.");
      console.error("API key validation error:", error);
    } finally {
      setIsValidating(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="api-key">Gemini API Key</Label>
        <div className="flex gap-2">
          <Input
            id="api-key"
            type="password"
            placeholder="Enter your Gemini-1.5-flash API key"
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
          To use this application, you need a free Gemini-1.5-flash API key.
          You can get one from the{" "}
          <a
            href="https://ai.google.dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-2"
          >
            Google AI Studio
          </a>
          .
        </p>
      </motion.div>
    </div>
  );
}