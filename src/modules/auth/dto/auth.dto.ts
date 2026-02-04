import { IsString , IsEmail , IsNotEmpty , IsOptional } from "class-validator";

export class LoginDTO {
    @IsEmail() 
    @IsNotEmpty() 
    email : string 
    @IsNotEmpty() 
    @IsString() 
    password : string 
}