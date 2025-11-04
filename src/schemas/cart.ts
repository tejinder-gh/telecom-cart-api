/**
 * ============================================================================
 * CART ENDPOINT SCHEMAS AND CONTRACTS
 * ============================================================================
 * Zod validation schemas for cart endpoints
 */

import { z } from 'zod';

// ============================================================================
// PATH PARAMETER SCHEMAS
// ============================================================================

export const CartIdParamSchema = z.object({
  cartId: z.string().min(1, 'Cart ID is required'),
});

export const CartItemParamsSchema = z.object({
  cartId: z.string().min(1, 'Cart ID is required'),
  itemId: z.string().min(1, 'Item ID is required'),
});

export const ProductIdParamSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
});

// ============================================================================
// REQUEST BODY SCHEMAS
// ============================================================================

export const AddItemBodySchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z
    .number()
    .int('Quantity must be an integer')
    .positive('Quantity must be positive')
    .min(1, 'Quantity must be at least 1')
    .max(10, 'Quantity cannot exceed 10'),
});

export const UpdateItemBodySchema = z.object({
  quantity: z
    .number()
    .int('Quantity must be an integer')
    .positive('Quantity must be positive')
    .min(1, 'Quantity must be at least 1')
    .max(10, 'Quantity cannot exceed 10'),
});

// ============================================================================
// TYPE INFERENCE
// ============================================================================

export type CartIdParam = z.infer<typeof CartIdParamSchema>;
export type CartItemParams = z.infer<typeof CartItemParamsSchema>;
export type ProductIdParam = z.infer<typeof ProductIdParamSchema>;
export type AddItemBody = z.infer<typeof AddItemBodySchema>;
export type UpdateItemBody = z.infer<typeof UpdateItemBodySchema>;

// ============================================================================
// ENDPOINT CONTRACTS
// ============================================================================

/**
 * @endpoint POST /api/v1/carts
 * @description Initialize a new cart
 * @access Public
 */
export const InitializeCartContract = {
  method: 'POST' as const,
  path: '/api/v1/carts',
  statusCodes: {
    success: 201,
    errors: [500],
  },
} as const;

/**
 * @endpoint GET /api/v1/carts/:cartId
 * @description Get cart by ID
 * @access Public
 */
export const GetCartContract = {
  method: 'GET' as const,
  path: '/api/v1/carts/:cartId',
  params: CartIdParamSchema,
  statusCodes: {
    success: 200,
    errors: [400, 404, 500],
  },
} as const;

/**
 * @endpoint POST /api/v1/carts/:cartId/items
 * @description Add item to cart
 * @access Public
 */
export const AddItemToCartContract = {
  method: 'POST' as const,
  path: '/api/v1/carts/:cartId/items',
  params: CartIdParamSchema,
  body: AddItemBodySchema,
  statusCodes: {
    success: 200,
    errors: [400, 404, 500],
  },
} as const;

/**
 * @endpoint PATCH /api/v1/carts/:cartId/items/:itemId
 * @description Update cart item quantity
 * @access Public
 */
export const UpdateCartItemContract = {
  method: 'PATCH' as const,
  path: '/api/v1/carts/:cartId/items/:itemId',
  params: CartItemParamsSchema,
  body: UpdateItemBodySchema,
  statusCodes: {
    success: 200,
    errors: [400, 404, 500],
  },
} as const;

/**
 * @endpoint DELETE /api/v1/carts/:cartId/items/:itemId
 * @description Remove item from cart
 * @access Public
 */
export const RemoveCartItemContract = {
  method: 'DELETE' as const,
  path: '/api/v1/carts/:cartId/items/:itemId',
  params: CartItemParamsSchema,
  statusCodes: {
    success: 200,
    errors: [400, 404, 500],
  },
} as const;

/**
 * @endpoint GET /api/v1/carts/:cartId/validate
 * @description Validate cart against business rules
 * @access Public
 */
export const ValidateCartContract = {
  method: 'GET' as const,
  path: '/api/v1/carts/:cartId/validate',
  params: CartIdParamSchema,
  statusCodes: {
    success: 200,
    errors: [400, 404, 500],
  },
} as const;

/**
 * @endpoint GET /api/v1/products
 * @description Get all available products
 * @access Public
 */
export const GetProductsContract = {
  method: 'GET' as const,
  path: '/api/v1/products',
  statusCodes: {
    success: 200,
    errors: [500],
  },
} as const;

/**
 * @endpoint GET /api/v1/products/:productId
 * @description Get product by ID
 * @access Public
 */
export const GetProductContract = {
  method: 'GET' as const,
  path: '/api/v1/products/:productId',
  params: ProductIdParamSchema,
  statusCodes: {
    success: 200,
    errors: [400, 404, 500],
  },
} as const;
