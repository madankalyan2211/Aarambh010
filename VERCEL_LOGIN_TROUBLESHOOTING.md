# Vercel Login Troubleshooting Guide

This guide helps resolve common Vercel login issues and provides best practices for deployment.

## Common Login Issues and Solutions

### 1. "Login Failed" Error

#### Problem
Vercel CLI reports login failure when trying to authenticate.

#### Solutions

**Check Current Login Status**:
```bash
vercel whoami
```

If you're already logged in, you don't need to log in again.

**Force Re-login**:
```bash
vercel logout
vercel login
```

**Use Browser-Based Authentication**:
1. Run `vercel login`
2. Visit the provided URL (e.g., vercel.com/device)
3. Enter the code shown in your terminal
4. Complete authentication in browser

### 2. Authentication Hangs

#### Problem
The login process hangs or doesn't complete.

#### Solutions

**Use Non-Interactive Mode**:
```bash
vercel login --token=<your-vercel-token>
```

**Check Internet Connection**:
- Ensure you have stable internet access
- Check if corporate firewall is blocking Vercel domains

### 3. Multiple Account Issues

#### Problem
You have multiple Vercel accounts and are logged into the wrong one.

#### Solutions

**Check Current Account**:
```bash
vercel whoami
```

**Switch Accounts**:
```bash
vercel logout
vercel login
# Log in with the correct account
```

## Deployment Commands

### Development Deployment
```bash
# Deploy to a preview URL
vercel

# Deploy without confirmation prompts
vercel --yes
```

### Production Deployment
```bash
# Deploy to production
vercel --prod

# Deploy to production without confirmation
vercel --prod --yes
```

## Best Practices

### 1. Authentication
- Keep your Vercel CLI updated
- Use personal access tokens for automated deployments
- Log out from shared computers

### 2. Deployment
- Always test with preview deployments first
- Use `--yes` flag in automated scripts to avoid hangs
- Check deployment logs for issues

### 3. Configuration
- Keep [vercel.json](file:///Users/madanthambisetty/Downloads/Aarambh/vercel.json) up to date
- Use environment variables for sensitive data
- Test configuration changes locally

## Environment Variables

Set environment variables in Vercel dashboard rather than hardcoding them:

```bash
# In Vercel dashboard, set:
VITE_API_BASE_URL=https://your-render-app.onrender.com/api
VITE_APP_ENV=production
```

## Troubleshooting Steps

### 1. Verify Installation
```bash
vercel --version
```

### 2. Check Login Status
```bash
vercel whoami
```

### 3. Test Configuration
```bash
# Test build locally
npm run build

# Validate vercel.json
vercel --help
```

### 4. Clear Cache
```bash
# Clear Vercel cache
rm -rf .vercel
```

### 5. Re-authenticate
```bash
vercel logout
vercel login
```

## Common Error Messages

### "Not authorized to access project"
- Ensure you're logged into the correct account
- Check project permissions in Vercel dashboard
- Verify you have access to the GitHub repository

### "Build failed"
- Check build logs in Vercel dashboard
- Test build locally with `npm run build`
- Verify all dependencies are in package.json

### "Command not found"
- Ensure Vercel CLI is installed
- Check PATH environment variable
- Reinstall Vercel CLI if needed

## Useful Commands

```bash
# Check Vercel CLI version
vercel --version

# Check login status
vercel whoami

# View project settings
vercel inspect

# View deployment logs
vercel logs

# List deployments
vercel list

# Redeploy
vercel deploy --prebuilt
```

## Security Considerations

1. **Never commit tokens** to version control
2. **Use personal access tokens** for CI/CD
3. **Regularly rotate tokens** for security
4. **Limit token scopes** to minimum required permissions

## Contact Support

If you continue to experience issues:

1. **Vercel Documentation**: https://vercel.com/docs
2. **Vercel Community**: https://github.com/vercel/community
3. **Support**: https://vercel.com/support

## Resources

- [Vercel CLI Documentation](https://vercel.com/docs/cli)
- [Project Configuration](vercel.json)
- [Deployment Guide](VERCEL_DEPLOYMENT_GUIDE.md)