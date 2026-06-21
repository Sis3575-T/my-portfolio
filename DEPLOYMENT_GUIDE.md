# Backend Deployment Guide - Render.com

This guide will help you deploy the backend to Render.com using MongoDB Atlas.

## Prerequisites

1. **MongoDB Atlas Account**: Create a free cluster at [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. **Render.com Account**: Sign up at [render.com](https://render.com)
3. **GitHub Repository**: Your code should be pushed to GitHub

## Step 1: Set Up MongoDB Atlas

### 1.1 Create a Cluster
1. Log in to [MongoDB Atlas](https://cloud.mongodb.com)
2. Create a new cluster (free tier is fine)
3. Wait for cluster to be created (takes 3-5 minutes)

### 1.2 Create Database User
1. Go to **Database Access** in the left sidebar
2. Click **Add New Database User**
3. Choose **Password** authentication
4. Set username (e.g., `portfoliouser`)
5. Set a strong password (save it securely!)
6. Set **Database User Privileges** to **Read and write to any database**
7. Click **Add User**

### 1.3 Configure Network Access
1. Go to **Network Access** in the left sidebar
2. Click **Add IP Address**
3. Click **Allow Access From Anywhere** (or add `0.0.0.0/0`)
4. Click **Confirm**

### 1.4 Get Connection String
1. Go to **Database** in the left sidebar
2. Click **Connect** on your cluster
3. Choose **Connect your application**
4. Select **Node.js** driver and version **4.1 or later**
5. Copy the connection string, it looks like:
   ```
   mongodb+srv://portfoliouser:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. **Important**: Replace `<password>` with your actual database user password
7. Add the database name before the `?` like this:
   ```
   mongodb+srv://portfoliouser:YourPassword@cluster0.xxxxx.mongodb.net/portfolio?retryWrites=true&w=majority
   ```

## Step 2: Deploy to Render.com

### 2.1 Create Web Service
1. Log in to [Render Dashboard](https://dashboard.render.com)
2. Click **New +** button
3. Select **Web Service**
4. Connect your GitHub repository
5. Select the repository: `Sis3575-T/portfolio2`

### 2.2 Configure Service
Fill in the following settings:

- **Name**: `portfolio-backend` (or any name you prefer)
- **Region**: Choose closest to you
- **Branch**: `main`
- **Root Directory**: `backend`
- **Runtime**: `Node`
- **Build Command**: `npm install`
- **Start Command**: `npm run start`
- **Instance Type**: `Free`

### 2.3 Add Environment Variables

Click **Advanced** and add the following environment variables:

| Key | Value | Notes |
|-----|-------|-------|
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/portfolio?retryWrites=true&w=majority` | Your Atlas connection string |
| `JWT_SECRET` | `your-super-secret-random-string-here` | Generate a random string (min 32 chars) |
| `JWT_EXPIRE` | `7d` | Token expiration time |
| `CLOUDINARY_CLOUD_NAME` | `your_cloud_name` | From Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | `your_api_key` | From Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | `your_api_secret` | From Cloudinary dashboard |
| `ADMIN_EMAIL` | `sisay3575@gmail.com` | Your admin email |
| `ADMIN_PASSWORD` | `Sis3575@` | Your admin password |
| `CLIENT_URL` | `https://portfolio2-sigma-pink.vercel.app` | Your frontend URL |
| `PORT` | `10000` | Render assigns this automatically |
| `NODE_VERSION` | `24` | Optional: Specify Node version |

**Important Notes:**
- For `JWT_SECRET`, generate a strong random string. You can use:
  ```bash
  node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
  ```
- Make sure `MONGODB_URI` has the correct username, password, and database name
- Replace Cloudinary values with your actual credentials from [cloudinary.com](https://cloudinary.com)

### 2.4 Deploy
1. Click **Create Web Service**
2. Render will start building and deploying your app
3. Wait for the deployment to complete (3-5 minutes)
4. You'll see logs in real-time

## Step 3: Verify Deployment

### 3.1 Check Health Endpoint
Once deployed, visit:
```
https://your-service-name.onrender.com/api/health
```

You should see:
```json
{
  "success": true,
  "message": "Portfolio API is running",
  "timestamp": "2026-06-21T..."
}
```

### 3.2 Seed the Database (First Time Only)
If this is your first deployment, you need to seed the database:

1. Go to your Render service dashboard
2. Click **Shell** tab
3. Run:
   ```bash
   npm run seed
   ```
4. Wait for completion message

## Step 4: Update Frontend

Update your frontend to use the new backend URL:

In `admin/.env` or `admin/.env.production`:
```env
VITE_API_URL=https://your-service-name.onrender.com/api
```

## Troubleshooting

### Error: "MongoDB connection error: bad auth : Authentication failed"

**Solutions:**
1. Double-check your MongoDB Atlas username and password in the connection string
2. Ensure the password doesn't contain special characters like `@`, `%`, `/` (URL encode them)
3. Verify the database user has correct privileges (Read and write to any database)
4. Make sure Network Access allows connections from anywhere (`0.0.0.0/0`)
5. Wait 5-10 minutes after creating user for changes to propagate

### Error: "MongoServerError: bad auth"

The connection string format is incorrect. Ensure it looks like:
```
mongodb+srv://username:password@cluster.mongodb.net/databasename?retryWrites=true&w=majority
```

### Error: "Duplicate schema index"

This has been fixed in the code. Pull the latest changes and redeploy.

### Deployment Keeps Failing

1. Check Render logs for specific error messages
2. Verify all environment variables are set correctly
3. Ensure `backend` is set as the root directory
4. Check that `package.json` exists in the backend folder

### Application Won't Start

1. Make sure `PORT` is not hardcoded in your code
2. Verify MongoDB connection string is correct
3. Check that all required environment variables are set
4. Look at Render logs for specific errors

## Free Tier Limitations

Render free tier has these limitations:
- Service spins down after 15 minutes of inactivity
- First request after inactivity takes 30-60 seconds to wake up
- 750 hours/month of runtime (shared across services)

To keep service active:
- Upgrade to paid plan ($7/month)
- Use a service like [cron-job.org](https://cron-job.org) to ping your health endpoint every 10 minutes

## Security Best Practices

1. **Never commit `.env` files** to GitHub (already in `.gitignore`)
2. Use strong passwords for MongoDB and admin account
3. Generate a strong `JWT_SECRET` (64+ characters)
4. Regularly rotate your secrets
5. Use environment-specific URLs for `CLIENT_URL`
6. Enable CORS only for your frontend domain (update in production)

## Updating Your Deployment

When you push changes to GitHub:
1. Render automatically detects the push
2. Rebuilds and redeploys your service
3. Usually takes 2-3 minutes

To manually deploy:
1. Go to your Render service
2. Click **Manual Deploy** → **Deploy latest commit**

## Getting Your Backend URL

After deployment, your backend will be available at:
```
https://your-service-name.onrender.com
```

Use this URL in your frontend API configuration.

## Next Steps

1. ✅ Deploy backend to Render
2. ✅ Verify MongoDB connection
3. ✅ Seed database with initial data
4. ✅ Update frontend with new backend URL
5. ✅ Test all API endpoints
6. 🚀 Deploy frontend to Vercel/Netlify

## Support

If you encounter issues:
- Check Render logs (Dashboard → Logs)
- Check MongoDB Atlas logs (Atlas → Activity Feed)
- Review this guide again
- Search Render documentation: [render.com/docs](https://render.com/docs)

## MongoDB Atlas Connection String Examples

### Correct Format:
```
mongodb+srv://portfoliouser:MyP@ssw0rd@cluster0.abc123.mongodb.net/portfolio?retryWrites=true&w=majority
```

### With Special Characters (URL Encoded):
If your password is `P@ss#123`, encode it as:
```
mongodb+srv://portfoliouser:P%40ss%23123@cluster0.abc123.mongodb.net/portfolio?retryWrites=true&w=majority
```

URL Encoding Reference:
- `@` → `%40`
- `#` → `%23`
- `%` → `%25`
- `/` → `%2F`
- `:` → `%3A`

## Environment Variable Checklist

Before deploying, verify you have:

- [ ] MongoDB Atlas cluster created
- [ ] Database user created with password
- [ ] Network access configured (0.0.0.0/0)
- [ ] Connection string copied and password replaced
- [ ] JWT_SECRET generated (64+ chars)
- [ ] Cloudinary account created and credentials obtained
- [ ] All environment variables added to Render
- [ ] Frontend URL updated in CLIENT_URL

## Quick Reference Commands

### Generate JWT Secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Test MongoDB Connection Locally:
```bash
cd backend
node -e "require('dotenv').config(); require('./config/db')()"
```

### Seed Database:
```bash
npm run seed
```

Good luck with your deployment! 🚀
