import {  RegisterDTO , VerifyDTO } from "@/modules/auth/dto/auth.dto";
import { BadRequestException, Body, Controller, Get, Post, Put, Query, Req, UseGuards } from "@nestjs/common";
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
    async register(@Body() registerData : RegisterDTO) 
    {
        const responseData = await this.authService.register(registerData) 
        return responseData  //Gui ve ma OTP 
    }
    @Post('verify') 
    async verifyUser(@Body() verifyData : VerifyDTO) 
    {
        const responseData = await this.authService.verifyUser(verifyData) 
        return responseData
    }
    @UseGuards(LocalAuthGuard)
    @Post('login') 
    async login(@Req() req : Request) 
    {
        const responseData = await this.authService.login(req.user) 
        return responseData 
    }
}