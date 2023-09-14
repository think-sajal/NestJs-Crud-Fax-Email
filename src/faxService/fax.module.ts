import { Module } from '@nestjs/common';
import { FaxService } from './fax.service';
import { FaxController } from './fax.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SendFax } from './entities/sendFax.entity';
import { ReceivedFax } from './entities/receivedFax.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([SendFax]),
    TypeOrmModule.forFeature([ReceivedFax]),
  ],
  controllers: [FaxController],
  providers: [FaxService],
})
export class FaxModule {}
