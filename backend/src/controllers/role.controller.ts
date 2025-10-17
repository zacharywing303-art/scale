import { Request, Response } from "express";
import * as roleService from "../services/role.service";

// ✅ Create new role
export async function createRole(req: Request, res: Response) {
  try {
    const role = await roleService.createRole(req.body);
    res.status(201).json(role);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

// ✅ Get roles (optionally filtered by agency)
export async function getRoles(req: Request, res: Response) {
  try {
    const { agencyId } = req.query;
    const roles = await roleService.getRoles(
      agencyId ? String(agencyId) : undefined
    );
    res.json(roles);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

// ✅ Get single role
export async function getRoleById(req: Request, res: Response) {
  try {
    const role = await roleService.getRoleById(req.params.id);
    if (!role) return res.status(404).json({ message: "Role not found" });
    res.json(role);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

// ✅ Update role
export async function updateRole(req: Request, res: Response) {
  try {
    const role = await roleService.updateRole(req.params.id, req.body);
    res.json(role);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

// ✅ Delete role
export async function deleteRole(req: Request, res: Response) {
  try {
    await roleService.deleteRole(req.params.id);
    res.json({ message: "Role deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function createPermission(req: Request, res: Response) {
  try {
    const permission = await roleService.createPermission(req.body);
    res.status(201).json(permission);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getPermissions(req: Request, res: Response) {
  try {
    const { roleId } = req.query;
    const permissions = await roleService.getPermissions(
      roleId ? String(roleId) : undefined
    );
    res.json(permissions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getPermissionById(req: Request, res: Response) {
  try {
    const permission = await roleService.getPermissionById(req.params.id);
    if (!permission) return res.status(404).json({ message: "Not found" });
    res.json(permission);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function updatePermission(req: Request, res: Response) {
  try {
    const permission = await roleService.updatePermission(
      req.params.id,
      req.body
    );
    res.json(permission);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function deletePermission(req: Request, res: Response) {
  try {
    await roleService.deletePermission(req.params.id);
    res.json({ message: "Permission deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
