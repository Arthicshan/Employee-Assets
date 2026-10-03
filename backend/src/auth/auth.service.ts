import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';

@Injectable()

export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
      include: { employee: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    if (user.role !== 'ADMIN' && user.role !== 'MANAGER' && user.role !== 'EMPLOYEE') {
      throw new UnauthorizedException('Access denied. Invalid user role.');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    let employeeId = user.employeeId ?? user.employee?.id ?? null;
    if (!employeeId && user.role === 'EMPLOYEE') {
      const emp = await this.prisma.employee.findUnique({
        where: { email: user.email },
      });
      if (emp) {
        employeeId = emp.id;
        // Persist the link for future queries
        await this.prisma.user.update({
          where: { id: user.id },
          data: { employeeId: emp.id },
        });
      }
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      employeeId: employeeId ?? undefined,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        employeeId,
      },
    };
  }

  async validateToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
