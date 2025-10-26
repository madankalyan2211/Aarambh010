# MongoDB Atlas Connection Troubleshooting Guide

This guide helps resolve common MongoDB Atlas connection issues, particularly the "Could not connect to any servers in your MongoDB Atlas cluster" error.

## Common Causes and Solutions

### 1. IP Whitelist Issues

#### Problem
MongoDB Atlas restricts connections to only whitelisted IP addresses for security.

#### Solutions

**For Local Development:**
1. Go to [MongoDB Atlas Dashboard](https://cloud.mongodb.com)
2. Navigate to your cluster
3. Go to "Network Access" in the left sidebar
4. Click "Add IP Address"
5. Add your current IP address (Atlas usually detects it automatically)
6. Or add `0.0.0.0/0` temporarily for testing (NOT recommended for production)

**For Render Deployment:**
1. For testing, add `0.0.0.0/0` to your IP whitelist
2. For production, use Render's static IP addresses if available

**For Vercel Deployment:**
1. Add `0.0.0.0/0` to your IP whitelist for testing
2. Note that Vercel uses dynamic IP addresses

### 2. Connection String Issues

#### Problem
Incorrect connection string format or credentials.

#### Solutions
1. Verify your connection string format:
   ```
   mongodb+srv://<username>:<password>@<cluster-url>/<database>?<options>
   ```

2. Check that your username and password are correct:
   - Username should NOT include the database name
   - Password should be URL-encoded (special characters replaced)

3. Test your connection string with MongoDB Compass or mongosh:
   ```bash
   mongosh "mongodb+srv://<username>:<password>@<cluster-url>/<database>"
   ```

### 3. Network Issues

#### Problem
Firewall or network restrictions blocking the connection.

#### Solutions
1. Check if your network allows outbound connections on port 27017
2. Try connecting from a different network (mobile hotspot)
3. Check if you're behind a corporate firewall

### 4. Cluster Issues

#### Problem
Your MongoDB cluster might be paused or experiencing issues.

#### Solutions
1. Check your cluster status in MongoDB Atlas dashboard
2. Resume a paused cluster if needed
3. Check MongoDB status page for service interruptions

## Testing Your Connection

### 1. Using the Test Script
```bash
cd server
npm run test-mongodb
```

### 2. Using mongosh (MongoDB Shell)
```bash
# Install mongosh if not already installed
npm install -g mongosh

# Connect using your connection string
mongosh "mongodb+srv://Aarambh01:Aarambh143$@aarambh.bozwgdv.mongodb.net/aarambh-lms?retryWrites=true&w=majority"
```

### 3. Manual IP Whitelist Check
1. Visit [https://www.whatismyip.com/](https://www.whatismyip.com/) to get your current IP
2. Add this IP to your MongoDB Atlas whitelist

## Best Practices for Production

### 1. Security
- Never use `0.0.0.0/0` in production
- Use strong, unique passwords
- Enable MongoDB Atlas encryption at rest
- Regularly rotate credentials

### 2. Connection Management
- Use connection pooling
- Implement proper error handling
- Set appropriate timeout values
- Monitor connection health

### 3. Monitoring
- Enable MongoDB Atlas alerts
- Monitor connection metrics
- Set up logging for connection issues

## Environment Variables

Make sure your environment variables are correctly set:

### Backend (.env file)
```env
MONGODB_URI=mongodb+srv://Aarambh01:Aarambh143$@aarambh.bozwgdv.mongodb.net/aarambh-lms?retryWrites=true&w=majority&appName=Aarambh
```

### For Render Deployment
Set this in your Render dashboard:
- Key: `MONGODB_URI`
- Value: `mongodb+srv://Aarambh01:Aarambh143$@aarambh.bozwgdv.mongodb.net/aarambh-lms?retryWrites=true&w=majority&appName=Aarambh`

## Common Error Messages and Solutions

### "MongoServerSelectionError: connection timed out"
- Add your IP to the whitelist
- Check if your network allows outbound connections
- Verify the cluster is running

### "Authentication failed"
- Check username and password
- Ensure the user exists in the database
- Verify the user has proper permissions

### "getaddrinfo ENOTFOUND"
- Check your cluster URL
- Verify you have internet connectivity
- Ensure DNS is working properly

## Contact Support

If you continue to experience issues:

1. **MongoDB Atlas Support**:
   - Visit https://www.mongodb.com/cloud/atlas
   - Check their documentation at https://docs.atlas.mongodb.com/
   - Submit a support ticket if you have a paid plan

2. **Community Resources**:
   - MongoDB Community Forums
   - Stack Overflow MongoDB tag

## Additional Resources

- [MongoDB Atlas Security Documentation](https://docs.atlas.mongodb.com/security/)
- [MongoDB Connection Troubleshooting](https://docs.mongodb.com/manual/tutorial/troubleshoot-connectivity/)
- [Network Access Configuration](https://docs.atlas.mongodb.com/security-whitelist/)