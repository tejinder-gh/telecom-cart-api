/**
 * ============================================================================
 * PRODUCT ROUTES
 * ============================================================================
 * All product-related routes
 */

import { Router } from 'express';
import { asyncHandler, validateParams } from '../middleware';
import * as cartController from '../controllers/cart';
import { ProductIdParamSchema } from '../schemas/cart';

const router = Router();

/**
 * GET /products
 * Get all available products
 */
router.get('/', asyncHandler(cartController.getProducts));

/**
 * GET /products/:productId
 * Get product by ID
 */
router.get(
  '/:productId',
  validateParams(ProductIdParamSchema),
  asyncHandler(cartController.getProduct)
);

export default router;
