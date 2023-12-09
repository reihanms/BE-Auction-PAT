import { Module } from '@nestjs/common';
import { AuctionService } from './auction.service';
import { AuctionController } from './auction.controller';
import { AuctionSchedulerService } from './auction-scheduler.service';

@Module({
  providers: [AuctionService, AuctionSchedulerService],
  controllers: [AuctionController],
})
export class AuctionModule {}
