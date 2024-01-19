import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { INestApplication } from '@nestjs/common'

export function swaggerConfig(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('API REST Clowns Informatics 2DAW')
    .setDescription(
      'API REST para la gestión de una tienda de informática para el módulo de Desarrollo Web en Entornos Servidor.',
    )
    .setContact('Eva Gómez Uceda', 'https://github.com/evagmezz', '')
    .setContact('Jaime Medina Méndez', 'https://github.com/jaimemen897', '')
    .setContact('Jorge Benavente', 'https://github.com/jorgebenaventee', '')
    .setContact('David Jaraba', 'https://github.com/davidjaraba', '')
    .setVersion('1.0.0')
    .addTag('Products', 'Operaciones con productos')
    .addTag('Storage', 'Operaciones con almacenamiento')
    .addTag('Auth', 'Operaciones de autenticación')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api', app, document)
}
