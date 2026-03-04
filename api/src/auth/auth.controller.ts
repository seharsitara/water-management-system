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
    // Accept token from Authorization header or cookie for flexibility
    const authHeader = (req.headers.authorization as string) || ''
    let token = authHeader.replace('Bearer ', '')
    if (!token && req.cookies && req.cookies.authToken) {
      token = req.cookies.authToken
    }
    console.log('[AuthController.me] received token length:', token ? token.length : 0)
    const user = await this.authService.validateToken(token)
    if (!user) {
      console.warn('[AuthController.me] token validation failed')
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

