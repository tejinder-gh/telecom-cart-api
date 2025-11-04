/**
 * ============================================================================
 * CART ROUTES
 * ============================================================================
 * All cart and product-related routes
 */

import { Router } from 'express';
import { asyncHandler, validateParams, validateBody } from '../middleware';
import * as cartController from '../controllers/cart';
import {
  CartIdParamSchema,
  CartItemParamsSchema,
  AddItemBodySchema,
  UpdateItemBodySchema,
} from '../schemas/cart';

const router = Router();

// ============================================================================
// CART ROUTES
// ============================================================================

/**
 * POST /carts
 * Initialize a new cart
 */
router.post('/', asyncHandler(cartController.initializeCart));

/**
 * GET /carts/:cartId
 * Get cart by ID
 */
router.get(
  '/:cartId',
  validateParams(CartIdParamSchema),
  asyncHandler(cartController.getCart)
);

/**
 * POST /carts/:cartId/items
 * Add item to cart
 */
router.post(
  '/:cartId/items',
  validateParams(CartIdParamSchema),
  validateBody(AddItemBodySchema),
  asyncHandler(cartController.addItemToCart)
);

/**
 * PATCH /carts/:cartId/items/:itemId
 * Update cart item quantity
 */
router.patch(
  '/:cartId/items/:itemId',
  validateParams(CartItemParamsSchema),
  validateBody(UpdateItemBodySchema),
  asyncHandler(cartController.updateCartItem)
);

/**
 * DELETE /carts/:cartId/items/:itemId
 * Remove item from cart
 */
router.delete(
  '/:cartId/items/:itemId',
  validateParams(CartItemParamsSchema),
  asyncHandler(cartController.removeCartItem)
);

/**
 * GET /carts/:cartId/validate
 * Validate cart against business rules
 */
router.get(
  '/:cartId/validate',
  validateParams(CartIdParamSchema),
  asyncHandler(cartController.validateCart)
);

export default router;
