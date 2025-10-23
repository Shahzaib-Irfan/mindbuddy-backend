import { InjectRepository } from "@nestjs/typeorm";
import { Injectable } from "@nestjs/common";
import { CreateJournalDto } from "./dtos/CreateJournal.dto";
import { UpdateJournalDto } from "./dtos/UpdateJournal.dto";
import { Repository } from "typeorm";
import { Journal } from "./journal.entity";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";
import { DeepPartial } from 'typeorm';

@Injectable()
export class JournalService {
    constructor(
        @InjectRepository(Journal) private journalRepo: Repository<Journal>,
        @InjectQueue('journal-processing') private journalQueue: Queue,
    ) {}

    async create(anonymousUserId: string, data: CreateJournalDto): Promise<CreateJournalDto> {
        console.log(JSON.stringify(data));
        const journal = this.journalRepo.create({
            anonymousUserId,
            ...data,
        });

        const savedEntry = await this.journalRepo.save(journal);

        // Fire-and-forget: don't block the HTTP request waiting for Redis/Bull.
        // Log success or failure asynchronously so enqueue errors surface in logs
        // but won't impact API latency.
        await this.journalQueue
            .add(
                'analyze-entry',
                {
                    entryId: savedEntry.id,
                    anonymousUserId,
                },
                {
                    delay: 1000,
                    attempts: 3,
                    backoff: {
                        type: 'exponential',
                        delay: 2000,
                    },
                },
            )
            .then(() => console.log(`Enqueued analyze-entry for journal ${savedEntry.id}`))
            .catch((err) => console.error(`Failed to enqueue job analyze-entry for journal ${savedEntry.id}:`, err));

        return savedEntry;
    }

    async update(id: string, data: UpdateJournalDto): Promise<Journal | null> {
        await this.journalRepo.update(id, data);
        return this.journalRepo.findOne({ where: { id } });
    }      
    
    async delete(id: string): Promise<void> {
        await this.journalRepo.delete(id);
    }

    async findById(id: string): Promise<Journal | null> {
        return this.journalRepo.findOne({ where: { id } });
    }

    async findAll(): Promise<Journal[]> {
        return this.journalRepo.find();
    }

    async findByUser(anonymousUserId: string): Promise<Journal[]> {
        return this.journalRepo.find({ 
            where: { 
                anonymousUserId,
                isDeleted: false 
            },
            order: {
                createdAt: 'DESC'
            }
        });
    }

    async findByUserAndId(anonymousUserId: string, id: string): Promise<Journal | null> {
        return this.journalRepo.findOne({ 
            where: { 
                id,
                anonymousUserId,
                isDeleted: false 
            }
        });
    }

    async updateByUser(anonymousUserId: string, id: string, data: UpdateJournalDto): Promise<Journal | null> {
        const journal = await this.findByUserAndId(anonymousUserId, id);
        if (!journal) {
            return null;
        }
        await this.journalRepo.update(id, data);
        return this.journalRepo.findOne({ where: { id } });
    }

    async deleteByUser(anonymousUserId: string, id: string): Promise<boolean> {
        const journal = await this.findByUserAndId(anonymousUserId, id);
        if (!journal) {
            return false;
        }
        await this.journalRepo.update(id, { isDeleted: true });
        return true;
    }

    async updateAnalysisResults(
        entryId: string,
        analysisResults: {
            sentimentScore?: number | null;
            emotionScores?: {
                joy?: number;
                sadness?: number;
                anger?: number;
                fear?: number;
                surprise?: number;
                disgust?: number;
                anxiety?: number;
                excitement?: number;
            } | null;
            moodScore?: number | null;
            aiInsights?: {
                summary?: string;
                keyThemes?: string[];
                suggestedActions?: string[];
                crisalthScore?: number;
                triggerWarnings?: string[];
            } | null;
            processingStatus: 'completed' | 'failed';
    },
    ): Promise<void> {
    try {
        const journalEntry = await this.journalRepo.findOneBy({ id: entryId });
        if (!journalEntry) {
            throw new Error(`Journal entry with ID ${entryId} not found`);
        }
        Object.assign(journalEntry, {
            sentimentScore: analysisResults.sentimentScore ?? 0.0,
            emotionScores: analysisResults.emotionScores ?? {},
            moodScore: analysisResults.moodScore ?? 0.0,
            aiInsights: {
                summary: analysisResults.aiInsights?.summary ?? '',
                keyThemes: analysisResults.aiInsights?.keyThemes ?? [],
                suggestedActions: analysisResults.aiInsights?.suggestedActions ?? [],
                crisalthScore: analysisResults.aiInsights?.crisalthScore ?? 0,
                triggerWarnings: analysisResults.aiInsights?.triggerWarnings ?? [],
            },
            processingStatus: analysisResults.processingStatus,
        });
        await this.journalRepo.save(journalEntry);
    } catch (error) {
        console.error('Failed to update analysis results:', error);
        throw new Error('Failed to update analysis results');
    }
    }

}