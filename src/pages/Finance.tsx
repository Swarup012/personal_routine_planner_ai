import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAppContext } from "@/context/app-context";
import { ArrowLeft, TrendingUp, ExternalLink, Loader2, AlertCircle, DollarSign, PiggyBank, Target, Lightbulb } from "lucide-react";
import { GeminiService } from "@/lib/gemini";

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  publishedAt: string;
  url?: string;
}

interface FinancialAdvice {
  budgetBreakdown: {
    category: string;
    percentage: number;
    amount: number;
    description: string;
  }[];
  investmentRecommendations: {
    type: string;
    percentage: number;
    description: string;
    riskLevel: string;
  }[];
  savingsGoals: {
    goal: string;
    timeline: string;
    monthlyAmount: number;
    description: string;
  }[];
  tips: string[];
}

export default function Finance() {
  const navigate = useNavigate();
  const { apiKey, userDetails } = useAppContext();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdviceLoading, setIsAdviceLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("news");
  
  // Financial advice form state
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [monthlyExpenses, setMonthlyExpenses] = useState("");
  const [expenseBreakdown, setExpenseBreakdown] = useState("");
  const [financialGoals, setFinancialGoals] = useState("");
  const [financialAdvice, setFinancialAdvice] = useState<FinancialAdvice | null>(null);

  useEffect(() => {
    fetchFinancialNews();
  }, []);

  const fetchFinancialNews = async () => {
    if (!apiKey) {
      setError("API key is missing. Please provide your Gemini API key.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const geminiService = new GeminiService({ apiKey });
      const response = await geminiService.getFinancialNews();
      
      if (response && response.news && Array.isArray(response.news)) {
        setNews(response.news);
      } else {
        setError("Failed to fetch news. Please try again.");
      }
    } catch (error) {
      console.error("Error fetching financial news:", error);
      setError("Failed to fetch financial news. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getFinancialAdvice = async () => {
    if (!apiKey) {
      setError("API key is missing. Please provide your Gemini API key.");
      return;
    }

    if (!monthlyIncome || !monthlyExpenses) {
      setError("Please provide both monthly income and expenses.");
      return;
    }

    setIsAdviceLoading(true);
    setError(null);

    try {
      const geminiService = new GeminiService({ apiKey });
      const response = await geminiService.getFinancialAdvice({
        monthlyIncome: parseFloat(monthlyIncome),
        monthlyExpenses: parseFloat(monthlyExpenses),
        expenseBreakdown,
        financialGoals,
        userDetails: userDetails!,
      });
      
      if (response && response.advice) {
        setFinancialAdvice(response.advice);
      } else {
        setError("Failed to generate financial advice. Please try again.");
      }
    } catch (error) {
      console.error("Error getting financial advice:", error);
      setError("Failed to generate financial advice. Please try again.");
    } finally {
      setIsAdviceLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

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
    <div className="min-h-screen bg-gradient-to-br from-background to-primary/5">
      <div className="container mx-auto p-4 py-6 max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="outline"
              onClick={() => navigate("/landing")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <Button
              onClick={fetchFinancialNews}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <TrendingUp className="h-4 w-4" />
              )}
              Refresh News
            </Button>
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
              <TrendingUp className="h-8 w-8 text-primary" />
              Financial Dashboard
            </h1>
            <p className="text-muted-foreground">
              Stay updated with market news and get personalized financial advice
            </p>
          </div>
        </motion.div>

        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="news" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Market News
            </TabsTrigger>
            <TabsTrigger value="advice" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Financial Advice
            </TabsTrigger>
          </TabsList>

          {/* News Tab */}
          <TabsContent value="news" className="space-y-6">
            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                  <p className="text-lg text-muted-foreground">Fetching latest financial news...</p>
                </div>
              </div>
            )}

            {/* News Grid */}
            {!isLoading && news.length > 0 && (
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {news.map((item) => (
                  <motion.div key={item.id} variants={item}>
                    <Card className="h-full hover:shadow-lg transition-all duration-300 border-primary/20 hover:border-primary/40">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg line-clamp-2 leading-tight">
                            {item.title}
                          </CardTitle>
                          {item.url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(item.url, '_blank')}
                              className="flex-shrink-0 ml-2"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>{item.source}</span>
                          <span>{formatDate(item.publishedAt)}</span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground line-clamp-4 leading-relaxed">
                          {item.summary}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* Empty State */}
            {!isLoading && news.length === 0 && !error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <div className="rounded-full bg-primary/10 p-4 w-16 h-16 mx-auto flex items-center justify-center mb-4">
                  <TrendingUp className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">No News Available</h3>
                <p className="text-muted-foreground mb-4">
                  Unable to fetch financial news at the moment.
                </p>
                <Button onClick={fetchFinancialNews}>
                  Try Again
                </Button>
              </motion.div>
            )}
          </TabsContent>

          {/* Financial Advice Tab */}
          <TabsContent value="advice" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Input Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    Your Financial Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="income">Monthly Income</Label>
                      <Input
                        id="income"
                        type="number"
                        placeholder="5000"
                        value={monthlyIncome}
                        onChange={(e) => setMonthlyIncome(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="expenses">Monthly Expenses</Label>
                      <Input
                        id="expenses"
                        type="number"
                        placeholder="3000"
                        value={monthlyExpenses}
                        onChange={(e) => setMonthlyExpenses(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="breakdown">Expense Breakdown (Optional)</Label>
                    <Textarea
                      id="breakdown"
                      placeholder="e.g., Rent: $1500, Food: $500, Transportation: $300, Entertainment: $200..."
                      value={expenseBreakdown}
                      onChange={(e) => setExpenseBreakdown(e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="goals">Financial Goals (Optional)</Label>
                    <Textarea
                      id="goals"
                      placeholder="e.g., Save for house down payment, build emergency fund, invest for retirement..."
                      value={financialGoals}
                      onChange={(e) => setFinancialGoals(e.target.value)}
                      className="min-h-[80px]"
                    />
                  </div>
                  
                  <Button 
                    onClick={getFinancialAdvice}
                    disabled={isAdviceLoading || !monthlyIncome || !monthlyExpenses}
                    className="w-full"
                  >
                    {isAdviceLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Advice...
                      </>
                    ) : (
                      <>
                        <Lightbulb className="mr-2 h-4 w-4" />
                        Get Financial Advice
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Advice Display */}
              <div className="space-y-6">
                {financialAdvice && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                  >
                    {/* Budget Breakdown */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <PiggyBank className="h-5 w-5 text-primary" />
                          Budget Breakdown
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {financialAdvice.budgetBreakdown.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div>
                              <div className="font-medium">{item.category}</div>
                              <div className="text-sm text-muted-foreground">{item.description}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">{formatCurrency(item.amount)}</div>
                              <div className="text-sm text-muted-foreground">{item.percentage}%</div>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    {/* Investment Recommendations */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="h-5 w-5 text-primary" />
                          Investment Recommendations
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {financialAdvice.investmentRecommendations.map((item, index) => (
                          <div key={index} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-medium">{item.type}</div>
                              <Badge variant={item.riskLevel === 'High' ? 'destructive' : item.riskLevel === 'Medium' ? 'default' : 'secondary'}>
                                {item.riskLevel} Risk
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground mb-2">{item.description}</div>
                            <div className="text-sm font-medium">Allocation: {item.percentage}%</div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    {/* Savings Goals */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="h-5 w-5 text-primary" />
                          Savings Goals
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {financialAdvice.savingsGoals.map((goal, index) => (
                          <div key={index} className="p-3 bg-muted/50 rounded-lg">
                            <div className="font-medium mb-1">{goal.goal}</div>
                            <div className="text-sm text-muted-foreground mb-2">{goal.description}</div>
                            <div className="flex items-center justify-between text-sm">
                              <span>Timeline: {goal.timeline}</span>
                              <span className="font-medium">{formatCurrency(goal.monthlyAmount)}/month</span>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    {/* Tips */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Lightbulb className="h-5 w-5 text-primary" />
                          Financial Tips
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {financialAdvice.tips.map((tip, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                              <span className="text-sm">{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {!financialAdvice && !isAdviceLoading && (
                  <Card className="border-dashed">
                    <CardContent className="text-center py-12">
                      <div className="rounded-full bg-primary/10 p-4 w-16 h-16 mx-auto flex items-center justify-center mb-4">
                        <Lightbulb className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-medium mb-2">Get Personalized Financial Advice</h3>
                      <p className="text-muted-foreground">
                        Enter your income and expenses to receive AI-powered financial management advice.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 