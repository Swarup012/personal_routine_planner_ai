import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/context/app-context";
import { v4 as uuidv4 } from "uuid";
import { Loader2, Wand2, Calendar as CalendarIcon } from "lucide-react";
import { GeminiService } from "@/lib/gemini";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DatePicker } from "@/components/date-picker";
import { format } from "date-fns";

export default function RoutineInput() {
  const [routineDescription, setRoutineDescription] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { apiKey, userDetails, generateRoutine } = useAppContext();

  const handleGenerateRoutine = async () => {
    if (!routineDescription.trim()) {
      setError("Please enter a description of your day");
      return;
    }

    if (!apiKey) {
      setError("API key is missing. Please provide your Gemini API key");
      return;
    }

    if (!userDetails) {
      setError("User details are missing. Please complete your profile");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const geminiService = new GeminiService({ apiKey });
      const response = await geminiService.generateTodos({
        routineDescription,
        userDetails,
        selectedDate: selectedDate.toISOString(),
      });

      if (!response || !response.todos || !Array.isArray(response.todos)) {
        console.error("Invalid response structure:", response);
        setError("Received invalid response from AI service. Please try again.");
        return;
      }

      const todos = response.todos.map((todo) => ({
        id: uuidv4(),
        title: todo.title,
        description: todo.description,
        timeFrame: todo.timeFrame,
        completed: false,
        createdAt: new Date().toISOString(),
      }));

      const routine = {
        id: uuidv4(),
        date: selectedDate.toISOString(),
        description: routineDescription,
        todos,
      };

      generateRoutine(routine);
      setRoutineDescription("");
    } catch (error) {
      console.error("Error generating routine:", error);
      setError("Failed to generate routine. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="overflow-hidden border-primary/20">
        <CardHeader className="bg-primary/5">
          <CardTitle className="text-xl flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            Generate Your Routine
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-muted-foreground mb-1">
                  Select Date
                </label>
                <DatePicker 
                  date={selectedDate} 
                  onDateChange={setSelectedDate} 
                />
              </div>
            </div>
            <Textarea
              placeholder="Describe what you want to do for the selected date..."
              className="min-h-[120px] resize-none"
              value={routineDescription}
              onChange={(e) => setRoutineDescription(e.target.value)}
            />
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}
          </div>
        </CardContent>
        <CardFooter className="bg-muted/40 flex justify-end">
          <motion.div
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              onClick={handleGenerateRoutine} 
              disabled={isGenerating || !routineDescription.trim()}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Generate Routine
                </>
              )}
            </Button>
          </motion.div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}