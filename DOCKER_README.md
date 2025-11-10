# Docker Deployment Guide

## Files Created

✅ **Dockerfile** - Multi-stage Docker build configuration
✅ **.dockerignore** - Files to exclude from Docker build
✅ **docker-compose.yml** - Docker Compose configuration
✅ **.env.production** - Production environment variables
✅ **next.config.ts** - Updated with `output: 'standalone'`

## Build and Run

### Option 1: Using Docker directly

**Build the image:**
```bash
docker build -t basalam-product-tool .
```

**Run the container:**
```bash
docker run -p 3000:3000 basalam-product-tool
```

### Option 2: Using Docker Compose (Recommended)

**Build and run:**
```bash
docker-compose up --build
```

**Run in background:**
```bash
docker-compose up -d
```

**Stop the container:**
```bash
docker-compose down
```

## Access the Application

Once running, access the application at:
```
http://localhost:3000
```

## Deployment to Hamravesh Darkube

### Step 1: Push to Docker Registry

**Login to Hamravesh registry:**
```bash
docker login hamdocker.ir
```

**Tag your image:**
```bash
docker tag basalam-product-tool hamdocker.ir/YOUR_USERNAME/basalam-product-tool:latest
```

**Push to registry:**
```bash
docker push hamdocker.ir/YOUR_USERNAME/basalam-product-tool:latest
```

### Step 2: Deploy on Darkube

1. Go to https://console.hamravesh.com/darkube/create
2. Choose "Docker Image" as deployment method
3. Enter your image: `hamdocker.ir/YOUR_USERNAME/basalam-product-tool:latest`
4. Set port: `3000`
5. Configure resources (CPU, Memory)
6. Click "Deploy"

## Environment Variables

Update `.env.production` with your production values:
```env
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

## Dockerfile Stages

1. **deps** - Installs dependencies
2. **builder** - Builds the Next.js application
3. **runner** - Creates minimal production image

## Image Size Optimization

The multi-stage build ensures:
- ✅ Small final image size (~150MB)
- ✅ Only production dependencies included
- ✅ Non-root user for security
- ✅ Optimized layer caching

## Troubleshooting

**Port already in use:**
```bash
# Change port in docker-compose.yml or use:
docker run -p 8080:3000 basalam-product-tool
```

**Build fails:**
```bash
# Clean build
docker-compose down -v
docker-compose build --no-cache
```

**Check logs:**
```bash
docker-compose logs -f
```
