# CommerceAI — Cloud PostgreSQL Setup & Deployment Guide

Panduan lengkap deployment CommerceAI dengan arsitektur:
```
GitHub  ───►  Vercel (Serverless / Production Hosting)
                     │
                     ▼
       Cloud PostgreSQL (Neon / Supabase / Vercel Postgres)
```

---

## 1. Persiapan Database Cloud (Pilih Salah Satu)

Aplikasi CommerceAI sudah dikonfigurasi 100% menggunakan provider `postgresql` di Prisma dan **tidak memerlukan PostgreSQL lokal di komputer Anda**.

### Opsi A: Neon Serverless Postgres (Direkomendasikan)
1. Buka [neon.tech](https://neon.tech) dan buat akun gratis.
2. Buat project baru bernama `commerceai-db` (Pilih region terdekat, misal `ap-southeast-1` Singapore).
3. Salin **Connection String** yang berakhiran `?sslmode=require`:
   ```
   postgresql://[user]:[password]@[endpoint]-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
   ```

### Opsi B: Supabase
1. Buka [supabase.com](https://supabase.com) dan buat project baru.
2. Di menu **Project Settings -> Database -> Connection string**, pilih mode **URI** (atau Transaction Pooler port 6543):
   ```
   postgresql://postgres.[ref]:[password]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?sslmode=require
   ```

### Opsi C: Vercel Postgres
1. Di dashboard Vercel, buka tab **Storage** lalu pilih **Postgres**.
2. Klik **Connect to Project**, Vercel akan otomatis menyuntikkan environment variable `POSTGRES_PRISMA_URL` / `DATABASE_URL`.

---

## 2. Inisialisasi Skema & Migrasi Data dari SQLite

Data SQLite dari tahap pengembangan lokal Anda telah diamankan di `prisma/dev.db` dan snapshot `prisma/sqlite_backup.json`.

Untuk memindahkan data ke database cloud:

### Langkah 2.1: Pasang URL Cloud di `.env`
Buka file `.env` di komputer Anda, lalu perbarui variabel `DATABASE_URL`:
```env
DATABASE_URL="postgresql://[user]:[password]@[host]/[dbname]?sslmode=require"
```

### Langkah 2.2: Buat Tabel di Cloud PostgreSQL
Jalankan perintah ini untuk membuat seluruh tabel dan indeks di PostgreSQL cloud:
```bash
npx prisma db push
```

### Langkah 2.3: Pindahkan Data dari SQLite ke PostgreSQL
Jalankan script migrasi otomatis yang sudah menyertakan verifikasi jumlah record:
```bash
node scripts/migrate_sqlite_to_postgres.mjs
```

Script akan:
1. Membaca data dari `prisma/sqlite_backup.json`.
2. Menyuntikkan data secara bertahap menjaga integritas foreign key:
   - `User`
   - `Product`
   - `ContentProject`
   - `ContentVariation`
   - `ScoutAnalysis`
   - `TestingPlan`
   - `Experiment`
   - `PerformanceMetric`
   - `AiInsight`
   - `Setting`
   - `AiLog`
3. Membandingkan jumlah baris antara SQLite dan PostgreSQL.
4. Menampilkan tabel verifikasi:
   ```
   TABLE / MODEL          | SOURCE (SQLITE)  | TARGET (POSTGRES)  | STATUS
   ---------------------------------------------------------------------------
   products               | 6                | 6                  | [MATCH OK]
   contentProjects        | 6                | 6                  | [MATCH OK]
   experiments            | 3                | 3                  | [MATCH OK]
   performanceMetrics     | 23               | 23                 | [MATCH OK]
   ...
   ```

---

## 3. Konfigurasi Deployment di Vercel

### Langkah 3.1: Hubungkan Repository GitHub
1. Push repository CommerceAI ke GitHub:
   ```bash
   git add .
   git commit -m "feat: prepare for cloud postgresql deployment"
   git push origin main
   ```
2. Di dashboard [vercel.com](https://vercel.com), klik **Add New -> Project** dan pilih repository CommerceAI.

### Langkah 3.2: Masukkan Environment Variables di Vercel
Di bagian **Environment Variables** pada pengaturan proyek Vercel, tambahkan:

| Key | Value Contoh | Deskripsi |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://...@ep-...neon.tech/neondb?sslmode=require` | Connection string PostgreSQL cloud Anda |
| `AI_API_KEY` | *(Opsional)* `sk-proj-...` | Kunci OpenAI jika ingin AI live (kosongkan untuk mock) |
| `METRICOOL_USER_TOKEN` | *(Opsional)* Token Metricool | Token akun TikTok `@onesecond.id3` |
| `NEXT_PUBLIC_APP_NAME` | `CommerceAI` | Nama aplikasi |

### Langkah 3.3: Deploy!
Klik **Deploy**.
Vercel akan menjalankan build Next.js:
- `next build` otomatis menjalankan Prisma Client PostgreSQL.
- Kompilasi 28 route App Router akan selesai tanpa error.
- Aplikasi live dalam hitungan detik.

---

## 4. Keamanan & Sanitasi Arsitektur

- **Zero Localhost Assumption**: Tidak ada referensi database ke `localhost` atau `127.0.0.1`.
- **Zero Windows Path Dependency**: Semua path menggunakan relative import standar ESM/Node.js (`@/...` atau relative path).
- **Zero SQLite Production Lock**: Produksi tidak lagi menyentuh `prisma/dev.db`.
- **Zero Credential Exposure**: Token dan password database tersimpan secara eksklusif di server environment variable Vercel dan `.env`.
