# Database & Schema Migration Guide

## Current Schema Overview

### Data Model

```
User (Clerk)
  ├─ id (string, PK)
  ├─ name
  ├─ email (unique)
  ├─ cartItems (JSON)
  ├─ seller (boolean)
  └─ relationships: products, orders, addresses, reviews

Product
  ├─ id (int, PK, autoincrement)
  ├─ userId (string, FK → User)
  ├─ name
  ├─ description
  ├─ price (float)
  ├─ offerPrice (float)
  ├─ category
  ├─ images (string array)
  ├─ date (BigInt)
  ├─ ratingAverage (float, default 0)
  ├─ ratingCount (int, default 0)
  └─ indexes: userId, id

Order
  ├─ id (int, PK, autoincrement)
  ├─ userId (string, FK → User)
  ├─ addressId (int, FK → Address)
  ├─ amount (float)
  ├─ status (enum: ORDER_PLACED, PROCESSING, etc.)
  ├─ date (BigInt)
  └─ indexes: userId, addressId

OrderItem
  ├─ id (int, PK, autoincrement)
  ├─ orderId (int, FK → Order)
  ├─ productId (int, FK → Product)
  ├─ quantity (int, default 1)
  └─ indexes: orderId, productId

Address
  ├─ id (int, PK, autoincrement)
  ├─ userId (string, FK → User)
  ├─ fullName
  ├─ phoneNumber
  ├─ city
  ├─ state
  ├─ pincode
  ├─ area
  └─ index: userId

Review
  ├─ id (int, PK, autoincrement)
  ├─ productId (int, FK → Product)
  ├─ userId (string, FK → User)
  ├─ userName
  ├─ rating (int)
  ├─ comment
  ├─ verifiedPurchase (boolean, default false)
  ├─ createdAt (DateTime)
  ├─ updatedAt (DateTime)
  └─ indexes: productId, userId

Newsletter
  ├─ id (int, PK, autoincrement)
  ├─ email (string, unique)
  ├─ subscribedAt (DateTime)
  └─ index: email

Promo
  ├─ id (int, PK, autoincrement)
  ├─ code (string, unique)
  ├─ discount (int, percentage)
  ├─ allowedUsers (string array)
  ├─ isActive (boolean, default true)
  ├─ createdAt (DateTime)
  └─ expiresAt (DateTime, nullable)
```

## When to Migrate

### Add a New Field

**Example**: Add tracking number to orders

1. **Update Schema**

   ```prisma
   model Order {
     // ... existing fields
     trackingNumber String? // nullable initially
   }
   ```

2. **Create Migration**

   ```bash
   npx prisma migrate dev --name add_tracking_number
   ```

3. **Update Validation** (if needed)

   ```javascript
   // In lib/apiUtils.js
   export const validateTrackingNumber = (number) => {
     if (!number) return null; // Optional
     if (typeof number !== "string") return false;
     return number.trim();
   };
   ```

4. **Update Routes**

   - If returning this field, add to response
   - If receiving this field, add validation

5. **Test**
   ```bash
   npm run dev
   # Test GET - should include trackingNumber (null initially)
   # Test PUT - should accept trackingNumber
   ```

### Add a New Model

**Example**: Add PaymentMethod model

1. **Update Schema**

   ```prisma
   model PaymentMethod {
     id          Int     @id @default(autoincrement())
     userId      String
     user        User    @relation(fields: [userId], references: [id])
     type        String  // visa, mastercard, etc.
     lastFour    String
     isDefault   Boolean @default(false)
     createdAt   DateTime @default(now())

     @@index([userId])
   }

   model User {
     // ... existing fields
     paymentMethods PaymentMethod[]
   }
   ```

2. **Create Migration**

   ```bash
   npx prisma migrate dev --name add_payment_methods
   ```

3. **Update Routes**

   - Create `/api/payment-method/add`
   - Create `/api/payment-method/list`
   - Create `/api/payment-method/delete`
   - Create `/api/payment-method/set-default`

