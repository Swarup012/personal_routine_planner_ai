import React from "react";
import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAppContext } from "@/context/app-context";
import { BookOpen, Briefcase, Calendar, User } from "lucide-react";
import ThemeToggle from "./theme-toggle";

export default function ProfileSection() {
  const { userDetails } = useAppContext();
  
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
        </CardContent>
      </Card>
    </motion.div>
  );
}