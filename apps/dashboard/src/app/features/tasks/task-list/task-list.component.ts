import { Component, OnInit, computed, signal, effect } from '@angular/core';
import { DragDropModule, CdkDragDrop, transferArrayItem } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import type { Task, TaskStatus, TaskCategory } from '../../../models/task.model';
import { TaskService } from '../../../core/services/task.service';
import { AuthService } from '../../../core/services/auth.service';
import { TaskFormComponent } from '../task-form/task-form.component';
import { TaskChartComponent } from '../task-chart/task-chart.component';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [DragDropModule, FormsModule, TaskFormComponent, TaskChartComponent],
  template: `
    <div class="space-y-4 sm:space-y-6">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 class="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white">Tasks</h1>
        @if (canEdit() && !showForm()) {
          <button
            (click)="openCreate()"
            class="rounded-lg bg-blue-600 hover:bg-blue-500 px-3 sm:px-4 py-2 text-sm font-medium text-white transition w-fit"
          >
            + New Task
          </button>
        }
      </div>

      <!-- Filters & Sort -->
      <div class="flex flex-wrap gap-2">
        <select
          [ngModel]="filterStatus()"
          (ngModelChange)="filterStatus.set($event)"
          class="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All statuses</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="done">Done</option>
        </select>
        <select
          [ngModel]="filterCategory()"
          (ngModelChange)="filterCategory.set($event)"
          class="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All categories</option>
          <option value="work">Work</option>
          <option value="personal">Personal</option>
        </select>
        <select
          [ngModel]="sortBy()"
          (ngModelChange)="sortBy.set($event)"
          class="rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="title">Title A–Z</option>
          <option value="status">Status</option>
        </select>
      </div>

      <!-- Bar chart -->
      @if (filteredTasks().length > 0) {
        <app-task-chart [tasks]="filteredTasks()" />
      }

      @if (showForm()) {
        <div class="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 sm:p-6">
          <h2 class="text-lg font-medium text-slate-800 dark:text-white mb-4">{{ editingTask() ? 'Edit Task' : 'New Task' }}</h2>
          <app-task-form
            [task]="editingTask()"
            [loading]="formLoading()"
            [error]="formError()"
            (save)="onSave($event)"
            (cancel)="closeForm()"
          />
        </div>
      }

      @if (loading()) {
        <p class="text-slate-500 dark:text-slate-400">Loading tasks…</p>
      } @else if (filteredTasks().length === 0) {
        <p class="text-slate-500 dark:text-slate-400">No tasks found.</p>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4" cdkDropListGroup>
          @for (col of kanbanColumns; track col.status) {
            <div
              cdkDropList
              [cdkDropListData]="col.status === 'todo' ? kanbanTodo() : col.status === 'in_progress' ? kanbanInProgress() : kanbanDone()"
              [id]="col.status"
              (cdkDropListDropped)="onKanbanDrop($event)"
              class="rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-800/50 min-h-[120px] p-3"
            >
              <h3 class="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                <span [class]="col.dotClass" class="w-2 h-2 rounded-full"></span>
                {{ col.label }}
              </h3>
              <div class="space-y-2">
                @for (task of (col.status === 'todo' ? kanbanTodo() : col.status === 'in_progress' ? kanbanInProgress() : kanbanDone()); track task.id) {
                  <div
                    cdkDrag
                    [cdkDragDisabled]="!canEdit()"
                    class="rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 p-3 shadow-sm cursor-grab active:cursor-grabbing"
                    [class.opacity-60]="!canEdit()"
                  >
                    <div class="pointer-events-none">
                      <h4 class="font-medium text-slate-800 dark:text-white text-sm truncate">{{ task.title }}</h4>
                      @if (task.description) {
                        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{{ task.description }}</p>
                      }
                      <span class="inline-block mt-1 text-xs px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">{{ task.category }}</span>
                    </div>
                    @if (canEdit()) {
                      <div class="flex gap-1 mt-2 pointer-events-auto">
                        <button
                          (click)="openEdit(task); $event.stopPropagation()"
                          class="text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300"
                        >Edit</button>
                        <button
                          (click)="onDelete(task); $event.stopPropagation()"
                          class="text-xs px-2 py-1 rounded bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400"
                        >Delete</button>
                      </div>
                    }
                  </div>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class TaskListComponent implements OnInit {
  tasks = signal<Task[]>([]);
  loading = signal(true);
  showForm = signal(false);
  editingTask = signal<Task | null>(null);
  formLoading = signal(false);
  formError = signal('');

  filterStatus = signal('');
  filterCategory = signal('');
  sortBy = signal<'newest' | 'oldest' | 'title' | 'status'>('newest');

  kanbanColumns = [
    { status: 'todo' as TaskStatus, label: 'To Do', dotClass: 'bg-amber-500' },
    { status: 'in_progress' as TaskStatus, label: 'In Progress', dotClass: 'bg-blue-500' },
    { status: 'done' as TaskStatus, label: 'Done', dotClass: 'bg-emerald-500' },
  ];

  kanbanTodo = signal<Task[]>([]);
  kanbanInProgress = signal<Task[]>([]);
  kanbanDone = signal<Task[]>([]);

  canEdit = () => this.auth.canEditTasks();

  private syncKanban = effect(() => {
    const all = this.filteredTasks();
    this.kanbanTodo.set(all.filter((t) => t.status === 'todo'));
    this.kanbanInProgress.set(all.filter((t) => t.status === 'in_progress'));
    this.kanbanDone.set(all.filter((t) => t.status === 'done'));
  });

  filteredTasks = computed(() => {
    let list = [...this.tasks()];
    const status = this.filterStatus();
    const category = this.filterCategory();
    const sort = this.sortBy();
    if (status) list = list.filter((t) => t.status === status);
    if (category) list = list.filter((t) => t.category === category);
    if (sort === 'oldest') {
      list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sort === 'title') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sort === 'status') {
      const order = { todo: 0, in_progress: 1, done: 2 };
      list.sort((a, b) => order[a.status] - order[b.status]);
    } else {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return list;
  });

  constructor(
    private taskService: TaskService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    this.loading.set(true);
    this.taskService.list().subscribe({
      next: (data) => this.tasks.set(Array.isArray(data) ? data : []),
      error: () => {},
      complete: () => this.loading.set(false),
    });
  }

  onKanbanDrop(event: CdkDragDrop<Task[]>) {
    if (event.previousContainer === event.container) return;
    const task = event.item.data as Task;
    const newStatus = event.container.id as TaskStatus;
    if (task.status === newStatus) return;
    if (!this.canEdit()) return;
    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex
    );
    this.taskService.update(task.id, { status: newStatus }).subscribe({
      next: () => this.loadTasks(),
      error: () => this.loadTasks(),
    });
  }

  openCreate() {
    this.editingTask.set(null);
    this.showForm.set(true);
    this.formError.set('');
  }

  openEdit(task: Task) {
    this.editingTask.set(task);
    this.showForm.set(true);
    this.formError.set('');
  }

  closeForm() {
    this.showForm.set(false);
    this.editingTask.set(null);
  }

  onSave(payload: { id?: string; title: string; description?: string; status?: TaskStatus; category?: TaskCategory }) {
    this.formError.set('');
    this.formLoading.set(true);
    const { id, ...body } = payload;
    const req = id ? this.taskService.update(id, body) : this.taskService.create(body);
    req.subscribe({
      next: () => {
        this.formLoading.set(false);
        this.closeForm();
        this.loadTasks();
      },
      error: (err) => {
        this.formLoading.set(false);
        this.formError.set(err?.error?.message ?? 'Failed to save task');
      },
    });
  }

  onDelete(task: Task) {
    if (!confirm(`Delete "${task.title}"?`)) return;
    this.taskService.delete(task.id).subscribe({ next: () => this.loadTasks() });
  }

  statusLabel(s: TaskStatus): string {
    const map: Record<TaskStatus, string> = {
      todo: 'To Do',
      in_progress: 'In Progress',
      done: 'Done',
    };
    return map[s] ?? s;
  }
}
