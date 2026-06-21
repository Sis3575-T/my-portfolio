# MongoDB Atlas Setup Guide - Step by Step

## 🎯 Goal
Get your MongoDB Atlas connection string to use on Render.

---

## Step 1: Create MongoDB Atlas Account

1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up with email or Google
3. Complete verification

---

## Step 2: Create a FREE Cluster

1. After login, click **Build a Database**
2. Choose **FREE** (M0 - Free forever)
3. Cloud Provider: **AWS** (recommended)
4. Region: Choose closest to your location or **us-east-1** (common)
5. Cluster Name: Keep default or name it `portfolio-cluster`
6. Click **Create Cluster**
7. ⏰ **Wait 3-5 minutes** for cluster creation

---

## Step 3: Create Database User (IMPORTANT!)

1. Look for **Database Access** in left sidebar
2. Click **ADD NEW DATABASE USER**
3. Fill in:
   - **Authentication Method:** Password
   - **Username:** `portfoliouser` (you can choose any name)
   - **Password:** Click **Autogenerate Secure Password** OR create your own
   - **⚠️ SAVE THIS PASSWORD SOMEWHERE SAFE!**
   
4. **Database User Privileges:**
   - Select: **Built-in Role**
   - Choose: **Read and write to any database**
   
5. Click **Add User**
6. ✅ User created! Remember the username and password.

### Example:
```
Username: portfoliouser
Password: AbC123XyZ789!@#
```

---

## Step 4: Configure Network Access

1. Click **Network Access** in left sidebar
2. Click **ADD IP ADDRESS**
3. Click **ALLOW ACCESS FROM ANYWHERE**
   - This adds `0.0.0.0/0` (allows all IPs)
   - ⚠️ This is necessary for Render to connect
4. Click **Confirm**
5. ✅ Network configured!

---

## Step 5: Get Connection String

1. Click **Database** in left sidebar
2. You should see your cluster (e.g., `portfolio-cluster`)
3. Click the **Connect** button
4. Choose **Drivers** (or "Connect your application")
5. Select:
   - **Driver:** Node.js
   - **Version:** 4.1 or later
6. Copy the connection string

### What You'll See:
```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

---

## Step 6: Customize Connection String

**Original (from Atlas):**
```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

**Replace `<username>` with your actual username:**
```
mongodb+srv://portfoliouser:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

**Replace `<password>` with your actual password:**
```
mongodb+srv://portfoliouser:AbC123XyZ789!@#@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

**Add `/portfolio` database name before the `?`:**
```
mongodb+srv://portfoliouser:AbC123XyZ789!@#@cluster0.xxxxx.mongodb.net/portfolio?retryWrites=true&w=majority
```

✅ **This is your final connection string!**

---

## ⚠️ Special Characters in Password

If your password contains special characters, you need to **URL encode** them:

| Character | Encoded | Example |
|-----------|---------|---------|
| `@` | `%40` | `P@ss` → `P%40ss` |
| `#` | `%23` | `Pass#123` → `Pass%23123` |
| `%` | `%25` | `Pa%ss` → `Pa%25ss` |
| `/` | `%2F` | `Pass/123` → `Pass%2F123` |
| `:` | `%3A` | `Pa:ss` → `Pa%3Ass` |
| `?` | `%3F` | `Pass?` → `Pass%3F` |

### Example:
```
Password: MyP@ss#123
Encoded:  MyP%40ss%23123

Connection String:
mongodb+srv://portfoliouser:MyP%40ss%23123@cluster0.xxxxx.mongodb.net/portfolio?retryWrites=true&w=majority
```

---

## Step 7: Test Connection Locally (Optional but Recommended)

Before using on Render, test locally:

1. Open `backend/.env`
2. Replace `MONGODB_URI` with your Atlas connection string:
   ```env
   MONGODB_URI=mongodb+srv://portfoliouser:password@cluster0.xxxxx.mongodb.net/portfolio?retryWrites=true&w=majority
   ```
3. Run your backend:
   ```bash
   cd backend
   npm run dev
   ```
4. If you see "MongoDB Connected: cluster0.xxxxx.mongodb.net" → ✅ Success!
5. If error → Check username, password, network access

---

## Step 8: Use on Render

Now that you have your connection string:

1. Go to Render Dashboard: https://dashboard.render.com
2. Click your service
3. Go to **Environment** tab
4. Add new variable:
   - **Key:** `MONGODB_URI`
   - **Value:** Your Atlas connection string
5. Save (Render will auto-redeploy)

---

## 📝 Common Mistakes

### ❌ Mistake 1: Forgot to replace `<password>`
```
mongodb+srv://portfoliouser:<password>@cluster...
```
Should be:
```
mongodb+srv://portfoliouser:ActualPassword123@cluster...
```

### ❌ Mistake 2: Forgot to add `/portfolio` database name
```
mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true
```
Should be:
```
mongodb+srv://user:pass@cluster.mongodb.net/portfolio?retryWrites=true
```

### ❌ Mistake 3: Special characters not encoded
```
mongodb+srv://user:P@ss#123@cluster.mongodb.net/portfolio
```
Should be:
```
mongodb+srv://user:P%40ss%23123@cluster.mongodb.net/portfolio
```

### ❌ Mistake 4: Wrong user privileges
- Make sure user has **"Read and write to any database"**
- Not just "Read only"

### ❌ Mistake 5: Network access not configured
- Must allow `0.0.0.0/0` (anywhere)
- Or add Render's IP addresses specifically

---

## ✅ Final Checklist

Before moving on, verify:

- [ ] MongoDB Atlas cluster created and running (green status)
- [ ] Database user created with username and password
- [ ] User has "Read and write to any database" privileges
- [ ] Network access allows `0.0.0.0/0`
- [ ] Connection string copied
- [ ] `<username>` replaced with actual username
- [ ] `<password>` replaced with actual password
- [ ] Special characters in password are URL encoded (if any)
- [ ] `/portfolio` added before the `?` in the connection string
- [ ] Tested locally (optional but recommended)
- [ ] Ready to add to Render environment variables

---

## 🎯 Your Connection String Template

Fill this out:

```
mongodb+srv://[YOUR_USERNAME]:[YOUR_PASSWORD]@[YOUR_CLUSTER].mongodb.net/portfolio?retryWrites=true&w=majority
```

Example filled:
```
mongodb+srv://portfoliouser:SecurePass123@cluster0.abc123.mongodb.net/portfolio?retryWrites=true&w=majority
```

---

## 🆘 Troubleshooting

### Can't create cluster?
- Make sure you selected FREE tier (M0)
- Try different region if one doesn't work

### "User already exists" error?
- Go to Database Access
- Delete existing user or use different username

### Can't connect after everything?
- Wait 5-10 minutes after creating user (propagation time)
- Double-check password is correct
- Verify network access is set to `0.0.0.0/0`
- Try testing locally first

### Connection string doesn't work?
- Copy a fresh one from Atlas (Connect → Drivers)
- Make sure no extra spaces in the string
- Verify the format matches examples above

---

## 📞 MongoDB Atlas Support

If you're stuck:
- MongoDB Docs: https://docs.atlas.mongodb.com/
- Community Forums: https://www.mongodb.com/community/forums/
- Video Tutorials: Search YouTube for "MongoDB Atlas setup"

---

## 🎉 Next Step

Once you have your connection string:
👉 Go to **RENDER_FIX_NOW.md** and add it to Render!

Good luck! 🚀
