// auction-scheduler.service.ts

import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AuctionService } from './auction.service';

@Injectable()
export class AuctionSchedulerService implements OnModuleInit {
  constructor(private readonly auctionService: AuctionService) {}

  onModuleInit() {
    this.checkAndUpdateAuctions();
  }

  @Cron(CronExpression.EVERY_10_SECONDS)
  async checkAndUpdateAuctions() {
    await this.auctionService.checkAuctionExpired();
  }
}
