"use strict";
/**
 * ============================================================================
 * CART ROUTES
 * ============================================================================
 * All cart and product-related routes
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middleware_1 = require("../middleware");
const cartController = __importStar(require("../controllers/cart"));
const cart_1 = require("../schemas/cart");
const router = (0, express_1.Router)();
// ============================================================================
// CART ROUTES
// ============================================================================
/**
 * POST /carts
 * Initialize a new cart
 */
router.post('/', (0, middleware_1.asyncHandler)(cartController.initializeCart));
/**
 * GET /carts/:cartId
 * Get cart by ID
 */
router.get('/:cartId', (0, middleware_1.validateParams)(cart_1.CartIdParamSchema), (0, middleware_1.asyncHandler)(cartController.getCart));
/**
 * POST /carts/:cartId/items
 * Add item to cart
 */
router.post('/:cartId/items', (0, middleware_1.validateParams)(cart_1.CartIdParamSchema), (0, middleware_1.validateBody)(cart_1.AddItemBodySchema), (0, middleware_1.asyncHandler)(cartController.addItemToCart));
/**
 * PATCH /carts/:cartId/items/:itemId
 * Update cart item quantity
 */
router.patch('/:cartId/items/:itemId', (0, middleware_1.validateParams)(cart_1.CartItemParamsSchema), (0, middleware_1.validateBody)(cart_1.UpdateItemBodySchema), (0, middleware_1.asyncHandler)(cartController.updateCartItem));
/**
 * DELETE /carts/:cartId/items/:itemId
 * Remove item from cart
 */
router.delete('/:cartId/items/:itemId', (0, middleware_1.validateParams)(cart_1.CartItemParamsSchema), (0, middleware_1.asyncHandler)(cartController.removeCartItem));
/**
 * GET /carts/:cartId/validate
 * Validate cart against business rules
 */
router.get('/:cartId/validate', (0, middleware_1.validateParams)(cart_1.CartIdParamSchema), (0, middleware_1.asyncHandler)(cartController.validateCart));
exports.default = router;
