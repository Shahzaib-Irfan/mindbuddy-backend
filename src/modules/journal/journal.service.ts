import { InjectRepository } from "@nestjs/typeorm";
import { Injectable } from "@nestjs/common";
import { CreateJournalDto } from "./dtos/CreateJournal.dto";
import { UpdateJournalDto } from "./dtos/UpdateJournal.dto";
import { Repository } from "typeorm";
import { Journal } from "./journal.entities";

@Injectable()
export class JournalService {
    constructor(
        @InjectRepository(Journal) private journalRepo: Repository<Journal>,
    ) {}

    async create(data: CreateJournalDto): Promise<CreateJournalDto> {
        console.log(JSON.stringify(data));
        
        const journalData = {
            encryptedContent: data.encryptedContent || data.encryptedContent,
            moodScore: data.moodScore || data.moodScore,
            tags: data.tags || [],
        };

        const journal = this.journalRepo.create(journalData);
        return this.journalRepo.save(journal);
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
}