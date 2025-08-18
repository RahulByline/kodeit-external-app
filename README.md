# Kodeit External App - Teacher Training Academy

## Project Overview

A comprehensive teacher training academy platform built with React, TypeScript, and integrated with Moodle/Iomad API for real-time data management.

## Features

### 🔐 Authentication & Authorization
- Multi-role login system (Admin, School Admin, Teacher, Student)
- Real Moodle/Iomad API integration for authentication
- Protected routes based on user roles
- Secure logout functionality with confirmation dialog

### 📊 Dashboard System
- **Admin Dashboard**: System-wide analytics, user management, course oversight
- **School Admin Dashboard**: School-specific analytics and management
- **Teacher Dashboard**: Course management, student performance tracking
- **Student Dashboard**: Course progress, assignment tracking, grade monitoring

### ⚙️ System Settings
- Comprehensive settings panel for all user roles
- Profile management, notifications, security settings
- Appearance customization, privacy controls
- Admin-specific system configuration and API settings

### 🔗 Real-time Data Integration
- Live data from Moodle/Iomad API
- Real user statistics, course information, and company data
- Dynamic dashboard metrics based on actual system data
- Role-based data filtering and presentation

### 🎨 Modern UI/UX
- Responsive design with Tailwind CSS
- shadcn/ui components for consistent styling
- Interactive profile dropdown with logout functionality
- Smooth animations and transitions

## Project info

**URL**: https://lovable.dev/projects/09849073-2e56-4776-a1a4-c5ffe4eb63dd

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/09849073-2e56-4776-a1a4-c5ffe4eb63dd) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Run the multi-language executor (local)
```bash
# 1) Start backend (local execution)
cd backend
cp env.example .env
npm install
npm start

# 2) Start frontend (in another terminal)
cd ..
# your usual dev command, e.g.:
npm run dev
# Ensure VITE_RUN_PROXY_URL is set (defaults to http://localhost:5000)

# Optional: Test backend execution
cd backend
node test-execution.js
```

**Note:** This setup uses local code execution. For secure containerized execution, install Docker and use Judge0:
```bash
# Install Docker first, then:
cd infra/judge0
docker compose up -d
```

## Sanity tests (paste in editor)
**Python**
```python
print("hello python")
```

**C**
```c
#include <stdio.h>
int main(){ printf("hello c\n"); return 0; }
```

**C++**
```cpp
#include <bits/stdc++.h>
using namespace std;
int main(){ cout << "hello cpp\n"; }
```

**Java**
```java
class Main { public static void main(String[] args){ System.out.println("hello java"); } }
```

**JavaScript (Node)**
```js
console.log("hello js");
```

## Build & Deploy

### Production Build
```bash
# Install dependencies
npm ci

# Build for production with verification
npm run build:prod

# The build output will be in the dist/ directory
# Deploy ONLY the contents of dist/ to your hosting provider
```

### Development
```bash
# Start development server
npm run dev

# Build for development
npm run build:dev
```

### Build Verification
The build process includes automatic verification to ensure no webpack loader specifiers leak into the browser. If verification fails, the build will be aborted.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/09849073-2e56-4776-a1a4-c5ffe4eb63dd) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
