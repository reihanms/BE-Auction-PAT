import { IsNotEmpty } from 'class-validator';

export class CreateBidDto {
  user_id: number;

  @IsNotEmpty()
  auction_id: number;

  @IsNotEmpty()
  bid_price: number;
}
