import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  findAll(): Promise<Category[]> {
    return this.categoriesRepository.find();


  }

  create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    return this.categoriesRepository.save(createCategoryDto);
  }

  findByCategoryIds(categoryIds: number[]): Promise<Category[]> {
    return this.categoriesRepository.findBy({ 
      id: In(categoryIds) 
    });
  }
}
