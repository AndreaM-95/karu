import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerCustomOptions, SwaggerModule } from '@nestjs/swagger';
import { AllExceptionsFilter } from './common/filters/http-excepcion.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configDoc = new DocumentBuilder()
    .setTitle('API KARU')
    .setDescription( 'KARU es un servicio de movilidad segura para mujeres. Esta API expone los endpoints necesarios para gestionar usuarios, viajes, vehículos, ubicaciones, pagos y calificaciones, garantizando un flujo seguro mediante autenticación JWT y roles.')
    .setVersion('2.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, configDoc);
  const customOptions: SwaggerCustomOptions = {
    swaggerOptions: {
      url: '/api-json'
    },
    customCssUrl: [
      'https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui.css',
    ],
    customJs: [
      'https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui-bundle.js',
      'https://unpkg.com/swagger-ui-dist@5.10.3/swagger-ui-standalone-preset.js',
    ]
  }

  SwaggerModule.setup('api/docs', app, document, customOptions)

  app.useGlobalFilters(new AllExceptionsFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