4. **Create Validation**

   ```javascript
   // lib/apiUtils.js
   export const validatePaymentType = (type) => {
     const valid = ["visa", "mastercard", "amex"];
     return valid.includes(type?.toLowerCase()) ? type.toLowerCase() : false;
   };
   ```

5. **Add Indexes**
   - On userId (for fast lookups)
   - On isDefault (for queries)

### Modify Field Type

**Example**: Change status from string to enum

1. **Plan Migration**

   - Current: `status String @default("pending")`
   - Target: `status OrderStatus @default(PENDING)`

2. **Check Enum Definition**

   ```prisma
   enum OrderStatus {
     PENDING
     PROCESSING
     COMPLETED
     CANCELLED
   }
   ```

3. **Create Data Migration Script**

   ```javascript
   // scripts/migrate-status.js
   const mapping = {
     pending: "PENDING",
     processing: "PROCESSING",
     completed: "COMPLETED",
     cancelled: "CANCELLED",
   };
   ```

4. **Test Locally**
   ```bash
   # Reset database
   npx prisma migrate reset
   # This is DESTRUCTIVE - only in dev!
   ```

### Add Relationship

**Example**: Add tracking to orders

1. **Update Schema**

   ```prisma
   model Tracking {
     id        Int @id @default(autoincrement())
     orderId   Int
     order     Order @relation(fields: [orderId], references: [id])
     status    String
     location  String
     updatedAt DateTime @updatedAt
   }

   model Order {
     // ... existing
     tracking  Tracking[]
   }
   ```

2. **Manage Cascades**

   ```prisma
   order Order @relation(fields: [orderId], references: [id], onDelete: Cascade)
   ```

3. **Update Queries**
   ```javascript
   // Include tracking in order fetches
   const order = await prisma.order.findUnique({
     where: { id: orderId },
     include: {
       address: true,
       items: { include: { product: true } },
       tracking: true, // NEW
     },
   });
   ```

## Migration Safety Checklist

Before Each Migration:

- [ ] Backup production database
- [ ] Test migration in staging environment
- [ ] Write rollback plan
- [ ] Plan deployment window
- [ ] Prepare communication for users
- [ ] Have DBA review changes
- [ ] Create monitoring alerts
- [ ] Prepare rollback script

## Production Migration Steps

### 1. Backup

```bash
# PostgreSQL backup
pg_dump DATABASE_URL > backup.sql
```

### 2. Test in Staging

```bash
# Copy production data to staging
# Apply migration in staging
npx prisma migrate deploy
# Run full test suite
npm test
```

### 3. Deploy Migration

```bash
# In production
npx prisma migrate deploy

# Verify
npx prisma db push --skip-generate
```

### 4. Verify

```bash
# Check data integrity
SELECT COUNT(*) FROM orders;
SELECT COUNT(*) FROM order_items;
```

### 5. Monitor

- Check application logs
- Monitor error rates
- Check query performance
- Verify data consistency

### 6. Rollback Plan

```bash
# If something breaks
npx prisma migrate resolve --rolled-back "migration_name"

# Restore from backup if needed
psql DATABASE_URL < backup.sql
```

## Common Migration Patterns

### Pattern 1: Add Optional Field

```prisma
// Add nullable field
model Order {
  trackingNumber String?
}

// Migration: instant, safe
// No code changes needed
// Can start using immediately
```

### Pattern 2: Add Required Field with Default

```prisma
// Add field with default
model Order {
  status String @default("pending")
}

// Migration: safe with backfill
// Set all existing rows to default
// Can deploy without issues
```

### Pattern 3: Add Required Field (Risky)

```prisma
// Add field with no default
model Order {
  status String // REQUIRED
}

// This requires:
// 1. Migration script to set values
// 2. Application update
// 3. Coordination

// Better approach:
// 1. Add as nullable first
// 2. Backfill data
// 3. Make required in second migration
```

### Pattern 4: Rename Field

