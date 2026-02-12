import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskFormComponent } from './task-form.component';

describe('TaskFormComponent', () => {
  let component: TaskFormComponent;
  let fixture: ComponentFixture<TaskFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskFormComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('emits save with form data on submit', () => {
    component.form = { title: 'T1', description: 'D', status: 'todo', category: 'work' };
    const spy = jest.fn();
    component.save.subscribe(spy);
    component.onSubmit();
    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'T1', status: 'todo', category: 'work' })
    );
  });

  it('emits cancel when cancel clicked', () => {
    const spy = jest.fn();
    component.cancel.subscribe(spy);
    component.cancel.emit();
    expect(spy).toHaveBeenCalled();
  });
});
