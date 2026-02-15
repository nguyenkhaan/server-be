import { Injectable } from "@nestjs/common";
import * as crypto from 'crypto';
import { OTP_LENGTH } from "@/bases/common/constants/auth.constant";
import * as bcrypt from 'bcrypt'
@Injectable() 
export class OtpService 
{
    createOtp() 
    {
        const otp = crypto.randomInt(OTP_LENGTH , OTP_LENGTH * 10) 
        return otp.toString();
    }
    async hashOTP(otp: string) 
    {
        const salt = await bcrypt.genSalt(10);
        return bcrypt.hash(otp, salt);
    }
     async compareOtp(plainOtp: string, hashedOtp: string): Promise<boolean> {
        return bcrypt.compare(plainOtp, hashedOtp);
    }
}