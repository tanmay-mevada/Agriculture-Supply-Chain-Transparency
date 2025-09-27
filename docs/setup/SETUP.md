# Setup Guide

This guide provides detailed instructions for setting up the Agriculture Supply Chain Transparency Platform on different environments.

## 🎯 Prerequisites

### System Requirements
- **CPU**: 4+ cores
- **RAM**: 8GB+ (16GB recommended)
- **Storage**: 50GB+ free space
- **OS**: Linux, macOS, or Windows with WSL2

### Software Requirements
- **Docker** >= 20.x
- **Docker Compose** >= 2.x
- **Node.js** >= 18.x
- **npm** >= 9.x
- **Go** >= 1.21
- **Flutter** >= 3.x
- **Git**

## 🐧 Linux/macOS Setup

### 1. Install Prerequisites
```bash
# Update system
sudo apt update && sudo apt upgrade -y  # Ubuntu/Debian
# brew update && brew upgrade            # macOS

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Go
wget https://go.dev/dl/go1.21.5.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.21.5.linux-amd64.tar.gz
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
source ~/.bashrc

# Install Flutter
git clone https://github.com/flutter/flutter.git -b stable ~/flutter
echo 'export PATH="$PATH:~/flutter/bin"' >> ~/.bashrc
source ~/.bashrc
flutter doctor --android-licenses
```

### 2. Clone and Setup Repository
```bash
# Clone repository
git clone https://github.com/tanmay-mevada/Agriculture-Supply-Chain-Transparency-.git
cd Agriculture-Supply-Chain-Transparency-

# Make scripts executable
chmod +x scripts/*.sh

# Setup environment
./scripts/setup-environment.sh
```

## 🪟 Windows Setup

### 1. Install WSL2
```powershell
# Run as Administrator
wsl --install
# Restart computer
```

### 2. Install Prerequisites in WSL2
```bash
# Update WSL2
sudo apt update && sudo apt upgrade -y

# Install Docker Desktop for Windows (with WSL2 backend)
# Download from: https://www.docker.com/products/docker-desktop

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Go
wget https://go.dev/dl/go1.21.5.linux-amd64.tar.gz
sudo tar -C /usr/local -xzf go1.21.5.linux-amd64.tar.gz
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc

# Install Flutter
git clone https://github.com/flutter/flutter.git -b stable ~/flutter
echo 'export PATH="$PATH:~/flutter/bin"' >> ~/.bashrc
source ~/.bashrc
```

## 🔧 Environment Configuration

### 1. Create Environment Files
```bash
# Main environment file
cp .env.example .env

# Backend environment
cp backend/.env.example backend/.env

# Web environment
cp web/.env.example web/.env

# Storage environment
cp storage/.env.example storage/.env
```

### 2. Configure Environment Variables
Edit `.env` files with appropriate values:

```bash
# .env
NETWORK_NAME=agri-network
COMPOSE_PROJECT_NAME=agri-supply-chain

# Backend environment
NODE_ENV=development
PORT=3000
JWT_SECRET=your-jwt-secret-here
FABRIC_WALLET_PATH=./wallet
FABRIC_USER_ID=appUser
FABRIC_CHANNEL_NAME=agri-channel
FABRIC_CHAINCODE_NAME=agri-chaincode

# Storage environment
IPFS_HOST=localhost
IPFS_PORT=5001
IPFS_PROTOCOL=http

# Web environment
REACT_APP_API_URL=http://localhost:3000/api/v1
REACT_APP_IPFS_URL=http://localhost:5002
```

## 🏗️ Network Setup

### 1. Start Hyperledger Fabric Network
```bash
cd deployment/docker-compose

# Start the network
docker-compose up -d

# Wait for services to be ready
./scripts/wait-for-services.sh

# Check network status
docker-compose ps
```

### 2. Deploy Smart Contracts
```bash
# Package chaincode
./scripts/package-chaincode.sh

# Install chaincode on peers
./scripts/install-chaincode.sh

# Approve chaincode definition
./scripts/approve-chaincode.sh

# Commit chaincode definition
./scripts/commit-chaincode.sh

# Initialize ledger
./scripts/init-ledger.sh
```

### 3. Setup Network Identities
```bash
# Create user identities
./scripts/create-identities.sh

# Generate connection profiles
./scripts/generate-connection-profiles.sh
```

## 🚀 Application Setup

### 1. Backend API
```bash
cd backend

# Install dependencies
npm install

# Initialize Fabric SDK
npm run fabric:init

# Start development server
npm run dev

# Verify API is running
curl http://localhost:3000/health
```

