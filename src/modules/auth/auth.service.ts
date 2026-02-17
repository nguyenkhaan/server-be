import { PrismaService } from "@/prisma/prisma.service";
import { BadRequestException, Body, ConflictException, Injectable, InternalServerErrorException, UnauthorizedException } from "@nestjs/common";
import { UserService } from "@/modules/user/user.service";
import { ChangePasswordDTO, ForgotPasswordDTO, RegisterDTO, VerifyDTO } from "@/modules/auth/dto/auth.dto";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { AUTHTOKENTYPE, Role } from "@prisma/client";
import { OtpService } from "@/modules/otp/otp.service";
import { OTP_LIVE_TIME , ACCESS_TOKEN_LIVE_TIME , REFRESH_TOKEN_LIVE_TIME, RESET_PASSWORD_OTP_LIVE_TIME } from "@/bases/common/constants/auth.constant";
import { TokenField } from "@/bases/common/enums/token.enum";
import { EmailService } from "@/modules/email/email.service";
import { EMAIL_PURPOSE } from "@/bases/common/enums/email.enum";
import { EmailContentConsolic } from "@/util/contact.content.consolic";
import { SmsService } from "@/modules/sms/sms.service";
@Injectable() 
export class AuthService 
{
    constructor(
        private readonly prismaService : PrismaService, 
        private readonly userService : UserService, 
        private readonly jwtService : JwtService, 
        private readonly configService : ConfigService, 
        private readonly otpService : OtpService, 
        private readonly emailService : EmailService, 
        private readonly smsService : SmsService
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
            //Gui otp ve email cho nguoi dung 

            await this.emailService.sendEmail(EMAIL_PURPOSE.REGISTER , 'nguyenkhaan2006@gmail.com' , { otp : '123' , content : EmailContentConsolic.register } , 'Cloudian Company Sign Up')

            //Gui otp ve sms cho nguoi dung (Update brand name in production)
            // const res = await this.smsService.sendSms(String(phone) , 'This is yout otp: 123')
            
            
            return {
                otp,    //Ma otp gui ve cho FE 
                userID : user.id //Ben FE se nam user id va tien hanh gui lai cho BE de verify nguoi dung 
            }  
           return true 
        }
        catch (err) 
        {
            console.log(err) 
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
    async validateUser(identifier : string , password : string) 
    {
        const user = await this.prismaService.user.findFirst({
            where: {
                OR: [
                    {email : identifier}, 
                    {phone : identifier}
                ]
            }
        })
        if (user) 
        {
            const results = await Bun.password.verify(
                password, 
                user.password 
            )
            if (results) return user 
            return null  
        }
        return null  //Tra ve null 
    }
    async login(user : any)
    {
        try 
        {
            await this.prismaService.authToken.deleteMany({
                where: {
                    user_id : user.id  
                }
            })
            const roles = await this.prismaService.userRole.findMany({
                where: {
                    userID : user.id 
                },  
                select: {
                    role : true 
                }
            })
            const accessSecretKey = this.configService.get<string>('ACCESS_SECRET')
            const refreshSecretKey = this.configService.get<string>('REFRESH_SECRET')
            const payload = {
                [TokenField.ID] : user.id, 
                [TokenField.EMAIL] : user.email, 
                [TokenField.PHONE] : user.phone, 
                [TokenField.ROLE] : roles.map((r) => r.role), 
            }
            const accessToken = this.jwtService.sign({
                ...payload , [TokenField.PURPOSE] : AUTHTOKENTYPE.ACCESS 
            } , {
                secret : accessSecretKey, 
                expiresIn: '15m'  //15 phut 
            })
            const refreshToken = this.jwtService.sign({
                ...payload , [TokenField.PURPOSE] : AUTHTOKENTYPE.REFRESH
            } , {
                secret: refreshSecretKey, 
                expiresIn: '30d'
            }) 
            await this.prismaService.authToken.createMany({
                data: [
                    {
                        user_id : user.id, 
                        token : accessToken, 
                        expiresAt : new Date(Date.now() + ACCESS_TOKEN_LIVE_TIME), 
                        isActive : true, 
                        type : AUTHTOKENTYPE.ACCESS
                    }, 
                    {
                        user_id : user.id, 
                        token : refreshToken, 
                        expiresAt : new Date(Date.now() + REFRESH_TOKEN_LIVE_TIME), 
                        isActive : true, 
                        type : AUTHTOKENTYPE.REFRESH
                    }
                ]
            })
            return {
                access_token : accessToken, 
                refresh_token : refreshToken
            }
        } 
        catch (err)
        {
            if (err instanceof UnauthorizedException || err instanceof BadRequestException) 
                throw err 
            throw new InternalServerErrorException("Login Server Is Down") 
        }
    }
    //forgot password ? -> Truyen vao phone / email -> Tim kiem user, neu tim thay user thi lum -> Tao mot otp va gui lai -> Nguoi dung nhan otp + userID -> Tien hanh call lan nua de doi password 
    async forgotPassword(forgotPassword : ForgotPasswordDTO) 
    {
        try 
        {
            const user = await this.prismaService.user.findFirst({
                where: {
                    email : forgotPassword.email, 
                    phone : forgotPassword.phone
                }
            })
            if (!user) 
                throw new UnauthorizedException("User has not registered") 
            const otp = this.otpService.createOtp() 
            const hashedOtp = await this.otpService.hashOTP(otp) 
            await this.prismaService.resetPasswordOTP.deleteMany({
                where: {
                    userID : user.id 
                }
            })
            await this.prismaService.resetPasswordOTP.create({
                data: {
                    expiresAt : new Date(Date.now() + RESET_PASSWORD_OTP_LIVE_TIME), 
                    otp : hashedOtp, 
                    userID : user.id, 
                }
            })
            //Gui email ve cho nguoi dung 

            //Gui sms ve cho nguoi dung 
            return {
                userID : user.id, 
                otp 
            }
        } 
        catch (err) 
        {
            if (err instanceof UnauthorizedException) 
                throw err 
            throw new InternalServerErrorException("Forgot Password Server Is Down") 
        }
    }
    async changePassword(changePasswordData : ChangePasswordDTO) 
    {
        const record = await this.prismaService.resetPasswordOTP.findFirst({
            where: {
                userID : changePasswordData.userID
            }
        })
        if (!record) 
            throw new BadRequestException("Wrong information") 
        
        if (record.expiresAt.getTime() < Date.now()) 
            throw new BadRequestException("OTP is expired") 
        const result = await this.otpService.compareOtp(changePasswordData.otp , record.otp) 
    
        if (result) 
        {
            await this.prismaService.resetPasswordOTP.update({
                where: {id : record.id}, 
                data: {
                    usedAt : new Date(Date.now())
                }
            })
            const hashedPassword = await Bun.password.hash(changePasswordData.password , {
                algorithm: 'bcrypt', 
                cost : 10 
            })
            await this.prismaService.user.update({
                where: {id : changePasswordData.userID}, 
                data: {
                    password : hashedPassword
                }
            })
            return true 
        }
        else throw new BadRequestException("OTP is incorrect") 
    }
  
}