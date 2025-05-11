import { Injectable } from '@nestjs/common';
import { compareSync, hashSync } from 'bcrypt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { AuthDto } from './dto/auth.dto';
import { AuthResponse } from './dto/auth-response.dto';
import { JwtService } from '@nestjs/jwt';

const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService, private jwtService: JwtService) {}

  async validateUser(username: string, password: string): Promise<User | null> {
    const user = await this.usersService.findOneByUsername(username);

    if (user && compareSync(password, user.encryptedPassword)) {
      return user;
    }

    return null;
  }

  signUp({ username, password }: AuthDto) {
    const encryptedPassword = hashSync(password, SALT_ROUNDS);

    return this.usersService.create({ username, encryptedPassword });
  }

  async createToken(
    currentUser: any, 
  ): Promise<AuthResponse> {
    const payload = { 
      sub: currentUser.id,
      username: currentUser.name,
      role: currentUser.role
    };
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET,
      expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRE_IN,
    });
    return AuthResponse.build(accessToken);
  }
}
