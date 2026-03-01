import { Injectable,BadRequestException,UnauthorizedException } from '@nestjs/common';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class AuthService {
  private supabase: SupabaseClient;

  constructor(private jwtService: JwtService) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      console.warn('Supabase environment variables not configured; auth will not persist to database');
    }
    
    this.supabase = createClient(supabaseUrl || '', supabaseKey || '');
  }

  async signup(signupDto: SignupDto) {
    const { email, password, name } = signupDto;

    // Check if user already exists in Supabase
    const { data: existingUser, error: checkError } = await this.supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert new user into Supabase
    const { data: newUser, error } = await this.supabase
      .from('users')
      .insert([{ email, password: hashedPassword, name: name || '' }])
      .select()
      .single();

    if (error) {
      console.error('Supabase signup error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      throw new BadRequestException(`Failed to create user: ${error.message}`);
    }

    const payload = { sub: newUser.id, email: newUser.email };
    const token = this.jwtService.sign(payload);
    return { 
      user: { id: newUser.id, email: newUser.email, name: newUser.name }, 
      access_token: token 
    };
  }
 
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Fetch user from Supabase
    const { data: user, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    return { access_token: token, user: { id: user.id, email: user.email, name: user.name } };
  }

  async loginWithGoogle(user: any) {
    const payload = { email: user.email, sub: Date.now() };
    const token = this.jwtService.sign(payload);

    return { access_token: token, user };
  }

  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      
      // Fetch user from Supabase using the ID from token
      const { data: user, error } = await this.supabase
        .from('users')
        .select('id, email, name')
        .eq('id', payload.sub)
        .single();

      if (error || !user) return null;
      
      return { id: user.id, email: user.email, name: user.name };
    } catch (err) {
      console.error('Token validation error:', err);
      return null;
    }
  }
}
 