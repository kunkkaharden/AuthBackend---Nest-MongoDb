import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductImage } from './entities/product-image.entity';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductService');
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,
  ) {}
  async create(createProductDto: CreateProductDto) {
    try {
      const { images = [], ...producDetails } = createProductDto;
      const p = this.productRepository.create({
        ...producDetails,
        images: images.map((image) =>
          this.productImageRepository.create({ url: image }),
        ),
      });
      await this.productRepository.save(p);
      return { ...p, images: images };
    } catch (error) {
      this.handleException(error);
    }
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    return this.productRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true,
      },
    });
  }

  async findOne(id: string) {
    const product = await this.productRepository.findOneBy({ id });
    if (!product) {
      throw new NotFoundException(`Product not found id-> ${id}`);
    }
    return product;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
    return;
  }

  private handleException(error: any) {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    this.logger.error(error);
    throw new InternalServerErrorException('Error -> check server logs');
  }
}
