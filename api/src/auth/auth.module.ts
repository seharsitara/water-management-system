import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt/dist/jwt.module';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from './strategies/google.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'mysecretkey',
      signOptions: { expiresIn: (process.env.JWT_EXPIRES_IN as any) || '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService,GoogleStrategy],
  exports: [AuthService]  // allow other modules to inject AuthService
})
export class AuthModule {}
