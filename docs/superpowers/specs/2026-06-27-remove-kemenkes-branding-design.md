# Spec: Remove Kemenkes Branding and Replace with MHFA

## Goal
Remove all user-facing and code references to "Kemenkes", "Kementerian Kesehatan RI", and related Ministry of Health branding elements across the `mhfa-web` application, replacing them with "MHFA" or generic equivalents.

## Proposed Changes

### 1. `mhfa-web/src/app/register/page.tsx`
- Replace "Layanan Kesehatan Jiwa Kemenkes RI" with "Layanan Kesehatan Jiwa MHFA"

### 2. `mhfa-web/src/app/login/page.tsx`
- Replace "Layanan Kesehatan Jiwa Kemenkes RI" with "Layanan Kesehatan Jiwa MHFA"

### 3. `mhfa-web/src/app/layout.tsx`
- Replace description: "Sistem Skrining & Intervensi Kesehatan Mental — Kementerian Kesehatan Republik Indonesia" with "Sistem Skrining & Intervensi Kesehatan Mental — MHFA"

### 4. `mhfa-web/src/app/admin/layout.tsx`
- Replace `userEmail="admin@kemenkes.go.id"` with `userEmail="admin@mhfa.go.id"`

### 5. `mhfa-web/src/app/profile/page.tsx`
- Replace "sesuai standar Kementerian Kesehatan Republik Indonesia." with "sesuai standar keamanan data MHFA."

### 6. `mhfa-web/src/app/screening/start/page.tsx`
- Replace "Sistem ini diselenggarakan secara resmi oleh Kementerian Kesehatan Republik Indonesia. Semua data dijaga kerahasiaannya sesuai regulasi privasi data." with "Sistem ini diselenggarakan secara resmi oleh MHFA. Semua data dijaga kerahasiaannya sesuai regulasi privasi data."

### 7. `mhfa-web/src/app/notifications/page.tsx`
- Replace sender: "Kementerian Kesehatan RI" with "Tim MHFA"
- Replace content: "...sesuai dengan regulasi Kemenkes terbaru." with "...sesuai dengan regulasi MHFA terbaru."

### 8. `mhfa-web/src/app/first-aid/[screeningId]/page.tsx`
- Replace comment `{/* Kemenkes */}` with `{/* Hotline MHFA */}`
- Replace "Layanan SEJIWA (Kemenkes)" with "Layanan SEJIWA (MHFA)"

### 9. `mhfa-web/src/app/intervention/[screeningId]/contact/page.tsx`
- Replace description: "Layanan darurat bebas pulsa Kementerian Kesehatan RI." with "Layanan darurat bebas pulsa MHFA."

### 10. `mhfa-web/src/app/globals.css`
- Replace `--color-kemenkes-blue: #00A9E0;` with `--color-mhfa-blue: #00A9E0;`
