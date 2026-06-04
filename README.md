# Hustle.io

A premium digital marketplace connecting businesses with vetted, top-tier professionals. Hustle.io removes the friction of sourcing and managing talent, engineering a trusted ecosystem where quality and speed intersect seamlessly.

## 🚀 Features

- **User Authentication** - Secure sign-up, sign-in, and email verification
- **Service Marketplace** - Browse and book professional services
- **Category Management** - Dynamic category system with icon mapping
- **Hustle Management** - Create, edit, and manage service listings
- **Applicant System** - Review and manage service proposals
- **Secure Payments** - Escrow-based payment system with PIN verification
- **Real-time Messaging** - Communication between clients and service providers
- **Wallet System** - Manage funds and transactions
- **Responsive Design** - Optimized for mobile, tablet, and desktop
- **Dark Mode Support** - Built-in theme switching

## 🛠️ Tech Stack

- **Frontend Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Styling**: Tailwind CSS with custom design tokens
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Form Validation**: Zod
- **HTTP Client**: Axios

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Git

## 🔧 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd hustle-io
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:

   ```env
   VITE_API_BASE_URL=https://api-v2.hustleapp.info/api/v1
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173`

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🏗️ Project Structure

```
hustle-io/
├── src/
│   ├── app/                    # App configuration & routing
│   │   ├── App.jsx
│   │   ├── AppShell.jsx
│   │   ├── router.jsx
│   │   └── ProtectedRoute.jsx
│   ├── features/               # Feature modules
│   │   ├── auth/              # Authentication
│   │   ├── hustles/           # Service listings
│   │   ├── booking/           # Booking system
│   │   ├── messages/          # Messaging
│   │   ├── wallet/            # Payment & wallet
│   │   └── settings/          # User settings
│   ├── pages/                 # Public pages
│   │   └── public/
│   │       ├── home/          # Landing page
│   │       ├── AboutPage.jsx
│   │       └── ContactPage.jsx
│   ├── shared/                # Shared components & utilities
│   │   ├── components/        # Reusable components
│   │   ├── hooks/             # Custom hooks
│   │   ├── layouts/           # Layout components
│   │   └── store/             # Global state
│   ├── styles/                # Global styles & tokens
│   │   ├── tokens.css         # Design tokens
│   │   └── index.css          # Global styles
│   └── assets/                # Static assets
├── public/                    # Public assets
├── .env.example              # Environment variables template
└── README.md
```

## 🎨 Design System

The project uses a comprehensive design token system located in `src/styles/tokens.css`:

- **Colors**: Brand colors (green & gold), status colors, grayscale
- **Typography**: SF Pro Display font family with responsive scales
- **Spacing**: 8px base grid system
- **Radii**: Consistent border radius values
- **Shadows**: Elevation system
- **Transitions**: Standardized animation timings

### Brand Colors

- **Primary (Green)**: `#387D70` - Main brand color
- **Secondary (Gold)**: `#DEB751` - Accent color
- **Neutral Grey**: `#BCBEC0` - Neutral actions

## 🔐 Authentication

The app uses JWT-based authentication with the following flow:

1. User signs up with email, password, and account type
2. Email verification via link
3. Login with credentials
4. Token stored in localStorage
5. Protected routes require authentication

## 🌐 API Integration

Base URL: `https://api-v2.hustleapp.info/api/v1`

### Key Endpoints

- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/verify-email` - Email verification
- `POST /auth/password/reset` - Reset password from the browser reset page
- `GET /categories` - Fetch categories
- `GET /hustles` - Fetch service listings
- `POST /hustles` - Create new hustle

## 🎯 Key Features Implementation

### Category Icon Mapping

Dynamic icon mapping system that matches API category names to Lucide React icons:

```javascript
const CATEGORY_ICON_MAP = {
  cleaning: PaintBrush,
  beauty: Scissors,
  tech: Database,
  automotive: Settings,
  // ... more mappings
};
```

### Hustle Detail Panel

Modular component system for managing service proposals:

- Applicant review and selection
- Payment processing with PIN verification
- Rejection workflow with reasons
- Status tracking

### Responsive Design

- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px)
- Touch-optimized interactions

## 🌙 Dark Mode

The application supports dark mode through CSS custom properties:

```css
[data-theme="dark"] {
  --color-bg: #141414;
  --color-surface: #1e1e1e;
  /* ... more dark mode tokens */
}
```

## 🚢 Deployment

1. **Build the project**

   ```bash
   npm run build
   ```

2. **Preview the build**

   ```bash
   npm run preview
   ```

3. **Deploy to hosting platform**
   - The `dist` folder contains the production build
   - Compatible with Vercel, Netlify, AWS S3, etc.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Code Style

- Follow ESLint configuration
- Use functional components with hooks
- Implement proper error handling
- Write meaningful commit messages
- Keep components small and focused

## 🐛 Known Issues

- Video background may not autoplay on some browsers due to autoplay policies
- YouTube embed requires user interaction on some mobile browsers

## 📄 License

This project is proprietary and confidential.

## 👥 Team

Developed by the StitchItIn team.

## 📞 Support

For support, email hello@hustle.io or visit our contact page.

---

**Built with ❤️ using React + Vite**
