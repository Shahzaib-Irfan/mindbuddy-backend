import { Controller, Post, Get, Put, Delete, UseGuards, Body, Param, Request } from "@nestjs/common";
import { JournalService } from "./journal.service";
import { CreateJournalDto } from "./dtos/CreateJournal.dto";
import { AuthGuard } from "src/modules/auth/auth.guard";
import { UpdateJournalDto } from "./dtos/UpdateJournal.dto";

@Controller('journal')
export class JournalController {
    constructor(private readonly journalService: JournalService){}

    @Post()
    @UseGuards(AuthGuard)
    async create(@Body() dto: CreateJournalDto, @Request() req: any,) {
        console.log(`User: ${JSON.stringify(req.user)}`);
        var savedJournal = await this.journalService.create(req.user.sub, dto);

        return {
            statusCode: 201,
            message: "Journal entry created successfully",
            data: savedJournal
        }
    }

    @Put(':id')
    @UseGuards(AuthGuard)
    async update(@Param('id') id: string, @Body() dto: UpdateJournalDto, @Request() req: any) {
        var updatedJournal = await this.journalService.updateByUser(req.user.sub, id, dto);
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
    async getById(@Param('id') id: string, @Request() req: any) {
        var journal = await this.journalService.findByUserAndId(req.user.sub, id);
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
    async getAll(@Request() req: any) {
        var journals = await this.journalService.findByUser(req.user.sub);
        return {
            statusCode: 200,
            message: "Journal entries retrieved successfully",
            data: journals
        }
    }

    @Delete(':id')
    @UseGuards(AuthGuard)
    async delete(@Param('id') id: string, @Request() req: any) {
        var result = await this.journalService.deleteByUser(req.user.sub, id);
        if (!result) {
            return {
                statusCode: 404,
                message: "Journal entry not found"
            }
        }
        return {
            statusCode: 200,
            message: "Journal entry deleted successfully"
        }
    }
}