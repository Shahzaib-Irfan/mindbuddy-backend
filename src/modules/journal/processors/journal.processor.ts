import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { JournalService } from '../journal.service';
import { GeminiService } from 'src/modules/gemini/gemini.service';

@Processor('journal-processing')
export class JournalProcessor {
  constructor(
    private readonly journalService: JournalService,
    private readonly geminiService: GeminiService,
  ) {
    console.log('JournalProcessor initialized and ready to process jobs');
  }

  @Process('analyze-entry')
  async handleAnalysis(
    job: Job<{ entryId: string; anonymousUserId: string; priority?: string }>,
  ) {
    const { entryId } = job.data;

    try {
      const journalEntry = await this.journalService.findById(entryId);

      if (!journalEntry) {
        throw new Error(`Journal entry with ID ${entryId} not found`);
      }

      const prompt = `
        You are an AI mental health insights assistant.
        Analyze the following journal entry and return **only valid JSON** (no markdown, no extra text).
        Use this format exactly:
        {
          "sentimentScore": number (-1 to 1),
          "emotionScores": {
            "joy": number,
            "sadness": number,
            "anger": number,
            "fear": number,
            "surprise": number,
            "disgust": number,
            "anxiety": number,
            "excitement": number
          },
          "moodScore": number (0 to 10, optional),
          "aiInsights": {
            "summary": string,
            "keyThemes": [string],
            "suggestedActions": [string],
            "crisisScore": number (0 to 1),
            "triggerWarnings": [string]
          }
        }

        Journal Entry:
        """${journalEntry.encryptedContent}"""
      `;

      const aiResponse = await this.geminiService.generateContent(prompt);
      console.log('AI Response:', aiResponse);

      let structuredResult: any = null;
      try {
        structuredResult = JSON.parse(aiResponse);
      } catch {
        const jsonMatch = aiResponse.match(/{[\s\S]*}/);
        if (jsonMatch) {
          structuredResult = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('AI response is not valid JSON');
        }
      }

      const analysisResults = {
        sentimentScore: structuredResult?.sentimentScore ?? 0.0,
        emotionScores: structuredResult?.emotionScores ?? {},
        moodScore: structuredResult?.moodScore ?? 0.0,
        aiInsights: {
            summary: structuredResult?.aiInsights?.summary ?? '',
            keyThemes: structuredResult?.aiInsights?.keyThemes ?? [],
            suggestedActions: structuredResult?.aiInsights?.suggestedActions ?? [],
            crisalthScore: structuredResult?.aiInsights?.crisisScore ?? 0,
            triggerWarnings: structuredResult?.aiInsights?.triggerWarnings ?? [],
        },
        processingStatus: 'completed' as const,
        };

      await this.journalService.updateAnalysisResults(entryId, analysisResults);
    } catch (error) {
      console.error('Error during journal analysis:', error);
      await this.journalService.updateAnalysisResults(entryId, {
        processingStatus: 'failed',
      });
    }
  }
}
