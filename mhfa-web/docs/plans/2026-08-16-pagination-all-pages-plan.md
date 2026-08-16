# Implementation Plan: Comprehensive Pagination Across 8 Application Pages

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement robust, responsive, and aesthetically consistent pagination across 8 major data-list pages in the application.

**Design System Alignment:**
- Item limit per page: 10 items.
- Smart page resetting whenever search or filter criteria change.
- Clear status text: `"Menampilkan X - Y dari Z data"`.
- Buttons: "Sebelumnya" (Chevron Left), Page Numbers (Active styling with `bg-primary`), "Berikutnya" (Chevron Right). Disabled states for boundaries.

---

### Affected Pages List:
1. `src/app/admin/users/page.tsx` (Admin User Management)
2. `src/app/admin/invite-codes/page.tsx` (Admin Invite Codes)
3. `src/app/admin/guides/page.tsx` (Admin Intervention Guides)
4. `src/app/admin/contacts/page.tsx` (Admin Professional Contacts)
5. `src/app/admin/questionnaires/page.tsx` (Admin Questionnaires)
6. `src/app/konselor/patients/page.tsx` (Counselor Patient List)
7. `src/app/history/page.tsx` (Konseli Screening History)
8. `src/app/notifications/page.tsx` (User Notifications)

---

### Task 1: Add Pagination to Admin User Management (`/admin/users`)

**Files:**
- Modify: `src/app/admin/users/page.tsx`

- [ ] **Step 1: Add `currentPage` and `ITEMS_PER_PAGE = 10` state to `AdminUsersPage`**
- [ ] **Step 2: Slice `filtered` items based on `currentPage`**
- [ ] **Step 3: Reset `currentPage` to 1 whenever search/role/status filters change**
- [ ] **Step 4: Render pagination control component below the user table**

---

### Task 2: Add Pagination to Admin Invite Codes (`/admin/invite-codes`)

**Files:**
- Modify: `src/app/admin/invite-codes/page.tsx`

- [ ] **Step 1: Add pagination state (`currentPage`, `ITEMS_PER_PAGE = 10`)**
- [ ] **Step 2: Slice filtered invite codes by `currentPage`**
- [ ] **Step 3: Reset page on filter/search change and render pagination bar**

---

### Task 3: Add Pagination to Admin Intervention Guides (`/admin/guides`)

**Files:**
- Modify: `src/app/admin/guides/page.tsx`

- [ ] **Step 1: Add pagination state (`currentPage`, `ITEMS_PER_PAGE = 10`)**
- [ ] **Step 2: Slice filtered guides by `currentPage`**
- [ ] **Step 3: Reset page on search/tag filter change and render pagination bar**

---

### Task 4: Add Pagination to Admin Professional Contacts (`/admin/contacts`)

**Files:**
- Modify: `src/app/admin/contacts/page.tsx`

- [ ] **Step 1: Add pagination state (`currentPage`, `ITEMS_PER_PAGE = 10`)**
- [ ] **Step 2: Slice filtered contacts by `currentPage`**
- [ ] **Step 3: Reset page on search/type filter change and render pagination bar**

---

### Task 5: Add Pagination to Admin Questionnaires (`/admin/questionnaires`)

**Files:**
- Modify: `src/app/admin/questionnaires/page.tsx`

- [ ] **Step 1: Add pagination state (`currentPage`, `ITEMS_PER_PAGE = 10`)**
- [ ] **Step 2: Slice questionnaires list by `currentPage`**
- [ ] **Step 3: Render pagination bar if items exist**

---

### Task 6: Add Pagination to Counselor Patient List (`/konselor/patients`)

**Files:**
- Modify: `src/app/konselor/patients/page.tsx`

- [ ] **Step 1: Add pagination state (`currentPage`, `ITEMS_PER_PAGE = 10`)**
- [ ] **Step 2: Slice filtered patient list by `currentPage`**
- [ ] **Step 3: Reset page on search/risk filter change and render pagination bar**

---

### Task 7: Add Pagination to Konseli Screening History (`/history`)

**Files:**
- Modify: `src/app/history/page.tsx`

- [ ] **Step 1: Add pagination state (`currentPage`, `ITEMS_PER_PAGE = 10`)**
- [ ] **Step 2: Slice screening history list by `currentPage`**
- [ ] **Step 3: Render pagination bar below history list**

---

### Task 8: Add Pagination to User Notifications (`/notifications`)

**Files:**
- Modify: `src/app/notifications/page.tsx`

- [ ] **Step 1: Add pagination state (`currentPage`, `ITEMS_PER_PAGE = 10`)**
- [ ] **Step 2: Slice filtered notifications by `currentPage`**
- [ ] **Step 3: Reset page on tab filter change and render pagination bar**

---

### Task 9: Build & End-to-End Verification

- [ ] **Step 1: Run `npm run build` to verify no compilation errors**
- [ ] **Step 2: Commit all changes**
