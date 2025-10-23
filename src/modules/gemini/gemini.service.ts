    import { Injectable } from '@nestjs/common';
    import { GoogleGenerativeAI } from '@google/generative-ai';
    import { ConfigService } from '@nestjs/config';

    @Injectable()
    export class GeminiService {

      private genAI: GoogleGenerativeAI;
      private model: any;

      constructor(private configService: ConfigService) {
        this.genAI = new GoogleGenerativeAI(this.configService.get<string>('OPENAI_API_KEY')!);
        this.model = this.genAI.getGenerativeModel({ model: this.configService.get<string>('OPENAI_MODEL') || 'gemini-2.0-flash' });
      }

      async generateContent(prompt: string): Promise<string> {
        try {
          const result = await this.model.generateContent(prompt);
          const response = await result.response;
          return response.text();
        } catch (error) {
          console.error('Error generating content from Gemini:', error);
          throw error;
        }
      }

      async generateJSON(prompt: string): Promise<any> {
        const fullPrompt = `${prompt}\n\nReturn the response strictly in JSON format.`;
        const result = await this.generateContent(fullPrompt);
        try {
          return JSON.parse(result);
        } catch {
          throw new Error('Gemini did not return valid JSON');
        }
      }
      async startChat() {
        return this.model.startChat({ history: [] });
      }
    }