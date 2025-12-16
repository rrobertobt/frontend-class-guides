import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../../core/api.config';
import { Todo } from '../../core/models';

type TodosResponse = { todos: Todo[] };
type TodoResponse = { todo: Todo };

@Injectable({ providedIn: 'root' })
export class TodoService {
  constructor(private http: HttpClient) {}

  async list(): Promise<Todo[]> {
    const res = await firstValueFrom(
      this.http.get<TodosResponse>(`${API_BASE_URL}/todos`, { withCredentials: true })
    );
    return res.todos;
  }

  async create(title: string): Promise<Todo> {
    const res = await firstValueFrom(
      this.http.post<TodoResponse>(
        `${API_BASE_URL}/todos`,
        { title },
        { withCredentials: true }
      )
    );
    return res.todo;
  }

  async update(id: number, patch: { title?: string; done?: boolean }): Promise<Todo> {
    const res = await firstValueFrom(
      this.http.patch<TodoResponse>(
        `${API_BASE_URL}/todos/${id}`,
        patch,
        { withCredentials: true }
      )
    );
    return res.todo;
  }

  async remove(id: number): Promise<void> {
    await firstValueFrom(
      this.http.delete(`${API_BASE_URL}/todos/${id}`, { withCredentials: true })
    );
  }
}
