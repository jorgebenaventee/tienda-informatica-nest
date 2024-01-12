import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { ProductsService } from '../services/products.service'

@Injectable()
export class ProductExistsGuard implements CanActivate {
  constructor(private readonly productsService: ProductsService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest()
    const productId = request.params.id

    if (productId.length !== 36 && typeof productId !== 'string') {
      throw new BadRequestException(`Product id ${productId} is not a uuid`)
    }
    return this.productsService
      .findOne(productId.toString())
      .then((product) => {
        if (product) {
          request.product = product
          return true
        } else {
          throw new BadRequestException(
            `Product with id ${productId} not found`,
          )
        }
      })
  }
}
