This is a guide on things you should keep in your context when creating an API.
## 1. Core Principles & Standards

### 1.1 REST Constraints

Follow these REST architectural constraints:
- Consistent resource identification and manipulation
- A clear distinction between different layers such as controllers, services etc (refer to the architecture.md overview for more details)
- Use consistent naming conventions
- Implement pagination for collections

### 1.2 HTTP Status Codes Decision Tree
- `200 OK` - Successful GET, PUT, PATCH, DELETE
- `400 Bad Request` - Invalid request syntax or validation failure
- `404 Not Found` - Resource does not exist
- `500 Internal Server Error` - Unexpected server error
- `504 Gateway Timeout` - Upstream timeout

### 1.3 URL Design Patterns
 - /api/v1/products?category=electronics&sort=-price

Rules:
- Use consistent naming conventions
- Use lowercase letters, plural nouns, kebab-case, hyphens
- Use query parameters for filtering and sorting
- Use path parameters for resource identifiers
- Use optional query parameters for pagination

## 2. Contract Structure
TypeScript Interface Patterns

Every endpoint must define:

```typescript
/**
 * @endpoint GET /api/v1/users/:id
 * @description Retrieve a single user by ID
 * @access Public
 */

// Path Parameters
interface GetCartParams {
  id: string;
}

// Query Parameters (optional)
interface GetCartQuery {
  include?: string[]; // Related resources to include
  fields?: string[];  // Specific fields to return
}
// Response Body
interface GetCartResponse {
  data: Cart;
  meta: ResponseMeta;
}

interface ResponseMeta {
  requestId: string;
  timestamp: string; // ISO 8601
  version: string;   // API version
}
```

### 2.2 Zod Schema Definitions



```typescript
import { z } from 'zod';

// Schema for path parameters
const getCartParamsSchema = z.object({
  id: z.string().uuid('Invalid cart ID format'),
});

// Schema for response
const CartSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  items: z.array(z.any()),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Type inference from Zod
type GetCartParams = z.infer<typeof GetCartParamsSchema>;
type GetCartResponse = z.infer<typeof CartSchema>;
```

### 2.3 Complete Endpoint Contract Template

```typescript
/**
 * Endpoint Contract: Get cart by ID
 *
 * @route GET /api/v1/carts/:id
 * @description Retrieves detailed information about a specific cart
 * @access Public
 *
 * @param {string} id - Cart UUID (path parameter)
 * @query {string[]} include - Optional related resources (orders, profile, addresses)
 * @query {string[]} fields - Optional field filtering
 *
 * @returns {200} User retrieved successfully
 * @returns {400} Invalid request parameters
 * @returns {404} User not found
 * @returns {500} Internal server error
 *
 * @example
 * Request:
 *   GET /api/v1/carts/123e4567-e89b-12d3-a456-426614174000?include=orders
 *
 * Response (200):
 *   {
 *     "data": {
 *        <associated data>
 *     },
 *     "meta": {
 *       "requestId": "req_abc123",
 *       "timestamp": "2025-11-03T12:00:00Z",
 *       "version": "v1"
 *     }
 *   }
 */

export const GetUserContract = {
  method: 'GET' as const,
  path: '/api/v1/carts/:id',
  params: GetUserParamsSchema,
  query: GetUserQuerySchema,
  response: GetUserResponseSchema,
  statusCodes: {
    success: 200,
    errors: [400, 404, 500],
  },
} as const;
```
**Pagination:**

```
Offset-based (Default):
/api/v1/users?page=1&limit=20
```

```typescript
// Offset-based pagination
const OffsetPaginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

// Response pagination metadata
const OffsetPaginationMetaSchema = z.object({
  page: z.coerce.number().int().min(1),
  total: z.coerce.number().int().min(0),
  limit: z.coerce.number().int().min(1).max(100),
});

```

**Body Validation Pattern:**

