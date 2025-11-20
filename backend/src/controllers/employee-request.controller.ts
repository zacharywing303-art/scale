import { Request, Response } from "express";
import * as service from "../services/employee-request.service";

export const submitTimeOff = async (req: Request, res: Response) => {
  try {
    const result = await service.createTimeOffRequest(req.body);
    res.json({ success: true, request: result });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
};

export const submitAvailabilityChange = async (req: Request, res: Response) => {
  try {
    const result = await service.createAvailabilityChangeRequest(req.body);
    res.json({ success: true, request: result });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
};

export const submitStatusChange = async (req: Request, res: Response) => {
  try {
    const result = await service.createStatusChangeRequest(req.body);
    res.json({ success: true, request: result });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
};

export const getPending = async (req: Request, res: Response) => {
  try {
    const agencyId = req.params.agencyId;
    const list = await service.getPendingRequests(agencyId);
    res.json({ success: true, requests: list });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
};

export const approve = async (req: Request, res: Response) => {
  try {
    const requestId = req.params.id;
    const adminId = req.body.adminId;
    const result = await service.approveRequest(requestId, adminId);
    res.json({ success: true, request: result });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
};

export const decline = async (req: Request, res: Response) => {
  try {
    const result = await service.declineRequest(req.params.id);
    res.json({ success: true, request: result });
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
};
