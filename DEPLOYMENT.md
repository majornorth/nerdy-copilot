# Netlify Deployment Guide

This guide will help you deploy your Tutor Copilot application to Netlify.

## Prerequisites

- A GitHub account with your code pushed to a repository
- A Netlify account (sign up at [netlify.com](https://www.netlify.com))
- Your environment variables ready (OpenAI API key, and optionally Supabase credentials)

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
     - `VITE_OPENAI_API_KEY` - Your OpenAI API key (required)
     - `VITE_SUPABASE_URL` - Your Supabase project URL (optional, for production)
     - `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key (optional, for production)

5. **Deploy**
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

Make sure to set these in Netlify's dashboard under Site settings → Environment variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_OPENAI_API_KEY` | Yes | Your OpenAI API key |
| `VITE_SUPABASE_URL` | No | Supabase project URL (for production) |
| `VITE_SUPABASE_ANON_KEY` | No | Supabase anonymous key (for production) |

**Important**: Never commit your `.env` file to Git. Always use Netlify's environment variables interface.

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

- Your `VITE_OPENAI_API_KEY` will be exposed in the browser bundle
- For production, consider using Supabase Edge Functions to keep API keys secure
- See the main README.md for details on setting up Supabase Edge Functions

