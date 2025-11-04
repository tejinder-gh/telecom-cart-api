"use strict";
/**
 * ============================================================================
 * CART ENDPOINT SCHEMAS AND CONTRACTS
 * ============================================================================
 * Zod validation schemas for cart endpoints
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetProductContract = exports.GetProductsContract = exports.ValidateCartContract = exports.RemoveCartItemContract = exports.UpdateCartItemContract = exports.AddItemToCartContract = exports.GetCartContract = exports.InitializeCartContract = exports.UpdateItemBodySchema = exports.AddItemBodySchema = exports.ProductIdParamSchema = exports.CartItemParamsSchema = exports.CartIdParamSchema = void 0;
const zod_1 = require("zod");
// ============================================================================
// PATH PARAMETER SCHEMAS
// ============================================================================
exports.CartIdParamSchema = zod_1.z.object({
    cartId: zod_1.z.string().min(1, 'Cart ID is required'),
});
exports.CartItemParamsSchema = zod_1.z.object({
    cartId: zod_1.z.string().min(1, 'Cart ID is required'),
    itemId: zod_1.z.string().min(1, 'Item ID is required'),
});
exports.ProductIdParamSchema = zod_1.z.object({
    productId: zod_1.z.string().min(1, 'Product ID is required'),
});
// ============================================================================
// REQUEST BODY SCHEMAS
// ============================================================================
exports.AddItemBodySchema = zod_1.z.object({
    productId: zod_1.z.string().min(1, 'Product ID is required'),
    quantity: zod_1.z
        .number()
        .int('Quantity must be an integer')
        .positive('Quantity must be positive')
        .min(1, 'Quantity must be at least 1')
        .max(10, 'Quantity cannot exceed 10'),
});
exports.UpdateItemBodySchema = zod_1.z.object({
    quantity: zod_1.z
        .number()
        .int('Quantity must be an integer')
        .positive('Quantity must be positive')
        .min(1, 'Quantity must be at least 1')
        .max(10, 'Quantity cannot exceed 10'),
});
// ============================================================================
// ENDPOINT CONTRACTS
// ============================================================================
/**
 * @endpoint POST /api/v1/carts
 * @description Initialize a new cart
 * @access Public
 */
exports.InitializeCartContract = {
    method: 'POST',
    path: '/api/v1/carts',
    statusCodes: {
        success: 201,
        errors: [500],
    },
};
/**
 * @endpoint GET /api/v1/carts/:cartId
 * @description Get cart by ID
 * @access Public
 */
exports.GetCartContract = {
    method: 'GET',
    path: '/api/v1/carts/:cartId',
    params: exports.CartIdParamSchema,
    statusCodes: {
        success: 200,
        errors: [400, 404, 500],
    },
};
/**
 * @endpoint POST /api/v1/carts/:cartId/items
 * @description Add item to cart
 * @access Public
 */
exports.AddItemToCartContract = {
    method: 'POST',
    path: '/api/v1/carts/:cartId/items',
    params: exports.CartIdParamSchema,
    body: exports.AddItemBodySchema,
    statusCodes: {
        success: 200,
        errors: [400, 404, 500],
    },
};
/**
 * @endpoint PATCH /api/v1/carts/:cartId/items/:itemId
 * @description Update cart item quantity
 * @access Public
 */
exports.UpdateCartItemContract = {
    method: 'PATCH',
    path: '/api/v1/carts/:cartId/items/:itemId',
    params: exports.CartItemParamsSchema,
    body: exports.UpdateItemBodySchema,
    statusCodes: {
        success: 200,
        errors: [400, 404, 500],
    },
};
/**
 * @endpoint DELETE /api/v1/carts/:cartId/items/:itemId
 * @description Remove item from cart
 * @access Public
 */
exports.RemoveCartItemContract = {
    method: 'DELETE',
    path: '/api/v1/carts/:cartId/items/:itemId',
    params: exports.CartItemParamsSchema,
    statusCodes: {
        success: 200,
        errors: [400, 404, 500],
    },
};
/**
 * @endpoint GET /api/v1/carts/:cartId/validate
 * @description Validate cart against business rules
 * @access Public
 */
exports.ValidateCartContract = {
    method: 'GET',
    path: '/api/v1/carts/:cartId/validate',
    params: exports.CartIdParamSchema,
    statusCodes: {
        success: 200,
        errors: [400, 404, 500],
    },
};
/**
 * @endpoint GET /api/v1/products
 * @description Get all available products
 * @access Public
 */
exports.GetProductsContract = {
    method: 'GET',
    path: '/api/v1/products',
    statusCodes: {
        success: 200,
        errors: [500],
    },
};
/**
 * @endpoint GET /api/v1/products/:productId
 * @description Get product by ID
 * @access Public
 */
exports.GetProductContract = {
    method: 'GET',
    path: '/api/v1/products/:productId',
    params: exports.ProductIdParamSchema,
    statusCodes: {
        success: 200,
        errors: [400, 404, 500],
    },
};
