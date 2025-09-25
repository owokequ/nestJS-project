import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ApiErrors } from './common/exceptions/api.errors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new ApiErrors());
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
