import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: { navigate: jest.fn() } },
      ],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('isAuthenticated is false initially', () => {
    expect(service.isAuthenticated()).toBe(false);
  });

  describe('login', () => {
    it('stores token and user on success', (done) => {
      const response = {
        access_token: 'jwt-123',
        user: { id: 'u1', email: 'a@b.com', role: 'admin', organizationId: 'o1' },
      };
      service.login({ email: 'a@b.com', password: 'secret' }).subscribe(() => {
        expect(service.getToken()).toBe('jwt-123');
        expect(service.user()).toEqual(response.user);
        expect(localStorage.getItem('access_token')).toBe('jwt-123');
        done();
      });
      const req = httpMock.expectOne('/api/auth/login');
      expect(req.request.method).toBe('POST');
      req.flush(response);
    });
  });

  describe('logout', () => {
    it('clears state and navigates to login', () => {
      service['tokenSignal'].set('token');
      service['userSignal'].set({ id: 'u1', email: 'a@b.com', role: 'admin', organizationId: 'o1' });
      localStorage.setItem('access_token', 'x');
      service.logout();
      expect(service.getToken()).toBeNull();
      expect(service.user()).toBeNull();
      expect(localStorage.getItem('access_token')).toBeNull();
      expect(router.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('canEditTasks', () => {
    it('returns true for owner', () => {
      service['userSignal'].set({ role: 'owner' } as any);
      expect(service.canEditTasks()).toBe(true);
    });
    it('returns true for admin', () => {
      service['userSignal'].set({ role: 'admin' } as any);
      expect(service.canEditTasks()).toBe(true);
    });
    it('returns false for viewer', () => {
      service['userSignal'].set({ role: 'viewer' } as any);
      expect(service.canEditTasks()).toBe(false);
    });
    it('returns false when no user', () => {
      service['userSignal'].set(null);
      expect(service.canEditTasks()).toBe(false);
    });
  });
});
