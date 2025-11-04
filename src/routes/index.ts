/**
 * ============================================================================
 * MAIN ROUTER
 * ============================================================================
 * Register all route modules
 */

import { Router } from 'express';
import cartRoutes from './cart';
import productRoutes from './products';
import config from '../config';

const router = Router();

// API version prefix
const API_VERSION = `/v${config.server.apiVersion.replace('v', '')}`;

// Register routes
router.use(`${API_VERSION}/carts`, cartRoutes);
router.use(`${API_VERSION}/products`, productRoutes);

export default router;
