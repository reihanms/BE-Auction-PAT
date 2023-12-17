import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { omit } from 'lodash';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { calculateExpirationDate } from 'src/helpers/calculate-expiration-date';
import { CreateBidDto } from './dto/create-bid.auction.dto';

@Injectable()
export class AuctionService {
  constructor(private dbService: PrismaService) {}

  async getAuctions() {
    const auctions = await this.dbService.auctions.findMany({
      where: {
        is_complete: false,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
    const data =
      auctions.length <= 0
        ? []
        : auctions.map((item) => {
            const bid_at = item.highest_bid + item.price_increment;
            return {
              ...omit(item, ['created_at', 'updated_at']),
              bid_at,
            };
          });

    return {
      statusCode: 200,
      message: 'Success',
      data: data,
    };
  }

  async getAuction(auctionId: number) {
    const auction = await this.dbService.auctions.findFirst({
      where: {
        id: auctionId,
        // is_complete: false, optional kalo mau di hide auction yang dah beres
      },
      select: {
        user_id: true,
        picture: true,
        title: true,
        description: true,
        category: true,
        price_increment: true,
        start_bid: true,
        highest_bid: true,
        buy_out_price: true,
        expired: true,
        is_complete: true,
        bidder_won_id: true,
      },
    });
    if (!auction) {
      throw new HttpException('Auction not found', HttpStatus.BAD_REQUEST);
    }
    const user = await this.dbService.users.findFirst({
      where: {
        id: auction.user_id,
      },
      select: {
        id: true,
        profile_picture: true,
        name: true,
      },
    });
    const bid_at = auction.highest_bid + auction.price_increment;
    return {
      statusCode: 200,
      message: 'Success',
      data: {
        ...omit(auction, ['user_id']),
        bid_at,
        user,
      },
    };
  }

  async createAuction(userId: number, dto: CreateAuctionDto) {
    const expired = calculateExpirationDate(new Date(), dto.day, dto.hour);
    const createAuction = await this.dbService.auctions.create({
      data: {
        picture: dto.picture,
        title: dto.title,
        description: dto.description,
        category: dto.category,
        price_increment: dto.price_increment,
        buy_out_price: dto.buy_out_price,
        start_bid: dto.start_bid,
        user_id: userId,
        expired,
      },
    });
    if (createAuction) {
      return {
        statusCode: 200,
        message: 'Success',
        data: omit(createAuction, [
          'id',
          'user_id',
          'created_at',
          'updated_at',
        ]),
      };
    }
  }

  async createBid(userId: number, dto: CreateBidDto) {
    const is_owner = await this.dbService.auctions.findFirst({
      where: {
        user_id: userId,
      },
    });
    if (is_owner) {
      throw new HttpException(
        'You cannot bid your own auction!',
        HttpStatus.BAD_REQUEST,
      );
    }
    const auctionData = await this.dbService.auctions.findFirst({
      where: {
        id: dto.auction_id,
        is_complete: false,
      },
      select: {
        start_bid: true,
        highest_bid: true,
        price_increment: true,
        buy_out_price: true,
      },
    });

    if (!auctionData) {
      throw new HttpException(
        'Auction not found or has been closed',
        HttpStatus.NOT_FOUND,
      );
    }

    const { start_bid, highest_bid, price_increment, buy_out_price } =
      auctionData;

    const expectedBidPrice = highest_bid == 0 ? start_bid : highest_bid;

    if ((dto.bid_price - expectedBidPrice) % price_increment !== 0) {
      throw new HttpException(
        `Bid price is not a valid increment of ${price_increment}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    if (dto.bid_price <= expectedBidPrice) {
      throw new HttpException(
        `Minimum bid price is ${expectedBidPrice}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Create the bid
    const createBid = await this.dbService.bids.create({
      data: {
        ...dto,
        user_id: userId,
      },
    });

    if (createBid) {
      await this.dbService.auctions.update({
        where: {
          id: createBid.auction_id,
        },
        data: {
          highest_bid: createBid.bid_price,
          bidder_won_id: createBid.user_id,
        },
      });
      if (createBid.bid_price == buy_out_price) {
        await this.dbService.auctions.update({
          where: {
            id: createBid.auction_id,
          },
          data: {
            is_complete: true,
          },
        });
      }
      return {
        statusCode: 200,
        message: 'Success',
        data: omit(createBid, ['id', 'created_at', 'updated_at']),
      };
    }

    throw new HttpException(
      'Failed to create bid',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  async createBuyout(userId: number, dto: CreateBidDto) {
    const auctionData = await this.dbService.auctions.findFirst({
      where: {
        id: dto.auction_id,
        is_complete: false,
      },
      select: {
        buy_out_price: true,
      },
    });

    if (!auctionData) {
      throw new HttpException(
        'Auction not found or has been closed',
        HttpStatus.NOT_FOUND,
      );
    }

    const { buy_out_price } = auctionData;

    if (dto.bid_price < buy_out_price || dto.bid_price > buy_out_price) {
      throw new HttpException(
        `Your price is not a valid buy out price: ${buy_out_price}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    // Create the bid
    const createBid = await this.dbService.bids.create({
      data: {
        ...dto,
        user_id: userId,
      },
    });

    if (createBid) {
      await this.dbService.auctions.update({
        where: {
          id: createBid.auction_id,
        },
        data: {
          highest_bid: createBid.bid_price,
          bidder_won_id: createBid.user_id,
          is_complete: true,
        },
      });
      return {
        statusCode: 200,
        message: 'Success',
        data: omit(createBid, ['id', 'created_at', 'updated_at']),
      };
    }

    throw new HttpException(
      'Failed to buy out auction',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  async getInvoiceAuction(auctionId: number, userId: number) {
    const is_owner = await this.dbService.auctions.findFirst({
      where: {
        bidder_won_id: userId,
      },
    });
    if (!is_owner) {
      throw new HttpException(
        'You are not allowed to access this invoice',
        HttpStatus.BAD_REQUEST,
      );
    }
    const auction_data = await this.dbService.auctions.findFirst({
      where: {
        id: auctionId,
      },
      select: {
        title: true,
        user: true,
        bidder_won_id: true,
        highest_bid: true,
      },
    });
    const auction_winner = await this.dbService.users.findFirst({
      where: {
        id: auction_data.bidder_won_id,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
    const tax_total = auction_data.highest_bid * 0.1;
    const service_total = 100000;
    const sub_total = auction_data.highest_bid + tax_total + service_total;

    return {
      statusCode: 200,
      message: 'Success',
      data: {
        auction_title: auction_data.title,
        auction_owner: auction_data.user.name,
        auction_owner_email: auction_data.user.email,
        auction_winner,
        tax_total,
        service_total,
        sub_total,
      },
    };
  }

  async getUserBids(userId: number) {
    const bids = await this.dbService.bids.findMany({
      where: {
        user_id: userId,
      },
      select: {
        id: true,
        auction_id: true,
        bid_price: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    if (bids && bids.length > 0) {
      const bidsWithAuctionData = await Promise.all(
        bids.map(async (bid) => {
          const auction = await this.dbService.auctions.findFirst({
            where: {
              id: bid.auction_id,
            },
            select: {
              picture: true,
              title: true,
              description: true,
              category: true,
              highest_bid: true,
            },
          });

          return {
            bid_id: bid.id,
            auction_id: bid.auction_id,
            bid_price: bid.bid_price,
            auction_data: auction,
          };
        }),
      );

      return {
        statusCode: 200,
        message: 'Success',
        data: bidsWithAuctionData,
      };
    } else {
      return {
        statusCode: 200,
        message: 'Success',
        data: [],
      };
    }
  }

  async checkAuctionExpired() {
    const currentDateTime = new Date();

    const expiredAuctions = await this.dbService.auctions.findMany({
      where: {
        is_complete: false,
        expired: {
          lt: currentDateTime,
        },
      },
    });
    if (expiredAuctions.length >= 1) {
      expiredAuctions.map(async (auction) => {
        await this.dbService.auctions.update({
          where: { id: auction.id },
          data: { is_complete: true },
        });

        const auction_winner = await this.dbService.bids.findFirst({
          where: { auction_id: auction.id },
          orderBy: [{ bid_price: 'desc' }],
          take: 1,
          select: {
            user_id: true,
            auction_id: true,
          },
        });
        if (auction_winner) {
          await this.dbService.auctions.update({
            where: { id: auction_winner.auction_id },
            data: { is_complete: true, bidder_won_id: auction_winner.user_id },
          });
        }
      });
    }
  }
}
