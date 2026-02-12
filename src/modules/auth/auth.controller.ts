import { LoginDTO, RegisterDTO } from "@/modules/auth/dto/auth.dto";
import { BadRequestException, Body, Controller, Get, Post, Query, Req, UseGuards } from "@nestjs/common";
import { LocalAuthGuard } from "@/modules/auth/local-auth.guard";
import { JwtAuthGuard } from "@/modules/auth/jwt-auth.guard";
import { AuthService } from "@/modules/auth/auth.service";
import type { Request } from "express";
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
    @Get('verify') 
    async verify(@Query('token') token : string) 
    {
        if (!token || token == null) 
            throw new BadRequestException("Token is missing") 
        const response = this.authService.verifyUser(token) 
        return response
    }
    @Post('login')
    @UseGuards(LocalAuthGuard)
    async login(@Body() loginData : LoginDTO , @Req() req : Request) 
    {   
        console.log(req.user) 
        // const {email , password} = loginData 
        const responseData = await this.authService.login(req.user) 
        return responseData
    }
}