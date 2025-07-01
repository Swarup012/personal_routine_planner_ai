import React, { useState } from "react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAppContext } from "@/context/app-context";
import { BookOpen, Briefcase, Calendar, User, Key, AlertCircle, Loader2, CheckCircle2 } from "lucide-react";
import ThemeToggle from "./theme-toggle";
import { GeminiService } from "@/lib/gemini";

export default function ProfileSection() {
  const { userDetails, apiKey, clearApiKey, setApiKey } = useAppContext();
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [newApiKey, setNewApiKey] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  
  if (!userDetails) return null;

  const { name, age, occupation } = userDetails;
  
  // Create avatar initials from name
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
  
  // Get the current date
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const handleChangeKey = () => {
    clearApiKey();
    setShowApiKeyInput(true);
    setNewApiKey("");
    setIsValid(null);
    setErrorMessage("");
  };

  const handleCancelChangeKey = () => {
    setShowApiKeyInput(false);
    setNewApiKey("");
    setIsValid(null);
    setErrorMessage("");
  };

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewApiKey(e.target.value);
    setIsValid(null);
    setErrorMessage("");
  };

  const validateAndSaveApiKey = async () => {
    if (!newApiKey.trim()) {
      setErrorMessage("Please enter your Gemini API key");
      return;
    }
    
    setIsValidating(true);
    setErrorMessage("");
    
    try {
      const geminiService = new GeminiService({ apiKey: newApiKey });
      const isValidKey = await geminiService.validateApiKey();
      
      setIsValid(isValidKey);
      
      if (isValidKey) {
        setApiKey(newApiKey);
        setShowApiKeyInput(false);
        setNewApiKey("");
        setIsValid(null);
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="overflow-hidden">
        <CardHeader className="bg-primary text-primary-foreground flex flex-row items-center justify-between p-4 pb-8">
          <div>
            <h2 className="text-lg font-bold">{name}'s Planner</h2>
            <p className="text-xs opacity-80 flex items-center gap-1">
              <Calendar className="h-3 w-3" /> {currentDate}
            </p>
          </div>
          <ThemeToggle />
        </CardHeader>
        
        <div className="relative">
          <div className="absolute -top-6 left-4">
            <Avatar className="h-12 w-12 border-2 border-background">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
        
        <CardContent className="pt-8 pb-4 space-y-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Age:</span>
              <span>{age}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Briefcase className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Occupation:</span>
              <span>{occupation}</span>
            </div>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4 text-primary" />
              <span>AI-Powered Planner</span>
            </div>
          </div>
          
          {apiKey && !showApiKeyInput && (
            <div className="pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleChangeKey}
                className="w-full"
              >
                <Key className="h-4 w-4 mr-2" />
                Change Key
              </Button>
            </div>
          )}

          {showApiKeyInput && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="pt-4 space-y-3"
            >
              <div className="space-y-2">
                <Label htmlFor="new-api-key">New Gemini API Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="new-api-key"
                    type="password"
                    placeholder="Enter your new Gemini API key"
                    value={newApiKey}
                    onChange={handleApiKeyChange}
                    className="flex-1"
                  />
                  <Button
                    onClick={validateAndSaveApiKey}
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
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCancelChangeKey}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  size="sm" 
                  onClick={validateAndSaveApiKey}
                  disabled={isValidating || !newApiKey.trim()}
                  className="flex-1"
                >
                  {isValidating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Validating...
                    </>
                  ) : (
                    "Save Key"
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}