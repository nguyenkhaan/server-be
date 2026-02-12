import { PrismaService } from "@/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
@Injectable() 
export class UserService 
{
    constructor(private readonly prismaService : PrismaService) {} 
    async findOne(email : string) //Tim nguooi dung dua tren username  
    {
        const user = await this.prismaService.user.findFirst({
            where : {
                email : email 
            }
        })
        if (user == null) return undefined 
        return user 
    }
    
}