### 2. Web Dashboard
```bash
cd web

# Install dependencies
npm install

# Start development server
npm start

# Application will open at http://localhost:3001
```

### 3. Mobile Application
```bash
cd mobile

# Get Flutter dependencies
flutter pub get

# Run on Android emulator/device
flutter run

# Or build APK
flutter build apk
```

### 4. Storage Service
```bash
cd storage

# Install dependencies
npm install

# Start IPFS storage service
npm run dev

# Verify IPFS service
curl http://localhost:5002/health
```

## 📱 Mobile App Setup

### Android Setup
```bash
# Accept Android licenses
flutter doctor --android-licenses

# Create Android app
flutter create --platforms android .

# Configure Android permissions in android/app/src/main/AndroidManifest.xml
```

### iOS Setup
```bash
# Install CocoaPods
sudo gem install cocoapods

# Create iOS app
flutter create --platforms ios .

# Install iOS dependencies
cd ios && pod install
```

## 🧪 Testing Setup

### 1. Run Smart Contract Tests
```bash
cd contracts
go mod tidy
go test ./...
```

### 2. Run Backend Tests
```bash
cd backend
npm test
```

### 3. Run Frontend Tests
```bash
cd web
npm test
```

### 4. Run Mobile Tests
```bash
cd mobile
flutter test
```

## 🐳 Docker Development

### 1. Build All Services
```bash
# Build all Docker images
./scripts/build-all.sh

# Or build individually
docker build -t agri-backend ./backend
docker build -t agri-web ./web
docker build -t agri-storage ./storage
```

### 2. Development with Docker
```bash
# Start development environment
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose logs -f backend
```

## 🔍 Verification

### 1. Network Health Check
```bash
# Check all services
./scripts/health-check.sh

# Expected output:
# ✅ Orderer: Running
# ✅ Peer0-Org1: Running  
# ✅ Peer0-Org2: Running
# ✅ CA-Org1: Running
# ✅ CA-Org2: Running
# ✅ IPFS: Running
```

### 2. API Testing
```bash
# Test backend API
curl http://localhost:3000/health

# Test storage service
curl http://localhost:5002/health

# Test chaincode
./scripts/test-chaincode.sh
```

### 3. End-to-End Testing
```bash
# Run E2E tests
./scripts/e2e-tests.sh
```

## 🏭 Production Setup

### 1. Environment Preparation
```bash
# Copy production configs
cp .env.production .env

# Update configuration for production
# - Change default passwords
# - Configure TLS certificates
# - Set up monitoring
```

### 2. Security Configuration
```bash
# Generate production certificates
./scripts/generate-production-certs.sh

# Configure firewall rules
sudo ufw enable
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw allow 7050  # Orderer
sudo ufw allow 7051  # Peer
```

### 3. Production Deployment
```bash
# Deploy to production
docker-compose -f docker-compose.prod.yml up -d

# Configure reverse proxy (nginx)
sudo apt install nginx
sudo cp configs/nginx.conf /etc/nginx/sites-available/agri-supply-chain
sudo ln -s /etc/nginx/sites-available/agri-supply-chain /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```

## 🔧 Troubleshooting

### Common Issues

1. **Docker permission denied**
   ```bash
   sudo usermod -aG docker $USER
   newgrp docker
   ```

2. **Port already in use**
   ```bash
   sudo lsof -i :7050
   sudo kill -9 <PID>
   ```

3. **Flutter doctor issues**
   ```bash
   flutter doctor
   flutter doctor --android-licenses
   ```

4. **Go module issues**
   ```bash
   go clean -modcache
   go mod download
   ```

5. **Node.js version issues**
   ```bash
   nvm install 18
   nvm use 18
   ```

### Log Locations
- Fabric logs: `docker-compose logs <service-name>`
- Backend logs: `backend/logs/`
- IPFS logs: `storage/logs/`
- Web logs: Browser console

### Getting Help
- Check [Troubleshooting Guide](../troubleshooting/README.md)
- Review [FAQ](../FAQ.md)
- Create an issue on GitHub

## 🎉 Next Steps

After successful setup:

1. **Explore the Dashboard**: Open http://localhost:3001
2. **Test Mobile App**: Use QR scanner functionality
3. **Create Test Data**: Use the API to create sample products
4. **Review Documentation**: Check API docs and user guides
5. **Customize**: Modify configurations for your use case

## 📚 Additional Resources

- [Architecture Documentation](../architecture/README.md)
- [API Reference](../api/README.md)
- [Deployment Guide](../deployment/README.md)
- [User Guide](../guides/README.md)