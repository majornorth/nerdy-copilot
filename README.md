# Tutor Copilot Demo

A comprehensive tutor dashboard application with AI-powered teaching assistance.

## Features

- **Lesson Management**: View and manage upcoming lessons
- **AI-Powered Copilot**: Get help with lesson planning, practice problems, teaching strategies, and visual diagrams
- **Availability Tracking**: Manage your tutoring schedule
- **Resource Library**: Quick access to tutoring resources and tools
- **Image Generation**: Create educational diagrams and visual aids using AI

## Quick Start

### 1. Environment Setup

Create a `.env` file in the root directory:

```env
# Supabase Configuration (Required)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Set Up Supabase

1. **Create a Supabase project** at [supabase.com](https://supabase.com)
2. **Get your Supabase credentials**:
   - Go to Project Settings → API
   - Copy your Project URL and anon/public key
   - Add them to your `.env` file
3. **Set up OpenAI API key in Supabase**:
   - Go to Project Settings → Edge Functions → Secrets
   - Add a secret named `OPENAI_API_KEY` with your OpenAI API key
   - Get your API key from [OpenAI Platform](https://platform.openai.com/api-keys)

### 3. Run the Application

```bash
npm install
npm run dev
```

The application will start at `http://localhost:5173`

## Architecture & Security

### Secure API Key Storage
- **All OpenAI API calls** go through Supabase Edge Functions (server-side)
- **OpenAI API key** is stored in Supabase Edge Functions secrets (never exposed to client)
- **Client only uses** Supabase anon key (safe to expose publicly)
- This setup is secure for both development and production

### Supabase Edge Functions Setup
1. **Deploy Edge Functions**:
   - The function code is already included in `supabase/functions/openai-chat/` and `supabase/functions/openai-image/`
   - Deploy using the Supabase dashboard or CLI:
     ```bash
     supabase functions deploy openai-chat
     supabase functions deploy openai-image
     ```
2. **Set OpenAI API key secret**:
   - Go to Supabase Dashboard → Project Settings → Edge Functions → Secrets
   - Add secret: `OPENAI_API_KEY` = your OpenAI API key

## Architecture

- **Frontend**: React + TypeScript + Tailwind CSS
- **State Management**: Zustand
- **Icons**: Phosphor React
- **AI Integration**: OpenAI GPT-3.5-turbo + DALL-E 3 for image generation
- **Secure Backend**: Supabase Edge Functions (for production)
- **Database**: Supabase PostgreSQL with JSONB support for flexible message storage

## Project Structure

```
src/
├── components/          # React components
│   ├── copilot/        # AI chat interface
│   ├── lessons/        # Lesson management
│   ├── ui/             # Reusable UI components
│   └── layout/         # Layout components
├── stores/             # Zustand state management
├── services/           # API services
├── hooks/              # Custom React hooks
└── types/              # TypeScript type definitions
```

## Security Notes

- **Never commit your `.env` file** to version control
- **OpenAI API key** is stored securely in Supabase Edge Functions secrets (server-side only)
- **Client environment variables** (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) are safe to expose publicly
- All OpenAI API calls go through Supabase Edge Functions, keeping your API key secure
- This setup is safe for public GitHub repositories and iframe embedding

## Environment Variables

### Client-Side (`.env` file)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | Yes | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Your Supabase anonymous key (safe to expose) |

### Server-Side (Supabase Edge Functions Secrets)

| Secret Name | Required | Description |
|-------------|----------|-------------|
| `OPENAI_API_KEY` | Yes | Your OpenAI API key (stored securely in Supabase) |

**Note**: Never set `VITE_OPENAI_API_KEY` in your `.env` file. The OpenAI API key must be stored in Supabase Edge Functions secrets only.

## Troubleshooting

### "Supabase is not configured" Error
- Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in your `.env` file
- Restart the development server after adding environment variables
- Verify your Supabase project is active and accessible

### "OpenAI API key not configured" Error (from Edge Function)
- Ensure `OPENAI_API_KEY` is set in Supabase Edge Functions secrets
- Go to Supabase Dashboard → Project Settings → Edge Functions → Secrets
- Verify the secret name is exactly `OPENAI_API_KEY` (not `VITE_OPENAI_API_KEY`)

### "OpenAI API quota exceeded" Error
- This means your OpenAI API key has reached its usage limit
- Visit [OpenAI Billing Dashboard](https://platform.openai.com/account/billing) to:
  - Check your current usage and limits
  - Add payment method or credits
  - Upgrade your plan if needed
- Wait for your quota to reset (if on a free tier)

### Edge Function Errors
- Verify your Supabase Edge Functions are deployed
- Check that `OPENAI_API_KEY` secret is set in Supabase
- Review Edge Function logs in Supabase Dashboard → Edge Functions → Logs

### Image Generation Issues
- Ensure your OpenAI API key has access to DALL-E 3
- Check that image generation requests are properly formatted
- Images are stored as URLs and persisted in the database

### Network Errors
- Check your internet connection
- Verify your OpenAI API key is valid and has sufficient credits