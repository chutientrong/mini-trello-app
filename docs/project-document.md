# Mini Trello App - Project Documentation

## Project Structure
```
mini-trello-app/
├── backend/                 # Node.js/Express backend
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Route controllers
│   │   ├── middlewares/    # Express middlewares
│   │   ├── models/         # Data models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── socket/         # WebSocket handlers
│   │   ├── utils/          # Utility functions
│   │   └── validations/    # Request validation schemas
│   ├── env.example         # Environment variables template
│   └── package.json
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React contexts
│   │   ├── features/       # Feature-based modules
│   │   │   ├── auth/       # Authentication
│   │   │   ├── boards/     # Board management
│   │   │   ├── cards/      # Card management
│   │   │   ├── tasks/      # Task management
│   │   │   ├── github/     # GitHub integration
│   │   │   └── notifications/ # Notifications
│   │   ├── hooks/          # Custom React hooks
│   │   ├── layouts/        # Layout components
│   │   ├── pages/          # Page components
│   │   ├── routes/         # Routing configuration
│   │   ├── services/       # API services
│   │   ├── store/          # State management
│   │   ├── styles/         # Global styles
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Utility functions
│   ├── env.example         # Environment variables template
│   └── package.json
├── docs/                   # Documentation
```

## Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.IO** - Real-time communication
- **Firebase** - Database 
- **Passport** - Oauth
- **JWT** - Token-based authentication

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Query** - Data fetching and caching
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Socket.IO Client** - Real-time communication

## Getting Started

### Prerequisites
- Node.js (v20 or higher)
- npm or yarn
- Firebase project setup
- GitHub Oauth setup

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mini-trello-app/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp env.example .env
   ```
   
   Configure the following variables in `.env`

4. **Start the server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp env.example .env
   ```
   
   Configure the following variables in `.env`

4. **Start the development server**
   ```bash
   npm run dev
   ```

### Firebase Setup

1. **Create a Firebase project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Firestore Database

2. **Generate service account key**
   - Go to Project Settings > Service Accounts
   - Generate new private key
   - Download the JSON file
   - Use the values in your backend `.env` file

### GitHub OAuth Setup

1. **Create a GitHub OAuth App**
   - Go to [GitHub Developer Settings](https://github.com/settings/developers)
   - Click "OAuth Apps" -> "New OAuth App"
   - Fill in the application details:
     - **Application name**: Mini Trello App
     - **Homepage URL**: `http://localhost:5173` 
     - **Authorization callback URL**: `http://localhost:5173/auth/github/callback`

2. **Get OAuth Credentials**
   - After creating the app, you'll get:
     - **Client ID**: Copy this to your environment variables
     - **Client Secret**: Generate a new one and copy it

3. **Configure Environment Variables**
   
   **Backend (.env)**:
   ```env
   GITHUB_CLIENT_ID=your-github-client-id
   GITHUB_CLIENT_SECRET=your-github-client-secret
   ```
   
   **Frontend (.env)**:
   ```env
   VITE_GITHUB_CLIENT_ID=your-github-client-id
   ```

4. **GitHub OAuth Flow**
   - Users click "Connect GitHub" in the app
   - They're redirected to GitHub for authorization
   - GitHub redirects back with an authorization code
   - The backend exchanges the code for an access token
   - The user's GitHub account is linked to their profile
