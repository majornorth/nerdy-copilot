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
# OpenAI API Configuration (Required)
VITE_OPENAI_API_KEY=your_openai_api_key_here

# Supabase Configuration (Optional - for production deployment)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Get OpenAI API Key

1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Add it to your `.env` file as `VITE_OPENAI_API_KEY`

### 3. Run the Application

```bash
npm install
npm run dev
```

The application will start at `http://localhost:5173`

## Development vs Production

### Development Mode (Current Setup)
- Uses direct OpenAI API calls from the browser
- ⚠️ **Security Note**: API key is exposed in the browser (development only)
- No additional setup required beyond the OpenAI API key

### Production Mode (Recommended)
For production deployment, use Supabase Edge Functions to keep your API key secure:

1. **Create a Supabase project** at [supabase.com](https://supabase.com)
2. **Set up the Edge Function**:
   - The function code is already included in `supabase/functions/openai-chat/`
   - Deploy using the Supabase dashboard or CLI
3. **Configure environment variables**:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```
4. **Set your OpenAI API key** as a Supabase secret named `OPENAI_API_KEY`

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
- **Development**: Direct API calls expose your key in the browser
- **Production**: Use Supabase Edge Functions to keep API keys secure
- The application automatically detects if Supabase is configured and uses the secure endpoint

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_OPENAI_API_KEY` | Yes | Your OpenAI API key |
| `VITE_SUPABASE_URL` | No | Supabase project URL (for production) |
| `VITE_SUPABASE_ANON_KEY` | No | Supabase anonymous key (for production) |

## Troubleshooting

### "OpenAI API key not configured" Error
- Ensure `VITE_OPENAI_API_KEY` is set in your `.env` file
- Restart the development server after adding environment variables

### "OpenAI API quota exceeded" Error
- This means your OpenAI API key has reached its usage limit
- Visit [OpenAI Billing Dashboard](https://platform.openai.com/account/billing) to:
  - Check your current usage and limits
  - Add payment method or credits
  - Upgrade your plan if needed
- Wait for your quota to reset (if on a free tier)

### API Key Exposed in Browser
- This is expected in development mode
- For production, configure Supabase Edge Functions

### Image Generation Issues
- Ensure your OpenAI API key has access to DALL-E 3
- Check that image generation requests are properly formatted
- Images are stored as URLs and persisted in the database

### Network Errors
- Check your internet connection
- Verify your OpenAI API key is valid and has sufficient credits