import { Request, Response } from "express";
import * as reviewService from "../services/review.service";

export async function getEmployeeHistory(req: Request, res: Response) {
  try {
    const { agencyId } = req.params;
    const limit = Number(req.query.limit ?? 10);
    const data = await reviewService.getEmployeeReviewHistory(agencyId, limit);
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}

export async function generateEmployeeReview(req: Request, res: Response) {
  try {
    const data = await reviewService.generateEmployeeReview(req.body);
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}

export async function getEmployeeReview(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const review = await reviewService.getEmployeeReviewById(id);
    if (!review) return res.status(404).json({ error: "Review not found" });
    res.json(review);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}

// ---- CLIENTS ----

export async function getClientHistory(req: Request, res: Response) {
  try {
    const { agencyId } = req.params;
    const limit = Number(req.query.limit ?? 10);
    const data = await reviewService.getClientReviewHistory(agencyId, limit);
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}

export async function generateClientReview(req: Request, res: Response) {
  try {
    const data = await reviewService.generateClientReview(req.body);
    res.json(data);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}

export async function getClientReview(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const review = await reviewService.getClientReviewById(id);
    if (!review) return res.status(404).json({ error: "Review not found" });
    res.json(review);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
}
