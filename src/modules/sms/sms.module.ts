import { SmsService } from "@/modules/sms/sms.service";
import { Module } from "@nestjs/common";
@Module({
    imports: [], 
    providers: [SmsService], 
    exports: [SmsService]
}) 
export class SmsModule {} 