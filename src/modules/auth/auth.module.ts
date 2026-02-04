import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from '@/modules/user/user.module'; 
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from '@/modules/auth/local.strategy';
import { AuthController } from '@/modules/auth/auth.controller';
@Module({
  imports: [UserModule , PassportModule],
  providers: [AuthService , LocalStrategy],
  controllers: [AuthController]
})
export class AuthModule {}
