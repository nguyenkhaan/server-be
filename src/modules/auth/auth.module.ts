import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from '@/modules/user/user.module'; 
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from '@/modules/auth/local.strategy';
import { AuthController } from '@/modules/auth/auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '@/bases/common/constants/app.constant';
import { JwtStrategy } from '@/modules/auth/jwt.strategy';
@Module({
  imports: [
      UserModule , PassportModule, 
      JwtModule.register({
        secret: jwtConstants.secret, 
        signOptions: { expiresIn : '60s' }
      })
  ],
  providers: [AuthService , LocalStrategy , JwtStrategy],
  controllers: [AuthController]
})
export class AuthModule {}
