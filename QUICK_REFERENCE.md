# Quick Reference Checklist

## For Every New API Route

### Step 1: Imports (Copy-Paste)

```javascript
import { NextResponse } from "next/server";
import connectDB from "@/config/db.js";
import prisma from "@/lib/prisma";
import { getAuth } from "@clerk/nextjs/server";
import {
  handleError,
  handleSuccess,
  validateUserId,
  validateNumericId,
  safeDbOperation,
  validatePrismaClient,
} from "@/lib/apiUtils";
// Add other imports as needed
```

### Step 2: Start Handler

```javascript
export async function GET(request) {
  try {
    // Authentication (if needed)
    const { userId } = getAuth(request);
    if (!validateUserId(userId)) {
      return handleError("Authentication required", 401);
    }

    // Authorization (if needed)
    // const isSeller = await authSeller(userId);
    // if (!isSeller) {
    //   return handleError("Unauthorized", 403);
    // }

    // Parse body (if POST/PUT/DELETE)
    // let body;
    // try {
    //   body = await request.json();
    // } catch {
    //   return handleError("Invalid JSON", 400);
    // }

    // Validate inputs
    // Add your validation here

    // Connect to database
    try {
      await connectDB();
    } catch (dbErr) {
      return handleError("Database connection failed", 503, dbErr);
    }

    // Verify Prisma
    if (!validatePrismaClient(prisma)) {
      return handleError("Database client error", 500);
    }

    // Your logic here
    const result = await safeDbOperation(
      () => prisma.model.operation(),
      "Operation description"
    );

    if (!result.success) {
      return handleError("Operation failed", 500);
    }

    // Return success
    return handleSuccess({
      message: "Success message",
      data: result.data,
    });
  } catch (error) {
    console.error("[Route] Error:", error);
    return handleError("Internal server error", 500, error);
  }
}
```

## Validation Checklist

### For Every Input

- [ ] Null/undefined check
- [ ] Type check (string, number, array, etc.)
- [ ] Format check (email, URL, etc.)
- [ ] Range check (min/max values)
- [ ] Length check (min/max length)
- [ ] Existence check (in database)
- [ ] Ownership check (belongs to user)

### Validation Functions Available

```javascript
validateUserId(id); // For user IDs
validateNumericId(id); // For numeric IDs (1-2147483647)
validateQuantity(qty); // For quantities (1-10000)
validatePrice(price); // For prices (>=0)
validateEmail(email); // For email format
validateString(str, min, max); // For strings
validateArray(arr, minLength); // For arrays
validateOrderItems(items); // For order items
validateOrderStatus(status); // For order status
```

## Error Response Codes

```
401 = Unauthorized (not logged in)
403 = Forbidden (logged in but not allowed)
404 = Not Found (resource doesn't exist)
400 = Bad Request (invalid input)
500 = Server Error (unexpected issue)
503 = Unavailable (database down, temp issue)
200 = Success with data
201 = Created successfully
```

## Response Patterns

### Success Response

```javascript
return handleSuccess({
  message: "Operation completed",
  data: result,
  count: items.length,
});
```

### Error Response

```javascript
return handleError(
  "Error message shown to user",
  statusCode,
  errorObject // Optional, for logging
);
```

## Field Handling Patterns

### Null-Safe Access

```javascript
user?.name; // Optional chaining
user?.name || "Unknown"; // With default
Number(user?.age) || 0; // Number with default
String(user?.date) || ""; // String with default
Array.isArray(user?.items) ? user?.items : []; // Array with default
```

### BigInt Conversion (CRITICAL)

```javascript
String(bigIntValue); // Always use String()
NOT: bigIntValue.toString(); // Don't use this
NOT: JSON.stringify(bigIntValue); // Will crash
```

### Status Conversion

```javascript
validateOrderStatus(status); // Converts display to enum
STATUS_DISPLAY_MAP[enumStatus]; // Converts enum to display
```

## Common Operations

### Get Order with Details

```javascript
const order = await safeDbOperation(
  () =>
    prisma.order.findUnique({
      where: { id: orderId },
      include: {
        address: true,
        items: { include: { product: true } },
      },
    }),
  "Fetch order"
);
```

### List Orders for User

```javascript
const orders = await safeDbOperation(
  () =>
    prisma.order.findMany({
      where: { userId },
      include: {
        address: true,
        items: { include: { product: true } },
      },
      orderBy: { id: "desc" },
    }),
  "Fetch user orders"
);
```

### Update Order Status

```javascript
const updated = await safeDbOperation(
  () =>
    prisma.order.update({
      where: { id: orderId },
      data: { status: enumStatus },
    }),
  "Update order status"
);
```

### Get Products by IDs

