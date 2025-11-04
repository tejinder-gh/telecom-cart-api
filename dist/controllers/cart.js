"use strict";
/**
 * ============================================================================
 * CART CONTROLLER
 * ============================================================================
 * HTTP handlers for cart operations
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeCart = initializeCart;
exports.getCart = getCart;
exports.addItemToCart = addItemToCart;
exports.updateCartItem = updateCartItem;
exports.removeCartItem = removeCartItem;
exports.validateCart = validateCart;
exports.getProducts = getProducts;
exports.getProduct = getProduct;
const cart_1 = require("../services/cart");
const salesforce_client_1 = require("../services/salesforce-client");
const config_1 = __importDefault(require("../config"));
// Initialize services
const sfClient = new salesforce_client_1.SalesforceCartClient(config_1.default.salesforce.contextTTL);
const cartService = new cart_1.CartService(sfClient);
/**
 * Initialize a new cart
 * POST /api/v1/carts
 */
async function initializeCart(req, res, next) {
    try {
        const cart = await cartService.initializeCart();
        const response = {
            data: cart,
            meta: {
                requestId: req.headers['x-request-id'] || 'unknown',
                timestamp: new Date().toISOString(),
                version: config_1.default.server.apiVersion,
            },
        };
        res.status(201).json(response);
    }
    catch (error) {
        next(error);
    }
}
/**
 * Get cart by ID
 * GET /api/v1/carts/:cartId
 */
async function getCart(req, res, next) {
    try {
        const { cartId } = req.params;
        const cart = await cartService.getCart(cartId);
        const response = {
            data: cart,
            meta: {
                requestId: req.headers['x-request-id'] || 'unknown',
                timestamp: new Date().toISOString(),
                version: config_1.default.server.apiVersion,
            },
        };
        res.status(200).json(response);
    }
    catch (error) {
        next(error);
    }
}
/**
 * Add item to cart
 * POST /api/v1/carts/:cartId/items
 */
async function addItemToCart(req, res, next) {
    try {
        const { cartId } = req.params;
        const { productId, quantity } = req.body;
        const cart = await cartService.addItem(cartId, productId, quantity);
        const response = {
            data: cart,
            meta: {
                requestId: req.headers['x-request-id'] || 'unknown',
                timestamp: new Date().toISOString(),
                version: config_1.default.server.apiVersion,
            },
        };
        res.status(200).json(response);
    }
    catch (error) {
        next(error);
    }
}
/**
 * Update cart item quantity
 * PATCH /api/v1/carts/:cartId/items/:itemId
 */
async function updateCartItem(req, res, next) {
    try {
        const { cartId, itemId } = req.params;
        const { quantity } = req.body;
        const cart = await cartService.updateItem(cartId, itemId, quantity);
        const response = {
            data: cart,
            meta: {
                requestId: req.headers['x-request-id'] || 'unknown',
                timestamp: new Date().toISOString(),
                version: config_1.default.server.apiVersion,
            },
        };
        res.status(200).json(response);
    }
    catch (error) {
        next(error);
    }
}
/**
 * Remove item from cart
 * DELETE /api/v1/carts/:cartId/items/:itemId
 */
async function removeCartItem(req, res, next) {
    try {
        const { cartId, itemId } = req.params;
        const cart = await cartService.removeItem(cartId, itemId);
        const response = {
            data: cart,
            meta: {
                requestId: req.headers['x-request-id'] || 'unknown',
                timestamp: new Date().toISOString(),
                version: config_1.default.server.apiVersion,
            },
        };
        res.status(200).json(response);
    }
    catch (error) {
        next(error);
    }
}
/**
 * Validate cart
 * GET /api/v1/carts/:cartId/validate
 */
async function validateCart(req, res, next) {
    try {
        const { cartId } = req.params;
        const validation = await cartService.validateCart(cartId);
        const response = {
            data: validation,
            meta: {
                requestId: req.headers['x-request-id'] || 'unknown',
                timestamp: new Date().toISOString(),
                version: config_1.default.server.apiVersion,
            },
        };
        res.status(200).json(response);
    }
    catch (error) {
        next(error);
    }
}
/**
 * Get all products
 * GET /api/v1/products
 */
async function getProducts(req, res, next) {
    try {
        const products = cartService.getProducts();
        const response = {
            data: products,
            meta: {
                requestId: req.headers['x-request-id'] || 'unknown',
                timestamp: new Date().toISOString(),
                version: config_1.default.server.apiVersion,
            },
        };
        res.status(200).json(response);
    }
    catch (error) {
        next(error);
    }
}
/**
 * Get product by ID
 * GET /api/v1/products/:productId
 */
async function getProduct(req, res, next) {
    try {
        const { productId } = req.params;
        const product = cartService.getProduct(productId);
        if (!product) {
            res.status(404).json({
                type: 'https://api.example.com/errors/not-found',
                title: 'Not Found',
                status: 404,
                detail: `Product with ID '${productId}' does not exist`,
                instance: req.path,
                requestId: req.headers['x-request-id'] || 'unknown',
                timestamp: new Date().toISOString(),
            });
            return;
        }
        const response = {
            data: product,
            meta: {
                requestId: req.headers['x-request-id'] || 'unknown',
                timestamp: new Date().toISOString(),
                version: config_1.default.server.apiVersion,
            },
        };
        res.status(200).json(response);
    }
    catch (error) {
        next(error);
    }
}
