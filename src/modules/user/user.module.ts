import { UserService } from "@/modules/user/user.service";
import { Module } from "@nestjs/common";
@Module({
    providers: [UserService], 
    exports: [UserService]
}) 
export class UserModule {} 