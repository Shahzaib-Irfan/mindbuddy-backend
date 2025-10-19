    import { Injectable } from '@nestjs/common';
    import { GoogleGenerativeAI } from '@google/generative-ai';
    import { ConfigService } from '@nestjs/config';

    @Injectable()
    export class GeminiService {

      private genAI: GoogleGenerativeAI;
      private model: any; // Or a more specific type if desired

      constructor(private configService: ConfigService) {
        this.genAI = new GoogleGenerativeAI(this.configService.get<string>('OPENAI_API_KEY')!);
        this.model = this.genAI.getGenerativeModel({ model: this.configService.get<string>('OPENAI_MODEL')! });
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

      // Add methods for chat, multi-turn conversations, etc.
      async startChat() {
        return this.model.startChat({ history: [] });
      }
    }