# Firestore Security Specifications & TDD Plan

This specification outlines the data invariants, threat model, "Dirty Dozen" malicious payloads, and rules compliance check for the FirstStep app.

## 1. Data Invariants

1. **User Profiles (`/users/{userId}`)**
   - A user profile can only be created by the authenticated owner (`request.auth.uid == userId`).
   - The document key `userId` must match the owner's Firebase Authentication UID.
   - Profile information (`email`, `fullName`) is private and can only be read by the owner.
   - `createdAt` is immutable and must equal `request.time`.

2. **Polished CVs (`/users/{userId}/cvs/{cvId}`)**
   - A CV always belongs to a single user, nested under `/users/{userId}/cvs/{cvId}`.
   - It can only be created, read, updated, or deleted by that specific authenticated user.
   - `id` and `userId` must be immutable.
   - Fields such as `title`, `template`, `summary`, `name`, `email`, and `phone` must be restricted string types of valid sizes.

3. **Job Applications (`/users/{userId}/applications/{applicationId}`)**
   - An application can only be created by the authenticated student under their own path.
   - `jobId`, `cvId`, and `appliedAt` must be present and immutable.
   - `status` must be a valid enum string: `submitted`, `processing`, or `under_review`.
   - Access to applications is restricted to the specific authenticated user.

---

## 2. The "Dirty Dozen" Malicious Payloads

The ruleset must explicitly block the following twelve malicious actions:

### Type 1: Identity Spoofing & Profiling
1. **User Spoofing (Create path mismatch)**: Creating `/users/attacker_uid` as `victim_uid`.
2. **PII Data Leak (Unauthorized read)**: Authenticated user `attacker_uid` trying to read `/users/victim_uid`.
3. **Immutability Breach (Tamper profile timestamp)**: Modifying `/users/victim_uid` to change `createdAt` post-creation.

### Type 2: CV Tampering & Resource Poisoning
4. **CV Theft (Encroach nested path)**: Authenticated user `attacker_uid` trying to view CV under `/users/victim_uid/cvs/cv_123`.
5. **Junk Injection (ID Poisoning of cvId)**: Injecting a 2MB long junk string as a `cvId` document key.
6. **Self-Attributed Ownership**: Creating a CV under `/users/victim_uid/cvs/cv_123` with `userId` set to `attacker_uid`.
7. **Size Overrun**: Submitting a CV `title` that is 50,000 characters long, threatening to blow storage limits.

### Type 3: Application Integrity & State Shortcutting
8. **Application Spoofing**: Authenticated user `attacker_uid` writing an application record under `/users/victim_uid/applications/app_123`.
9. **State Elevator**: Enforcing or modifying the application `status` directly to `under_review` by the student during submission.
10. **Orphaned Application (Invalid Relation)**: Creating a `JobApplication` with invalid/empty `jobId` or `cvId`.
11. **Client-Side Query Scraping**: Attempting a collection group query on all user applications without identifying owner.
12. **Double Apply State Loop**: Modifying application status from `submitted` to an arbitrary string like `approved_with_bonus` that bypasses checks.

---

## 3. Test Runner Design

We will write and enforce tests verifying that all Dirty Dozen payloads return `PERMISSION_DENIED` under our rigorous `isValid[Entity]` security helpers.
