import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetAllProductDto } from './dto/get-all-product.dto';
import { CurrentUser } from '../auth/auth.decorator';

@ApiTags('Products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  index(@Query() getAllProductDto: GetAllProductDto, @CurrentUser() user) {
    return this.productsService.findAll(getAllProductDto, user.id);
  }

  @Post()
  create(@Body() createProductDto: CreateProductDto, @CurrentUser() user) {
    return this.productsService.create(createProductDto, user);
  }

  @Get(':id')
  async show(@Param('id') id: number, @CurrentUser() user) {
    return await this.productsService.findOne(+id, user.id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateProductDto: UpdateProductDto,
    @CurrentUser() user,
  ) {
    const product = await this.productsService.findOne(id, user.id);

    return this.productsService.update(product, updateProductDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: number, @CurrentUser() user) {
    const product = await this.productsService.findOne(id, user.id);

    return this.productsService.remove(product);
  }
}
