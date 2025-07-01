// Main dashboard component for the routine planner
import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "@/context/app-context";
import ProfileSection from "./profile-section";
import RoutineInput from "./routine-input";
import TodoCard from "./todo-card";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { CalendarClock, ArrowLeft } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const { currentRoutine, routines, userDetails, setCurrentRoutine } = useAppContext();
  
  // Sort routines by date (most recent first)
  const sortedRoutines = React.useMemo(() => {
    return [...routines].sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [routines]);
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };
  
  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };
  
  return (
    <div className="container mx-auto p-4 py-6 max-w-6xl">
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <Button
          variant="outline"
          onClick={() => navigate("/landing")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          className="lg:col-span-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="space-y-6 sticky top-20">
            <ProfileSection />
            <RoutineInput />
          </div>
        </motion.div>
        
        <motion.div 
          className="lg:col-span-2"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {sortedRoutines.length > 0 && (
            <motion.div variants={item} className="mb-6">
              <h2 className="text-xl font-semibold mb-3">Your Routines</h2>
              <div className="flex overflow-x-auto gap-2 pb-2 mb-4">
                {sortedRoutines.map((routine) => (
                  <Button 
                    key={routine.id}
                    variant={currentRoutine?.id === routine.id ? "default" : "outline"}
                    className="flex-shrink-0"
                    onClick={() => setCurrentRoutine(routine)}
                  >
                    {new Date(routine.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric"
                    })}
                  </Button>
                ))}
              </div>
            </motion.div>
          )}
          
          {currentRoutine && currentRoutine.todos.length > 0 ? (
            <>
              <motion.div
                variants={item}
                className="mb-6"
              >
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <CalendarClock className="text-primary" />
                  <span>Your Daily Routine</span>
                </h2>
                <p className="text-muted-foreground">
                  {new Date(currentRoutine.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </motion.div>
              
              <ScrollArea className="h-[calc(100vh-200px)]">
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  variants={container}
                  initial="hidden"
                  animate="show"
                >
                  {currentRoutine.todos.map((todo) => (
                    <motion.div key={todo.id} variants={item}>
                      <TodoCard todo={todo} routineId={currentRoutine.id} />
                    </motion.div>
                  ))}
                </motion.div>
              </ScrollArea>
            </>
          ) : (
            <Card className="border-dashed bg-muted/50 h-[300px] flex items-center justify-center">
              <CardContent className="text-center space-y-3">
                <div className="rounded-full bg-primary/10 p-4 w-16 h-16 mx-auto flex items-center justify-center">
                  <CalendarClock className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-medium">No Routine Yet</h3>
                <p className="text-muted-foreground max-w-md">
                  {userDetails?.name ? `Hey ${userDetails.name}! ` : ""}
                  Describe your day in the panel to the left, and we'll create a personalized routine for you with AI.
                </p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
}