import { Type } from 'class-transformer';
import {
    IsString,
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsDateString,
    MinLength, 
    ValidateIf, 
    Matches,
    IsNumber,
    Length
} from 'class-validator';

export class RegisterDTO {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @MinLength(10)
  password: string;
    //Email Optional 
  @IsEmail()
  email: string;
    //Phone number (Optional) 
  @Matches(/^[0-9]{9,15}$/, {
    message: 'Phone number is invalid',
  })
  phone: string;

  @IsDateString()
  date_of_birth: string;
}
export class VerifyDTO {
    @IsNumber() 
    userID : number 
    @IsString() 
    @Length(6) 
    otp : string 
}
export class LoginDTO {
    @IsString() 
    identifier : string 
    @IsString() 
    password : string 
}
export class ForgotPasswordDTO {
    @IsString() 
    @IsEmail() 
    email : string 
    @IsString() 
    @Matches(/^[0-9]{9,15}$/, {
        message: 'Phone number is invalid',
    })
    phone : string 
}
export class ChangePasswordDTO {
    @IsString() 
    otp : string 
    @IsNumber() 
    userID : number 
    @IsString() 
    password : string 
}
//Login se xu li sau 