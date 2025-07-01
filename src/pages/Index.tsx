import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/app-context";
import { Loader2 } from "lucide-react";

export default function IndexPage() {
  const { isOnboarded } = useAppContext();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect based on onboarding status
    if (isOnboarded) {
      navigate("/landing");
    } else {
      navigate("/onboarding");
    }
  }, [isOnboarded, navigate]);

  // Show loading state while redirecting
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-primary/5 p-6 text-center">
      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
        <p className="text-lg text-muted-foreground">Loading your personal dashboard...</p>
      </div>
    </div>
  );
}