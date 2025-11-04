/**
 * ============================================================================
 * CART CONTROLLER
 * ============================================================================
 * HTTP handlers for cart operations
 */

import { Request, Response, NextFunction } from 'express';
import { CartService } from '../services/cart';
import { SalesforceCartClient } from '../services/salesforce-client';
import { ApiResponse } from '../types';
import config from '../config';

// Initialize services
const sfClient = new SalesforceCartClient(config.salesforce.contextTTL);
const cartService = new CartService(sfClient);

/**
 * Initialize a new cart
 * POST /api/v1/carts
 */
export async function initializeCart(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const cart = await cartService.initializeCart();

    const response: ApiResponse<typeof cart> = {
      data: cart,
      meta: {
        requestId: (req.headers['x-request-id'] as string) || 'unknown',
        timestamp: new Date().toISOString(),
        version: config.server.apiVersion,
      },
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
}

/**
 * Get cart by ID
 * GET /api/v1/carts/:cartId
 */
export async function getCart(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { cartId } = req.params;
    const cart = await cartService.getCart(cartId);

    const response: ApiResponse<typeof cart> = {
      data: cart,
      meta: {
        requestId: (req.headers['x-request-id'] as string) || 'unknown',
        timestamp: new Date().toISOString(),
        version: config.server.apiVersion,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}

/**
 * Add item to cart
 * POST /api/v1/carts/:cartId/items
 */
export async function addItemToCart(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { cartId } = req.params;
    const { productId, quantity } = req.body;

    const cart = await cartService.addItem(cartId, productId, quantity);

    const response: ApiResponse<typeof cart> = {
      data: cart,
      meta: {
        requestId: (req.headers['x-request-id'] as string) || 'unknown',
        timestamp: new Date().toISOString(),
        version: config.server.apiVersion,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}

/**
 * Update cart item quantity
 * PATCH /api/v1/carts/:cartId/items/:itemId
 */
export async function updateCartItem(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { cartId, itemId } = req.params;
    const { quantity } = req.body;

    const cart = await cartService.updateItem(cartId, itemId, quantity);

    const response: ApiResponse<typeof cart> = {
      data: cart,
      meta: {
        requestId: (req.headers['x-request-id'] as string) || 'unknown',
        timestamp: new Date().toISOString(),
        version: config.server.apiVersion,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}

/**
 * Remove item from cart
 * DELETE /api/v1/carts/:cartId/items/:itemId
 */
export async function removeCartItem(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { cartId, itemId } = req.params;
    const cart = await cartService.removeItem(cartId, itemId);

    const response: ApiResponse<typeof cart> = {
      data: cart,
      meta: {
        requestId: (req.headers['x-request-id'] as string) || 'unknown',
        timestamp: new Date().toISOString(),
        version: config.server.apiVersion,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}

/**
 * Validate cart
 * GET /api/v1/carts/:cartId/validate
 */
export async function validateCart(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { cartId } = req.params;
    const validation = await cartService.validateCart(cartId);

    const response: ApiResponse<typeof validation> = {
      data: validation,
      meta: {
        requestId: (req.headers['x-request-id'] as string) || 'unknown',
        timestamp: new Date().toISOString(),
        version: config.server.apiVersion,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}

/**
 * Get all products
 * GET /api/v1/products
 */
export async function getProducts(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const products = cartService.getProducts();

    const response: ApiResponse<typeof products> = {
      data: products,
      meta: {
        requestId: (req.headers['x-request-id'] as string) || 'unknown',
        timestamp: new Date().toISOString(),
        version: config.server.apiVersion,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}

/**
 * Get product by ID
 * GET /api/v1/products/:productId
 */
export async function getProduct(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
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
        requestId: (req.headers['x-request-id'] as string) || 'unknown',
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const response: ApiResponse<typeof product> = {
      data: product,
      meta: {
        requestId: (req.headers['x-request-id'] as string) || 'unknown',
        timestamp: new Date().toISOString(),
        version: config.server.apiVersion,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
}
