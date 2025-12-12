# Google OAuth Setup Guide

Follow these steps to enable Google OAuth login for your Itinerary app.

## Step 1: Configure Google Cloud Console

1. **Go to Google Cloud Console**: https://console.cloud.google.com/

2. **Create a new project** (or select an existing one):
   - Click on the project dropdown at the top
   - Click "New Project"
   - Name it "Itinerary" (or your preferred name)
   - Click "Create"

3. **Enable Google+ API**:
   - In the left sidebar, go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click on it and click "Enable"

4. **Create OAuth Credentials**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - If prompted, configure the OAuth consent screen first:
     - User Type: "External"
     - App name: "Itinerary"
     - User support email: Your email
     - Developer contact: Your email
     - Click "Save and Continue" through the remaining steps

5. **Configure OAuth Client**:
   - Application type: "Web application"
   - Name: "Itinerary Web App"
   - **Authorized JavaScript origins**:
     - http://localhost:3000 (for local development)
     - https://your-production-domain.com (for production)
   - **Authorized redirect URIs**:
     - http://localhost:3000/auth/callback (for local development)
     - https://your-production-domain.com/auth/callback (for production)
     - **IMPORTANT**: Also add your Supabase callback URL (you'll get this in the next step)
   - Click "Create"

6. **Save your credentials**:
   - Copy the "Client ID" and "Client Secret" - you'll need these for Supabase

## Step 2: Configure Supabase

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard

2. **Navigate to Authentication**:
   - Click on your project
   - Go to "Authentication" → "Providers"

3. **Enable Google Provider**:
   - Find "Google" in the list
   - Toggle it to "Enabled"

4. **Add Google Credentials**:
   - Paste your **Client ID** from Google Console
   - Paste your **Client Secret** from Google Console

5. **Get Supabase Callback URL**:
   - Copy the "Callback URL (for OAuth)" shown in the Google provider settings
   - It should look like: `https://[your-project-ref].supabase.co/auth/v1/callback`

6. **Go back to Google Cloud Console**:
   - Add the Supabase callback URL to your "Authorized redirect URIs"
   - Click "Save"

7. **Save in Supabase**:
   - Click "Save" in Supabase

## Step 3: Configure Site URL in Supabase

1. In Supabase Dashboard, go to "Authentication" → "URL Configuration"

2. Set the **Site URL** to:
   - For development: `http://localhost:3000`
   - For production: `https://your-production-domain.com`

3. Add **Redirect URLs** (optional but recommended):
   - `http://localhost:3000/auth/callback`
   - `https://your-production-domain.com/auth/callback`

## Step 4: Test the Integration

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Go to the auth page**: http://localhost:3000/auth

3. **Click "Login with Google"**:
   - You should be redirected to Google's login page
   - After logging in, you should be redirected back to your app
   - You should be logged in

## Troubleshooting

### "redirect_uri_mismatch" error
- Make sure the redirect URI in Google Console exactly matches the one Supabase is using
- Check for trailing slashes and http vs https

### "Access blocked: This app's request is invalid"
- Make sure you've enabled the Google+ API
- Verify your OAuth consent screen is configured

### User redirected but not logged in
- Check browser console for errors
- Verify the callback route is working: `/auth/callback`
- Check Supabase logs in the Dashboard

### "oauth_failed" error message
- Check the Supabase logs for detailed error messages
- Verify your Client ID and Client Secret are correct
- Make sure your callback URL is correctly configured

## Production Deployment

When deploying to production (Vercel):

1. **Add your production domain to Google Console**:
   - Authorized JavaScript origins: `https://your-vercel-domain.vercel.app`
   - Authorized redirect URIs: `https://your-vercel-domain.vercel.app/auth/callback`

2. **Update Supabase Site URL**:
   - Set to your production domain

3. **Test thoroughly** before making it live to users

## Security Notes

- Never commit your Google Client Secret to version control
- Keep your Supabase keys secure
- Use environment variables for sensitive data
- Regularly review authorized domains in Google Console
