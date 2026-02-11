import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { Task, CreateTask, TaskStatus, TaskCategory } from '../../../models/task.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [FormsModule],
  template: `
    <form (ngSubmit)="onSubmit()" class="space-y-4">
      <div>
        <label for="title" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
        <input
          id="title"
          type="text"
          [(ngModel)]="form.title"
          name="title"
          required
          class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Task title"
        />
      </div>
      <div>
        <label for="description" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
        <textarea
          id="description"
          [(ngModel)]="form.description"
          name="description"
          rows="3"
          class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Optional description"
        ></textarea>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label for="status" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Status</label>
          <select
            id="status"
            [(ngModel)]="form.status"
            name="status"
            class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>
        <div>
          <label for="category" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
          <select
            id="category"
            [(ngModel)]="form.category"
            name="category"
            class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="work">Work</option>
            <option value="personal">Personal</option>
          </select>
        </div>
      </div>
      @if (error) {
        <p class="text-sm text-red-500 dark:text-red-400">{{ error }}</p>
      }
      <div class="flex gap-2">
        <button
          type="submit"
          [disabled]="loading"
          class="rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-slate-400 px-4 py-2 font-medium text-white transition"
        >
          {{ loading ? 'Saving…' : (task ? 'Update' : 'Create') }}
        </button>
        @if (task) {
          <button
            type="button"
            (click)="cancel.emit()"
            class="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 px-4 py-2 font-medium text-slate-700 dark:text-slate-300 transition"
          >
            Cancel
          </button>
        }
      </div>
    </form>
  `,
})
export class TaskFormComponent implements OnChanges {
  @Input() task: Task | null = null;
  @Input() loading = false;
  @Input() error = '';
  @Output() save = new EventEmitter<CreateTask & { id?: string }>();
  @Output() cancel = new EventEmitter<void>();

  form: { title: string; description: string; status: TaskStatus; category: TaskCategory } = {
    title: '',
    description: '',
    status: 'todo',
    category: 'work',
  };

  ngOnChanges(changes: SimpleChanges) {
    if (changes['task']) {
      if (this.task) {
        this.form = {
          title: this.task.title,
          description: this.task.description ?? '',
          status: this.task.status,
          category: this.task.category,
        };
      } else {
        this.form = { title: '', description: '', status: 'todo', category: 'work' };
      }
    }
  }

  onSubmit() {
    this.save.emit({
      ...this.form,
      ...(this.task ? { id: this.task.id } : {}),
    });
  }
}
