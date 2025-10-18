import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entities';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async createAnonymousUser(): Promise<{ user: User; token: string }> {
    // Create anonymous user
    const anonymousUser = new User();
    anonymousUser.anonymousUser = true;
    // email, name, password will be undefined by default for optional fields

    const savedUser = await this.usersRepository.save(anonymousUser);

    // Generate JWT token for anonymous user
    const payload = {
      sub: savedUser.id,
      anonymousUser: true,
      isAnonymous: true,
    };

    const token = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '30d', // Anonymous users get longer sessions
    });

    return {
      user: savedUser,
      token,
    };
  }

  async upgradeAnonymousUser(
    userId: string,
    email: string,
    name?: string,
    password?: string,
  ): Promise<{ user: User; token: string }> {
    const user = await this.usersRepository.findOne({
      where: { id: userId, anonymousUser: true },
    });

    if (!user) {
      throw new Error('Anonymous user not found');
    }

    
    user.email = email;
    if(name)
      user.name = name;
    if(password)
      user.password = password; // In real app, hash this password

    const updatedUser = await this.usersRepository.save(user);

    // Generate new JWT token for registered user
    const payload = {
      sub: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      anonymousUser: updatedUser.anonymousUser, // Use actual value from database
      isAnonymous: updatedUser.anonymousUser,   // Mirror the anonymousUser field
    };

    const token = await this.jwtService.signAsync(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '7d',
    });

    return {
      user: updatedUser,
      token,
    };
  }

  async validateUser(userId: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id: userId } });
  }
}
