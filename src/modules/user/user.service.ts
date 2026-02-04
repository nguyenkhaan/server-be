import { PrismaService } from "@/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
export type User = any 
@Injectable() 
export class UserService 
{
    constructor(private readonly prismaService : PrismaService) {} 
    async findOne(email : string) : Promise<User | undefined>  //Tim nguooi dung dua tren username  
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