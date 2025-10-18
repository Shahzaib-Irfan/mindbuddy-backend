import { Controller, Post, Get, Put, Delete, UseGuards, Body, Param } from "@nestjs/common";
import { JournalService } from "./journal.service";
import { CreateJournalDto } from "./dtos/CreateJournal.dto";
import { AuthGuard } from "src/modules/auth/auth.guard";
import { UpdateJournalDto } from "./dtos/UpdateJournal.dto";

@Controller('journal')
export class JournalController {
    constructor(private readonly journalService: JournalService){}

    @Post()
    @UseGuards(AuthGuard)
    async create(@Body() dto: CreateJournalDto) {
        var savedJournal = await this.journalService.create(dto);

        return {
            statusCode: 201,
            message: "Journal entry created successfully",
            data: savedJournal
        }
    }

    @Put(':id')
    @UseGuards(AuthGuard)
    async update(@Param('id') id: string, @Body() dto: UpdateJournalDto) {
        var updatedJournal = await this.journalService.update(id, dto);
        if (!updatedJournal) {
            return {
                statusCode: 404,
                message: "Journal entry not found"
            }
        }
        return {
            statusCode: 200,
            message: "Journal entry updated successfully",
            data: updatedJournal
        }
    }

    @Get(':id')
    @UseGuards(AuthGuard)
    async getById(@Param('id') id: string) {
        var journal = await this.journalService.findById(id);
        if (!journal) {
            return {
                statusCode: 404,
                message: "Journal entry not found"
            }
        }
        return {
            statusCode: 200,
            message: "Journal entry retrieved successfully",
            data: journal
        }
    }

    @Get()
    @UseGuards(AuthGuard)
    async getAll() {
        var journals = await this.journalService.findAll();
        return {
            statusCode: 200,
            message: "Journal entries retrieved successfully",
            data: journals
        }
    }

    @Delete(':id')
    @UseGuards(AuthGuard)
    async delete(@Param('id') id: string) {
        await this.journalService.delete(id);
        return {
            statusCode: 200,
            message: "Journal entry deleted successfully"
        }
    }
}