import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Product } from './entities/product.entity';
import { GetAllProductDto } from './dto/get-all-product.dto';
import { Category } from '../categories/entities/category.entity';
import { CategoriesService } from '../categories/categories.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    private readonly categoriesService: CategoriesService,
  ) {}

  findAll(getAllProductDto: GetAllProductDto, userId: number): Promise<Product[]> {
    const { name, price_subunit: priceSubunit } = getAllProductDto;
    const priceSubunitGte = priceSubunit ? priceSubunit.gte : null; 
    const priceSubunitLte = priceSubunit ? priceSubunit.lte : null; 
    const queryBuilder: SelectQueryBuilder<Product> = this.productsRepository
      .createQueryBuilder('product')
      .where('product.user.id = :userId', { userId: userId });
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

  async findOne(id: number, userId: number) {
    const product: Product = await this.productsRepository.findOne({ 
      where: { id: id, user: { id: userId } }, 
      relations: ['categories'] 
    });
    if (!product) {
      throw new NotFoundException();
    }
    return product;
  }

  create(createProductDto: CreateProductDto, user: User) {
    return this.productsRepository.save({ ...createProductDto, user });
  }

  async update(product: Product, updateProductDto: UpdateProductDto) {
    const { categoryIds, ...rest } = updateProductDto;
    let newCategories: Category[] = [];
    if (categoryIds) {
      newCategories = await this.categoriesService.findByCategoryIds(
        categoryIds
      );
    }
    const existingCategoryIds: number[] = product.categories.map(
      (category) => category.id
    );
    const uniqueCategories: Category[] = [
      ...product.categories,
      ...newCategories.filter(
        (newCategory) => !existingCategoryIds.includes(newCategory.id)
      ),
    ];
    product.categories = uniqueCategories;
    return this.productsRepository.save({ ...product, ...rest });
  }

  remove(product: Product) {
    return this.productsRepository.delete(product.id);
  }
}
