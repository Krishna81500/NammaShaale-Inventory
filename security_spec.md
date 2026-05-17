# Security Specification: Namma-Shaale Inventory

## Data Invariants
1. An asset must have a name, category, and initial condition.
2. Health checks must reference an existing assetId.
3. Issue logs must reference an existing assetId.
4. Timestamps (`addedAt`, `lastCheckedAt`, `timestamp`, `date`) must be server-validated where applicable.

## The Dirty Dozen Payloads (Rejection Tests)
1. **Identity Spoofing**: Attempt to create an asset with someone else's `ownerId` (if implemented).
2. **Ghost Fields**: Attempt to add `isPremium: true` to an asset document.
3. **Type Poisoning**: Sending `condition: 123` (number) instead of a string enum.
4. **Size Attack**: Sending a 1MB string for the `name` field.
5. **ID Injection**: Using `../../system` as a document ID.
6. **Relational Break**: Creating a health check for a non-existent asset ID.
7. **Timestamp Fraud**: Sending a future date as `addedAt` from the client.
8. **Enum Violation**: Setting condition to `Destroyed` (not in enum).
9. **Update Gap**: Updating `serialNumber` on an asset after it's been created (if marked immutable).
10. **Unauthenticated Read**: Attempting to read any asset without being signed in.
11. **Malicious Query**: Listing all assets without any filters across all schools (if multitenant).
12. **PII Leak**: Accessing user private info (if implemented).

## Tests
I will implement validation helpers for each entity.
