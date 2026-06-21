# Render Environment Variables - Copy & Paste Guide

## 📋 Step-by-Step Instructions

1. Go to your Render service: https://dashboard.render.com
2. Click on your **portfolio-backend** service
3. Go to **Environment** tab in the left sidebar
4. Click **Add Environment Variable** for each variable below
5. Copy the **Key** and paste your actual **Value**

---

## 🔑 Environment Variables to Add

### 1. MONGODB_URI ⚠️ MOST IMPORTANT
**Key:** `MONGODB_URI`

**Value:** 
```
mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/portfolio?retryWrites=true&w=majority
```

**How to get this:**
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Click **Connect** on your cluster
3. Choose **Connect your application**
4. Copy the connection string
5. Replace `<password>` with your actual database password
6. Add `/portfolio` before the `?` to specify the database name

**Example:**
```
mongodb+srv://portfoliouser:MySecurePass123@cluster0.abc123.mongodb.net/portfolio?retryWrites=true&w=majority
```

---

### 2. JWT_SECRET
**Key:** `JWT_SECRET`

**Value:** Generate a random secret (run this in your terminal):
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the output and paste as the value.

**Example value:**
```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2g3h4i5j6k7l8m9n0o1p2q3r4
```

---

### 3. JWT_EXPIRE
**Key:** `JWT_EXPIRE`

**Value:**
```
7d
```

---

### 4. CLOUDINARY_CLOUD_NAME
**Key:** `CLOUDINARY_CLOUD_NAME`

**Value:** Get from [Cloudinary Dashboard](https://cloudinary.com/console)

Go to Cloudinary → Dashboard → Look for "Cloud name"

**Example:**
```
dab12cd3e
```

---

### 5. CLOUDINARY_API_KEY
**Key:** `CLOUDINARY_API_KEY`

**Value:** Get from [Cloudinary Dashboard](https://cloudinary.com/console)

Go to Cloudinary → Dashboard → Look for "API Key"

**Example:**
```
123456789012345
```

---

### 6. CLOUDINARY_API_SECRET
**Key:** `CLOUDINARY_API_SECRET`

**Value:** Get from [Cloudinary Dashboard](https://cloudinary.com/console)

Go to Cloudinary → Dashboard → Look for "API Secret" (click "Reveal" button)

**Example:**
```
abcdefghijklmnopqrstuvwxyz123456
```

---

### 7. ADMIN_EMAIL
**Key:** `ADMIN_EMAIL`

**Value:**
```
sisay3575@gmail.com
```

---

### 8. ADMIN_PASSWORD
**Key:** `ADMIN_PASSWORD`

**Value:**
```
Sis3575@
```

⚠️ **Important:** Change this to a stronger password in production!

---

### 9. CLIENT_URL
**Key:** `CLIENT_URL`

**Value:**
```
https://portfolio2-sigma-pink.vercel.app
```

This is your frontend URL. Update this when you deploy your frontend.

---

## ✅ Verification Checklist

After adding all environment variables:

- [ ] All 9 variables added
- [ ] `MONGODB_URI` has correct username and password
- [ ] `MONGODB_URI` includes `/portfolio` database name
- [ ] `JWT_SECRET` is at least 64 characters long
- [ ] Cloudinary credentials match your dashboard
- [ ] Clicked **Save** or they auto-saved
- [ ] Triggered manual redeploy if needed

---

## 🔄 After Adding Variables

1. **Render will automatically redeploy** when you save variables
2. Wait 2-3 minutes for deployment
3. Check the **Logs** tab
4. Look for "MongoDB Connected: cluster0.xxxxx.mongodb.net"
5. No "bad auth" error should appear

---

## 🆘 Troubleshooting

### Still getting "bad auth" error?

1. **Check password encoding**: If your password has special characters, URL encode them:
   - `@` becomes `%40`
   - `#` becomes `%23`
   - `%` becomes `%25`
   - `/` becomes `%2F`

   Example:
   - Password: `MyP@ss#123`
   - Encoded: `MyP%40ss%23123`
   - Full URL: `mongodb+srv://user:MyP%40ss%23123@cluster...`

2. **Verify MongoDB Atlas**:
   - Go to Database Access → Check user exists
   - Go to Network Access → Check `0.0.0.0/0` is allowed
   - Wait 5 minutes after creating user

3. **Test locally first**:
   - Update your local `backend/.env` with the Atlas connection string
   - Run `cd backend && npm run dev`
   - If it works locally, the string is correct

---

## 📝 Quick Copy Template

For easy copy-paste, prepare this in a text editor first:

```
MONGODB_URI=mongodb+srv://YOUR_USER:YOUR_PASS@cluster0.xxxxx.mongodb.net/portfolio?retryWrites=true&w=majority
JWT_SECRET=<generate with node command>
JWT_EXPIRE=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
ADMIN_EMAIL=sisay3575@gmail.com
ADMIN_PASSWORD=Sis3575@
CLIENT_URL=https://portfolio2-sigma-pink.vercel.app
```

Then add them one by one to Render.

---

## 🎯 What's Next?

After successful deployment:

1. Test health endpoint: `https://your-service.onrender.com/api/health`
2. Go to Render Shell and run: `npm run seed`
3. Test login with your admin credentials
4. Update frontend with new backend URL

Good luck! 🚀
