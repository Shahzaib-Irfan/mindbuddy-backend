// users/users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Journal } from './journal.entity';
import { JournalService } from './journal.service';
import { JournalController } from './journal.controller';
import { GeminiModule } from '../gemini/gemini.module';
import { BullModule } from '@nestjs/bull';
import { JournalProcessor } from './processors/journal.processor';
@Module({
  imports: [
    TypeOrmModule.forFeature([Journal]), 
    BullModule.registerQueue({
        name: 'journal-processing',
    }),
    GeminiModule
  ],
  controllers: [JournalController],
  providers: [JournalService, JournalProcessor],
  exports: [JournalService],
})
export class JournalModule {}
