import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TaskService } from './task.service';

describe('TaskService', () => {
  let service: TaskService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TaskService],
    });
    service = TestBed.inject(TaskService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('list calls GET /api/tasks', () => {
    const tasks = [{ id: '1', title: 'T1', status: 'todo', category: 'work' }];
    service.list().subscribe((res) => expect(res).toEqual(tasks));
    const req = httpMock.expectOne('/api/tasks');
    expect(req.request.method).toBe('GET');
    req.flush(tasks);
  });

  it('list passes params when provided', () => {
    service.list({ status: 'done', category: 'work' }).subscribe();
    const req = httpMock.expectOne((r) => r.url.includes('/api/tasks'));
    expect(req.request.params.get('status')).toBe('done');
    expect(req.request.params.get('category')).toBe('work');
    req.flush([]);
  });

  it('get calls GET /api/tasks/:id', () => {
    const task = { id: '1', title: 'T1', status: 'todo', category: 'work' };
    service.get('1').subscribe((res) => expect(res).toEqual(task));
    const req = httpMock.expectOne('/api/tasks/1');
    expect(req.request.method).toBe('GET');
    req.flush(task);
  });

  it('create calls POST /api/tasks', () => {
    const body = { title: 'New', description: 'D' };
    service.create(body).subscribe();
    const req = httpMock.expectOne('/api/tasks');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    req.flush({});
  });

  it('update calls PUT /api/tasks/:id', () => {
    const body = { title: 'Updated' };
    service.update('1', body).subscribe();
    const req = httpMock.expectOne('/api/tasks/1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(body);
    req.flush({});
  });

  it('delete calls DELETE /api/tasks/:id', () => {
    service.delete('1').subscribe();
    const req = httpMock.expectOne('/api/tasks/1');
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
