import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// Handle BigInt serialization in JSON responses
(BigInt.prototype as any).toJSON = function () {
  return Number(this);
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Critical configuration for cross-origin requests!
  app.enableCors({
    // Allowed origins: include your production URL and local development ports
    origin: [
      'https://front-production-98bd.up.railway.app', // Your actual Railway frontend domain
      'http://localhost:9000', // Default Quasar dev port
      'http://localhost:8080',// Alternative dev port
      'http://localhost:8081'// Another alternative dev port
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true, // Must be true if using Cookies or Authorization headers
  });

  // Must listen on the port assigned by Railway
  const port = process.env.PORT || 3000;
  
  // '0.0.0.0' is required to ensure the service is accessible externally
  await app.listen(port, '0.0.0.0'); 
}
bootstrap();