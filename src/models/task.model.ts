
import Database from "better-sqlite3";
import path from "path";
import { randomUUID } from "crypto";

export type TaskStatus = "PENDING" | "COMPLETED" | "IN_PROGRESS";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

const dbPath = path.join(process.cwd(), "tasks.sqlite");
const db = new Database(dbPath);

// Initialize schema
db.exec(`
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  status TEXT CHECK(status IN ('PENDING','COMPLETED','IN_PROGRESS')) NOT NULL DEFAULT 'PENDING',
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);
`);

export const TaskModel = {
  create: (data: Omit<Task, "id" | "createdAt" | "updatedAt">): Task => {
    const now = new Date().toISOString();
    const id = randomUUID();
    const task: Task = {
      id,
      title: data.title,
      description: data.description ?? "",
      status: data.status ?? "PENDING",
      createdAt: now,
      updatedAt: now,
    };
    const stmt = db.prepare(
      "INSERT INTO tasks (id, title, description, status, createdAt, updatedAt) VALUES (@id, @title, @description, @status, @createdAt, @updatedAt)"
    );
    stmt.run(task);
    return task;
  },

  findById: (id: string): Task | undefined => {
    const stmt = db.prepare("SELECT * FROM tasks WHERE id = ?");
    return stmt.get(id);
  },

  deleteById: (id: string): boolean => {
    const stmt = db.prepare("DELETE FROM tasks WHERE id = ?");
    const info = stmt.run(id);
    return info.changes > 0;
  },

  updateById: (id: string, updates: Partial<Omit<Task, "id" | "createdAt">>): Task | undefined => {
    const existing = TaskModel.findById(id);
    if (!existing) return undefined;
    const updated: Task = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    const stmt = db.prepare(
      "UPDATE tasks SET title=@title, description=@description, status=@status, updatedAt=@updatedAt WHERE id=@id"
    );
    stmt.run(updated);
    return updated;
  },

  list: (opts: { page: number; limit: number; status?: TaskStatus; title?: string }) => {
    const { page, limit, status, title } = opts;
    const offset = (page - 1) * limit;
    const where: string[] = [];
    const params: any[] = [];

    if (status) {
      where.push("status = ?");
      params.push(status);
    }
    if (title) {
      where.push("LOWER(title) LIKE ?");
      params.push(`%${title.toLowerCase()}%`);
    }

    const whereClause = where.length ? `WHERE ${where.join(" AND ")}` : "";
    const listStmt = db.prepare(`SELECT * FROM tasks ${whereClause} ORDER BY createdAt DESC LIMIT ? OFFSET ?`);
    const countStmt = db.prepare(`SELECT COUNT(*) as count FROM tasks ${whereClause}`);

    const rows = listStmt.all(...params, limit, offset) as Task[];
    const total = (countStmt.get(...params) as any).count as number;
    const totalPages = Math.ceil(total / limit) || 1;

    return { data: rows, page, limit, total, totalPages };
  },
};

export default db;
