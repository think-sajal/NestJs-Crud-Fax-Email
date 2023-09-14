import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class CreateNoteDto {
  @ApiProperty({ required: true, description: 'this is required Property' })
  @MinLength(5)
  @MaxLength(150)
  @IsNotEmpty({ message: 'Title should not be empty.' })
  title: string;

  @ApiPropertyOptional({ description: 'this is optional' })
  @MinLength(1)
  description: string;
}
