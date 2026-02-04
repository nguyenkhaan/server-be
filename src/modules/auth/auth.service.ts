import { PrismaService } from "@/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { UserService } from "@/modules/user/user.service";
@Injectable() 
export class AuthService 
{
    constructor(
        private readonly prismaService : PrismaService, 
        private readonly userService : UserService, 
    ) {} 
    async validateUser(email : string , password : string) 
    {
        const user = await this.userService.findOne(email) 
        if (user) 
        {
            const results = await Bun.password.verify(
                password, 
                user.password 
            )
            return results
        }
        return null 
    }
}