```typescript
// Validation middleware factory
function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated; // Replace with validated data
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          description: 'Validation Error',
          status: 400,
          detail: 'One or more fields failed validation', // only in dev mode
          instance: req.path,
          errors: error.errors.map(err => ({ // only in dev mode
            field: err.path.join('.'),
            message: err.message,
            code: err.code,
          })),
          requestId: req.headers['x-request-id'],
          timestamp: new Date().toISOString(),
        });
      }
      next(error);
    }
  };
}

// Usage
router.post('/api/v1/users',
  validateBody(CreateUserBodySchema),
  userController.create
);
```
### Zod Schema Patterns

```typescript
// Discriminated unions (for polymorphic data)
const PaymentMethodSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('credit_card'),
    cardNumber: z.string().regex(/^\d{16}$/),
    expiryDate: z.string().regex(/^\d{2}\/\d{2}$/),
    cvv: z.string().length(3),
  }),
  z.object({
    type: z.literal('paypal'),
    email: z.string().email(),
  }),
  z.object({
    type: z.literal('bank_transfer'),
    accountNumber: z.string(),
    routingNumber: z.string(),
  }),
]);


### 6.2 Custom Error Classes

```typescript
// Base error class
export class APIError extends Error {
  public readonly statusCode: number;
  public readonly type: string;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number,
    type: string,
    isOperational = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.type = type;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Specific error classes
export class ValidationError extends APIError {
  public readonly errors: Array<{
    field: string;
    message: string;
    code: string;
  }>;

  constructor(errors: Array<{ field: string; message: string; code: string }>) {
    super('Validation Error', 400, 'https://api.example.com/errors/validation-error');
    this.errors = errors;
  }
}

export class NotFoundError extends APIError {
  constructor(resource: string, id: string) {
    super(
      `${resource} with ID '${id}' does not exist`,
      404,
      'https://api.example.com/errors/not-found'
    );
  }
}

export class ConflictError extends APIError {
  constructor(message: string) {
    super(message, 409, 'https://api.example.com/errors/conflict');
  }
}

export class UnprocessableEntityError extends APIError {
  constructor(message: string) {
    super(message, 422, 'https://api.example.com/errors/unprocessable-entity');
  }
}

export class InternalServerError extends APIError {
  constructor(message = 'An unexpected error occurred') {
    super(message, 500, 'https://api.example.com/errors/internal-error', false);
  }
}
```

### 6.3 Error Handler Middleware

```typescript
import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

// Global error handler
export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Zod validation errors
  if (error instanceof ZodError) {
    const problemDetail = {
      type: 'https://api.example.com/errors/validation-error',
      title: 'Validation Error',
      status: 400,
      detail: 'One or more fields failed validation',
      instance: req.path,
      requestId: req.headers['x-request-id'] as string,
      timestamp: new Date().toISOString(),
      errors: error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code,
      })),
    };

    res.status(400).json(problemDetail);
    return;
  }

  // Custom API errors
  if (error instanceof APIError) {
    const problemDetail = {
      type: error.type,
      title: error.message,
      status: error.statusCode,
      detail: error.message,
      instance: req.path,
      requestId: req.headers['x-request-id'] as string,
      timestamp: new Date().toISOString(),
      ...(error instanceof ValidationError && { errors: error.errors }),
    };

    res.status(error.statusCode).json(problemDetail);
    return;
  }

  // Unexpected errors
  console.error('Unexpected error:', error);

  const problemDetail = {
    type: 'https://api.example.com/errors/internal-error',
    title: 'Internal Server Error',
    status: 500,
    detail: 'An unexpected error occurred while processing your request',
    instance: req.path,
    requestId: req.headers['x-request-id'] as string,
    timestamp: new Date().toISOString(),
  };

  res.status(500).json(problemDetail);
}

