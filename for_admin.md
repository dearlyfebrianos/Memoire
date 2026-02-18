# ✦ Panduan Administrator Memoire

Selamat datang di panel kendali **Memoire**. Dokumen ini akan memandu Anda melalui langkah-langkah setup, pengelolaan konten, hingga proses publikasi kenangan ke situs utama.

---

## 🔐 1. Cara Mengakses Admin Panel

Untuk masuk ke dashboard, navigasikan browser Anda ke:

> **`memoire.vercel.app/admin`** atau **`localhost:5173/admin`** (jika lokal)

### Kredensial Akses

Gunakan akun yang telah terdaftar di sistem:

- **Username**: `admin`
- **Password**: `adminmemo2026`

---

## ⚙️ 2. Setup Awal (Wajib)

Agar fitur "Upload" dan "Publish" berfungsi, Anda perlu melakukan konfigurasi sekali saja di perangkat/browser Anda.

### B. Konfigurasi Vercel (PENTING)

Agar fitur sync berjalan di server Vercel, Anda harus mendaftarkan GitHub Token di dashboard Vercel:

1.  Buka **Vercel Dashboard** → Pilih proyek **Memoire**.
2.  Pergi ke tab **Settings** → **Environment Variables**.
3.  Tambahkan variable berikut:
    - `VITE_GITHUB_TOKEN`: Isi dengan Personal Access Token GitHub Anda.
    - `VITE_GITHUB_OWNER`: Username GitHub Anda (contoh: `dearlyfebrianos`).
    - `VITE_GITHUB_REPO`: Nama repository (contoh: `memoire`).
    - `VITE_GITHUB_BRANCH`: Branch utama (contoh: `master` atau `main`).
4.  Klik **Save** dan lakukan **Redeploy** agar perubahan terbaca oleh sistem.

> **💡 Keamanan:** Sistem akan otomatis menghapus semua token yang tersimpan di browser (localStorage) demi alasan keamanan. Token kini hanya aman tersimpan di server.

## 📸 3. Cara Menambah Kenangan (Upload)

Proses penambahan foto/video dilakukan dalam 3 langkah mudah:

### Langkah 1: Host Media (Dapatkan Link)

1.  Buka menu **Generator** (Link Hub).
2.  Tarik (_drag & drop_) atau pilih foto/video dari Perangkat Anda.
3.  Tunggu proses upload selesai, lalu klik **Salin** pada link yang dihasilkan.

### Langkah 2: Input Data

1.  Kembali ke Dashboard utama.
2.  Klik **+ New Chapter** (jika ingin membuat kategori baru) atau klik ikon **+** pada Chapter yang sudah ada.
3.  Isi detail kenangan:
    - **Judul**: Nama kenangan (misal: "Liburan di Bali").
    - **Link Foto/Video**: Tempel (_paste_) link yang Anda salin dari Langkah 1.
    - **Caption/Tanggal/Tags**: Lengkapi sesuai keinginan.
4.  Klik **Simpan Kenangan**.

---

## 🚀 4. Publikasi & Sinkronisasi

1.  **Otomatis**: Setiap kali Anda mengklik tombol "Simpan" di modal (tambah/edit), sistem akan otomatis melakukan sinkronisasi ke GitHub.
2.  **Status**: Periksa notifikasi di pojok kanan bawah ("Live on GitHub") untuk memastikan data sudah terkirim.
3.  **Manual (Force Sync)**: Jika karena alasan tertentu data belum terupdate, Anda bisa menekan tombol **Publish** di pojok kanan atas untuk memaksa sinkronisasi ulang seluruh data.
4.  **Waktu Rebuild**: Setelah notifikasi muncul, tunggu sekitar **30-60 detik** agar server (Vercel) selesai membangun ulang website sebelum perubahan terlihat oleh pengunjung umum.

---

_Dibuat dengan ❤️ untuk pengelolaan kenangan yang lebih indah._
