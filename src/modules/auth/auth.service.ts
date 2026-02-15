import { PrismaService } from "@/prisma/prisma.service";
import { BadRequestException, Body, ConflictException, Injectable, InternalServerErrorException, UnauthorizedException } from "@nestjs/common";
import { UserService } from "@/modules/user/user.service";
import { RegisterDTO, VerifyDTO } from "@/modules/auth/dto/auth.dto";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { AUTHTOKENTYPE, Role } from "@prisma/client";
import { OtpService } from "@/modules/otp/otp.service";
import { OTP_LIVE_TIME } from "@/bases/common/constants/auth.constant";
@Injectable() 
export class AuthService 
{
    constructor(
        private readonly prismaService : PrismaService, 
        private readonly userService : UserService, 
        private readonly jwtService : JwtService, 
        private readonly configService : ConfigService, 
        private readonly otpService : OtpService 
    ) {} 
    async register(registerData : RegisterDTO) 
    {
        try 
        {
            const phone = registerData.phone 
            const email = registerData.email 
            if (!phone || !email)
                throw new BadRequestException("Missing phone number or email") 
            let user = await this.prismaService.user.findFirst({
                    where: {
                        OR: [
                            {email : email}, 
                            {phone : phone}
                        ]
                    }
                })
            //Ton tai user va da active 
            if (user && user.active) {
                throw new ConflictException("Email or phone has been used")
            }
            //Email hoac phone khong trung hoan toan 
            if (user && (! (user.email === email && user.phone === phone))) {
                throw new ConflictException("Email or phone has been used")
            }
            
            //Create password 
            const hashedPassword = await Bun.password.hash(registerData.password , {
                algorithm : 'bcrypt', 
                cost : 10 
            })
            if (!user) 
            {
                //Tao user moi 
                user = await this.prismaService.user.create({
                    data: { 
                        date_of_birth : new Date(registerData.date_of_birth),  
                        password : hashedPassword, 
                        email : registerData.email, 
                        name : registerData.name, 
                        active : false, 
                        phone : registerData.phone, 
                    }
                })
                //Gan Role cho nguoi dung 
                await this.prismaService.userRole.create({
                    data: {
                        role : Role.USER, //Nguoi dung binh thuong thoi, dell co tac dung gi het 
                        userID : user.id 
                    }
                })
            }
            
            //Tao otp va luu tru vao database 
            //Xoa het tat ca otp cu lien quan den email va phone nay 
            await this.prismaService.registerVerificationOTP.deleteMany({
                where: {
                    userID : user.id
                }
            })
            //Them Otp moi vao he thong 
            const otp = this.otpService.createOtp()
            const hashedOtp = await this.otpService.hashOTP(otp) 

            await this.prismaService.registerVerificationOTP.create({
                data : {
                    userID : user.id, 
                    expiresAt : new Date(Date.now() + OTP_LIVE_TIME), 
                    otp : hashedOtp, 
                }
            })
            return {
                otp,    //Ma otp gui ve cho FE 
                userID : user.id //Ben FE se nam user id va tien hanh gui lai cho BE de verify nguoi dung 
            }
        }
        catch (err) 
        {
            if (err instanceof BadRequestException || err instanceof ConflictException || err instanceof BadRequestException) 
                throw err 
            throw new InternalServerErrorException("Register Server Is Down") 
        }   
    }
    async verifyUser(verifyData :VerifyDTO) 
    {
        try 
        {
            const user = await this.prismaService.user.findFirst({
                where : {
                    id : verifyData.userID
                }
            })
            if (!user) 
                throw new UnauthorizedException("User has not been registered") 
            const record = await this.prismaService.registerVerificationOTP.findFirst({
                where: {
                    userID : verifyData.userID
                }
            })
            if (!record) 
                throw new BadRequestException("User has not registered") 
            //Kiem tra xem otp da het han chua 
            if (record.expiresAt.getTime() < Date.now()) 
                throw new BadRequestException("OTP has expired")
            if (record.usedAt != null) 
                throw new BadRequestException("OTP has been used")
            const results = await this.otpService.compareOtp(verifyData.otp , record.otp) 
            if (results) 
            {
                await this.prismaService.registerVerificationOTP.update({
                    where: {
                        id : record.id 
                    }, 
                    data: {
                        usedAt: new Date(Date.now()), 
                    }
                })
                await this.prismaService.user.update({
                    where: {id : verifyData.userID}, 
                    data : {active : true}
                })
                return true 
            }
            throw new BadRequestException("OTP is incorrect")
        } 
        catch (err) 
        {
            if (err instanceof UnauthorizedException || err instanceof BadRequestException) 
                throw err 
            throw new InternalServerErrorException("Verify Server Is Down") 
        }

    }
    async validateUser(email : string , password : string) 
    {
        console.log(email , password) 
        const user = await this.userService.findOne(email) 
        console.log(user) 
        if (user) 
        {
            const results = await Bun.password.verify(
                password, 
                user.password 
            )
            if (results) return user 
            return null  
        }
        return null  
    }
  
}