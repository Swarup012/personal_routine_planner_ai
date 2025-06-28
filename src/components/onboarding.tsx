// Main onboarding component that handles both API key input and user details
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import ApiKeyInput from "./api-key-input";
import UserDetailsForm from "./user-details-form";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/context/app-context";

export default function Onboarding() {
  const [step, setStep] = useState<"api-key" | "user-details">("api-key");
  const { apiKey } = useAppContext();
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
      },
    },
  };
  
  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-primary/5">
      <motion.div
        className="w-full max-w-md"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <Card className="shadow-xl border-t border-primary/20 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <motion.div variants={item}>
              <CardTitle className="text-2xl text-center font-bold">
                {step === "api-key"
                  ? "Welcome to Your Routine Planner"
                  : "Tell Us About Yourself"}
              </CardTitle>
            </motion.div>
          </CardHeader>
          
          <CardContent>
            <motion.div variants={item}>
              {step === "api-key" ? (
                <ApiKeyInput
                  onValidated={() => setStep("user-details")}
                />
              ) : (
                <UserDetailsForm />
              )}
            </motion.div>
          </CardContent>
          
          {step === "api-key" && apiKey && (
            <CardFooter className="justify-end">
              <motion.div variants={item}>
                <Button onClick={() => setStep("user-details")}>
                  Continue
                </Button>
              </motion.div>
            </CardFooter>
          )}
        </Card>
      </motion.div>
    </div>
  );
}