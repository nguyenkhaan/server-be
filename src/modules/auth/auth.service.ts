import { PrismaService } from "@/prisma/prisma.service";
import { BadRequestException, Body, ConflictException, Injectable, InternalServerErrorException, UnauthorizedException } from "@nestjs/common";
import { UserService } from "@/modules/user/user.service";
import { RegisterDTO } from "@/modules/auth/dto/auth.dto";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { TokenField } from "@/bases/common/enums/token.enum";
import { AUTHTOKENTYPE, FUNCTOKETYPE, Role } from "@prisma/client";
@Injectable() 
export class AuthService 
{
    constructor(
        private readonly prismaService : PrismaService, 
        private readonly userService : UserService, 
        private readonly jwtService : JwtService, 
        private readonly configService : ConfigService
    ) {} 
    async register(data : RegisterDTO) 
    {
        try 
        {
            let user = await this.prismaService.user.findUnique({
                where : {
                    email : data.email
                }
            })
            if (!(user && user.active == false || !user)) 
                throw new ConflictException("User has been exists") 
            if (!user) 
            {
                //Create a new user 
                const hashedPassword = await Bun.password.hash(data.password , {
                    algorithm : 'bcrypt', 
                    cost: 10 
                })
                user = await this.prismaService.user.create({
                    data : {
                        date_of_birth : new Date(data.date_of_birth), 
                        name : data.name, 
                        email : data.email, 
                        password : hashedPassword, 
                        active: false 
                    }
                })
            }
            //Create a verify token 
            const verifySecretKey = this.configService.get<string>('VERIFY_SECRET')
            const verifyToken = await this.jwtService.signAsync({
                email : user.email, 
            }, {
                expiresIn : '5m', 
                secret : verifySecretKey
            })
            //Store the verify token 
            //Xu li loi: User co them spam token dang ki 
            await this.prismaService.emailVerificationToken.deleteMany({
                where: {
                    email : user.email 
                }
            })
            await this.prismaService.emailVerificationToken.create({
                data: {
                    email : user.email, 
                    token : verifyToken, 
                    expiresAt : new Date(Date.now() + 5 * 60 * 1000) //5 minutes 
                }
            })
            return {
                ...user, 
                verifyToken 
            }
        } 
        catch (err) 
        {
            console.log('Register Error: ' , err) 
            if (err instanceof ConflictException) 
                throw err //Gom lai thanh 1 ham de su sung 
            throw new InternalServerErrorException("Internal Server Error") 
        }
    }
    
