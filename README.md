# To-Do List Application

## Features

- **Authentication**: secure sign-up and login with email/password with protected routes.
- **Task Management**: Create, read, update, and delete tasks.
- **Search & Sort**: Filter tasks by name, status, or date.
- **Responsive Design**: optimized for all devices.
- **Fast Loading & Smart Caching**: Powered by React Query, ensuring instant page loads and minimized network requests.
- **Real-time Sync**: Tasks update instantly across all devices using Supabase Realtime. To test it, login to the app in two different devices using the same account and try to add a task in one device, it should appear in the other device instantly(this also works for updating, marking as complete and deleting).
- **Security**: Built-in SQL injection prevention via Supabase's parameterized query builder, ensuring all user inputs are automatically sanitized.
- **Additional Features**: toast notifications for user feedback, confirmation dialog for deletion, empty states, and loading states.


## Design Decisions

### UX/UI Choices
- **Task Creation Workflow**: The requirements mentioned including a "Status" field in the Add Task form. I intentionally omitted this to streamline the user experience.
  - **Rationale**: A "To-Do" app is primarily for tracking incomplete tasks. Creating a task that is already "Complete" is an edge case that doesn't justify complicating the primary creation flow. By default, all new tasks are "Incomplete". If a user needs to log a completed task, they can create it and immediately check it off in the list view. This reduces friction for the 99% use case.

## Prerequisites

- Node.js (v18 or higher)
- npm

## Setup & Database Initialization

### 1. Database Setup (Supabase)

Run the following SQL script in your Supabase SQL Editor to create the necessary tables and policies:

```sql
-- Create Tasks Table
create table tasks (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  description text,
  is_complete boolean default false,
  user_id uuid references auth.users default auth.uid()
);

-- Enable Row Level Security (RLS)
alter table tasks enable row level security;

-- Create Policies
-- Users can only see their own tasks
create policy "Users can select their own tasks" 
on tasks for select 
using (auth.uid() = user_id);

-- Users can insert their own tasks
create policy "Users can insert their own tasks" 
on tasks for insert 
with check (auth.uid() = user_id);

-- Users can update their own tasks
create policy "Users can update their own tasks" 
on tasks for update 
using (auth.uid() = user_id);

-- Users can delete their own tasks
create policy "Users can delete their own tasks" 
on tasks for delete 
using (auth.uid() = user_id);

-- Enable Realtime
alter publication supabase_realtime add table tasks;
```

### 2. Environment Variables

Ensure you have the following `.env` files created.

**Server (`server/.env`):** & **Client (`client/.env`):**

Get your supabase url and anon key from your supabase project and add them to the .env files.

I've included a .env.example file in the root directory of the project. You can use it as a template to create your own .env files.

Disable Email Confirmation in Sign-In/Providers in your supabase project.

### 3. Installation

**Server:**
```bash
cd server
npm install
```

**Client:**
```bash
cd client
npm install
```

## Running the Application

1. **Start the Backend Server:**
   ```bash
   cd server
   npm run dev
   ```
   The server will start on `http://localhost:3000`.

2. **Start the Frontend Client:**
   ```bash
   cd client
   npm run dev
   ```
   The application will be accessible at `http://localhost:5173`.

