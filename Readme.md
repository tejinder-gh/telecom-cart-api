This is a submission for coding interview round for backend dev.

Assumptions:
- Interviewer wants to see development skills along with AI skills. To project the actual interaction I have created a coversation.js file which hold the conversation I had with claude code along with the response from claude.
- as requested, .claude/api.md is a trimmed version of my api specification template file I generally use for my AI-assistant(more about it in section below). Also architecture.md is a file used to guide the architecture related discussion.
- I tried not to use external resources, the outcome is solely developed with using the prompts in prompt.md. Although I sometime had to tweak the decision in certain direction.
- To inject the context, i have used clade.md file, as this is a file claude code reads by default.


.claude/api.md is a trimmed version of my api specification template file I generally use for my AI-assistant. For your context, I have removed elements such as:
- API versioning
- db related
- authentication related
- some error handling specifications
- middlewares related
- request tagging
- audit logging
- request lifecycle management including time tracking
- rate limiting
- some of the health checks such as db ping and redis ping


Commands available:
  - npm run dev - Start development server (running on port 3000)
  - npm run build - Build TypeScript project
  - npm test - Run all tests
  - npm start - Start production server


API Endpoints

  Products:
  - GET /api/v1/products - List all products
  - GET /api/v1/products/:productId - Get single product

  Cart:
  - POST /api/v1/carts - Initialize new cart
  - GET /api/v1/carts/:cartId - Get cart by ID
  - POST /api/v1/carts/:cartId/items - Add item to cart
  - PATCH /api/v1/carts/:cartId/items/:itemId - Update item quantity
  - DELETE /api/v1/carts/:cartId/items/:itemId - Remove item from cart
  - GET /api/v1/carts/:cartId/validate - Validate cart

  Health:
  - GET /health - Health check
