import type { LoginDTO } from "@/modules/auth/dto/auth.dto";
import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { LocalAuthGuard } from "@/modules/auth/local-auth.guard";
import { JwtAuthGuard } from "@/modules/auth/jwt-auth.guard";
@Controller('auth') 
export class AuthController 
{
    @UseGuards(LocalAuthGuard)
    @UseGuards(JwtAuthGuard)
    @Post('login')
    async login(@Body() loginData : LoginDTO) 
    {
        const email = loginData.email 
        const password = loginData.password
        console.log(email + "  " + password) 
        return 'Login successfully'
    }
}