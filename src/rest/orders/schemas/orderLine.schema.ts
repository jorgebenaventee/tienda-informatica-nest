import { Prop } from '@nestjs/mongoose'
import { v4 as uuidv4 } from 'uuid'

export class OrderLine {
  @Prop({
    type: Number,
    required: true,
  })
  quantity: number

  @Prop({
    type: String,
    required: true,
  })
  productId: string = uuidv4()

  @Prop({
    type: Number,
    required: true,
  })
  productPrice: number

  @Prop({
    type: Number,
    required: true,
  })
  total: number
}
