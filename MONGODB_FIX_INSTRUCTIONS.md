# MongoDB Connection Fix Instructions

## Issue Identified
The backend server is failing to connect to MongoDB Atlas with the error:
```
Could not connect to any servers in your MongoDB Atlas cluster. One common reason is that you're trying to access the database from an IP that isn't whitelisted.
```

## Current IP Address
Your current public IP address is: `49.37.156.230`

## Solution Steps

### Option 1: Add Your Current IP to MongoDB Atlas Whitelist (Recommended)

1. Go to MongoDB Atlas Dashboard:
   - Visit https://cloud.mongodb.com
   - Log in with your credentials

2. Navigate to Network Access:
   - In the left sidebar, click on "Network Access" under the "Security" section

3. Add Your Current IP:
   - Click the "Add IP Address" button
   - Select "Add Current IP Address" (Atlas should auto-detect it as 49.37.156.230)
   - Add a comment like "Development Machine"
   - Click "Confirm"

### Option 2: Allow All IPs (Temporary Solution for Development Only)

⚠️ **WARNING**: This is not recommended for production environments as it creates a security risk.

1. Go to MongoDB Atlas Dashboard:
   - Visit https://cloud.mongodb.com
   - Log in with your credentials

2. Navigate to Network Access:
   - In the left sidebar, click on "Network Access" under the "Security" section

3. Add All IPs:
   - Click the "Add IP Address" button
   - Enter `0.0.0.0/0` in the IP Address field
   - Add a comment like "Temporary - Allow All IPs"
   - Click "Confirm"

## After Updating Whitelist

Once you've updated the whitelist, restart both servers:

1. Start the backend server:
   ```bash
   cd /Users/madanthambisetty/Downloads/Aarambh/server
   npm start
   ```

2. In a new terminal, start the frontend server:
   ```bash
   cd /Users/madanthambisetty/Downloads/Aarambh
   npm run dev
   ```

## Verification

After both servers are running:

1. Check that the backend connects to MongoDB successfully
2. Visit the frontend at http://localhost:5174 (or the port shown in the terminal)
3. Try logging in to verify the connection works

## Security Recommendations

1. After development, remove the `0.0.0.0/0` entry if you added it
2. Only keep specific IP addresses that you actually need
3. Regularly review and update your IP whitelist
4. For production deployments, use proper security measures

## Additional Resources

- MongoDB Atlas Network Access Documentation: https://docs.atlas.mongodb.com/security-whitelist/
- MongoDB Security Documentation: https://docs.mongodb.com/manual/security/