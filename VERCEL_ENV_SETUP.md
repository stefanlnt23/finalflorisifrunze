# Vercel Environment Variables Setup

## Required Environment Variables

You need to set the following environment variables in your Vercel project settings:

### 1. MONGODB_URI
This is required for your database connection. You need a MongoDB instance (MongoDB Atlas is recommended for production).

Example value:
```
mongodb+srv://username:password@cluster.mongodb.net/garden_services_db?retryWrites=true&w=majority
```

### 2. JWT_SECRET
This should be a strong, randomly generated secret key for JWT token signing.

Example value (generate your own!):
```
your-super-secret-jwt-key-change-this-in-production-123456789
```

### 3. JWT_EXPIRES_IN (Optional)
Token expiration time. Default is "24h" if not set.

Example value:
```
24h
```

## How to Set Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Go to "Settings" tab
4. Click on "Environment Variables" in the left sidebar
5. Add each variable:
   - Key: MONGODB_URI
   - Value: Your MongoDB connection string
   - Environment: Production, Preview, Development (select all)
6. Repeat for JWT_SECRET and JWT_EXPIRES_IN
7. Click "Save" for each variable

## Getting a MongoDB URI

If you don't have a MongoDB instance:

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster (free tier available)
4. Click "Connect" on your cluster
5. Choose "Connect your application"
6. Copy the connection string
7. Replace `<password>` with your database user password
8. Replace `myFirstDatabase` with `garden_services_db`

## After Setting Environment Variables

1. Redeploy your application on Vercel
2. The environment variables will be available to your serverless functions
3. Your admin login should work properly

## Testing

After setting up the environment variables and redeploying, try logging in again with your admin credentials.
