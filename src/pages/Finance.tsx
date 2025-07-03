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
import { ArrowLeft, TrendingUp, ExternalLink, Loader2, AlertCircle, DollarSign, PiggyBank, Target, Lightbulb, BadgeDollarSign, TrendingDown, Tag, Edit2, Trash2 } from "lucide-react";
import { GeminiService } from "@/lib/gemini";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

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

const NEWS_CACHE_KEY = 'financialNewsCache';
const NEWS_CACHE_DURATION = 5 * 60 * 60 * 1000; // 5 hours in ms

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

  // --- Finance Management State ---
  const CATEGORY_OPTIONS = [
    { label: "Food", value: "Food", color: "#8884d8" },
    { label: "Transport", value: "Transport", color: "#82ca9d" },
    { label: "Shopping", value: "Shopping", color: "#ffc658" },
    { label: "Bills", value: "Bills", color: "#ff8042" },
    { label: "Health", value: "Health", color: "#0088FE" },
    { label: "Entertainment", value: "Entertainment", color: "#FFBB28" },
    { label: "Other", value: "Other", color: "#FF8042" },
  ];
  const INCOME_SOURCE_OPTIONS = [
    { label: "Salary", value: "Salary" },
    { label: "Business", value: "Business" },
    { label: "Freelance", value: "Freelance" },
    { label: "Other", value: "Other" },
  ];

  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('expenses');
    return saved ? JSON.parse(saved) : [];
  });
  const [incomes, setIncomes] = useState(() => {
    const saved = localStorage.getItem('incomes');
    return saved ? JSON.parse(saved) : [];
  });
  const [expenseForm, setExpenseForm] = useState({
    amount: '',
    category: CATEGORY_OPTIONS[0].value,
    date: '',
    description: '',
    id: null,
  });
  const [incomeForm, setIncomeForm] = useState({
    amount: '',
    source: INCOME_SOURCE_OPTIONS[0].value,
    date: '',
    description: '',
    id: null,
  });
  const [expenseEditId, setExpenseEditId] = useState(null);
  const [incomeEditId, setIncomeEditId] = useState(null);
  const [expenseFilter, setExpenseFilter] = useState({ category: '', from: '', to: '' });
  const [incomeFilter, setIncomeFilter] = useState({ source: '', from: '', to: '' });

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(expenses));
  }, [expenses]);
  useEffect(() => {
    localStorage.setItem('incomes', JSON.stringify(incomes));
  }, [incomes]);

  // --- Expense Handlers ---
  const handleExpenseChange = (e) => {
    setExpenseForm({ ...expenseForm, [e.target.name]: e.target.value });
  };
  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!expenseForm.amount || !expenseForm.category || !expenseForm.date) return;
    if (expenseEditId) {
      setExpenses(expenses.map(exp => exp.id === expenseEditId ? { ...expenseForm, amount: parseFloat(expenseForm.amount), id: expenseEditId } : exp));
      setExpenseEditId(null);
    } else {
      setExpenses([
        ...expenses,
        { ...expenseForm, amount: parseFloat(expenseForm.amount), id: Date.now() },
      ]);
    }
    setExpenseForm({ amount: '', category: CATEGORY_OPTIONS[0].value, date: '', description: '', id: null });
  };
  const handleEditExpense = (exp) => {
    setExpenseForm({ ...exp, amount: exp.amount.toString() });
    setExpenseEditId(exp.id);
  };
  const handleDeleteExpense = (id) => {
    setExpenses(expenses.filter((exp) => exp.id !== id));
    if (expenseEditId === id) setExpenseEditId(null);
  };

  // --- Income Handlers ---
  const handleIncomeChange = (e) => {
    setIncomeForm({ ...incomeForm, [e.target.name]: e.target.value });
  };
  const handleAddIncome = (e) => {
    e.preventDefault();
    if (!incomeForm.amount || !incomeForm.source || !incomeForm.date) return;
    if (incomeEditId) {
      setIncomes(incomes.map(inc => inc.id === incomeEditId ? { ...incomeForm, amount: parseFloat(incomeForm.amount), id: incomeEditId } : inc));
      setIncomeEditId(null);
    } else {
      setIncomes([
        ...incomes,
        { ...incomeForm, amount: parseFloat(incomeForm.amount), id: Date.now() },
      ]);
    }
    setIncomeForm({ amount: '', source: INCOME_SOURCE_OPTIONS[0].value, date: '', description: '', id: null });
  };
  const handleEditIncome = (inc) => {
    setIncomeForm({ ...inc, amount: inc.amount.toString() });
    setIncomeEditId(inc.id);
  };
  const handleDeleteIncome = (id) => {
    setIncomes(incomes.filter((inc) => inc.id !== id));
    if (incomeEditId === id) setIncomeEditId(null);
  };

  // --- Filtering ---
  const filterByDate = (arr, from, to) => {
    return arr.filter(item => {
      if (from && item.date < from) return false;
      if (to && item.date > to) return false;
      return true;
    });
  };
  const filteredExpenses = filterByDate(
    expenseFilter.category ? expenses.filter(e => e.category === expenseFilter.category) : expenses,
    expenseFilter.from,
    expenseFilter.to
  );
  const filteredIncomes = filterByDate(
    incomeFilter.source ? incomes.filter(i => i.source === incomeFilter.source) : incomes,
    incomeFilter.from,
    incomeFilter.to
  );

  // --- Analytics ---
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalIncomes = filteredIncomes.reduce((sum, i) => sum + i.amount, 0);
  const netSavings = totalIncomes - totalExpenses;
  const largestExpense = filteredExpenses.reduce((max, e) => e.amount > (max?.amount || 0) ? e : max, null);
  const categoryCount = filteredExpenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + 1;
    return acc;
  }, {});
  const mostFrequentCategory = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  const expenseCategoryData = CATEGORY_OPTIONS.map(opt => ({
    category: opt.label,
    value: filteredExpenses.filter(e => e.category === opt.value).reduce((sum, e) => sum + e.amount, 0),
    color: opt.color,
  })).filter(d => d.value > 0);

  // Monthly bar chart data
  const getMonth = date => date.slice(0, 7); // YYYY-MM
  const months = Array.from(new Set([...filteredExpenses, ...filteredIncomes].map(e => getMonth(e.date)))).sort();
  const barChartData = months.map(month => ({
    month,
    Expenses: filteredExpenses.filter(e => getMonth(e.date) === month).reduce((sum, e) => sum + e.amount, 0),
    Income: filteredIncomes.filter(i => getMonth(i.date) === month).reduce((sum, i) => sum + i.amount, 0),
  }));

  useEffect(() => {
    const cached = localStorage.getItem(NEWS_CACHE_KEY);
    if (cached) {
      const { news: cachedNews, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < NEWS_CACHE_DURATION) {
        setNews(cachedNews);
        setIsLoading(false);
        return;
      }
    }
    fetchFinancialNews();
  }, []);

  const fetchFinancialNews = async (force = false) => {
    if (!apiKey) {
      setError("API key is missing. Please provide your Gemini API key.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // If not forced, check cache first
      if (!force) {
        const cached = localStorage.getItem(NEWS_CACHE_KEY);
        if (cached) {
          const { news: cachedNews, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < NEWS_CACHE_DURATION) {
            setNews(cachedNews);
            setIsLoading(false);
            return;
          }
        }
      }
      const geminiService = new GeminiService({ apiKey });
      const response = await geminiService.getFinancialNews();
      if (response && response.news && Array.isArray(response.news)) {
        setNews(response.news);
        localStorage.setItem(NEWS_CACHE_KEY, JSON.stringify({ news: response.news, timestamp: Date.now() }));
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
              onClick={() => { fetchFinancialNews(true); }}
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

            {/* --- Finance Management Dashboard --- */}
            <div className="mt-12 space-y-8">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-card p-4 rounded-lg shadow flex flex-col items-center">
                  <BadgeDollarSign className="h-6 w-6 text-green-600 mb-2" />
                  <div className="text-xs text-muted-foreground">Total Income</div>
                  <div className="text-xl font-bold text-green-700">${totalIncomes.toFixed(2)}</div>
                </div>
                <div className="bg-card p-4 rounded-lg shadow flex flex-col items-center">
                  <TrendingDown className="h-6 w-6 text-red-600 mb-2" />
                  <div className="text-xs text-muted-foreground">Total Expenses</div>
                  <div className="text-xl font-bold text-red-700">${totalExpenses.toFixed(2)}</div>
                </div>
                <div className="bg-card p-4 rounded-lg shadow flex flex-col items-center">
                  <PiggyBank className="h-6 w-6 text-blue-600 mb-2" />
                  <div className="text-xs text-muted-foreground">Net Savings</div>
                  <div className={`text-xl font-bold ${netSavings >= 0 ? 'text-blue-700' : 'text-red-700'}`}>${netSavings.toFixed(2)}</div>
                </div>
                <div className="bg-card p-4 rounded-lg shadow flex flex-col items-center">
                  <Tag className="h-6 w-6 text-yellow-600 mb-2" />
                  <div className="text-xs text-muted-foreground">Most Frequent Category</div>
                  <div className="text-xl font-bold text-yellow-700">{mostFrequentCategory || '-'}</div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pie Chart */}
                <div className="bg-card p-4 rounded-lg shadow flex flex-col items-center">
                  <h3 className="font-semibold mb-2">Expense Category Breakdown</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie data={expenseCategoryData} dataKey="value" nameKey="category" cx="50%" cy="50%" outerRadius={80} label>
                        {expenseCategoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Bar Chart */}
                <div className="bg-card p-4 rounded-lg shadow flex flex-col items-center">
                  <h3 className="font-semibold mb-2">Monthly Income & Expenses</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="Income" fill="#4ade80" />
                      <Bar dataKey="Expenses" fill="#f87171" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Expense Filter */}
                <div className="bg-card p-4 rounded-lg shadow">
                  <h3 className="font-semibold mb-2">Filter Expenses</h3>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <select name="category" value={expenseFilter.category} onChange={e => setExpenseFilter(f => ({ ...f, category: e.target.value }))} className="input text-black">
                      <option value="">All Categories</option>
                      {CATEGORY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                    <input type="date" value={expenseFilter.from} onChange={e => setExpenseFilter(f => ({ ...f, from: e.target.value }))} className="input text-black" placeholder="From" />
                    <input type="date" value={expenseFilter.to} onChange={e => setExpenseFilter(f => ({ ...f, to: e.target.value }))} className="input text-black" placeholder="To" />
                  </div>
                </div>
                {/* Income Filter */}
                <div className="bg-card p-4 rounded-lg shadow">
                  <h3 className="font-semibold mb-2">Filter Income</h3>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <select name="source" value={incomeFilter.source} onChange={e => setIncomeFilter(f => ({ ...f, source: e.target.value }))} className="input text-black">
                      <option value="">All Sources</option>
                      {INCOME_SOURCE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                    <input type="date" value={incomeFilter.from} onChange={e => setIncomeFilter(f => ({ ...f, from: e.target.value }))} className="input text-black" placeholder="From" />
                    <input type="date" value={incomeFilter.to} onChange={e => setIncomeFilter(f => ({ ...f, to: e.target.value }))} className="input text-black" placeholder="To" />
                  </div>
                </div>
              </div>

              {/* Expense & Income Management */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Expense Management */}
                <div className="bg-card p-4 rounded-lg shadow">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">Expenses <TrendingDown className="h-4 w-4 text-red-600" /></h3>
                  <form onSubmit={handleAddExpense} className="space-y-2 mb-4">
                    <div className="flex gap-2">
                      <input type="number" name="amount" value={expenseForm.amount} onChange={handleExpenseChange} className="input text-black w-24" required min="0.01" step="0.01" placeholder="Amount" />
                      <select name="category" value={expenseForm.category} onChange={handleExpenseChange} className="input text-black">
                        {CATEGORY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                      <input type="date" name="date" value={expenseForm.date} onChange={handleExpenseChange} className="input text-black w-32" required />
                      <input type="text" name="description" value={expenseForm.description} onChange={handleExpenseChange} className="input text-black flex-1" placeholder="Description" />
                      <button type="submit" className="btn btn-primary">{expenseEditId ? 'Update' : 'Add'}</button>
                    </div>
                  </form>
                  <ul className="divide-y divide-border max-h-64 overflow-y-auto">
                    {filteredExpenses.length === 0 && <li className="text-muted-foreground py-4 text-center">No expenses found.</li>}
                    {filteredExpenses.map((exp) => {
                      const cat = CATEGORY_OPTIONS.find(c => c.value === exp.category);
                      return (
                        <li key={exp.id} className="py-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">${exp.amount.toFixed(2)}</span>
                            <span className="px-2 py-0.5 rounded text-xs" style={{ background: cat?.color || '#eee', color: '#222' }}>{exp.category}</span>
                            <span className="text-xs text-muted-foreground">{exp.date}</span>
                            {exp.description && <span className="text-xs text-muted-foreground">- {exp.description}</span>}
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => handleEditExpense(exp)} className="text-blue-600 hover:underline text-xs flex items-center"><Edit2 className="h-4 w-4 mr-1" />Edit</button>
                            <button onClick={() => handleDeleteExpense(exp.id)} className="text-destructive hover:underline text-xs flex items-center"><Trash2 className="h-4 w-4 mr-1" />Delete</button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
                {/* Income Management */}
                <div className="bg-card p-4 rounded-lg shadow">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">Income <TrendingUp className="h-4 w-4 text-green-600" /></h3>
                  <form onSubmit={handleAddIncome} className="space-y-2 mb-4">
                    <div className="flex gap-2">
                      <input type="number" name="amount" value={incomeForm.amount} onChange={handleIncomeChange} className="input text-black w-24" required min="0.01" step="0.01" placeholder="Amount" />
                      <select name="source" value={incomeForm.source} onChange={handleIncomeChange} className="input text-black">
                        {INCOME_SOURCE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                      </select>
                      <input type="date" name="date" value={incomeForm.date} onChange={handleIncomeChange} className="input text-black w-32" required />
                      <input type="text" name="description" value={incomeForm.description} onChange={handleIncomeChange} className="input text-black flex-1" placeholder="Description" />
                      <button type="submit" className="btn btn-primary">{incomeEditId ? 'Update' : 'Add'}</button>
                    </div>
                  </form>
                  <ul className="divide-y divide-border max-h-64 overflow-y-auto">
                    {filteredIncomes.length === 0 && <li className="text-muted-foreground py-4 text-center">No income found.</li>}
                    {filteredIncomes.map((inc) => (
                      <li key={inc.id} className="py-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">${inc.amount.toFixed(2)}</span>
                          <span className="px-2 py-0.5 rounded text-xs bg-green-200 text-green-800">{inc.source}</span>
                          <span className="text-xs text-muted-foreground">{inc.date}</span>
                          {inc.description && <span className="text-xs text-muted-foreground">- {inc.description}</span>}
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleEditIncome(inc)} className="text-blue-600 hover:underline text-xs flex items-center"><Edit2 className="h-4 w-4 mr-1" />Edit</button>
                          <button onClick={() => handleDeleteIncome(inc.id)} className="text-destructive hover:underline text-xs flex items-center"><Trash2 className="h-4 w-4 mr-1" />Delete</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 