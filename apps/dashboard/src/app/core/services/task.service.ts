import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import type { Task, CreateTask, UpdateTask } from '../../models/task.model';

const API = '/api';

@Injectable({ providedIn: 'root' })
export class TaskService {
  constructor(private http: HttpClient) {}

  list(params?: { status?: string; category?: string; sort?: string }) {
    let httpParams = new HttpParams();
    if (params?.status) httpParams = httpParams.set('status', params.status);
    if (params?.category) httpParams = httpParams.set('category', params.category);
    if (params?.sort) httpParams = httpParams.set('sort', params.sort);
    return this.http.get<Task[]>(`${API}/tasks`, { params: httpParams });
  }

  get(id: string) {
    return this.http.get<Task>(`${API}/tasks/${id}`);
  }

  create(body: CreateTask) {
    return this.http.post<Task>(`${API}/tasks`, body);
  }

  update(id: string, body: UpdateTask) {
    return this.http.put<Task>(`${API}/tasks/${id}`, body);
  }

  delete(id: string) {
    return this.http.delete<void>(`${API}/tasks/${id}`);
  }
}
