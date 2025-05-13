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
import { NamingUtils } from '../utils/naming.utils';
import { OperatorEnum } from '../utils/enums/operator.enum';
import { DataTypeEnum } from '../utils/enums/data-type.enum';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    private readonly categoriesService: CategoriesService,
  ) {}

  findAll(
    getAllProductDto: GetAllProductDto,
    userId: number
  ): Promise<Product[]> {
    const conditions = this.buildConditions(getAllProductDto);
    const queryBuilder: SelectQueryBuilder<Product> = this.productsRepository
      .createQueryBuilder('product')
      .where('product.user.id = :userId', { userId: userId });

    conditions.forEach((condition) => {
      queryBuilder.andWhere(condition.condition, condition.value);
    });
    return queryBuilder.getMany();
  }

  buildConditions = (getAllProductDto: GetAllProductDto) => {
    const fields = Object.entries(getAllProductDto).map(([key, value]) => ({ 
      key: NamingUtils.snakeCaseToCamelCase(key),
      value
    }));
    const tableName = this.productsRepository.metadata.tableName;
    const conditions = [];
    fields.forEach((field) => {
      if (typeof field.value === DataTypeEnum.STRING) {
        conditions.push({ 
          condition: `${tableName}.${field.key} = :${field.key}`,
          value: { [field.key]: field.value } 
        });
      }
      if (typeof field.value === DataTypeEnum.OBJECT) {
        conditions.push(...this.buildSpecialConditions(field));
      }
    });
    return conditions;
  }

  buildSpecialConditions = (field) => {
    const tableName = this.productsRepository.metadata.tableName;
    const operators = Object.keys(field.value);
    const specialConditions = [];
    operators.forEach((operator) => {
      if (operator === OperatorEnum.GTE) {
        specialConditions.push({
          condition: `${tableName}.${field.key} >= :${field.key}Gte`,
          value: { [`${field.key}Gte`]: field.value[operator] }
        });
      }
      if (operator === OperatorEnum.LTE) {
        specialConditions.push({
          condition: `${tableName}.${field.key} <= :${field.key}Lte`,
          value: { [`${field.key}Lte`]: field.value[operator] }
        });
      }
    })
    return specialConditions;
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
