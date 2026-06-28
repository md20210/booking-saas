# Railway CLI Setup - Complete Guide

This document explains how to set up Railway CLI access for the booking-saas project.

## Problem Background

Railway offers two types of authentication:
- **API Tokens** (GraphQL API) - For programmatic API access, NOT for CLI
- **Session Tokens** - For CLI access, obtained via browser login

**IMPORTANT:** API tokens from the Railway dashboard DO NOT work with the CLI. You must use browser-based login.

## Installation

### WSL/Linux

```bash
# Install Railway CLI
curl -fsSL https://railway.app/install.sh | sh

# This installs to ~/.railway/bin/railway
# Add to PATH (add to ~/.bashrc or ~/.zshrc)
export PATH="$HOME/.railway/bin:$PATH"

# Verify installation
~/.railway/bin/railway --version
# Should show: railway version 5.23.1 or higher
```

### Windows

Download and run the official installer from https://railway.app/cli

## Authentication

### Step 1: Login

```bash
cd /mnt/e/CodelocalLLM/booking-saas
~/.railway/bin/railway login
```

**IMPORTANT:** When the browser opens:
1. If you have multiple Railway accounts, Railway may open with the wrong account
2. Close the tab
3. Open a NEW Inkognito/Private browser window
4. Manually navigate to the Railway login page
5. Login with the correct account: **michael.dabrock@web.de**
6. Complete the CLI authentication

### Step 2: Verify Authentication

```bash
~/.railway/bin/railway whoami
# Should show: Logged in as michael.dabrock@web.de
```

### Step 3: Link Project

```bash
cd /mnt/e/CodelocalLLM/booking-saas

# Link to the booking-saas project
~/.railway/bin/railway link --project fearless-amazement --environment production --service booking-saas
```

This creates a `.railway-link.json` file in the project directory (already in .gitignore).

## Common Commands

### Check Deployment Status

```bash
~/.railway/bin/railway status
```

Shows:
- Workspace name
- Project name and ID
- Environment
- Service status (Online/Building/Crashed)
- Current deployment ID
- Public URL
- Region

### View Deployment Logs

```bash
# Live logs (follow mode)
~/.railway/bin/railway logs

# Recent logs with tail
~/.railway/bin/railway logs | tail -50
```

### View Specific Deployment

```bash
~/.railway/bin/railway logs <deployment-id>
```

### Open Dashboard

```bash
~/.railway/bin/railway open
```

Opens the Railway dashboard in your browser for the linked project.

### Environment Variables

```bash
# List all environment variables
~/.railway/bin/railway variables

# Set a variable
~/.railway/bin/railway variables --set KEY=value

# Delete a variable
~/.railway/bin/railway variables --delete KEY
```

## Troubleshooting

### "Unauthorized. Please login with railway login"

**Solution:** You're likely using an API token instead of logging in via browser.
```bash
~/.railway/bin/railway login
```

### "No linked project found"

**Solution:** Link the project first:
```bash
~/.railway/bin/railway link --project fearless-amazement --environment production --service booking-saas
```

### Wrong Account Logged In

**Solution:**
1. Logout first: `~/.railway/bin/railway logout`
2. Login again using Inkognito mode to select correct account
3. Verify: `~/.railway/bin/railway whoami`

### Version Mismatch

If Railway CLI is old (< v5.0):
```bash
# Reinstall with official installer
curl -fsSL https://railway.app/install.sh | sh

# Verify version
~/.railway/bin/railway --version
```

## Project Details

- **Account:** michael.dabrock@web.de
- **Workspace:** md20210's Projects
- **Project:** fearless-amazement
- **Project ID:** 9dc34084-da2b-48c7-8155-34f864f57872
- **Environment:** production
- **Environment ID:** e56f9b60-efa5-42fd-b9e0-9e159bd42c8b
- **Service:** booking-saas
- **Service ID:** 108d4126-b6a4-403b-a77f-3b8238f7e2db
- **URL:** https://booking-saas-production-c352.up.railway.app
- **Region:** EU West
- **Database:** Postgres (postgres-volume)

## Additional Resources

- Railway CLI Documentation: https://docs.railway.app/guides/cli
- Railway Status: https://status.railway.app/
- Project Dashboard: Run `railway open` after linking

## Notes

- The `.railway-link.json` file is git-ignored and should NOT be committed
- Railway CLI config is stored in `~/.railway/` on Linux/Mac
- Each environment (dev/staging/production) requires separate linking
- Railway auto-deploys on git push to master branch
- Deployments typically take 2-3 minutes to complete
