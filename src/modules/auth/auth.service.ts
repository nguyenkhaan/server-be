import { PrismaService } from "@/prisma/prisma.service";
import { ConflictException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { UserService } from "@/modules/user/user.service";
import { RegisterDTO } from "@/modules/auth/dto/auth.dto";
@Injectable() 
export class AuthService 
{
    constructor(
        private readonly prismaService : PrismaService, 
        private readonly userService : UserService, 
    ) {} 
    async register(data : RegisterDTO) 
    {
        try 
        {
            const user = await this.prismaService.user.findFirst({
                where : {
                    email : data.email
                }
            })
            if (user) 
                throw new ConflictException("User has been exists") 
            const hashedPassword = await Bun.password.hash(data.password)
            const newUser = await this.prismaService.user.create({
                data : {
                    date_of_birth : data.date_of_birth, 
                    name : data.name, 
                    email : data.email, 
                    password : hashedPassword
                }
            })
            return newUser 
        } 
        catch (err) 
        {
            console.log('Register Error: ' , err) 
            throw new InternalServerErrorException("Internal Server Error") 
        }

    }
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