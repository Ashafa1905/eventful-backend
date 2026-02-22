import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User, UserDocument } from '../users/schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  // Register a new user
  async register(dto: RegisterDto) {
    const { email, password, role } = dto;

    // Check if user already exists
    const existing = await this.userModel.findOne({ email });
    if (existing) throw new BadRequestException('Email already exists');

    // Hash the password before saving
    const hashed = await bcrypt.hash(password, 10);

    // Save user to MongoDB
    const user = await this.userModel.create({ email, password: hashed, role });

    return { message: 'User registered successfully' };
  }

  // Login user
  async login(dto: LoginDto) {
    const { email, password } = dto;

    // Find user by email
    const user = await this.userModel.findOne({ email });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    // Compare password with hashed password
    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new UnauthorizedException('Invalid credentials');

    // Create JWT payload
    const payload = { sub: user._id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);

    return { token };
  }
}
