"use client";

import { useState, useEffect, useCallback } from "react";
import { Todo, Status } from "@/types/todo";

const STATUS_COLORS: Record<Status, string> = {
  todo: "bg-pink-400",
  doing: "bg-yellow-400",
  done: "bg-emerald-400",
};

const STATUS_LABELS: Record<Status, string> = {
  todo: "To Do",
  doing: "Doing",
  done: "Done",
};

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<Status | "all">("all");
  const [title, setTitle] = useState("");
  const [deadline, setDeadline] = useState("");

  const fetchTodos = useCallback(async () => {
    const res = await fetch("/api/todos");
    setTodos(await res.json());
  }, []);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  // Check for reminders every minute
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      todos.forEach((todo) => {
        if (todo.deadline && todo.status !== "done") {
          const deadlineDate = new Date(todo.deadline);
          const diff = deadlineDate.getTime() - now.getTime();
          const thirtyMin = 30 * 60 * 1000;
          if (diff > 0 && diff <= thirtyMin) {
            if (Notification.permission === "granted") {
              new Notification(`Reminder: ${todo.title}`, {
                body: `Due in ${Math.round(diff / 60000)} minutes!`,
              });
            }
          }
        }
      });
    };

    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    const interval = setInterval(checkReminders, 60000);
    return () => clearInterval(interval);
  }, [todos]);

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, deadline: deadline || null }),
    });
    setTitle("");
    setDeadline("");
    fetchTodos();
  };

  const updateStatus = async (id: string, status: Status) => {
    await fetch(`/api/todos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchTodos();
  };

  const deleteTodo = async (id: string) => {
    await fetch(`/api/todos/${id}`, { method: "DELETE" });
    fetchTodos();
  };

  const filtered = filter === "all" ? todos : todos.filter((t) => t.status === filter);

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-8 text-gray-900">todos</h1>

      {/* Add form */}
      <form onSubmit={addTodo} className="mb-8 p-6 bg-white rounded-2xl border-2 border-gray-900">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          className="w-full text-lg p-3 border-2 border-gray-200 rounded-xl mb-4 focus:outline-none focus:border-gray-900"
        />
        <div className="flex gap-4">
          <input
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="flex-1 p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-gray-900"
          />
          <button
            type="submit"
            className="px-8 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors"
          >
            Add
          </button>
        </div>
      </form>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {(["all", "todo", "doing", "done"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              filter === f
                ? "bg-gray-900 text-white"
                : "bg-white border-2 border-gray-200 hover:border-gray-900"
            }`}
          >
            {f === "all" ? "All" : STATUS_LABELS[f]}
          </button>
        ))}
      </div>

      {/* Todo list */}
      <div className="space-y-3">
        {filtered.map((todo) => (
          <div
            key={todo.id}
            className="p-4 bg-white rounded-2xl border-2 border-gray-200 flex items-center gap-4"
          >
            <div className={`w-3 h-3 rounded-full ${STATUS_COLORS[todo.status]}`} />
            <div className="flex-1">
              <p className={`font-medium ${todo.status === "done" ? "line-through text-gray-400" : ""}`}>
                {todo.title}
              </p>
              {todo.deadline && (
                <p className="text-sm text-gray-500">
                  Due: {new Date(todo.deadline).toLocaleString()}
                </p>
              )}
            </div>
            <select
              value={todo.status}
              onChange={(e) => updateStatus(todo.id, e.target.value as Status)}
              className={`px-3 py-1 rounded-lg text-white font-medium ${STATUS_COLORS[todo.status]}`}
            >
              <option value="todo">To Do</option>
              <option value="doing">Doing</option>
              <option value="done">Done</option>
            </select>
            <button
              onClick={() => deleteTodo(todo.id)}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            >
              ✕
            </button>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-gray-400 py-8">No tasks yet</p>
        )}
      </div>
    </main>
  );
}
