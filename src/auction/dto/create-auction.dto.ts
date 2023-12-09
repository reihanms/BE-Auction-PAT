import { IsNotEmpty } from 'class-validator';

export class CreateAuctionDto {
  user_id: number;

  @IsNotEmpty()
  picture: string;

  @IsNotEmpty()
  title: string;

  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  category: string;

  @IsNotEmpty()
  price_increment: number;

  @IsNotEmpty()
  buy_out_price: number;

  @IsNotEmpty()
  start_bid: number;

  @IsNotEmpty()
  day: number;

  @IsNotEmpty()
  hour: number;
}
