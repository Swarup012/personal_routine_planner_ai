// Unified AI service for different providers
export interface AIServiceConfig {
  apiKey: string;
  provider: 'gemini' | 'openai' | 'deepseek';
}

export interface AIResponse {
  text: string;
  error?: string;
}

export class AIService {
  private apiKey: string;
  private provider: string;

  constructor(config: AIServiceConfig) {
    this.apiKey = config.apiKey;
    this.provider = config.provider;
  }

  async validateApiKey(): Promise<boolean> {
    try {
      switch (this.provider) {
        case 'gemini':
          return await this.validateGeminiKey();
        case 'openai':
          return await this.validateOpenAIKey();
        case 'deepseek':
          return await this.validateDeepSeekKey();
        default:
          return false;
      }
    } catch (error) {
      console.error('API key validation error:', error);
      return false;
    }
  }

  async generateResponse(prompt: string): Promise<AIResponse> {
    try {
      switch (this.provider) {
        case 'gemini':
          return await this.callGeminiAPI(prompt);
        case 'openai':
          return await this.callOpenAIAPI(prompt);
        case 'deepseek':
          return await this.callDeepSeekAPI(prompt);
        default:
          return { text: '', error: 'Unsupported provider' };
      }
    } catch (error) {
      console.error('AI API call error:', error);
      return { text: '', error: 'Failed to generate response' };
    }
  }

  private async validateGeminiKey(): Promise<boolean> {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${this.apiKey}`);
      return response.ok;
    } catch {
      return false;
    }
  }

  private async validateOpenAIKey(): Promise<boolean> {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  private async validateDeepSeekKey(): Promise<boolean> {
    try {
      const response = await fetch('https://api.deepseek.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  private async callGeminiAPI(prompt: string): Promise<AIResponse> {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error('Gemini API request failed');
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      return { text };
    } catch (error) {
      return { text: '', error: 'Failed to call Gemini API' };
    }
  }

  private async callOpenAIAPI(prompt: string): Promise<AIResponse> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error('OpenAI API request failed');
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || '';
      return { text };
    } catch (error) {
      return { text: '', error: 'Failed to call OpenAI API' };
    }
  }

  private async callDeepSeekAPI(prompt: string): Promise<AIResponse> {
    try {
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error('DeepSeek API request failed');
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || '';
      return { text };
    } catch (error) {
      return { text: '', error: 'Failed to call DeepSeek API' };
    }
  }
} 