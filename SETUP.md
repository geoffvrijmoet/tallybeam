# TallyBeam Setup Guide

## 🚀 Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up Environment Variables**
   - Get Gemini AI API Key from [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Set up MongoDB (see MongoDB Setup section below)
   - Create a `.env.local` file in this directory:
   ```bash
   # AI Configuration
   GEMINI_API_KEY=your_actual_api_key_here
   
   # Database Configuration
   MONGODB_URI=your_mongodb_connection_string
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Test AI Parsing**
   - Open http://localhost:3000
   - Type something like: "John Smith $500 web design"
   - Watch for server logs in your terminal showing AI parsing activity

## 🗄️ MongoDB Setup

### Option 1: MongoDB Atlas (Cloud - Recommended)
1. **Create a MongoDB Atlas account** at [mongodb.com](https://www.mongodb.com/atlas)
2. **Create a new cluster** (free tier available)
3. **Get connection string**:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Example: `mongodb+srv://username:password@cluster0.xxx.mongodb.net/tallybeam?retryWrites=true&w=majority`

### Option 2: Local MongoDB
1. **Install MongoDB** locally from [mongodb.com/try/download/community](https://www.mongodb.com/try/download/community)
2. **Start MongoDB** service
3. **Use local connection string**: `mongodb://localhost:27017/tallybeam`

### Database Features
- **Invoice storage**: All created invoices are automatically saved
- **Client history**: Track invoices by client name
- **Payment tracking**: Monitor invoice status and payments
- **Search & filtering**: Find invoices by date, client, or amount

## 🔧 Troubleshooting

### "Check your environment variables" error
- Make sure `.env.local` exists in the project root
- Verify your `GEMINI_API_KEY` is correct
- Restart your dev server after adding the environment file

### No server logs when typing
- This means the client isn't reaching the server API
- Check browser console for errors
- Ensure you're typing at least 5 characters

### MongoDB connection errors
- Make sure your `MONGODB_URI` is correct in `.env.local`
- For Atlas: Ensure your IP address is whitelisted
- For local: Ensure MongoDB service is running
- Check the database name in your connection string

### Expected Server Logs
When typing, you should see:
```
🤖 AI Parsing request received: John Smith $500 web...
✅ AI Parsing successful: { clientName: 'John Smith', amount: 500, confidence: 0.9 }
```

## 📁 File Structure
```
scaffolds/tallybeam/
├── .env.local          # Your environment variables (create this)
├── app/
│   ├── page.tsx        # Main UI
│   └── api/
│       ├── parse/      # AI parsing endpoint
│       └── invoices/   # Invoice CRUD operations
├── lib/
│   ├── db.ts           # MongoDB connection (Mongoose)
│   ├── mongodb.ts      # Alternative MongoDB connection (native driver)
│   └── services/ai.ts  # AI logic
└── components/
    └── InvoicePreview.tsx  # Invoice preview component
``` 