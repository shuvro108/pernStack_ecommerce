# Development Best Practices Guide

## Quick Reference for Developers

### When Writing API Routes

#### 1. Import Required Utilities

```javascript
import {
  handleError,
  handleSuccess,
  validateUserId,
  validateNumericId,
  safeDbOperation,
  validatePrismaClient,
} from "@/lib/apiUtils";
```

#### 2. Validate Authentication

```javascript
// Get user ID
const { userId } = getAuth(request);

// Validate it
if (!validateUserId(userId)) {
  return handleError("Authentication required", 401);
}
```

#### 3. Validate Authorization (for Seller Routes)

```javascript
const isSeller = await authSeller(userId);
if (!isSeller) {
  return handleError("Seller access required", 403);
}
```

#### 4. Parse Request Body Safely

```javascript
let requestBody;
try {
  requestBody = await request.json();
} catch {
  return handleError("Invalid request body - JSON parse failed", 400);
}
```

#### 5. Validate Input Data

```javascript
const id = validateNumericId(request.body.id);
if (id === false) {
  return handleError("Invalid ID format", 400);
}
```

#### 6. Connect to Database

```javascript
try {
  await connectDB();
} catch (dbErr) {
  return handleError("Database connection failed", 503, dbErr);
}
```

#### 7. Use Safe Database Operations

```javascript
const result = await safeDbOperation(
  () => prisma.model.findUnique({ where: { id } }),
  "Fetch user"
);

if (!result.success) {
  return handleError("Failed to fetch user", 500);
}

const user = result.data;
```

#### 8. Handle Null Values

```javascript
// ✅ Good
const name = user?.name || "Unknown";
const price = Number(product?.price) || 0;
const items = Array.isArray(product?.images) ? product?.images : [];

// ❌ Avoid
const name = user.name;
const price = product.price;
```

#### 9. Sanitize BigInt Fields

```javascript
const order = {
  id: Number(dbOrder.id),
  date: String(dbOrder.date), // CRITICAL: Convert BigInt to string
  amount: Number(dbOrder.amount),
};
```

#### 10. Return Consistent Response

```javascript
// Success
return handleSuccess({
  message: "Operation completed",
  data: result,
  count: items.length,
});

// Error
return handleError("Operation failed", 500, error);
```

### Error Handling Pattern

#### Wrong (Old Way)

```javascript
try {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return NextResponse.json({ success: true, user });
} catch (error) {
  return NextResponse.json(
    { success: false, message: error.message },
    { status: 500 }
  );
}
```

#### Right (New Way)

```javascript
try {
  if (!validateUserId(userId)) {
    return handleError("Authentication required", 401);
  }

  const result = await safeDbOperation(
    () => prisma.user.findUnique({ where: { id: userId } }),
    "Fetch user"
  );

  if (!result.success) {
    return handleError("User not found", 404);
  }

  return handleSuccess({
    user: result.data,
  });
} catch (error) {
  console.error("[Route] Unexpected error:", error);
  return handleError("Internal server error", 500, error);
}
```

### Validation Pattern

#### For Numeric IDs

```javascript
const productId = validateNumericId(request.body.productId);
if (productId === false) {
  return handleError("Invalid product ID", 400);
}
// productId is now guaranteed to be a positive integer
```

#### For Quantities

```javascript
const quantity = validateQuantity(request.body.quantity);
if (quantity === false) {
  return handleError("Quantity must be between 1 and 10000", 400);
}
```

#### For Order Items

```javascript
const items = validateOrderItems(request.body.items);
if (items === false) {
  return handleError("Invalid order items", 400);
}
// items is now validated array with safe values
```

#### For Order Status

```javascript
const status = validateOrderStatus(request.body.status);
if (!status) {
  return handleError(
    "Invalid status. Valid options: Order Placed, Processing, etc.",
    400
  );
}
```

### Security Patterns

#### Authentication

```javascript
const { userId } = getAuth(request);
if (!validateUserId(userId)) {
  return handleError("Unauthorized", 401); // 401 = not authenticated
}
```

#### Authorization

```javascript
const isSeller = await authSeller(userId);
if (!isSeller) {
  return handleError("Forbidden", 403); // 403 = authenticated but not authorized
}
```

#### User Ownership Verification

```javascript
const address = await prisma.address.findFirst({
  where: { id: addressId, userId }, // Verify user owns the address
});
if (!address) {
  return handleError("Address not found", 404);
}
```

### Common Mistakes to Avoid

#### ❌ Don't: Access properties without null checking

```javascript
const name = user.name; // CRASH if user is null
```

#### ✅ Do: Use optional chaining

```javascript
const name = user?.name || "Unknown"; // Safe
```

#### ❌ Don't: Use JSON responses directly

```javascript
return NextResponse.json({ message: "Error", error });
```

#### ✅ Do: Use handleError function

```javascript
return handleError("Error message", 500, error);
```

#### ❌ Don't: Skip input validation

```javascript
const id = Number(request.body.id); // Might be NaN
```

#### ✅ Do: Validate properly

```javascript
const id = validateNumericId(request.body.id);
if (id === false) {
  return handleError("Invalid ID", 400);
}
```

#### ❌ Don't: Return BigInt directly

```javascript
return NextResponse.json({ date: BigInt(timestamp) }); // JSON.stringify fails
```

#### ✅ Do: Convert to string

```javascript
return NextResponse.json({ date: String(BigInt(timestamp)) }); // Safe
```