    //Verify User Through Token 
    async verifyUser(token: string) 
    {
        try {
                const verifySecretKey = this.configService.get<string>('VERIFY_SECRET')
                let payload: { email: string };
                try {
                    payload = await this.jwtService.verifyAsync(token , {
                        secret : verifySecretKey
                    });
                } catch {
                    throw new UnauthorizedException('Token is invalid or expired');
                }
            
                const tokenRecord =
                    await this.prismaService.emailVerificationToken.findUnique({
                    where: { token },
                });
            
                if (!tokenRecord) {
                    throw new UnauthorizedException('Token not found');
                }
            
                if (tokenRecord.usedAt) {
                    throw new UnauthorizedException('Token has already been used');
                }
            
                if (tokenRecord.expiresAt < new Date()) {
                    throw new UnauthorizedException('Token expired');
                }
            
                await this.prismaService.user.update({
                    where: { email: tokenRecord.email },
                    data: { active: true },
                });
            
                await this.prismaService.emailVerificationToken.update({
                    where: { token },
                    data: { usedAt: new Date() },
                });
            
                return {
                    message: 'User has been verified successfully',
                };
            } 
            catch (err) {
                if (err instanceof UnauthorizedException) 
                    throw err;
                console.error('Verify User Error:', err);
                throw new InternalServerErrorException('Internal Server Error');
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
    async login(user : any) 
    {
        try 
        {
            if (!user.active) 
                throw new UnauthorizedException("User is not verified") 
            const accessKey = this.configService.get<string>('ACCESS_SECRET') 
            const refreshKey = this.configService.get<string>('REFRESH_SECRET') 
            const userRoles = await this.prismaService.userRole.findMany({
                where: {
                    userID : user.id 
                } , 
                select : {
                    role : true 
                }
            })
            const payload = {
                [TokenField.EMAIL] : user.email, 
                [TokenField.NAME] : user.name, 
                [TokenField.ROLE] : userRoles.map((userRoleRow) => userRoleRow.role) 
            }
            const access_token = this.jwtService.sign(
            { 
                ...payload , [TokenField.PURPOSE] : AUTHTOKENTYPE.ACCESS
            } , {
                secret: accessKey, 
                expiresIn : '15m', 
            })
            //Create refresh token 
            const refresh_token = this.jwtService.sign(
            {
                ...payload , [TokenField.PURPOSE] : AUTHTOKENTYPE.REFRESH     
            } , {
                secret: refreshKey, 
                expiresIn : '30d', 
            })
            return {
                accessToken : access_token, 
                refreshToken : refresh_token
            }
        } 
        catch (err) 
        {
            if (err instanceof UnauthorizedException) 
                throw err 
            throw new InternalServerErrorException("Login server down. Please try again") 
            
        }
    }
    async resetPassword(email : string)  
    {
        //Tien hanh tao token va gui ve cho nguoi dung 
        try 
        {
            const user = await this.userService.findOne(email) 
            //Gui cai token di kem chung 
            if (!user) 
                throw new UnauthorizedException("User has not been verified") 
            const secretResetPasswordKey = this.configService.get<string>('RESET_PASSWORD_SECRET')
            //Ben quan tri vien se co 1 route de xoa tai khoan nguoi dung, phong truong hop ho dang nhap tao lao -> Dat tai khoan thanh active = 0
            const resetPassToken = this.jwtService.sign({
                [TokenField.EMAIL] : user.email, 
                [TokenField.PURPOSE] : FUNCTOKETYPE.RESET_PASSWORD, 
                [TokenField.NAME] : user.name
            } , {
                secret: secretResetPasswordKey, 
                expiresIn : '5m'
            })
            //Luu token vao trong database 
            //Xu li loi: User co them spam token dang ki -> Can than coi chung bi tran database vi may tro choi ngu nay 
            await this.prismaService.passwordVerificationToken.deleteMany({
                where: {
                    email : user.email 
                }
            })
            await this.prismaService.passwordVerificationToken.create({
                data: {
                    email : user.email, 
                    expiresAt : new Date(Date.now() + 5 * 60 * 1000), //5 minutes 
                    token : resetPassToken 
                }
            })
            //Tra ve du lieu de ben FE lam viec 
            return {
                token : resetPassToken   //Gui token ve 
            }
        } 
        catch (err) 
        {
            if (err instanceof UnauthorizedException) 
                throw err 
            throw new InternalServerErrorException("Reset Password server down. Please try again") 
        }
    } 
    async changePasswordInDb(token : string , newPassword : string) 
    {
        try 
        {
            const secretResetPasswordKey = this.configService.get<string>('RESET_PASSWORD_SECRET')
            const payload = await this.jwtService.verifyAsync(token , {
                secret : secretResetPasswordKey
            })
            if (payload[TokenField.PURPOSE] !== FUNCTOKETYPE.RESET_PASSWORD) 
            {
                throw new UnauthorizedException('Invalid token purpose')
            }
            const email = payload[TokenField.EMAIL] 
            const hashedPassword = await Bun.password.hash(newPassword , {
                algorithm: 'bcrypt', 
                cost: 10 
            })
            
            const savedToken = await this.prismaService.passwordVerificationToken.findFirst({
                where: { token } , 
                select: {
                    token : true, 
                    email : true, 
                    usedAt: true, 
                    expiresAt: true 
                }
            })
            if (!savedToken || savedToken.expiresAt < new Date()) 
            {
                throw new UnauthorizedException('Token expired')
            }

            if (!savedToken?.usedAt && savedToken?.email == email) 
            {
                await this.prismaService.user.update({
                    where: {email}, 
                    data: {
                        password : hashedPassword
                    }
                })
                //Cap nhat thoi diem su dung 
                await this.prismaService.passwordVerificationToken.update({
                    where: {token}, 
                    data: {
                        usedAt: new Date() 
                    }
                })
                return true 
            }
            else throw new BadRequestException("Token has been used") 
            
            return true 
        }
        catch (err) 
        {
            if (err instanceof UnauthorizedException || err instanceof BadRequestException) 
                throw err 
            throw new InternalServerErrorException("Reset Password server down. Please try again") 
        }
    }
}