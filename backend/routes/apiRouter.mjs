/**
 * @file backend/routes/apiRouter.mjs
 * @summary Roteador HTTP da API local.
 * @responsibility Encaminhar requests para handlers menores por dominio.
 */

import { handleAdminRoutes } from "./adminRoutes.mjs";
import { handleEventRoutes } from "./eventRoutes.mjs";
import { handleFormRoutes } from "./formRoutes.mjs";
import { handleSystemRoutes } from "./systemRoutes.mjs";

export const handleApiRequest = async (req, res, url) => {
  if (await handleSystemRoutes(req, res, url)) {
    return true;
  }
  if (await handleFormRoutes(req, res, url)) {
    return true;
  }
  if (await handleEventRoutes(req, res, url)) {
    return true;
  }
  if (await handleAdminRoutes(req, res, url)) {
    return true;
  }
  return false;
};
