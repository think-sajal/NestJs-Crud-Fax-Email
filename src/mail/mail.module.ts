import { Global, Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mail } from './entities/mail.entity';
import { MailController } from './mail.controller';

@Global() 
@Module({
  imports: [
    TypeOrmModule.forFeature([Mail]),
  ],
  providers: [MailService],
  controllers: [MailController], 
})
export class MailModule {}
