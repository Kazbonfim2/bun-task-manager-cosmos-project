import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../http-error";
import { authService } from "./auth.service";

export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization ?? "";
  const [tipo, token] = header.split(" ");
  if (tipo !== "Bearer" || !token) {
    return next(new HttpError(401, "Token ausente"));
  }
  try {
    req.usuario = authService.validarToken(token);
    next();
  } catch (erro) {
    next(erro);
  }
}
