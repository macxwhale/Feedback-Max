
# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/78273d06-7aff-45d9-82e6-cf34b3c501aa

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/78273d06-7aff-45d9-82e6-cf34b3c501aa) and start prompting.

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

## Architecture Overview

This project is a full-stack web application built using a modern JAMstack architecture.

- **Frontend**: A single-page application (SPA) built with **React** and **Vite**. It handles the user interface and client-side logic.
- **Backend**: Serverless functions powered by **Supabase Edge Functions** (written in Deno/TypeScript). These handle business logic, database interactions, and secure operations.
- **Database**: A **PostgreSQL** database managed by **Supabase**, which also provides authentication and storage services.
- **Styling**: **Tailwind CSS** with **shadcn/ui** for a utility-first CSS framework and a set of pre-built, accessible components.
- **State Management**: Client state is managed with React hooks. Server state (data fetching, caching, mutations) is handled efficiently by **TanStack React Query**.

## Folder Structure

The project is organized with a clear separation of concerns:

- `src/`: Contains all the frontend source code.
  - `components/`: Reusable React components, organized by feature area (e.g., `admin`, `auth`, `feedback`).
  - `hooks/`: Custom React hooks for encapsulating logic, especially data fetching and state management.
  - `pages/`: Top-level components that correspond to application routes.
  - `services/`: Modules for interacting with external APIs or centralizing business logic.
  - `integrations/`: Code for connecting to third-party services, like the Supabase client.
  - `lib/`: General utility functions.
- `supabase/`: Contains all backend and database-related code.
  - `functions/`: Deno-based serverless Edge Functions. Each folder is a separate function.
  - `migrations/`: SQL files for database schema changes.
- `public/`: Static assets that are served directly.

## Configuration Notes

- **Supabase Environment Variables**: The Supabase functions rely on environment variables set within the Supabase dashboard (Project Settings > Functions). These include `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`. These are not stored in the repository for security reasons.
- **Frontend Supabase Client**: The Supabase client in `src/integrations/supabase/client.ts` is configured with the public URL and anon key. These are safe to expose in the frontend code.
- **Styling**: Tailwind CSS configuration is in `tailwind.config.ts`. Customizations to the shadcn/ui theme can be made there.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/78273d06-7aff-45d9-82e6-cf34b3c501aa) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

