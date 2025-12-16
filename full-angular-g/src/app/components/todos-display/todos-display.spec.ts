import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodosDisplay } from './todos-display';

describe('TodosDisplay', () => {
  let component: TodosDisplay;
  let fixture: ComponentFixture<TodosDisplay>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodosDisplay]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TodosDisplay);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
