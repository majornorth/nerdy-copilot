# Netlify Deployment Guide

This guide will help you deploy your Tutor Copilot application to Netlify.

## Prerequisites

- A GitHub account with your code pushed to a repository
- A Netlify account (sign up at [netlify.com](https://www.netlify.com))
- Your Supabase credentials ready (Supabase is required for secure API key storage)

## Deployment Steps

### Option 1: Deploy via Netlify Dashboard (Recommended for first-time deployment)

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for Netlify deployment"
   git push origin main
   ```

2. **Connect to Netlify**
   - Go to [app.netlify.com](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Choose "GitHub" and authorize Netlify
   - Select your repository

3. **Configure build settings**
   - Netlify should auto-detect your settings from `netlify.toml`:
     - Build command: `npm run build`
     - Publish directory: `dist`
   - If not auto-detected, enter these manually

4. **Set environment variables**
   - In the site settings, go to "Environment variables"
   - Add the following variables:
     - `VITE_SUPABASE_URL` - Your Supabase project URL (required)
     - `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key (required)
   - **Important**: The OpenAI API key is stored securely in Supabase Edge Functions secrets (see step 5)

5. **Configure Supabase Edge Functions**
   - Go to your Supabase project dashboard
   - Navigate to Project Settings → Edge Functions → Secrets
   - Add a secret named `OPENAI_API_KEY` with your OpenAI API key value
   - This keeps your API key secure and never exposes it to the client

6. **Deploy**
   - Click "Deploy site"
   - Wait for the build to complete
   - Your site will be live at a URL like `https://your-site-name.netlify.app`

### Option 2: Deploy via Netlify CLI

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Initialize and deploy**
   ```bash
   netlify init
   ```
   - Follow the prompts to connect to your site
   - Set environment variables when prompted, or add them later in the dashboard

4. **Deploy**
   ```bash
   netlify deploy --prod
   ```

## Environment Variables

### Netlify Environment Variables

Make sure to set these in Netlify's dashboard under Site settings → Environment variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_SUPABASE_URL` | Yes | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes | Your Supabase anonymous key (safe to expose publicly) |

### Supabase Edge Functions Secrets

Set your OpenAI API key securely in Supabase (not in Netlify):

1. Go to Supabase Dashboard → Project Settings → Edge Functions → Secrets
2. Add a secret:
   - **Name**: `OPENAI_API_KEY`
   - **Value**: Your OpenAI API key

**Important**: 
- Never commit your `.env` file to Git
- Never set `VITE_OPENAI_API_KEY` in Netlify (it would expose your key in the browser)
- The OpenAI API key must be stored in Supabase Edge Functions secrets only

## Post-Deployment

1. **Custom Domain** (Optional)
   - Go to Site settings → Domain management
   - Add your custom domain

2. **Continuous Deployment**
   - Netlify automatically deploys on every push to your main branch
   - You can configure branch deploys in Site settings → Build & deploy

3. **Monitor Deployments**
   - Check the Deploys tab to see build logs and deployment history

## Troubleshooting

### Build Fails
- Check the build logs in Netlify dashboard
- Ensure all environment variables are set
- Verify Node.js version (should be 20, as specified in `netlify.toml`)

### Environment Variables Not Working
- Make sure variable names start with `VITE_` (required for Vite)
- Redeploy after adding new environment variables
- Check that variables are set for "Production" environment

### SPA Routing Issues
- The `netlify.toml` includes a redirect rule for SPA routing
- If routes don't work, verify the redirect rule is present

## Security Notes

- **OpenAI API key is stored securely** in Supabase Edge Functions secrets (server-side only)
- The client only uses `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (safe to expose)
- All OpenAI API calls go through Supabase Edge Functions, keeping your API key secure
- This setup is safe for public GitHub repositories and iframe embedding