#### ❌ Don't: Expose error details to client

```javascript
return handleError(error.stack, 500); // Exposes sensitive info
```

#### ✅ Do: Generic message with logging

```javascript
console.error("[Route] Error:', error);
return handleError("Operation failed", 500);
```

### HTTP Status Code Guide

| Code | Meaning                          | Example                    |
| ---- | -------------------------------- | -------------------------- |
| 200  | OK - Success                     | GET request succeeded      |
| 201  | Created - New resource           | POST created new order     |
| 202  | Accepted - Async                 | Task queued for processing |
| 400  | Bad Request - Invalid input      | Missing required field     |
| 401  | Unauthorized - Not logged in     | No auth token              |
| 403  | Forbidden - Not allowed          | Not a seller               |
| 404  | Not Found - Resource missing     | Order doesn't exist        |
| 500  | Server Error - Unexpected        | Database connection failed |
| 503  | Service Unavailable - Temp issue | Database down              |

### Testing Your Route

#### Test Cases to Cover

1. **Happy Path**: Normal successful operation
2. **Missing Auth**: No authentication token
3. **Invalid Auth**: Wrong token
4. **Invalid Input**: Wrong data type
5. **Out of Range**: Value too large/small
6. **Not Found**: Resource doesn't exist
7. **Database Down**: Connection fails
8. **Unauthorized**: Valid auth, but not allowed
9. **Concurrent Access**: Multiple requests at once
10. **Edge Cases**: Empty arrays, null values

#### Quick Test Example

```bash
# Test successful operation
curl -X GET http://localhost:3000/api/order/list \
  -H "Authorization: Bearer TOKEN"

# Test missing auth
curl -X GET http://localhost:3000/api/order/list

# Test invalid input
curl -X POST http://localhost:3000/api/order/create \
  -H "Content-Type: application/json" \
  -d '{"items": "invalid"}'

# Test with valid data
curl -X POST http://localhost:3000/api/order/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "items": [{"product": 1, "quantity": 2}],
    "address": 1
  }'
```

### Code Review Checklist

Before submitting a pull request, verify:

- [ ] All endpoints have authentication validation
- [ ] Admin endpoints have seller authorization
- [ ] All inputs are validated
- [ ] All database operations use `safeDbOperation()`
- [ ] All error responses use `handleError()`
- [ ] All success responses use `handleSuccess()`
- [ ] BigInt fields are converted to strings
- [ ] Null values are handled safely
- [ ] Proper HTTP status codes are used
- [ ] Error logging includes context
- [ ] No sensitive data in error messages
- [ ] No console.log statements left
- [ ] Array methods have null checks
- [ ] Database queries include needed fields only
- [ ] Indexes are used for common queries
- [ ] Transaction handling where needed
- [ ] Performance considered for batch operations
- [ ] Tests cover error cases

### Debugging Tips

#### 1. Check Request Body

```javascript
console.log("[Route] Request body:', {
  received: requestBody,
  keys: Object.keys(requestBody),
});
```

#### 2. Check Validation

```javascript
const id = validateNumericId(input);
console.log("[Validation]", {
  input,
  validated: id,
  isValid: id !== false,
});
```

#### 3. Check Database Results

```javascript
const result = await safeDbOperation(...);
console.log('[Database]', {
  success: result.success,
  dataCount: result.data?.length,
  firstItem: result.data?.[0],
});
```

#### 4. Check Null Values

```javascript
console.log("[Data]", {
  value: data?.field,
  exists: data?.field != null,
  type: typeof data?.field,
});
```

### Performance Best Practices

1. **Select Only Needed Fields**

```javascript
// Good: Only fetch what you need
prisma.product.findMany({
  select: { id: true, name: true, price: true },
});

// Avoid: Fetch entire object
prisma.product.findMany();
```

2. **Use Indexes**

```javascript
// Schema already has indexes on:
// - User: id
// - Product: id, userId
// - Order: id, userId, addressId
// - OrderItem: orderId, productId
```

3. **Batch Operations**

```javascript
// Good: Single query
const products = await prisma.product.findMany({
  where: { id: { in: productIds } },
});

// Avoid: Loop with individual queries
for (const id of productIds) {
  const product = await prisma.product.findUnique({ where: { id } });
}
```

4. **Early Returns**

```javascript
// Return early when no data
if (productIds.length === 0) {
  return handleSuccess({ items: [] });
}

// Continue with larger operations
```

### Documentation Standards

Every route should have comments like:

```javascript
/**
 * @route GET /api/order/list
 * @auth Required (User ID from Clerk)
 * @param None
 * @returns Array of orders for the authenticated user
 * @errors
 *   - 401: Unauthorized (no auth token)
 *   - 404: User not found
 *   - 500: Database error
 */
export async function GET(request) {
  // Implementation
}
```

### Common Gotchas

1. **BigInt Serialization**

   - Always convert to string before JSON.stringify
   - Test with actual data that has BigInt fields

2. **Null Reference Errors**

   - Use optional chaining (?.)
   - Use nullish coalescing (??)
   - Filter arrays before returning

3. **Type Coercion**

   - Always validate types explicitly
   - Don't rely on JavaScript's type coercion

4. **Error Messages**

   - Never expose stack traces to clients
   - Always log full errors on server
   - Give helpful messages to users

5. **Authentication**
   - Always validate userId from getAuth()
   - Don't trust client data
   - Verify seller role for admin operations

---

**Follow these patterns and your code will be production-ready and maintainable!**
