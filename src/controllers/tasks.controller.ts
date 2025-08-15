
import { Request, Response } from "express";
import { TaskModel } from "../models/task.model";
import { createTaskSchema, updateTaskSchema, listQuerySchema } from "../middleware/validators";

/**
 * @summary Create a new task
 */
export const createTask = (req: Request, res: Response) => {
  const parsed = createTaskSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const task = TaskModel.create({
    title: parsed.data.title,
    description: parsed.data.description ?? "",
    status: parsed.data.status ?? "PENDING",
  });
  return res.status(201).json(task);
};

/**
 * @summary Get all tasks with pagination & filters
 */
export const getTasks = (req: Request, res: Response) => {
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const { page, limit, status, title } = parsed.data;
  const result = TaskModel.list({ page, limit, status, title });
  return res.json(result);
};

/**
 * @summary Get a task by ID
 */
export const getTaskById = (req: Request, res: Response) => {
  const task = TaskModel.findById(req.params.id);
  if (!task) return res.status(404).json({ error: "Task not found" });
  return res.json(task);
};

/**
 * @summary Update a task by ID
 */
export const updateTaskById = (req: Request, res: Response) => {
  const parsed = updateTaskSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const updated = TaskModel.updateById(req.params.id, parsed.data);
  if (!updated) return res.status(404).json({ error: "Task not found" });
  return res.json(updated);
};

/**
 * @summary Delete a task by ID
 */
export const deleteTaskById = (req: Request, res: Response) => {
  const ok = TaskModel.deleteById(req.params.id);
  if (!ok) return res.status(404).json({ error: "Task not found" });
  return res.status(204).send();
};
