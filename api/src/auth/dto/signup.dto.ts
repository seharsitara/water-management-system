import { IsNotEmpty,MinLength, IsEmail } from "class-validator";
export class SignupDto {
    @IsEmail()
    email: string;   

    @IsNotEmpty()
    @MinLength(6)
    password: string;

   }