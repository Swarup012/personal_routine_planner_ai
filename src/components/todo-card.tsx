import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { TodoItem } from "@/types";
import { useAppContext } from "@/context/app-context";

interface TodoCardProps {
  todo: TodoItem;
  routineId: string;
}

export default function TodoCard({ todo, routineId }: TodoCardProps) {
  const { updateTodoStatus } = useAppContext();

  const handleStatusChange = (checked: boolean) => {
    updateTodoStatus(routineId, todo.id, checked);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className={`border-l-4 ${todo.completed ? "border-l-green-500 bg-green-50 dark:bg-green-900/10" : "border-l-primary"}`}>
        <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between gap-2">
          <div className="flex items-start gap-2">
            <Checkbox 
              checked={todo.completed}
              onCheckedChange={handleStatusChange}
              className="mt-1"
            />
            <h3 
              className={`text-lg font-medium leading-tight ${todo.completed ? "line-through text-muted-foreground" : ""}`}
            >
              {todo.title}
            </h3>
          </div>
          <Badge variant="outline" className="flex items-center gap-1 whitespace-nowrap">
            <Clock className="h-3 w-3" />
            <span className="text-xs">{todo.timeFrame}</span>
          </Badge>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <p className={`text-sm ${todo.completed ? "text-muted-foreground line-through" : ""}`}>
            {todo.description}
          </p>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between items-center text-xs text-muted-foreground">
          <span>Created {new Date(todo.createdAt).toLocaleTimeString()}</span>
          {todo.completed && <span className="text-green-600 dark:text-green-400">Completed</span>}
        </CardFooter>
      </Card>
    </motion.div>
  );
}