# MongoDB Connection Test

## 🧪 Quick Test

After setting up your `MONGODB_URI` in `.env.local`, test the connection:

1. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm run dev
   ```

3. **Test the connection** by visiting:
   ```
   http://localhost:3000/api/test-db
   ```

## ✅ Expected Success Response

If MongoDB is connected properly, you should see:

```json
{
  "success": true,
  "message": "MongoDB connection successful",
  "details": {
    "readyState": 1,
    "databaseName": "tallybeam",
    "host": "cluster0.xxx.mongodb.net",
    "port": 27017
  }
}
```

## ❌ Common Error Messages

### "Please define the MONGODB_URI environment variable"
- Add `MONGODB_URI` to your `.env.local` file
- Restart your development server

### "MongoNetworkError" or connection timeout
- Check your internet connection
- Verify MongoDB Atlas IP whitelist (if using Atlas)
- Confirm the connection string format

### "Authentication failed"
- Verify username and password in connection string
- Check database user permissions in MongoDB Atlas

## 🔍 Server Logs

Watch your terminal for these logs:

**Success:**
```
🔍 Testing MongoDB connection...
✅ MongoDB connected successfully
📊 Connection state: 1
🏷️ Database name: tallybeam
```

**Failure:**
```
🔍 Testing MongoDB connection...
❌ MongoDB connection failed: [error details]
```

Once this test passes, your MongoDB connection is ready for invoice storage! 