// Async error wrapper
export function asyncHandler<T>(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<T>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
```

### 6.4 Error Code Taxonomy

```typescript
// Error code prefixes
const ErrorCodes = {
  // Validation errors (1000-1999)
  VALIDATION_FAILED: 1000,
  INVALID_EMAIL: 1001,
  INVALID_UUID: 1002,
  INVALID_DATE: 1003,
  REQUIRED_FIELD_MISSING: 1004,
  FIELD_TOO_SHORT: 1005,
  FIELD_TOO_LONG: 1006,
  INVALID_ENUM_VALUE: 1007,

  // Resource errors (2000-2999)
  RESOURCE_NOT_FOUND: 2000,
  RESOURCE_ALREADY_EXISTS: 2001,
  RESOURCE_CONFLICT: 2002,
  RESOURCE_DELETED: 2003,

  // Business logic errors (3000-3999)
  INSUFFICIENT_BALANCE: 3000,
  ORDER_ALREADY_COMPLETED: 3001,
  CANNOT_DELETE_WITH_DEPENDENCIES: 3002,
  INVALID_STATE_TRANSITION: 3003,

  // System errors (5000-5999)
  INTERNAL_SERVER_ERROR: 5000,
  DATABASE_ERROR: 5001,
  EXTERNAL_SERVICE_ERROR: 5002,
  RATE_LIMIT_EXCEEDED: 5003,
} as const;

type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];
```

---

## 3. Middleware
### 3.1 CORS Configuration

```typescript
import cors from 'cors';

export const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:3000', // Development
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Request-Id',
  ],
  exposedHeaders: [
    'X-Request-Id',
    'X-Response-Time',
    'X-RateLimit-Limit',
    'X-RateLimit-Remaining',
    'X-RateLimit-Reset',
  ],
  credentials: true,
  maxAge: 86400, // 24 hours
};

// Apply CORS
app.use(cors(corsOptions));
```


## 4. Code Generation Templates

### 8.1 Complete Endpoint Template

```typescript
/**
 * ============================================================================
 * ENDPOINT: Create User
 * ============================================================================
 *
 * @route POST /api/v1/users
 * @description Creates a new user account
 * @access Public
 *
 * @body {CreateUserBody} User data
 * @returns {201} User created successfully
 * @returns {400} Validation error
 * @returns {409} User already exists
 * @returns {500} Internal server error
 */

import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { validateBody, asyncHandler } from '../middleware';
import { ConflictError } from '../errors';
import { userService } from '../services';

const router = Router();

// ============================================================================
// SCHEMAS
// ============================================================================

const CreateUserBodySchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters'),
});

const UserResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

const CreateUserResponseSchema = z.object({
  data: UserResponseSchema,
  meta: z.object({
    requestId: z.string().uuid(),
    timestamp: z.string().datetime(),
    version: z.string(),
  }),
});

// ============================================================================
// TYPES
// ============================================================================

type CreateUserBody = z.infer<typeof CreateUserBodySchema>;
type CreateUserResponse = z.infer<typeof CreateUserResponseSchema>;

// ============================================================================
// CONTRACT
// ============================================================================

export const CreateUserContract = {
  method: 'POST' as const,
  path: '/api/v1/users',
  body: CreateUserBodySchema,
  response: CreateUserResponseSchema,
  statusCodes: {
    success: 201,
    errors: [400, 409, 500],
  },
} as const;

// ============================================================================
// CONTROLLER
// ============================================================================

export const createUserController = asyncHandler(
  async (req: Request<{}, {}, CreateUserBody>, res: Response) => {
    const { email, firstName, lastName, password } = req.body;

    // Check if user already exists
    const existingUser = await userService.findByEmail(email);
    if (existingUser) {
      throw new ConflictError(`User with email '${email}' already exists`);
    }

    // Create user
    const user = await userService.create({
      email,
      firstName,
      lastName,
      password,
    });

    // Build response
    const response: CreateUserResponse = {
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
      meta: {
        requestId: req.headers['x-request-id'] as string,
        timestamp: new Date().toISOString(),
        version: 'v1',
      },
    };

    // Set Location header
    res.setHeader('Location', `/api/v1/users/${user.id}`);

    res.status(201).json(response);
  }
);

// ============================================================================
// ROUTES
// ============================================================================

router.post(
  '/api/v1/users',
  validateBody(CreateUserBodySchema),
  createUserController
);

export default router;
```

### 8.2 Service Layer Template

```typescript
/**
 * ============================================================================
 * SERVICE: User Service
 * ============================================================================
 */

import { User, Prisma } from '@prisma/client';
import { prisma } from '../database';
import bcrypt from 'bcrypt';

