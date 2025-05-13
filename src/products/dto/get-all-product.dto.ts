import { IsObject, IsOptional, IsString } from 'class-validator';
import { PriceSubunit } from './price-subunit.dto';

export class GetAllProductDto {
  @IsOptional()
  @IsString()
  name?: string;
  
  @IsOptional()
  @IsObject()
  price_subunit?: PriceSubunit;
}