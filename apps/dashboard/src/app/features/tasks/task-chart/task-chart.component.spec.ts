import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskChartComponent } from './task-chart.component';

describe('TaskChartComponent', () => {
  let component: TaskChartComponent;
  let fixture: ComponentFixture<TaskChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskChartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskChartComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('computes bars from tasks', () => {
    component.tasks = [
      { id: '1', status: 'todo', category: 'work', title: 'T1', description: null, ownerId: '', organizationId: '', createdAt: '', updatedAt: '' },
      { id: '2', status: 'done', category: 'work', title: 'T2', description: null, ownerId: '', organizationId: '', createdAt: '', updatedAt: '' },
    ];
    fixture.detectChanges();
    const bars = component.bars();
    expect(bars.length).toBe(3);
    const todoBar = bars.find((b) => b.status === 'todo');
    const doneBar = bars.find((b) => b.status === 'done');
    expect(todoBar?.count).toBe(1);
    expect(todoBar?.percent).toBe(50);
    expect(doneBar?.count).toBe(1);
    expect(doneBar?.percent).toBe(50);
  });
});
