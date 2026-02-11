import { Component, Input, computed } from '@angular/core';
import type { Task, TaskStatus } from '../../../models/task.model';

@Component({
  selector: 'app-task-chart',
  standalone: true,
  template: `
    <div class="rounded-xl border p-4 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
      <h3 class="text-sm font-medium text-slate-700 dark:text-slate-300 mb-4">Task completion</h3>
      <div class="space-y-3">
        @for (bar of bars(); track bar.status) {
          <div>
            <div class="flex justify-between text-xs mb-1">
              <span class="text-slate-600 dark:text-slate-400">{{ bar.label }}</span>
              <span class="font-medium text-slate-800 dark:text-slate-200">{{ bar.count }} ({{ bar.percent }}%)</span>
            </div>
            <div class="h-3 rounded-full bg-slate-200 dark:bg-slate-600 overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-500"
                [style.width.%]="bar.percent"
                [class]="bar.bgClass"
              ></div>
            </div>
          </div>
        }
      </div>
      <p class="mt-3 text-xs text-slate-500 dark:text-slate-400">
        {{ doneCount() }} of {{ total() }} tasks completed
      </p>
    </div>
  `,
})
export class TaskChartComponent {
  @Input({ required: true }) tasks: Task[] = [];

  private statusConfig: { status: TaskStatus; label: string; bgClass: string }[] = [
    { status: 'todo', label: 'To Do', bgClass: 'bg-amber-500' },
    { status: 'in_progress', label: 'In Progress', bgClass: 'bg-blue-500' },
    { status: 'done', label: 'Done', bgClass: 'bg-emerald-500' },
  ];

  bars = computed(() => {
    const total = this.tasks.length || 1;
    return this.statusConfig.map(({ status, label, bgClass }) => {
      const count = this.tasks.filter((t) => t.status === status).length;
      const percent = Math.round((count / total) * 100);
      return { status, label, count, percent, bgClass };
    });
  });

  doneCount = computed(() => this.tasks.filter((t) => t.status === 'done').length);
  total = computed(() => this.tasks.length);
}
