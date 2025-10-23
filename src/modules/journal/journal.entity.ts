import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('journal_entries')
@Index(['anonymousUserId', 'createdAt'])
@Index(['anonymousUserId', 'isDeleted'])
export class Journal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'anonymous_user_id' })
  anonymousUserId: string;

  @Column({ name: 'encrypted_content', type: 'text' })
  encryptedContent: string;

  @Column({ name: 'mood_score', type: 'integer', nullable: true })
  moodScore?: number;

  @Column({ name: 'word_count', type: 'integer', default: 0 })
  wordCount: number;

  @Column({ name: 'tags', type: 'text', array: true, default: '{}' })
  tags: string[];

  @Column({ name: 'is_deleted', default: false })
  isDeleted: boolean;

  @Column({ name: 'sentiment_score', type: 'decimal', precision: 5, scale: 4, nullable: true })
  sentimentScore?: number;

  @Column({ name: 'emotion_scores', type: 'jsonb', nullable: true })
  emotionScores?: {
    joy?: number;
    sadness?: number;
    anger?: number;
    fear?: number;
    surprise?: number;
    disgust?: number;
    anxiety?: number;
    excitement?: number;
  };

  @Column({ name: 'ai_insights', type: 'jsonb', nullable: true })
  aiInsights?: {
    summary?: string;
    keyThemes?: string[];
    suggestedActions?: string[];
    crisalthScore?: number;
    triggerWarnings?: string[];
  };

  @Column({ name: 'processing_status', default: 'pending' })
  processingStatus: 'pending' | 'processing' | 'completed' | 'failed';

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'version', default: 1 })
  version: number;
}
