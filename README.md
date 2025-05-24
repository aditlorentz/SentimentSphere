# NLP AI Sentiment Analysis Dashboard

Sebuah platform analisis sentimen berbasis AI yang mengubah data teks kompleks menjadi insights visual yang intuitif dan mudah dipahami untuk feedback organisasi dan analisis.

![NLP AI Dashboard](./generated-icon.png)

## 🚀 Fitur Utama

### 📊 Dashboard Komprehensif
- **Survey Dashboard**: Analisis sentimen real-time dengan filtering multi-kriteria
- **My Insights**: Manajemen insights personal dengan kategorisasi otomatis
- **Top Insights**: Visualisasi insights terpopuler dengan word cloud dan peta regional
- **Smart Analytics**: Analytics mendalam dengan tren dan pola data
- **Action Page**: Rekomendasi actionable berdasarkan analisis AI

### 🤖 AI-Powered Features
- **AI Instant Conclusion**: Kesimpulan otomatis menggunakan OpenRouter AI dengan model Google Gemini 2.0 Flash
- **Dynamic Content**: Variasi konten yang berbeda setiap refresh
- **Filter-Responsive**: AI conclusion yang menyesuaikan dengan filter yang dipilih
- **Multi-Language Support**: Analisis sentimen dalam Bahasa Indonesia

### 🎨 User Experience
- **Modern UI/UX**: Design neumorphic dengan Inter/SF Pro Display fonts
- **Responsive Design**: Optimal di desktop, tablet, dan mobile
- **Real-time Updates**: Data yang selalu ter-update
- **Interactive Filtering**: Multi-select filtering dengan date range
- **Skeleton Loading**: Loading states yang smooth dan intuitif

## 🛠️ Tech Stack

### Frontend
- **React 18** dengan TypeScript
- **Vite** untuk build tool dan development server
- **TailwindCSS** untuk styling
- **Shadcn/UI** untuk komponen UI
- **TanStack Query** untuk data fetching
- **Wouter** untuk routing
- **AmCharts 5** untuk visualisasi data

### Backend
- **Node.js** dengan Express
- **TypeScript** untuk type safety
- **Drizzle ORM** untuk database operations
- **PostgreSQL** sebagai database utama
- **OpenRouter AI** dengan model Google Gemini 2.0 Flash

### Database
- **Neon Database** (PostgreSQL)
- **Drizzle Kit** untuk migrations
- **Zod** untuk validation

## 📁 Struktur Project

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   │   ├── auth/       # Authentication components
│   │   │   ├── cards/      # Card components
│   │   │   ├── dashboard/  # Dashboard specific components
│   │   │   ├── layout/     # Layout components (Header, Sidebar)
│   │   │   └── ui/         # Base UI components (Shadcn)
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility libraries
│   │   └── assets/         # Static assets
├── server/                 # Backend Express application
│   ├── routes.ts           # API routes definition
│   ├── storage.ts          # Database operations
│   ├── openrouter-api.ts   # AI integration
│   ├── db.ts               # Database configuration
│   └── index.ts            # Server entry point
├── shared/                 # Shared types and schemas
│   └── schema.ts           # Database schemas and types
└── database files          # SQL scripts and data
```

## 🚀 Instalasi dan Setup

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- OpenRouter API key

### 1. Clone Repository
```bash
git clone <repository-url>
cd nlp-ai-dashboard
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Buat file `.env` dengan konfigurasi berikut:
```env
DATABASE_URL=your_postgresql_database_url
OPENROUTER_API_KEY=your_openrouter_api_key
```

### 4. Database Setup
```bash
# Push database schema
npm run db:push

# Optional: Seed database with sample data
npm run db:seed
```

### 5. Run Development Server
```bash
npm run dev
```

Server akan berjalan di `http://localhost:5000`

## 🔑 Login Credentials

Default login untuk testing:
- **Username**: `admin@nlp`
- **Password**: `12345`

## 📊 Data Overview

Project ini menganalisis **633 insights karyawan** dengan distribusi:
- **310 sentimen positif** (49.0%)
- **293 sentimen negatif** (46.3%)
- **30 sentimen netral** (4.7%)

### Top Insights Categories:
1. Program Wellness (43)
2. Fasilitas Kerja (41)
3. Employee Recognition (40)
4. Pelatihan Digital (39)
5. Program Mentoring (39)
6. Flexible Working (37)
7. Penilaian Kinerja (35)
8. Ruang Kerja (33)
9. Kesehatan Mental (32)
10. Program Pensiun (30)

### Data Sources:
- Bot HC (129)
- Instagram HC (127)
- Diarium (96)
- Komplain Helpdesk HC (93)
- Berita HC (92)

## 🎯 Key Features Detail

### AI Instant Conclusion
- Menggunakan **Google Gemini 2.0 Flash** melalui OpenRouter
- Menghasilkan insight yang berbeda setiap refresh
- Menyesuaikan analisis berdasarkan filter yang dipilih
- Fallback messages untuk reliability

### Multi-Filter System
- **Word Insights**: Multi-select dengan checkbox
- **Source Data**: Filter berdasarkan sumber data
- **Location**: Filter berdasarkan lokasi/witel
- **Date Range**: Filter berdasarkan rentang tanggal
- **Sentiment**: Filter berdasarkan sentimen

### Visualisasi Data
- **Word Cloud**: Visualisasi kata-kata yang sering muncul
- **Indonesia Map**: Distribusi regional sentimen
- **Charts**: Bar charts, pie charts, dan line charts
- **Progress Bars**: Visualisasi persentase sentimen

## 🔧 Scripts

```bash
# Development
npm run dev          # Jalankan development server

# Database
npm run db:push      # Push schema ke database
npm run db:studio    # Buka Drizzle Studio

# Build
npm run build        # Build untuk production
npm run preview      # Preview build hasil
```

## 🌟 Design System

### Colors
- **Primary**: #2D3436
- **Secondary**: #0984E3
- **Accent**: #00B894
- **Background**: #F7F9FC

### Typography
- **Heading**: Inter/SF Pro Display
- **Body**: Inter

### Components
- **Shadows**: `0 10px 20px rgba(0,0,0,0.05)`
- **Border Radius**: 12px
- **Grid Spacing**: 24px
- **Transitions**: 0.3s ease

## 📱 Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🔒 Security Features

- Form validation dengan Zod
- Input sanitization
- Type-safe database operations
- Environment variable protection

## 🚀 Deployment

### Replit Deployment
Project sudah dikonfigurasi untuk deployment di Replit dengan:
- Automatic port allocation
- Environment variable management
- PostgreSQL database integration

### Manual Deployment
1. Build project: `npm run build`
2. Setup environment variables
3. Deploy ke platform pilihan (Vercel, Netlify, etc.)

## 🤝 Contributing

1. Fork repository
2. Buat feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push ke branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Contact

Project Link: [https://github.com/username/nlp-ai-dashboard](https://github.com/username/nlp-ai-dashboard)

---

**Built with ❤️ using modern web technologies and AI-powered insights**