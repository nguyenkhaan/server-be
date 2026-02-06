import { IsString , IsEmail , IsNotEmpty , IsOptional, IsDateString } from "class-validator";
export class RegisterDTO {
    @IsString() 
    @IsNotEmpty() 
    name : string 
    @IsString() 
    @IsNotEmpty() 
    password : string 
    @IsEmail() 
    email : string 
    @IsDateString() 
    date_of_birth: string 
}
export class LoginDTO {
    @IsEmail() 
    @IsNotEmpty() 
    email : string 
    @IsNotEmpty() 
    @IsString() 
    password : string 
}