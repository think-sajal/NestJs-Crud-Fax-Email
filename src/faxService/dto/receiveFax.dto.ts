import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReceiveFaxDto {
  @ApiProperty({ required: true, description: 'This is required Property' })
  @IsNotEmpty({ message: 'FaxSid should not be empty.' })
  faxSid: string;
}

export class ListReceivedFaxesDto {
  readonly page: number;
  readonly pageSize: number;
}
