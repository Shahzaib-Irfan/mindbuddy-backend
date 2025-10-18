import {IsString, IsOptional, IsInt, Min, Max, IsArray} from 'class-validator';

export class CreateJournalDto {
  @IsString()
  encryptedContent: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10)
  moodScore?: number;

  @IsOptional()
  @IsArray()
  @IsString({each: true})
  tags?: string[];

  @IsOptional()
  @IsInt()
  @Min(0)
  wordCount?: number;
}