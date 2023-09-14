import { Controller, Post, Get, Query, Body } from '@nestjs/common';
import { SendFaxDto } from './dto/sendFax.dto';
import { ApiTags } from '@nestjs/swagger';
import { FaxService } from './fax.service';

@ApiTags('Faxes')
@Controller('fax')
export class FaxController {
  constructor(private readonly faxService: FaxService) {}

  @ApiTags('Send Fax')
  @Post('send')
  async sendFax(@Body() sendFaxDto: SendFaxDto): Promise<void> {
    await this.faxService.sendFax(sendFaxDto);
  }

  @ApiTags('Received Fax')
  @Get('received')
  async listReceivedFaxes(): Promise<any> {
    return this.faxService.listReceivedFaxes();
  }
}
