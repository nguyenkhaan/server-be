import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { EmailModule } from '@/modules/email/email.module';
@Module({
  imports: [
    ConfigModule.forRoot({
        isGlobal : true 
    }), 
    PrismaModule, 
    AuthModule, 
    EmailModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
