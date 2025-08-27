# Mini Trello App - Project Documentation

## 📋 Table of Contents

### Prerequisites
- Node.js (v18 or higher)
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
   - Click "New OAuth App"
   - Fill in the application details:
     - **Application name**: Mini Trello App
     - **Homepage URL**: `http://localhost:5173` 
     - **Authorization callback URL**: `http://localhost:5173/auth/github/callback`
     - **Description**: Real-time collaborative task management app

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
