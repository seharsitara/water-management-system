import { IsNotEmpty,MinLength, IsEmail } from "class-validator";
export class SignupDto {
    @IsNotEmpty()
    name: string;

    @IsEmail()
    email: string;   

    @IsNotEmpty()
    @MinLength(6)
    password: string;

   }