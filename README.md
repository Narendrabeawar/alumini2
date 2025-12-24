# 🎓 Alumni Management System

A comprehensive alumni management system built with Next.js, TypeScript, and Supabase.

## ✨ Features

### 👥 User Features

- **User Registration & Authentication** - Secure signup/login with email verification
- **Profile Management** - Complete profile setup with education, work history, skills, and contact details
- **Alumni Directory** - Browse and search through all approved alumni with advanced filters
- **Profile Viewing** - Detailed alumni profile pages with all information
- **Dashboard** - User-friendly dashboard with quick access to all features

### 🔐 Admin Features

- **Pending Approvals** - Review and approve/reject new alumni registrations
- **Create Alumni** - Manually create alumni profiles
- **Import Alumni** - Bulk import alumni data via CSV/Excel
- **Send Invites** - Generate and send invite codes to imported alumni
- **Alumni List** - Complete list of all approved alumni with search and filtering
- **Analytics** - View pending approvals count and statistics

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, React
- **UI Components**: Shadcn UI, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **Database**: PostgreSQL with Row Level Security (RLS)
- **Deployment**: Vercel (recommended)

## 📁 Project Structure

```
school/
├── web/                    # Next.js application
│   ├── src/
│   │   ├── app/           # App router pages
│   │   │   ├── (admin)/   # Admin routes
│   │   │   ├── (app)/     # User routes
│   │   │   └── (auth)/    # Auth routes
│   │   ├── components/    # React components
│   │   └── lib/          # Utilities and helpers
│   └── public/            # Static assets
├── final_setup.sql        # Complete database setup
├── make_admin.sql         # Admin user setup
└── README.md              # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Narendrabeawar/alumini2.git
   cd alumini2
   ```

2. **Install dependencies**

   ```bash
   cd web
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the `web` directory:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up the database**

   - Go to your Supabase project SQL Editor
   - Run `final_setup.sql` to create all tables, RLS policies, functions, and triggers
   - Run `make_admin.sql` to create your first admin user (update the email in the script)

5. **Run the development server**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## 📝 Database Setup

### Run SQL Scripts

1. **Final Setup** (`final_setup.sql`)

   - Creates all database tables
   - Sets up Row Level Security (RLS) policies
   - Creates helper functions and triggers
   - Sets up storage buckets for avatars

2. **Make Admin** (`make_admin.sql`)
   - Creates the first admin user
   - Update the email address in the script before running

## 🔒 Security Features

- Row Level Security (RLS) on all tables
- Admin-only functions for sensitive operations
- Secure authentication with Supabase Auth
- Protected API routes
- Input validation and sanitization

## 📄 Key Pages

### Public Pages

- `/` - Landing page
- `/login` - Login page
- `/register` - Registration page

### User Pages (After Approval)

- `/dashboard` - User dashboard
- `/profile` - Edit own profile
- `/alumni` - Browse alumni directory
- `/alumni/[id]` - View alumni details

### Admin Pages

- `/admin/alumni` - Pending approvals
- `/admin/create-alumni` - Create new alumni
- `/admin/import` - Import alumni data
- `/admin/invites` - Send invites
- `/admin/alumni-list` - Complete alumni list

## 🎨 UI Components

- Built with Shadcn UI components
- Fully responsive design
- Modern and clean interface
- Accessible and user-friendly

## 📦 Features in Detail

### Profile Management

- Personal information (name, avatar, bio)
- Education history
- Work experience
- Skills
- Contact details (phone, WhatsApp, social media links)

### Alumni Directory

- Search functionality
- Filter by graduation year, department, company
- Pagination
- Responsive card layout

### Admin Dashboard

- Pending approvals management
- Bulk import/export
- Invite code generation
- Complete alumni listing

## 🔄 Workflow

1. **User Registration**: Users register via `/register` or claim invite codes
2. **Profile Setup**: New users fill out their profile (stored in staging tables)
3. **Admin Review**: Admins review and approve/reject profiles
4. **Approval**: Approved profiles are promoted to main tables
5. **Directory Access**: Approved users can view and be viewed by others

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

Narendra Beawar

## 🙏 Acknowledgments

- Built with Next.js and Supabase
- UI components from Shadcn UI
- Icons from Lucide React

---

**Happy Coding! 🚀**
