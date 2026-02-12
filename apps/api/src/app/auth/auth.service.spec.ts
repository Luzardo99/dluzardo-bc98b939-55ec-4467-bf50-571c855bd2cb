import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { User } from '@dluzardo-bc98b939-55ec-4467-bf50-571c855bd2cb/data';
import { UserRole } from '@dluzardo-bc98b939-55ec-4467-bf50-571c855bd2cb/data';

jest.mock('bcrypt');

const mockUser: User = {
  id: 'user-1',
  email: 'test@example.com',
  passwordHash: 'hashed',
  role: UserRole.ADMIN,
  organizationId: 'org-1',
  createdAt: new Date(),
  updatedAt: new Date(),
} as User;

describe('AuthService', () => {
  let service: AuthService;
  let userRepo: { findOne: jest.Mock };
  let jwtService: { sign: jest.Mock };

  beforeEach(async () => {
    userRepo = { findOne: jest.fn() };
    jwtService = { sign: jest.fn().mockReturnValue('jwt-token') };
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('validateUser', () => {
    it('returns null when user not found', async () => {
      userRepo.findOne.mockResolvedValue(null);
      const result = await service.validateUser('unknown@example.com', 'pass');
      expect(result).toBeNull();
      expect(userRepo.findOne).toHaveBeenCalledWith({ where: { email: 'unknown@example.com' } });
    });

    it('returns null when password does not match', async () => {
      userRepo.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      const result = await service.validateUser('test@example.com', 'wrong');
      expect(result).toBeNull();
    });

    it('returns user when password matches', async () => {
      userRepo.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      const result = await service.validateUser('test@example.com', 'correct');
      expect(result).toEqual(mockUser);
    });
  });

  describe('login', () => {
    it('throws UnauthorizedException for invalid credentials', async () => {
      userRepo.findOne.mockResolvedValue(null);
      await expect(
        service.login({ email: 'bad@example.com', password: 'pass' })
      ).rejects.toThrow(UnauthorizedException);
    });

    it('returns access_token and user on success', async () => {
      userRepo.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({
        email: 'test@example.com',
        password: 'correct',
      });

      expect(result).toEqual({
        access_token: 'jwt-token',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          role: mockUser.role,
          organizationId: mockUser.organizationId,
        },
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        organizationId: mockUser.organizationId,
      });
    });
  });
});
