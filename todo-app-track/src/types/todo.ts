export type Status = "todo" | "doing" | "done";

export interface Todo {
  id: string;
  title: string;
  status: Status;
  deadline: string | null;
  createdAt: string;
}
