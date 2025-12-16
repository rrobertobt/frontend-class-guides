import { Component, computed, signal } from '@angular/core';
import {FormsModule} from '@angular/forms';
type Todo = {
  id: number;
  title: string;
  done: boolean;
};

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  imports: [FormsModule],
  styleUrl: './app.css',
})
export class App {
  todos = signal<Todo[]>([]);
  newTitle = '';
  private nextId = 1;

  pendingTodos = computed(() => this.todos().filter((t) => !t.done).length);
  addTodo() {
    const title = this.newTitle.trim();
    if (!title) return;

    this.todos.update((list) => [...list, { id: this.nextId++, title, done: false }]);

    this.newTitle = '';
  }

  toggle(id: number) {
    this.todos.update((list) => list.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  }

  remove(id: number) {
    this.todos.update((list) => list.filter((t) => t.id !== id));
  }
}
