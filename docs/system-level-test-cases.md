# Requirements-based System Level Test Cases

These requirements-based system test cases target the TerraCotta eCommerce (Next.js + Tailwind) experience across shopper, seller, and admin flows. They validate that critical journeys behave per specification, surface meaningful errors, and protect data integrity and security.

## Requirements Specification

| Requirement ID  | Requirement Statement                                                                                                                 | Must / Want | Comment                                                 |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------- |
| R-Auth-01       | Student/visitor login form shows student ID/email and password fields; displays specific error messages for missing or invalid input. | Must        | Covers client-side and server responses.                |
| R-Auth-02       | Successful login navigates to the home/dashboard view and stores session securely.                                                    | Must        | Validate cookie/session behavior.                       |
| R-Prod-01       | Product catalog lists items by category with accurate name, price, image, and availability.                                           | Must        | Includes landing, category, and all-products views.     |
| R-Prod-02       | Product detail page renders full item data (images, description, price, stock) and loads related reviews.                             | Must        | Validate dynamic route `product/[id]`.                  |
| R-Search-01     | Search/filter surfaces matching products and updates results list without broken links.                                               | Want        | If search is temporarily disabled, mark as blocked.     |
| R-Cart-01       | Users can add products to cart from listing and detail pages; cart persists within the session.                                       | Must        | Includes mini-cart summary.                             |
| R-Cart-02       | Users can update quantities or remove items; totals recalc immediately and correctly.                                                 | Must        | Validate price, tax/fees if applicable.                 |
| R-Checkout-01   | Checkout collects shipping address, validates required fields, and submits an order successfully.                                     | Must        | Blocks submission on invalid address.                   |
| R-Order-01      | My Orders page shows placed orders with status, items, totals, and created date; supports pagination where applicable.                | Must        | Ensure privacy (only requester’s orders).               |
| R-Profile-01    | Profile/Address pages display current user data and allow address updates with validation.                                            | Must        | Reject invalid or incomplete address input.             |
| R-Newsletter-01 | Newsletter subscription accepts valid emails, rejects invalid ones, and shows confirmation/error states.                              | Want        | Covers `/api/newsletter/subscribe` flow.                |
| R-Seller-01     | Seller dashboard lists seller products and allows create/update/delete product entries with accurate data persistence.                | Must        | Validate upload/field validation.                       |
| R-Seller-02     | Seller orders view displays incoming orders and allows status updates with auditability.                                              | Must        | Confirm order status change is reflected in buyer view. |
| R-Admin-01      | Admin promo management allows creating and updating promo codes; enforces unique codes and proper value ranges.                       | Want        | Covers `/admin/promo` UI + API.                         |

## Requirements-based System Level Test Cases

| Test Case ID                       | Scenario                                  | Steps                                                                                                    | Expected Result                                                                                                      |
| ---------------------------------- | ----------------------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| TC-Auth-01 (R-Auth-01)             | Validate login error messages             | 1. Navigate to login. 2. Leave required fields empty or enter invalid formats. 3. Submit.                | Field-level errors display; form blocks submission; no session created.                                              |
| TC-Auth-02 (R-Auth-02)             | Test login success and failure            | 1. Enter valid credentials and submit. 2. Reattempt with invalid credentials.                            | Valid creds redirect to home/dashboard and set session. Invalid creds show specific error without redirect.          |
| TC-Prod-01 (R-Prod-01)             | Verify catalog rendering by category      | 1. Open All Products and a category page. 2. Scroll/paginate.                                            | Products render with correct name, price, image, availability; no broken images/links; pagination works.             |
| TC-Prod-02 (R-Prod-02)             | Verify product detail                     | 1. Open product detail from catalog. 2. Inspect images, description, price, stock, reviews.              | All product fields render correctly; add-to-cart enabled when in stock; related reviews load or show empty state.    |
| TC-Search-01 (R-Search-01)         | Verify search/filter                      | 1. Use search bar or filters. 2. Clear filters.                                                          | Results update to matching items; counts and links correct; clearing restores full list.                             |
| TC-Cart-01 (R-Cart-01)             | Add to cart from list and detail          | 1. Add product from catalog. 2. Add another from detail page. 3. Reopen cart.                            | Items appear with correct qty/price; cart persists during session refresh.                                           |
| TC-Cart-02 (R-Cart-02)             | Update cart quantities                    | 1. Increase/decrease qty. 2. Remove an item.                                                             | Totals recalc instantly; zero qty removes item; no negative or fractional qty accepted.                              |
| TC-Checkout-01 (R-Checkout-01)     | Place order with address validation       | 1. Proceed to checkout. 2. Submit with missing address fields. 3. Submit with valid address.             | Missing fields show inline errors; valid submission creates order and shows confirmation.                            |
| TC-Order-01 (R-Order-01)           | Verify My Orders listing                  | 1. Open My Orders. 2. Inspect latest order details/status.                                               | Orders list shows only current user’s orders with accurate status, totals, items, and timestamps.                    |
| TC-Profile-01 (R-Profile-01)       | Verify profile/address display and update | 1. Open Profile/Address. 2. Edit address with invalid data. 3. Save valid address.                       | Invalid input blocked with messages; valid save persists and shows updated address on reload.                        |
| TC-Newsletter-01 (R-Newsletter-01) | Verify newsletter subscription            | 1. Submit invalid email. 2. Submit valid email.                                                          | Invalid email rejected with error; valid email accepted with success confirmation; no duplicate subscription errors. |
| TC-Seller-01 (R-Seller-01)         | Seller product CRUD                       | 1. Login as seller. 2. Create product with required fields. 3. Edit and delete it.                       | Product appears in seller list and public catalog; edits persist; deletion removes from catalog.                     |
| TC-Seller-02 (R-Seller-02)         | Seller order status update                | 1. Login as seller. 2. Open seller orders. 3. Change an order status.                                    | Status change saves and shows updated state for seller and buyer views.                                              |
| TC-Admin-01 (R-Admin-01)           | Admin promo management                    | 1. Login as admin. 2. Create promo with invalid value/duplicate code. 3. Create valid promo and edit it. | Invalid inputs blocked; valid promo saved and visible in promo list; edited values persist.                          |

## Notes

- Run across primary browsers (Chrome/Firefox) and responsive breakpoints (mobile/desktop).
- Data setup: ensure seed data for products, seller account, admin account, and at least one buyer account.
- Security: confirm unauthorized users cannot access seller/admin routes or other users’ data.
- Performance spot-check: core pages (home, product detail, cart) should load within acceptable times under concurrent requests.
