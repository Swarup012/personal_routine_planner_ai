// Form for collecting user details during onboarding
import React, { useState } from "react";
import { motion } from "framer-motion";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useNavigate } from "react-router-dom";

import { useAppContext } from "@/context/app-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";

const userDetailsSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters." })
    .max(50, { message: "Name cannot exceed 50 characters." }),
  age: z
    .number({ required_error: "Age is required", invalid_type_error: "Age must be a number" })
    .int()
    .positive()
    .min(1, { message: "Age must be at least 1." })
    .max(120, { message: "Age cannot exceed 120." }),
  occupation: z
    .string()
    .min(2, { message: "Occupation must be at least 2 characters." })
    .max(100, { message: "Occupation cannot exceed 100 characters." }),
});

type UserDetailsFormValues = z.infer<typeof userDetailsSchema>;

export default function UserDetailsForm() {
  const { setUserDetails } = useAppContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  const form = useForm<UserDetailsFormValues>({
    resolver: zodResolver(userDetailsSchema),
    defaultValues: {
      name: "",
      age: undefined,
      occupation: "",
    },
  });
  
  const onSubmit = async (data: UserDetailsFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Simulate a delay for better UX
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setUserDetails({
        name: data.name,
        age: data.age,
        occupation: data.occupation,
      });
      
      navigate("/landing");
    } catch (error) {
      console.error("Error saving user details:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Your name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="age"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Age</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Your age"
                  {...field}
                  onChange={(e) => {
                    field.onChange(e.target.value ? parseInt(e.target.value, 10) : undefined);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="occupation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Occupation</FormLabel>
              <FormControl>
                <Input placeholder="Your occupation" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <motion.div
          className="pt-2"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Setting Up
              </>
            ) : (
              "Get Started"
            )}
          </Button>
        </motion.div>
      </form>
    </Form>
  );
}