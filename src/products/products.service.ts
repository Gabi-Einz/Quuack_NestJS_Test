import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Between, Repository, SelectQueryBuilder } from 'typeorm';
import { Product } from './entities/product.entity';
import { GetAllProductDto } from './dto/get-all-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  findAll(getAllProductDto: GetAllProductDto): Promise<Product[]> {
    const { name, price_subunit: priceSubunit } = getAllProductDto;
    const queryBuilder: SelectQueryBuilder<Product> = 
      this.productsRepository.createQueryBuilder('product');
    if (name) {
      queryBuilder.andWhere('product.name = :name', { name: name });
    }
    if (priceSubunit.gte) {
      queryBuilder.andWhere('product.priceSubunit >= :priceSubunit', { 
        priceSubunit: priceSubunit.gte
      });
    }
    if (priceSubunit.lte) {
      queryBuilder.andWhere('product.priceSubunit <= :priceSubunit', { 
        priceSubunit: priceSubunit.lte 
      });
    }
    return queryBuilder.getMany();

  }

  findOne(id: number) {
    return this.productsRepository.findOneByOrFail({ id });
  }

  create(createProductDto: CreateProductDto) {
    return this.productsRepository.save(createProductDto);
  }

  update(product: Product, updateProductDto: UpdateProductDto) {
    return this.productsRepository.save({ ...product, ...updateProductDto });
  }

  remove(product: Product) {
    return this.productsRepository.delete(product.id);
  }
}
