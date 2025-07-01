import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/context/app-context";
import { CalendarClock, TrendingUp, Sparkles } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();
  const { userDetails } = useAppContext();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  const handleRoutinePlanner = () => {
    navigate("/dashboard");
  };

  const handleFinance = () => {
    navigate("/finance");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-primary/5">
      <motion.div
        className="w-full max-w-4xl"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={item} className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            Welcome back, {userDetails?.name}! 👋
          </h1>
          <p className="text-xl text-muted-foreground">
            Choose what you'd like to work on today
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Routine Planner Card */}
          <motion.div variants={item}>
            <Card 
              className="h-full cursor-pointer hover:shadow-lg transition-all duration-300 border-primary/20 hover:border-primary/40"
              onClick={handleRoutinePlanner}
            >
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <CalendarClock className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Routine Planner</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Create personalized daily routines with AI assistance. 
                  Get organized and boost your productivity.
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-primary">
                  <Sparkles className="h-4 w-4" />
                  <span>AI-Powered Planning</span>
                </div>
                <Button className="w-full" size="lg">
                  Open Planner
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Finance Card */}
          <motion.div variants={item}>
            <Card 
              className="h-full cursor-pointer hover:shadow-lg transition-all duration-300 border-primary/20 hover:border-primary/40"
              onClick={handleFinance}
            >
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl">Finance News</CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Stay updated with the latest financial news and market trends. 
                  Get insights to make informed decisions.
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-primary">
                  <TrendingUp className="h-4 w-4" />
                  <span>Real-time Updates</span>
                </div>
                <Button className="w-full" size="lg">
                  View News
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
} 