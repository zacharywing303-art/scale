import { Request, Response } from "express";
import * as addressService from "../services/address.service";

export const createAddress = async (req: Request, res: Response) => {
  try {
    const address = await addressService.createAddress(req.body);
    res.status(201).json(address);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
};

export const updateAddress = async (req: Request, res: Response) => {
  try {
    const address = await addressService.updateAddress(req.params.id, req.body);
    res.json(address);
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
};

export const deleteAddress = async (req: Request, res: Response) => {
  try {
    await addressService.deleteAddress(req.params.id);
    res.status(204).send();
  } catch (e: any) {
    res.status(500).json({ message: e.message });
  }
};
