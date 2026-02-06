import type { LoginDTO, RegisterDTO } from "@/modules/auth/dto/auth.dto";
import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { LocalAuthGuard } from "@/modules/auth/local-auth.guard";
import { JwtAuthGuard } from "@/modules/auth/jwt-auth.guard";
import { AuthService } from "@/modules/auth/auth.service";
@Controller('auth') 
export class AuthController 
{
    constructor(
        private readonly authService : AuthService
    ) {} 
    @Post('register') 
    async register(@Body() data : RegisterDTO) 
    {
        const response = await this.authService.register(data) 
        return response

    }
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