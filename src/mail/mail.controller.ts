import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { MailService } from './mail.service';
import { SendMailDto, UpdateMailDto } from './dto/mail.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Mails')
@Controller('mail')
export class MailController {
  constructor(private readonly mailService: MailService) {}

  @ApiOperation({ summary: 'Get all mails' })
  @Get()
  async myMails(): Promise<any> {
    return this.mailService.findMails();
  }

  @ApiOperation({ summary: 'Delete mail by Id' })
  @Delete(':id')
  async deleteMail(@Param('id', ParseIntPipe) id: number): Promise<any> {
    return this.mailService.deleteMail(id);
  }

  @ApiOperation({ summary: 'Send mail' })
  @Post()
  async sendMail(@Body() mailBody: SendMailDto): Promise<any> {
    return this.mailService.createMail(mailBody);
  }

  @ApiTags('Update Mail')
  @Put()
  updateMail(@Body() mailBody: UpdateMailDto): any {
    return this.mailService.updateMail(mailBody);
  }

  @ApiOperation({ summary: 'Upload Mail Attachment' })
  @Put('upload')
  @UseInterceptors(
    FilesInterceptor('file', 3, {
      storage: diskStorage({
        destination: join(__dirname, './attachments'),
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
    }),
  )
  async upload(@UploadedFiles() file, @Body() mailBody: any) {
    return this.mailService.saveAttachments(file, mailBody.id);
  }
}