```prisma
// Before
model Order {
  orderId Int
}

// After
model Order {
  id Int @id @default(autoincrement())
}

// This requires:
// 1. Database migration (complex)
// 2. Code update everywhere
// 3. Careful coordination

// Better approach: Add new field, deprecate old
```

## Validation for New Fields

### When Adding Field

```javascript
// 1. Add to apiUtils.js
export const validateNewField = (value) => {
  if (!value) return null; // if optional
  if (typeof value !== "string") return false;
  return value.trim();
};

// 2. Update route validation
const newField = validateNewField(request.body.newField);
if (newField === false) {
  return handleError("Invalid field", 400);
}

// 3. Update response
return handleSuccess({
  order: {
    id: order.id,
    newField: order.newField, // Include in response
  },
});
```

## Backwards Compatibility

### Supporting Old API

```javascript
// OLD API: uses "orderId"
// NEW API: uses "id"

// Support both temporarily
const order = {
  id: dbOrder.id,
  orderId: dbOrder.id, // For backwards compatibility
  // ... other fields
};

// Can deprecate after all clients update
```

### Deprecation Timeline

1. **Phase 1**: Support both old and new for 2 weeks
2. **Phase 2**: Log warnings when old is used
3. **Phase 3**: Only support new API

## Performance After Migration

### Check Query Performance

```bash
# Enable query logging
SET log_statement = 'all';

# Run queries
SELECT * FROM orders WHERE userId = 'abc' AND status = 'pending';

# Check execution time
EXPLAIN ANALYZE SELECT ...;
```

### Add Indexes if Needed

```prisma
model Order {
  // ... fields

  @@index([userId, status]) // Composite index
}
```

## Testing Migrations

### Unit Test

```javascript
test("migration preserves data", async () => {
  // Before migration
  const ordersBefore = await prisma.order.count();

  // Run migration
  // After migration
  const ordersAfter = await prisma.order.count();

  expect(ordersAfter).toBe(ordersBefore);
});
```

### Integration Test

```javascript
test("order creation with new field", async () => {
  const order = await prisma.order.create({
    data: {
      userId: "user1",
      amount: 100,
      newField: "value",
      // ... other fields
    },
  });

  expect(order.newField).toBe("value");
});
```

## Troubleshooting

### Migration Fails

```bash
# Check status
npx prisma migrate status

# Resolve any issues
npx prisma migrate resolve --rolled-back "migration_name"

# Or force
npx prisma migrate deploy --skip-generate
```

### Data Loss

```bash
# Restore from backup
psql DATABASE_URL < backup.sql

# Recreate migration
npx prisma migrate dev --name fix_issue
```

### Performance Degradation

```bash
# Analyze queries
EXPLAIN ANALYZE SELECT ...;

# Add missing indexes
ALTER TABLE orders ADD INDEX idx_user_status (userId, status);

# Rebuild statistics
ANALYZE orders;
```

## Checklist for Schema Changes

- [ ] Schema change written and tested locally
- [ ] Migration file created
- [ ] Backwards compatibility ensured
- [ ] Validation added to apiUtils
- [ ] Routes updated if needed
- [ ] Response formats updated
- [ ] Tests written and passing
- [ ] Staging deployment tested
- [ ] Documentation updated
- [ ] Rollback plan created
- [ ] Team notified
- [ ] Production backup taken
- [ ] Monitoring alerts set up
- [ ] Migration deployed
- [ ] Data integrity verified
- [ ] Performance verified
- [ ] Deprecation timeline (if needed)

## Quick Commands

```bash
# Generate Prisma client
npx prisma generate

# Create migration
npx prisma migrate dev --name description

# Deploy migration to production
npx prisma migrate deploy

# Check migration status
npx prisma migrate status

# Reset database (LOCAL ONLY!)
npx prisma migrate reset

# View schema
npx prisma db push --skip-generate

# Format schema
npx prisma format

# Validate schema
npx prisma db validate
```

---

**Follow this guide for safe, coordinated schema changes!**
