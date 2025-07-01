const GEMINI_API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

export interface GeminiConfig {
  apiKey: string;
}

export interface GenerateTodosRequest {
  routineDescription: string;
  selectedDate?: string; // ISO string of selected date
  userDetails: {
    name: string;
    age: number;
    occupation: string;
  };
}

export interface GenerateTodosResponse {
  todos: {
    title: string;
    description: string;
    timeFrame: string;
  }[];
}

export interface FinancialNewsResponse {
  news: {
    id: string;
    title: string;
    summary: string;
    source: string;
    publishedAt: string;
    url?: string;
  }[];
}

export interface FinancialAdviceRequest {
  monthlyIncome: number;
  monthlyExpenses: number;
  expenseBreakdown?: string;
  financialGoals?: string;
  userDetails: {
    name: string;
    age: number;
    occupation: string;
  };
}

export interface FinancialAdviceResponse {
  advice: {
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
  };
}

export class GeminiService {
  private apiKey: string;

  constructor(config: GeminiConfig) {
    this.apiKey = config.apiKey;
  }

  async validateApiKey(): Promise<boolean> {
    try {
      const response = await fetch(
        `${GEMINI_API_BASE_URL}?key=${this.apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: "Hello, this is a test request to validate the API key.",
                  },
                ],
              },
            ],
          }),
        }
      );

      return response.status !== 400 && response.status !== 403;
    } catch (error) {
      console.error("Error validating API key:", error);
      return false;
    }
  }

  async generateTodos(
    request: GenerateTodosRequest
  ): Promise<GenerateTodosResponse> {
    try {
      const { routineDescription, userDetails, selectedDate } = request;
      
      const dateText = selectedDate 
        ? `for ${new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}` 
        : 'today';

        const prompt = `
        You are a smart, supportive, and highly efficient AI routine assistant helping users build productive daily routines tailored to their profession, lifestyle, and personal goals.
        
        User Details:
        - Name: ${userDetails.name}
        - Age: ${userDetails.age}
        - Profession: ${userDetails.occupation}
        - Daily habits or context: "${routineDescription || 'N/A'}"
        
        Your task:
        Generate a highly effective and balanced daily routine for ${dateText}, focusing on productivity, health, and personal growth. Make the routine realistic, motivational, and aligned with the user's professional and personal responsibilities.
        
        **Output Format (JSON):**
        {
          "todos": [
            {
              "title": "Task or Activity Title",
              "description": "Clear and practical steps or notes for the activity",
              "timeFrame": "Suggested time or time block (e.g., '8:00 AM – 9:00 AM', 'Afternoon')"
            }
          ]
        }
        
        **Guidelines:**
        - Include 6 to 10 meaningful tasks covering work, learning, self-care, health, and rest.
        - Tailor the tasks to suit the user's **profession** (e.g., coding, teaching, design, business).
        - Start with a morning routine and end with night reflection or winding down.
        - Ensure a healthy balance between deep work, breaks, meals, and personal time.
        - Be supportive and practical, avoiding overly generic advice.
        - IMPORTANT: Respond ONLY with valid JSON in the exact format specified above.
        `;
        

      const response = await fetch(
        `${GEMINI_API_BASE_URL}?key=${this.apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 2048,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }

      const data = await response.json();
      
      // Check if the response has the expected structure
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
        throw new Error("Invalid response structure from Gemini API");
      }
      
      // Extract the JSON response from the text
      const responseText = data.candidates[0].content.parts[0].text;
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        console.error("No JSON found in response:", responseText);
        throw new Error("AI response does not contain valid JSON format");
      }
      
      try {
        const jsonResponse = JSON.parse(jsonMatch[0]);
        
        // Validate the response structure
        if (!jsonResponse.todos || !Array.isArray(jsonResponse.todos)) {
          console.error("Invalid JSON structure:", jsonResponse);
          throw new Error("AI response does not contain valid todos array");
        }
        
        return jsonResponse as GenerateTodosResponse;
      } catch (parseError) {
        console.error("JSON parsing error:", parseError);
        console.error("Response text:", responseText);
        throw new Error("Failed to parse AI response as JSON");
      }
    } catch (error) {
      console.error("Error generating todos:", error);
      throw error;
    }
  }

  async getFinancialNews(): Promise<FinancialNewsResponse> {
    try {
      const prompt = `
        You are a veteran financial advisor with 20 years of experience, trusted by high‑net‑worth clients for your insights and precision. Aggregate the latest and most important financial news from the past 24 hours and present it in structured JSON.

Output Format (JSON):

json
Copy
Edit
{
  "news": [
    {
      "id": "unique-id-1",
      "title": "News Headline",
      "summary": "Brief summary of the news article (2-3 sentences)",
      "source": "News Source Name",
      "publishedAt": "2024-01-15T10:30:00Z",
      "url": "https://example.com/article-url"
    }
  ]
}
Advisor Guidelines:

Curate 6–8 of the most market‑moving stories from the past 24 hours.

Prioritize major equity, bond and commodity moves, company earnings surprises, key economic indicator releases, and central‑bank or regulatory policy shifts.

Balance optimistic developments (e.g., stronger‑than‑expected GDP, blockbuster earnings) with headwinds (e.g., inflation data, geopolitical tensions).

Draw on a diverse set of reputable sources: Reuters, Bloomberg, CNBC, Financial Times, The Wall Street Journal, etc.

Provide concise, actionable summaries: 2–3 sentences highlighting why each story matters to investors.

Use realistic but fictional URLs for demonstration.

Assign each item a unique ID and a recent ISO‑8601 timestamp within the last 24 hours in UTC.

Respond only with the JSON array as specified—no additional text.
        `;

      const response = await fetch(
        `${GEMINI_API_BASE_URL}?key=${this.apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 2048,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }

      const data = await response.json();
      
      // Check if the response has the expected structure
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
        throw new Error("Invalid response structure from Gemini API");
      }
      
      // Extract the JSON response from the text
      const responseText = data.candidates[0].content.parts[0].text;
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        console.error("No JSON found in response:", responseText);
        throw new Error("AI response does not contain valid JSON format");
      }
      
      try {
        const jsonResponse = JSON.parse(jsonMatch[0]);
        
        // Validate the response structure
        if (!jsonResponse.news || !Array.isArray(jsonResponse.news)) {
          console.error("Invalid JSON structure:", jsonResponse);
          throw new Error("AI response does not contain valid news array");
        }
        
        return jsonResponse as FinancialNewsResponse;
      } catch (parseError) {
        console.error("JSON parsing error:", parseError);
        console.error("Response text:", responseText);
        throw new Error("Failed to parse AI response as JSON");
      }
    } catch (error) {
      console.error("Error fetching financial news:", error);
      throw error;
    }
  }

  async getFinancialAdvice(
    request: FinancialAdviceRequest
  ): Promise<FinancialAdviceResponse> {
    try {
      const { monthlyIncome, monthlyExpenses, expenseBreakdown, financialGoals, userDetails } = request;
      
      const disposableIncome = monthlyIncome - monthlyExpenses;
      const savingsRate = (disposableIncome / monthlyIncome) * 100;
      
      const prompt = `
        You are a certified financial advisor providing personalized financial advice. Analyze the user's financial situation and provide comprehensive recommendations.
        
        User Profile:
        - Name: ${userDetails.name}
        - Age: ${userDetails.age}
        - Occupation: ${userDetails.occupation}
        - Monthly Income: $${monthlyIncome.toLocaleString()}
        - Monthly Expenses: $${monthlyExpenses.toLocaleString()}
        - Disposable Income: $${disposableIncome.toLocaleString()}
        - Savings Rate: ${savingsRate.toFixed(1)}%
        ${expenseBreakdown ? `- Expense Breakdown: ${expenseBreakdown}` : ''}
        ${financialGoals ? `- Financial Goals: ${financialGoals}` : ''}
        
        **Output Format (JSON):**
        {
          "advice": {
            "budgetBreakdown": [
              {
                "category": "Essential Expenses",
                "percentage": 50,
                "amount": 2500,
                "description": "Housing, utilities, food, transportation, insurance"
              },
              {
                "category": "Savings & Investments",
                "percentage": 20,
                "amount": 1000,
                "description": "Emergency fund, retirement, investment accounts"
              },
              {
                "category": "Debt Repayment",
                "percentage": 15,
                "amount": 750,
                "description": "Credit cards, loans, student debt"
              },
              {
                "category": "Discretionary Spending",
                "percentage": 15,
                "amount": 750,
                "description": "Entertainment, dining out, shopping, hobbies"
              }
            ],
            "investmentRecommendations": [
              {
                "type": "Emergency Fund",
                "percentage": 10,
                "description": "High-yield savings account with 3-6 months of expenses",
                "riskLevel": "Low"
              },
              {
                "type": "Retirement Accounts",
                "percentage": 15,
                "description": "401(k) or IRA with diversified index funds",
                "riskLevel": "Medium"
              },
              {
                "type": "Taxable Investments",
                "percentage": 5,
                "description": "Brokerage account with ETFs and individual stocks",
                "riskLevel": "Medium-High"
              }
            ],
            "savingsGoals": [
              {
                "goal": "Emergency Fund",
                "timeline": "6 months",
                "monthlyAmount": 500,
                "description": "Build 3-6 months of expenses for financial security"
              },
              {
                "goal": "Retirement Savings",
                "timeline": "Long-term",
                "monthlyAmount": 750,
                "description": "Aim for 15% of income towards retirement"
              }
            ],
            "tips": [
              "Track your expenses using a budgeting app",
              "Automate your savings and investments",
              "Review and adjust your budget monthly",
              "Consider increasing your income through side hustles",
              "Pay off high-interest debt first"
            ]
          }
        }
        
        **Guidelines:**
        - Provide realistic and actionable advice based on the user's income and expenses
        - Consider the user's age and occupation when making recommendations
        - Ensure the budget breakdown percentages add up to 100%
        - Include specific investment types and risk levels
        - Provide 3-5 practical financial tips
        - Make savings goals achievable and time-bound
        - Consider the user's financial goals if provided
        - IMPORTANT: Respond ONLY with valid JSON in the exact format specified above
        `;

      const response = await fetch(
        `${GEMINI_API_BASE_URL}?key=${this.apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 2048,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }

      const data = await response.json();
      
      // Check if the response has the expected structure
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
        throw new Error("Invalid response structure from Gemini API");
      }
      
      // Extract the JSON response from the text
      const responseText = data.candidates[0].content.parts[0].text;
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        console.error("No JSON found in response:", responseText);
        throw new Error("AI response does not contain valid JSON format");
      }
      
      try {
        const jsonResponse = JSON.parse(jsonMatch[0]);
        
        // Validate the response structure
        if (!jsonResponse.advice || !jsonResponse.advice.budgetBreakdown || !Array.isArray(jsonResponse.advice.budgetBreakdown)) {
          console.error("Invalid JSON structure:", jsonResponse);
          throw new Error("AI response does not contain valid advice structure");
        }
        
        return jsonResponse as FinancialAdviceResponse;
      } catch (parseError) {
        console.error("JSON parsing error:", parseError);
        console.error("Response text:", responseText);
        throw new Error("Failed to parse AI response as JSON");
      }
    } catch (error) {
      console.error("Error getting financial advice:", error);
      throw error;
    }
  }
}