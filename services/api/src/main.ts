import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import cookie from '@fastify/cookie';
import helmet from '@fastify/helmet';
import multipart from '@fastify/multipart';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './core/filters/global-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: {
        // Sécurité: on évite de journaliser des secrets transportés dans headers/cookies.
        redact: {
          paths: ['req.headers.authorization', 'req.headers.cookie'],
          censor: '[REDACTED]',
        },
      },
    }),
  );

  const isProduction = process.env.NODE_ENV === 'production';

  await app.register(cookie, {
    // Sécurité: secret distinct pour la signature cookie (optionnelle ici, utile si signed=true).
    secret: process.env.COOKIE_SECRET ?? process.env.JWT_SECRET,
  });

  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false,
    hsts: isProduction
      ? {
          maxAge: 15552000,
          includeSubDomains: true,
          preload: true,
        }
      : false,
    referrerPolicy: { policy: 'no-referrer' },
  });

  await app.register(multipart, {
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  });

  const corsOriginsRaw =
    process.env.CORS_ORIGINS?.trim() ?? process.env.CORS_ORIGIN?.trim() ?? '';
  const corsOrigins =
    corsOriginsRaw.length > 0
      ? corsOriginsRaw
          .split(',')
          .map((o) => o.trim())
          .filter(Boolean)
      : ['http://localhost:5173', 'http://127.0.0.1:5173'];

  if (isProduction && corsOriginsRaw.length === 0) {
    throw new Error(
      'Configuration invalide: CORS_ORIGINS/CORS_ORIGIN est obligatoire en production.',
    );
  }

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalFilters(new GlobalExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT ?? 3001, '0.0.0.0');
}

void bootstrap();