```javascript
const products = await safeDbOperation(
  () =>
    prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, price: true },
    }),
  "Fetch products"
);
```

## Authentication Patterns

### Check User is Logged In

```javascript
const { userId } = getAuth(request);
if (!validateUserId(userId)) {
  return handleError("Authentication required", 401);
}
```

### Check User is Seller

```javascript
const isSeller = await authSeller(userId);
if (!isSeller) {
  return handleError("Seller access required", 403);
}
```

### Verify User Owns Resource

```javascript
const address = await prisma.address.findFirst({
  where: { id: addressId, userId },
});
if (!address) {
  return handleError("Address not found", 404);
}
```

## Logging Pattern

```javascript
console.log("[Route/Function] Description:', {
  userId,
  resourceId: id,
  action: "what happened",
  result: "success/failure",
});

// For errors:
console.error("[Route/Function] Error:', {
  message: error?.message,
  code: error?.code,
  userId,
});
```

## Database Connection Pattern

```javascript
try {
  await connectDB();
} catch (dbErr) {
  return handleError("Database connection failed", 503, dbErr);
}

if (!validatePrismaClient(prisma)) {
  return handleError("Database client error", 500);
}
```

## Testing Checklist

### Before Committing

- [ ] Tested with valid input
- [ ] Tested with missing input
- [ ] Tested with invalid type
- [ ] Tested with out-of-range values
- [ ] Tested without authentication
- [ ] Tested without authorization
- [ ] Tested with non-existent resource
- [ ] Tested with database down
- [ ] No console.log left
- [ ] Error messages are helpful
- [ ] HTTP status codes are correct
- [ ] Response format is consistent

### Test Examples

```bash
# Valid request
curl -X POST http://localhost:3000/api/endpoint \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"field": "value"}'

# Missing auth
curl -X POST http://localhost:3000/api/endpoint \
  -H "Content-Type: application/json" \
  -d '{"field": "value"}'

# Invalid data
curl -X POST http://localhost:3000/api/endpoint \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"field": 12345}' # Wrong type
```

## Documentation Template

```javascript
/**
 * Get user's orders
 * @route GET /api/order/list
 * @auth Required (Clerk token)
 * @returns {Object} - { success: true, orders: [...] }
 * @errors
 *   - 401: No authentication token
 *   - 404: User not found
 *   - 500: Database error
 * @example
 *   GET /api/order/list
 *   Response: { success: true, orders: [...] }
 */
export async function GET(request) {
  // Implementation
}
```

## Quick Debugging Steps

1. **Check Logs**

   ```bash
   npm run dev # See console output
   ```

2. **Add Debug Logs**

   ```javascript
   console.log("[Debug] Step 1:', { input, validated });
   ```

3. **Check Request**

   ```javascript
   console.log("[Debug] Body:', await request.json());
   ```

4. **Check Database**

   ```javascript
   console.log("[Debug] Query result:", result.data);
   ```

5. **Check Response**
   ```javascript
   console.log("[Debug] Response:", { success, data });
   ```

## Common Errors & Fixes

| Error                            | Cause              | Fix                        |
| -------------------------------- | ------------------ | -------------------------- |
| JSON serialization error         | BigInt field       | Use `String(bigInt)`       |
| Cannot read property 'x' of null | Null value         | Use optional chaining `?.` |
| Unexpected token in JSON         | Invalid JSON       | Wrap in try-catch          |
| Unauthorized                     | No/invalid token   | Check auth headers         |
| Forbidden                        | Not a seller       | Add seller check           |
| Not Found                        | Resource missing   | Verify ID exists           |
| Timeout                          | DB connection slow | Check database status      |
| Type error                       | Wrong input type   | Validate type first        |

## File Structure Reference

```
app/
  api/
    order/
      create/        ← Create order (user)
      list/          ← List user's orders
      update-status/ ← Update status (seller)
      seller-orders/ ← List all orders (seller)
    cart/
      get/           ← Get user's cart
      update/        ← Update cart
    product/
      add/           ← Add product (seller)
lib/
  apiUtils.js        ← Validation & responses
  errorHandler.js    ← Error utilities
  authSeller.js      ← Seller auth
  prisma.js          ← Prisma client
config/
  db.js              ← Database connection
```

## Last Minute Checks

Before pushing to production:

- [ ] All 401/403/404 errors properly handled
- [ ] All database operations wrapped
- [ ] All BigInt fields converted to strings
- [ ] All null values handled safely
- [ ] All input validated before use
- [ ] All errors logged with context
- [ ] No sensitive data in error messages
- [ ] Proper HTTP status codes
- [ ] Consistent response format
- [ ] API documentation updated
- [ ] Tested in staging environment
- [ ] Performance acceptable

---

**Use this checklist for every new route!**
