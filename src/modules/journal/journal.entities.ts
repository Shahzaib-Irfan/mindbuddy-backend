import {IsString, IsOptional, IsInt, Min, Max, IsArray} from 'class-validator';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('journal_entries')
export class Journal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'encrypted_content', type: 'text', nullable: false })
  encryptedContent: string;

  @Column({ name: 'mood_score', type: 'integer', nullable: true })
  moodScore?: number;

  @Column({ name: 'word_count', type: 'integer', nullable: false, default: 0 })
  wordCount: number;

  @Column({ type: 'text', array: true, default: '{}' })
  tags: string[];

  @Column({ name: 'is_deleted', type: 'boolean', nullable: false, default: false })
  isDeleted: boolean;

  @Column({ name: 'sentiment_score', type: 'decimal', precision: 5, scale: 4, nullable: true })
  sentimentScore?: number;

  @Column({ name: 'emotion_scores', type: 'jsonb', nullable: true })
  emotionScores?: any;

  @Column({ name: 'ai_insights', type: 'jsonb', nullable: true })
  aiInsights?: any;

  @Column({ name: 'processing_status', type: 'varchar', nullable: false, default: 'pending' })
  processingStatus: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ type: 'integer', nullable: false, default: 1 })
  version: number;
}