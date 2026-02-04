import type { LoginDTO } from "@/modules/auth/dto/auth.dto";
import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Controller('auth') 
export class AuthController 
{
    @UseGuards(AuthGuard('local'))
    @Post('login')
    async login(@Body() loginData : LoginDTO) 
    {
        const email = loginData.email 
        const password = loginData.password
        console.log(email + "  " + password) 
        return 'Login successfully'
    }
}