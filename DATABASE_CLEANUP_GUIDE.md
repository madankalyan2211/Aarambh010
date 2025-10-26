# Database Cleanup Guide

## 🗑️ Clear All Sample Data from MongoDB Atlas

This guide explains how to safely remove all test/sample data from your MongoDB Atlas database to free up storage space.

## ⚠️ Important Warning

**This operation is PERMANENT and IRREVERSIBLE!**

- All users will be deleted
- All courses will be deleted
- All assignments will be deleted
- All submissions will be deleted
- All discussions will be deleted
- All notifications will be deleted

**The database structure (collections) will remain intact**, ready for new data.

## 🚀 How to Clear Database

### Step 1: Run the Cleanup Script

```bash
cd server
npm run clear-db
```

### Step 2: Confirm Deletion

The script will show you:

```
🗑️  MongoDB Database Cleaner
════════════════════════════════════════════════════════════════════════════════

⚠️  WARNING: This will delete ALL data from your database!
Database: mongodb+srv://Aarambh01:****@aarambh.bozwgdv.mongodb.net/...
Database Name: aarambh-lms

Are you sure you want to delete ALL data? Type "YES" to confirm:
```

**Type:** `YES` (all caps)

### Step 3: Review What Will Be Deleted

```
📁 Found 6 collections:

   - users: 15 documents
   - courses: 5 documents
   - assignments: 8 documents
   - submissions: 12 documents
   - discussions: 3 documents
   - notifications: 20 documents

Type "DELETE" to permanently delete all this data:
```

**Type:** `DELETE` (all caps)

### Step 4: Confirmation

```
🗑️  Deleting data...

   ✅ Deleted 15 documents from users
   ✅ Deleted 5 documents from courses
   ✅ Deleted 8 documents from assignments
   ✅ Deleted 12 documents from submissions
   ✅ Deleted 3 documents from discussions
   ✅ Deleted 20 documents from notifications

════════════════════════════════════════════════════════════════════════════════

🎉 Successfully deleted 63 total documents!
💾 Database storage has been freed up.
📊 Collections remain intact (empty and ready for new data).

✅ Database connection closed.
```

## 🔒 Safety Features

### 1. Double Confirmation
- Requires typing "YES" first
- Then requires typing "DELETE"
- Prevents accidental deletion

### 2. Preview Before Delete
- Shows all collections
- Shows document counts
- Gives you a chance to cancel

### 3. No Structural Changes
- Collections are NOT deleted
- Database schema remains intact
- Only documents are removed

### 4. Easy to Cancel
- Type anything other than "YES" or "DELETE"
- Or press Ctrl+C at any time
- No data will be deleted

## 📊 What Gets Deleted

### Users Collection
```
Before: 15 users (students, teachers, admins)
After:  0 users (empty collection)
```

### Courses Collection
```
Before: 5 courses with enrollments
After:  0 courses (empty collection)
```

### Assignments Collection
```
Before: 8 assignments
After:  0 assignments (empty collection)
```

### And All Other Collections...
```
All data removed, collections remain for future use
```

## 💾 Storage Savings

MongoDB Atlas Free Tier includes:
- **512 MB storage** limit

After cleanup:
- ✅ All document storage freed
- ✅ Only schema definitions remain (< 1 KB)
- ✅ Ready for production data

## 🔄 After Cleanup

### Database is Ready For:

1. **Production Data**
   - Real student registrations
   - Actual course enrollments
   - Live assignments and submissions

2. **Fresh Start**
   - No test data
   - Clean database
   - Optimal storage usage

3. **New Development**
   - Test with fresh data
   - No conflicts with old data
   - Clean slate for testing

## 🧪 Alternative: Selective Deletion

If you want to keep some data and delete only specific collections:

### Delete Only Users
```bash
# In MongoDB Shell or Compass
use aarambh-lms
db.users.deleteMany({})
```

### Delete Only Test Users
```bash
# Delete users with test emails
db.users.deleteMany({ email: /test/i })
```

### Delete Users by Role
```bash
# Delete all students
db.users.deleteMany({ role: 'student' })
```

## 📝 Verify Cleanup

After running cleanup, verify it worked:

```bash
# View users (should be empty)
npm run view-users
```

Expected output:
```
📊 Total Users: 0

No users registered yet. Register your first user!
```

Or check in MongoDB Atlas:
1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Browse Collections
3. Select `aarambh-lms` database
4. All collections should show 0 documents

## 🚨 Troubleshooting

### Error: "Cannot find module"
```bash
cd server
npm install
```

### Error: "Authentication failed"
- Check `.env` file has correct MongoDB URI
- Verify credentials are correct

### Error: "Network timeout"
- Check internet connection
- Verify IP is whitelisted in MongoDB Atlas

## 🔐 Security Note

**The cleanup script:**
- ✅ Requires double confirmation
- ✅ Shows exactly what will be deleted
- ✅ Can be cancelled anytime
- ✅ Does NOT delete the database itself
- ✅ Does NOT delete collections
- ✅ Only removes documents (data)

## 📚 Related Commands

```bash
# View current users
npm run view-users

# Test database connection
npm run test-db

# Clear all data
npm run clear-db

# Start server
npm run dev
```

## 💡 Best Practices

### Before Production:
1. ✅ Clear all test data
2. ✅ Verify database is empty
3. ✅ Test registration flow
4. ✅ Ensure email verification works

### During Development:
- Keep test data separate
- Use different databases for dev/prod
- Regular cleanup of test data
- Monitor storage usage

### Production Database:
- NEVER run cleanup on production!
- Use different connection string
- Have backup strategy
- Monitor regularly

## 🎯 Summary

**To clear all sample data:**
```bash
cd server
npm run clear-db
```

**Results:**
- ✅ All test/sample data deleted
- ✅ Storage freed up
- ✅ Database ready for real data
- ✅ Collections intact

**Safety:**
- Requires typing "YES" and "DELETE"
- Shows preview before deletion
- Can be cancelled anytime
- No structural changes

Your MongoDB Atlas database will be clean and ready for production use! 🚀
