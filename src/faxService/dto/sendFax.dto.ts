import { IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SendFaxDto {
  @ApiProperty({ required: true, description: 'This is required Property' })
  @IsNotEmpty({ message: 'To should not be empty.' })
  readonly to: string;

  @ApiProperty({ required: true, description: 'This is required Property' })
  @IsNotEmpty({ message: 'From should not be empty.' })
  readonly from: string;

  @ApiPropertyOptional({ description: 'This is optional' })
  public mediaUrl: string;
}
