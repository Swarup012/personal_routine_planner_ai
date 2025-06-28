// Gemini API client for AI functionality
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
        You are a personal routine assistant for ${userDetails.name}, who is ${userDetails.age} years old and works as a ${userDetails.occupation}.
        
        Based on the following daily routine description, create a list of 5-7 specific todo items ${dateText}.

        Daily routine description: "${routineDescription}"
        
        Format your response as a JSON object with the following structure:
        {
          "todos": [
            {
              "title": "Brief title",
              "description": "Detailed description of the task",
              "timeFrame": "Suggested time of day or duration"
            }
          ]
        }
        
        Provide practical, actionable items that can be completed within the day.
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
      
      // Extract the JSON response from the text
      const responseText = data.candidates[0].content.parts[0].text;
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        const jsonResponse = JSON.parse(jsonMatch[0]);
        return jsonResponse as GenerateTodosResponse;
      }
      
      throw new Error("Failed to parse response from Gemini API");
    } catch (error) {
      console.error("Error generating todos:", error);
      throw error;
    }
  }
}