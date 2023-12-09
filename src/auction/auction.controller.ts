import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuctionService } from './auction.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { CreateBidDto } from './dto/create-bid.auction.dto';

@Controller('api/auction')
export class AuctionController {
  constructor(private auctionService: AuctionService) {}

  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Get('')
  async getAuctions() {
    return await this.auctionService.getAuctions();
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Get('/:id')
  async getAuction(@Param('id', ParseIntPipe) auctionId: number) {
    return await this.auctionService.getAuction(auctionId);
  }

  @UseGuards(JwtAuthGuard)
  @UsePipes(ValidationPipe)
  @HttpCode(200)
  @Post('create')
  async createAuction(@Request() req: any, @Body() dto: CreateAuctionDto) {
    const userId = req.user.user_id;
    return await this.auctionService.createAuction(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @UsePipes(ValidationPipe)
  @HttpCode(200)
  @Post('/bid')
  async createBid(@Request() req: any, @Body() dto: CreateBidDto) {
    const userId = req.user.user_id;
    return await this.auctionService.createBid(userId, dto);
  }
  @UseGuards(JwtAuthGuard)
  @UsePipes(ValidationPipe)
  @HttpCode(200)
  @Post('/buyout')
  async createBuyout(@Request() req: any, @Body() dto: CreateBidDto) {
    const userId = req.user.user_id;
    return await this.auctionService.createBuyout(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Get('/invoice/:id')
  async getInvoiceAuction(
    @Param('id', ParseIntPipe) auctionId: number,
    @Request() req: any,
  ) {
    const userId = req.user.user_id;
    return await this.auctionService.getInvoiceAuction(auctionId, userId);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Get('/bid/all')
  async getUserBids(@Request() req: any) {
    const userId = req.user.user_id;
    return await this.auctionService.getUserBids(userId);
  }
}
