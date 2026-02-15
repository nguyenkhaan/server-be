import { OtpService } from "@/modules/otp/otp.service";
import { Module } from "@nestjs/common";

@Module({
    imports: [], 
    exports: [OtpService], 
    providers: [OtpService]
})
export class OtpModule {} 