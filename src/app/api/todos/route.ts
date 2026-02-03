import { NextResponse } from "next/server";
import { store } from "@/lib/store";
import { Todo } from "@/types/todo";

export async function GET() {
  return NextResponse.json(store.getAll());
}

export async function POST(request: Request) {
  const body = await request.json();
  const todo: Todo = {
    id: crypto.randomUUID(),
    title: body.title,
    status: body.status || "todo",
    deadline: body.deadline || null,
    createdAt: new Date().toISOString(),
  };
  store.add(todo);
  return NextResponse.json(todo, { status: 201 });
}
