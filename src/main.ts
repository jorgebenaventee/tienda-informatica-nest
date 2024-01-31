import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import * as process from 'process'
import { ValidationPipe } from '@nestjs/common'
import { swaggerConfig } from './config/swagger/swagger.config'
import * as dotenv from 'dotenv'

dotenv.config()

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  if (process.env.NODE_ENV === 'dev') {
    console.log('🛠️ Iniciando Nestjs Modo desarrollo 🛠️')
  } else {
    console.log('🚗 Iniciando Nestjs Modo producción 🚗')
  }

  app.useGlobalPipes(new ValidationPipe())
  app.setGlobalPrefix('api')
  if (process.env.NODE_ENV === 'dev') {
    swaggerConfig(app)
  }
  await app.listen(process.env.PORT || 3000)
}

bootstrap().then(() => {
  console.log(`Aplicación iniciada en el puerto ${process.env.PORT || 3000}`)
})
