import { Component, computed, OnInit, signal } from '@angular/core';
import { Todo } from '../../core/models';
import { TodoService } from '../../core/services/todo.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-todos-display',
  imports: [FormsModule],
  templateUrl: './todos-display.html',
  styleUrl: './todos-display.css',
})
export class TodosDisplay implements OnInit {
  todos = signal<Todo[]>([]);
  newTitle = '';

  loading = signal(false);
  error = signal<string | null>(null);

  pendingCount = computed(() => this.todos().filter((t) => !t.done).length);

  constructor(private todoService: TodoService) {}

  async ngOnInit() {
    await this.load();
  }

  private async load() {
    this.error.set(null);
    this.loading.set(true);
    try {
      const data = await this.todoService.list();
      this.todos.set(data);
    } catch (e: any) {
      this.error.set(e?.error?.message ?? 'Error cargando tareas');
    } finally {
      this.loading.set(false);
    }
  }

  async add() {
    const title = this.newTitle.trim();
    if (!title) return;

    this.error.set(null);
    this.loading.set(true);
    try {
      await this.todoService.create(title);
      this.newTitle = '';
      await this.load();
    } catch (e: any) {
      this.error.set(e?.error?.message ?? 'Error creando tarea');
      this.loading.set(false);
    }
  }

  async toggle(t: Todo) {
    this.error.set(null);
    this.loading.set(true);
    try {
      await this.todoService.update(t.id, { done: !t.done });
      await this.load();
    } catch (e: any) {
      this.error.set(e?.error?.message ?? 'Error actualizando tarea');
      this.loading.set(false);
    }
  }

  async remove(t: Todo) {
    this.error.set(null);
    this.loading.set(true);
    try {
      await this.todoService.remove(t.id);
      await this.load();
    } catch (e: any) {
      this.error.set(e?.error?.message ?? 'Error eliminando tarea');
      this.loading.set(false);
    }
  }
}