export class UserService {
  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Create new user
   */
  async create(data: {
    email: string;
    firstName: string;
    lastName: string;
    password: string;
  }): Promise<User> {
    const hashedPassword = await bcrypt.hash(data.password, 10);

    return prisma.user.create({
      data: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        password: hashedPassword,
      },
    });
  }

  /**
   * Update user
   */
  async update(id: string, data: Partial<User>): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete user
   */
  async delete(id: string): Promise<User> {
    return prisma.user.delete({
      where: { id },
    });
  }

  /**
   * List users with pagination
   */
  async list(params: {
    page: number;
    limit: number;
    sort?: string;
  }): Promise<{ users: User[]; total: number }> {
    const { page, limit, sort } = params;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: this.parseSortParam(sort),
      }),
      prisma.user.count(),
    ]);

    return { users, total };
  }

  /**
   * Parse sort parameter
   */
  private parseSortParam(sort?: string): Prisma.UserOrderByWithRelationInput {
    if (!sort) {
      return { createdAt: 'desc' };
    }

    const isDescending = sort.startsWith('-');
    const field = isDescending ? sort.slice(1) : sort;

    return {
      [field]: isDescending ? 'desc' : 'asc',
    };
  }
}

export const userService = new UserService();
```

### 8.3 Router Registration Template

```typescript
/**
 * ============================================================================
 * MAIN ROUTER
 * ============================================================================
 */

import express, { Router } from 'express';
import userRoutes from './users';
import orderRoutes from './orders';
import productRoutes from './products';

const router = Router();

// API version prefix
const API_VERSION = '/api/v1';

// Register routes
router.use(`${API_VERSION}/users`, userRoutes);
router.use(`${API_VERSION}/orders`, orderRoutes);
router.use(`${API_VERSION}/products`, productRoutes);

// 404 handler for API routes
router.use(`${API_VERSION}/*`, (req, res) => {
  res.status(404).json({
    type: 'https://api.example.com/errors/not-found',
    title: 'Not Found',
    status: 404,
    detail: `The requested endpoint '${req.path}' does not exist`,
    instance: req.path,
    requestId: req.headers['x-request-id'],
    timestamp: new Date().toISOString(),
  });
});

export default router;
```

---

## 5. Testing Contracts

### 5.1 Unit Test Pattern

```typescript
/**
 * ============================================================================
 * UNIT TESTS: Create User Endpoint
 * ============================================================================
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import app from '../app';
import { userService } from '../services';

describe('POST /api/v1/users', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a user successfully', async () => {
    // Arrange
    const userData = {
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'SecurePass123!',
    };

    const mockUser = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.spyOn(userService, 'findByEmail').mockResolvedValue(null);
    vi.spyOn(userService, 'create').mockResolvedValue(mockUser);

    // Act
    const response = await request(app)
      .post('/api/v1/users')
      .send(userData)
      .set('Accept', 'application/json');

    // Assert
    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      type: 'https://api.example.com/errors/validation-error',
      title: 'Validation Error',
      status: 400,
      errors: expect.arrayContaining([
        expect.objectContaining({
          field: 'email',
          message: expect.stringContaining('Invalid email'),
        }),
      ]),
    });
  });

  it('should return 409 if user already exists', async () => {
    // Arrange
    const userData = {
      email: 'existing@example.com',
      firstName: 'John',
      lastName: 'Doe',
      password: 'SecurePass123!',
    };

    const existingUser = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.spyOn(userService, 'findByEmail').mockResolvedValue(existingUser);

    // Act
    const response = await request(app)
      .post('/api/v1/users')
      .send(userData)
      .set('Accept', 'application/json');

    // Assert
    expect(response.status).toBe(409);
    expect(response.body).toMatchObject({
      type: 'https://api.example.com/errors/conflict',
      title: 'Resource Conflict',
      status: 409,
      detail: expect.stringContaining('already exists'),
    });
  });

  it('should return 400 for missing required fields', async () => {
    // Arrange
    const incompleteData = {
      email: 'test@example.com',
      // Missing firstName, lastName, password
    };

    // Act
    const response = await request(app)
      .post('/api/v1/users')
      .send(incompleteData)
      .set('Accept', 'application/json');

    // Assert
    expect(response.status).toBe(400);
    expect(response.body.errors).toHaveLength(3);
  });
});
```
