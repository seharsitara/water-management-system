import { Injectable,BadRequestException,UnauthorizedException } from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private users: any[] = []; 

  constructor(private jwtService: JwtService) {}

  async signup(signupDto: SignupDto) {
    const { email, password } = signupDto;

    const userExists = this.users.find(u => u.email === email);
    if (userExists) throw new BadRequestException('Email already exists');

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = { id: Date.now(), email, password: hashedPassword };
    this.users.push(user);

    return { message: 'User created successfully' };
  }
 
   async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = this.users.find(u => u.email === email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    return { access_token: token };
  }

  async loginWithGoogle(user: any) {
    const payload = { email: user.email, sub: Date.now() };
    const token = this.jwtService.sign(payload);

    return { access_token: token, user };
  }
}
 