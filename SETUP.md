# GitHub Setup Guide

Follow these steps to push your Sleeper Manager project to GitHub.

## Step 1: Create a New Repository on GitHub

1. Go to [github.com](https://github.com) and log in
2. Click the **+** icon in the top-right corner → **New repository**
3. Name it: `sleeper-manager`
4. Add description: "A web app to manage your fantasy football teams from Sleeper"
5. Choose **Public** (so others can use it)
6. Do NOT initialize with README, .gitignore, or license (we already have those)
7. Click **Create repository**

## Step 2: Push Your Code

Once your repository is created, GitHub will show you a set of commands. Run these in your terminal:

```bash
# Navigate to your project directory
cd sleeper-manager

# Initialize git (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Sleeper Manager app"

# Add the remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/sleeper-manager.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

## Step 3: Verify

1. Go to your repository on GitHub: `https://github.com/YOUR_USERNAME/sleeper-manager`
2. You should see all your files
3. The README.md will display on the main page

## Step 4: (Optional) Deploy for Free

### Option A: Vercel (Recommended - 1 click setup)

1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Paste your GitHub repo URL
4. Click "Import"
5. Vercel will auto-deploy! Your app will be live at a URL like `sleeper-manager-xxxxx.vercel.app`

### Option B: GitHub Pages

1. Go to your repository settings
2. Scroll to "GitHub Pages"
3. Select `main` branch, `/root` folder
4. Click Save
5. Your app will be at `https://YOUR_USERNAME.github.io/sleeper-manager`

**Note:** GitHub Pages requires a build step. You may need to configure it further.

### Option C: Netlify

1. Go to [netlify.com](https://netlify.com)
2. Click "New site from Git"
3. Connect your GitHub account
4. Select the `sleeper-manager` repository
5. Build command: `npm run build`
6. Publish directory: `dist`
7. Click "Deploy"

## Step 5: Share Your Project!

Once deployed, you can share your app with others:
- Share the GitHub repo link: `https://github.com/YOUR_USERNAME/sleeper-manager`
- Share the live demo link (if deployed): `https://your-app-url.vercel.app`

## Useful Git Commands

```bash
# Check status
git status

# See your commits
git log

# Make changes and commit
git add .
git commit -m "Your message"
git push

# Create a new branch
git checkout -b feature/new-feature
git push -u origin feature/new-feature
```

## Troubleshooting

**"fatal: not a git repository"**
- Make sure you're in the `sleeper-manager` directory
- Run `git init` to initialize

**"Permission denied (publickey)"**
- You may need to set up SSH keys
- Or use HTTPS instead of SSH for the remote URL

**"branch 'main' set up to track remote 'origin/main'"**
- This is normal! It means your local branch is tracking the remote

## Next Steps

Once your repo is on GitHub:
- ⭐ Star your own repo! (People view starred repos)
- 📝 Add a "Deploy" badge to your README pointing to your live demo
- 🚀 Consider deploying to Vercel/Netlify for a live demo
- 💬 Open issues for features you want to add
- 🤝 Invite others to contribute!

---

Questions? Check the main [README.md](README.md) or open an issue on GitHub!
