"use strict";
/**
 * ============================================================================
 * MAIN ROUTER
 * ============================================================================
 * Register all route modules
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cart_1 = __importDefault(require("./cart"));
const products_1 = __importDefault(require("./products"));
const config_1 = __importDefault(require("../config"));
const router = (0, express_1.Router)();
// API version prefix
const API_VERSION = `/v${config_1.default.server.apiVersion.replace('v', '')}`;
// Register routes
router.use(`${API_VERSION}/carts`, cart_1.default);
router.use(`${API_VERSION}/products`, products_1.default);
exports.default = router;
