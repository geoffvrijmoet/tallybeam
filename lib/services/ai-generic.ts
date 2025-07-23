import { GoogleGenerativeAI } from '@google/generative-ai'

function createGeminiClient(version: 'v1' | 'v1beta' | 'v1alpha' = 'v1') {
  const key = process.env.GEMINI_API_KEY || ''
  if (!key) {
    throw new Error('GEMINI_API_KEY environment variable is required')
  }
  // The SDK constructor's signature variants aren't reflected in current @types; cast to any to pass httpOptions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new (GoogleGenerativeAI as any)(key, { httpOptions: { apiVersion: version } }) as GoogleGenerativeAI
}

export interface AIPromptRequest {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIResponse<T = unknown> {
  success: boolean;
  data?: T;
  rawResponse?: string;
  error?: string;
  usage?: {
    inputTokens?: number;
    outputTokens?: number;
  };
}

/**
 * Generic AI service for prompt/response interactions
 * Can be used for various tasks like data extraction, text generation, classification, etc.
 */
export class AIService {
  private client: GoogleGenerativeAI;
  private model: string;

  constructor(modelName: string = 'gemini-1.5-flash') {
    this.client = createGeminiClient();
    this.model = modelName;
  }

  /**
   * Send a prompt to the AI and get a response
   */
  async prompt(request: AIPromptRequest): Promise<AIResponse<string>> {
    try {
      const model = this.client.getGenerativeModel({ model: this.model });
      
      let fullPrompt = request.prompt;
      if (request.systemPrompt) {
        fullPrompt = `${request.systemPrompt}\n\n${request.prompt}`;
      }

      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();

      return {
        success: true,
        data: text,
        rawResponse: text,
      };
    } catch (error) {
      console.error('AI Service Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown AI error',
      };
    }
  }

  /**
   * Send a prompt expecting a JSON response
   * Automatically parses and validates the JSON
   */
  async promptForJSON<T = unknown>(request: AIPromptRequest): Promise<AIResponse<T>> {
    try {
      const jsonRequest = {
        ...request,
        prompt: `${request.prompt}\n\nRespond with ONLY a valid JSON object, no other text.`
      };

      const response = await this.prompt(jsonRequest);
      
      if (!response.success || !response.data) {
        return {
          success: false,
          error: response.error || 'No response data',
        };
      }

      // Try to parse JSON from the response
      let parsedData: T;
      try {
        parsedData = JSON.parse(response.data);
      } catch {
        // If direct parsing fails, try to extract JSON from the response
        const jsonMatch = response.data.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedData = JSON.parse(jsonMatch[0]);
        } else {
          return {
            success: false,
            error: 'Could not parse JSON from AI response',
            rawResponse: response.data,
          };
        }
      }

      return {
        success: true,
        data: parsedData,
        rawResponse: response.data,
      };
    } catch (error) {
      console.error('AI JSON Service Error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown AI JSON error',
      };
    }
  }

  /**
   * Classify text into categories
   */
  async classify(text: string, categories: string[], systemPrompt?: string): Promise<AIResponse<{ category: string; confidence: number }>> {
    const prompt = `
    Classify the following text into one of these categories: ${categories.join(', ')}
    
    Text to classify: "${text}"
    
    Respond with a JSON object containing:
    - category: the best matching category from the list
    - confidence: a number between 0 and 1 indicating your confidence
    
    ${systemPrompt || ''}`;

    return this.promptForJSON<{ category: string; confidence: number }>({ prompt });
  }

  /**
   * Extract structured data from unstructured text
   */
  async extract<T = unknown>(text: string, schema: Record<string, string>, systemPrompt?: string): Promise<AIResponse<T>> {
    const schemaDescription = Object.entries(schema)
      .map(([key, description]) => `- ${key}: ${description}`)
      .join('\n');

    const prompt = `
    Extract the following information from the text:
    
    ${schemaDescription}
    
    Text: "${text}"
    
    Respond with a JSON object containing the extracted data. If any field cannot be determined, use null.
    
    ${systemPrompt || ''}`;

    return this.promptForJSON<T>({ prompt });
  }

  /**
   * Generate text based on a template and data
   */
  async generate(template: string, data: Record<string, unknown>, systemPrompt?: string): Promise<AIResponse<string>> {
    const dataDescription = Object.entries(data)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    const prompt = `
    Generate text using this template and data:
    
    Template: ${template}
    
    Data:
    ${dataDescription}
    
    ${systemPrompt || ''}`;

    return this.prompt({ prompt, systemPrompt });
  }
}

// Export a default instance for convenience
export const aiService = new AIService();

// Export helper functions for common use cases
export async function promptAI(prompt: string, systemPrompt?: string): Promise<string | null> {
  const response = await aiService.prompt({ prompt, systemPrompt });
  return response.success ? response.data || null : null;
}

export async function extractData<T>(text: string, schema: Record<string, string>): Promise<T | null> {
  const response = await aiService.extract<T>(text, schema);
  return response.success ? response.data || null : null;
}

export async function classifyText(text: string, categories: string[]): Promise<{ category: string; confidence: number } | null> {
  const response = await aiService.classify(text, categories);
  return response.success ? response.data || null : null;
} 