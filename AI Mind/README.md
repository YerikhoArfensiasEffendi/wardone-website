# 🧠 AI Mind — Internal Architecture & Engineering Workspace

Direktori ini didedikasikan secara khusus untuk menampung seluruh skrip pembantu (*helper tools*), catatan arsitektur, dokumentasi teknis, dan artefak kecerdasan buatan (AI) agar **100% terisolasi** dari kode sumber produksi website WARDONE.

---

## 📂 Struktur Direktori AI Mind

```
AI Mind/
├── README.md                  # Panduan & indeks AI Mind
└── architecture_spec.md       # Spesifikasi arsitektur 3D & komponen Svelte
```

---

## 🛡️ Standar Pemisahan Kode

1. **Pure Production Code**: Folder `src/` dan `public/` hanya berisi kode bersih yang siap dirilis ke user.
2. **Zero Contamination**: Tidak ada file dump, skrip crawler, atau eksperimen acak yang dibiarkan tercecer di root proyek.
