import { Request, Response } from "express";
import * as contactService from "../services/contact.service";

export const createContact = async (req: Request, res: Response) => {
  try {
    const contact = await contactService.createContact(req.body);
    res.status(201).json(contact);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
};

export const updateContact = async (req: Request, res: Response) => {
  try {
    const contact = await contactService.updateContact(req.params.id, req.body);
    res.json(contact);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
};
export const deleteContact = async (req: Request, res: Response) => {
  try {
    await contactService.deleteContact(req.params.id);
    res.status(204).send();
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
};
