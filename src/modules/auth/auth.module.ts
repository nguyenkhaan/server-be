import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from '@/modules/user/user.module'; 
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from '@/modules/auth/local.strategy';
import { AuthController } from '@/modules/auth/auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '@/bases/common/constants/app.constant';
import { JwtStrategy } from '@/modules/auth/jwt.strategy';
import { LocalAuthGuard } from '@/modules/auth/local-auth.guard';
import { JwtAuthGuard } from '@/modules/auth/jwt-auth.guard';
import { OtpModule } from '@/modules/otp/otp.module';
import { EmailService } from '@/modules/email/email.service';
import { SmsModule } from '@/modules/sms/sms.module';
import { SmsService } from '@/modules/sms/sms.service';
@Module({
  imports: [
      UserModule , PassportModule, 
      JwtModule.register({
        secret: jwtConstants.secret, 
        signOptions: { expiresIn : '60s' }
      }), 
      OtpModule, 
      SmsModule
  ],
  providers: [AuthService , LocalStrategy , JwtStrategy , LocalAuthGuard , JwtAuthGuard , EmailService , SmsService],
  controllers: [AuthController]
})
export class AuthModule {}
