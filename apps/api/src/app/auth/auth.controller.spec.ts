import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: { login: jest.Mock };

  beforeEach(async () => {
    authService = {
      login: jest.fn().mockResolvedValue({ access_token: 'token', user: {} }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('calls authService.login with body', async () => {
      const dto = { email: 'a@b.com', password: 'secret' };
      await controller.login(dto);
      expect(authService.login).toHaveBeenCalledWith(dto);
    });

    it('returns auth response from service', async () => {
      const res = { access_token: 'x', user: { id: '1' } };
      authService.login.mockResolvedValue(res);
      const result = await controller.login({
        email: 'a@b.com',
        password: 'secret',
      });
      expect(result).toEqual(res);
    });
  });
});
