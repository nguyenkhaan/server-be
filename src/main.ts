import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggingInterceptor } from 'src/bases/interceptors/logging.interceptor';
import { TransformInterceptor } from 'src/bases/interceptors/transform.interceptor';
import { HttpExceptionFilter } from '@/bases/filters/http-exception.filter';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = 4000 

  app.setGlobalPrefix('api');
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter())
  app.useGlobalPipes(new ValidationPipe({
    transform : true, 
    whitelist : true 
  }))
  await app.listen(port);

  // --- Modern Modern Panel Layout ---
  const serverName = 'BE_SERVER';
  const url = `http://localhost:${port}`;
  const status = 'RUNNING';

  // Color codes (ANSI)
  const cyan = '\x1b[36m';
  const green = '\x1b[32m';
  const yellow = '\x1b[33m';
  const reset = '\x1b[0m';
  const bold = '\x1b[1m';

  console.log(`
    ${cyan}╔══════════════════════════════════════════════════╗${reset}
    ${cyan}║${reset}  ${bold}${green}🚀 SERVER STARTED SUCCESSFULLY${reset}                ${cyan}║${reset}
    ${cyan}╠══════════════════════╦═══════════════════════════╣${reset}
    ${cyan}║${reset} ${bold}SERVICE${reset}            ${cyan}║${reset} ${serverName.padEnd(25)} ${cyan}║${reset}
    ${cyan}║${reset} ${bold}PORT${reset}               ${cyan}║${reset} ${port.toString().padEnd(25)} ${cyan}║${reset}
    ${cyan}║${reset} ${bold}URL${reset}                ${cyan}║${reset} ${yellow}${url.padEnd(25)}${reset} ${cyan}║${reset}
    ${cyan}║${reset} ${bold}STATUS${reset}             ${cyan}║${reset} ${green}● ${status.padEnd(23)}${reset} ${cyan}║${reset}
    ${cyan}╚══════════════════════╩═══════════════════════════╝${reset}
  `);
}
bootstrap();
