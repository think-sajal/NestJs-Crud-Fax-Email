import { IsArray, IsInt, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendMailDto {
  @ApiProperty({ required: true, description: 'Recipients' })
  @IsArray()
  @IsString({ each: true })
  to: string[];

  @ApiProperty()
  @IsString()
  body: string;

  @ApiProperty()
  @IsString()
  subject: string;
}

export class UpdateMailDto {
  @ApiProperty()
  @IsInt()
  id: number;

  @ApiProperty()
  @IsString()
  body: string;
}
