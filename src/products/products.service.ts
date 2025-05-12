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

  findAll(getAllProductDto: GetAllProductDto) {
    const { name, priceSubunitGte, priceSubunitLte } = getAllProductDto;
    const queryBuilder: SelectQueryBuilder<Product> = 
      this.productsRepository.createQueryBuilder('product');
    if (name) {
      queryBuilder.andWhere('product.name = :name', { name: name });
    }
    if (priceSubunitGte) {
      queryBuilder.andWhere('product.priceSubunit >= :priceSubunit', { 
        priceSubunit: priceSubunitGte 
      });
    }
    if (priceSubunitLte) {
      queryBuilder.andWhere('product.priceSubunit <= :priceSubunit', { 
        priceSubunit: priceSubunitLte 
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
