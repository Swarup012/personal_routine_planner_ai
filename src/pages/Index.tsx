import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Lightbulb, TrendingUp, CalendarHeart, User, Sparkles, ArrowRight } from "lucide-react";

// Feature cards data
const features = [
  { icon: Lightbulb, label: "Smart Plans", color: "from-amber-400 to-orange-500" },
  { icon: TrendingUp, label: "Growth", color: "from-emerald-400 to-teal-500" },
  { icon: CalendarHeart, label: "Self-Care", color: "from-rose-400 to-pink-500" },
  { icon: User, label: "You First", color: "from-violet-400 to-purple-500" },
];

export default function Index() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors">
      
      {/* === Glowing background circles === */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-emerald-400/20 to-teal-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-rose-400/10 to-pink-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* === Floating particles === */}
      <div className="absolute inset-0 z-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* === Main Content === */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-4xl mx-4 md:mx-auto text-center p-8 md:p-12"
      >
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 dark:border-slate-700/50 p-8 md:p-12">

          {/* Sparkle Icon */}
          <div className="flex justify-center mb-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg"
            >
              <Sparkles className="w-8 h-8 text-white" />
            </motion.div>
          </div>

          {/* Feature Cards */}
          <div className="flex flex-wrap justify-center gap-5 mb-10">
            {features.map(({ icon: Icon, label, color }, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.1, rotate: 5 }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className={`flex flex-col items-center gap-2 p-4 bg-gradient-to-br ${color} text-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 min-w-[120px]`}
              >
                <Icon className="h-6 w-6 drop-shadow" />
                <span className="text-sm font-semibold">{label}</span>
              </motion.div>
            ))}
          </div>

          {/* Heading */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-r from-slate-800 via-blue-600 to-purple-600 dark:from-white dark:via-blue-300 dark:to-purple-300 bg-clip-text text-transparent leading-tight"
          >
            Your Personal AI <br />
            <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent">
              Routine Planner
            </span>
          </motion.h1>

          {/* Subheading */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-10 font-medium max-w-2xl mx-auto leading-relaxed"
          >
            Plan smarter. Grow faster. Live better with your AI-powered all-in-one dashboard for productivity and wellness.
          </motion.p>

          {/* CTA Button */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            whileHover={{ scale: 1.05 }}
            className="flex justify-center"
          >
            <Button
              size="lg"
              className="text-lg px-12 py-6 rounded-full font-bold shadow-2xl transition-all duration-300 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white border-0 group"
              onClick={() => navigate("/onboarding")}
            >
              <span className="flex items-center gap-3">
                <Sparkles className="w-6 h-6" />
                Get Started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
          </motion.div>

          {/* Trust Indicator */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-700"
          >
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Trusted by thousands • Secure & Private • AI-Powered
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
