import { Controller, Post,Body, Req,Get,UseGuards, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  signup(@Body() signupDto: SignupDto) {
    return this.authService.signup(signupDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('me')
  async me(@Req() req) {
    const authHeader = req.headers.authorization || ''
    const token = authHeader.replace('Bearer ', '')
    const user = await this.authService.validateToken(token)
    if (!user) {
      throw new UnauthorizedException('Invalid token')
    }
    return user
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth(@Req() req) {
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req) {
    return this.authService.loginWithGoogle(req.user);
  }
}

