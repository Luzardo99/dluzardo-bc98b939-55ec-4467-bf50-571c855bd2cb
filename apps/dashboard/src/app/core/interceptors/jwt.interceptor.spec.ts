import { TestBed } from '@angular/core/testing';
import { HttpRequest } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { jwtInterceptor } from './jwt.interceptor';

describe('jwtInterceptor', () => {
  let authService: { getToken: jest.Mock };

  beforeEach(() => {
    authService = { getToken: jest.fn() };
    TestBed.configureTestingModule({
      providers: [{ provide: AuthService, useValue: authService }],
    });
  });

  it('adds Authorization header when token exists', (done) => {
    authService.getToken.mockReturnValue('bearer-token');
    const req = new HttpRequest('GET', '/api/tasks');
    const next = jest.fn().mockReturnValue({ subscribe: (fn: any) => fn({}) });

    TestBed.runInInjectionContext(() => {
      jwtInterceptor(req, next as any).subscribe(() => {
        const passed = next.mock.calls[0][0];
        expect(passed.headers.get('Authorization')).toBe('Bearer bearer-token');
        done();
      });
    });
  });

  it('does not add header when no token', (done) => {
    authService.getToken.mockReturnValue(null);
    const req = new HttpRequest('GET', '/api/tasks');
    const next = jest.fn().mockReturnValue({ subscribe: (fn: any) => fn(req) });

    TestBed.runInInjectionContext(() => {
      jwtInterceptor(req, next as any).subscribe((evt: any) => {
        expect(evt).toBe(req);
        done();
      });
    });
  });
});
