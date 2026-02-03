import { Todo } from "@/types/todo";

const todos: Map<string, Todo> = new Map();

export const store = {
  getAll: () => Array.from(todos.values()),
  get: (id: string) => todos.get(id),
  add: (todo: Todo) => todos.set(todo.id, todo),
  update: (id: string, data: Partial<Todo>) => {
    const todo = todos.get(id);
    if (todo) todos.set(id, { ...todo, ...data });
    return todos.get(id);
  },
  delete: (id: string) => todos.delete(id),
};
