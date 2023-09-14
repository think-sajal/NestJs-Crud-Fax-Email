import { NestFactory } from '@nestjs/core';
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerDocumentOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('Notes Tracking Application')
    .setDescription('Notes API Application')
    .setVersion('v1')
    .addTag('Daily Notes')
    .build();
  const options: SwaggerDocumentOptions = { deepScanRoutes: true };
  const document = SwaggerModule.createDocument(app, config, options);
  const customOptions: SwaggerCustomOptions = {
    customSiteTitle: 'Notes API Docs',
  };
  SwaggerModule.setup('api', app, document, customOptions);
  await app.listen(3001);
}
bootstrap();
