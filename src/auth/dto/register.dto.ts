import { IsEmail, IsNotEmpty, MinLength, IsEnum } from 'class-validator';

export class RegisterDto {
  @IsEmail() // Ensures the value is a valid email format
  email: string;

  @IsNotEmpty() // Ensures password is not empty..
  @MinLength(6) // Ensures password is at least 6 characters
  password: string;

  @IsEnum(['CREATOR', 'EVENTEE']) // Only allows these 2 roles
  role: string;
}
