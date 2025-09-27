const { Gateway, Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const fs = require('fs');

class FabricService {
  constructor() {
    this.gateway = null;
    this.network = null;
    this.contract = null;
    this.channelName = 'agri-channel';
    this.chaincodeName = 'agri-chaincode';
  }

  async initialize() {
    try {
      // Load connection profile
      const ccpPath = path.resolve(__dirname, '../../config/connection-org1.json');
      const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

      // Create a new file system based wallet for managing identities
      const walletPath = path.join(process.cwd(), 'wallet');
      const wallet = await Wallets.newFileSystemWallet(walletPath);

      // Check if user identity exists in wallet
      const userIdentity = await wallet.get('appUser');
      if (!userIdentity) {
        console.log('An identity for the user "appUser" does not exist in the wallet');
        console.log('Run the registerUser.js application before retrying');
        throw new Error('User identity not found in wallet');
      }

      // Create a new gateway for connecting to peer node
      this.gateway = new Gateway();
      await this.gateway.connect(ccp, {
        wallet,
        identity: 'appUser',
        discovery: { enabled: true, asLocalhost: true }
      });

      // Get the network (channel) our contract is deployed to
      this.network = await this.gateway.getNetwork(this.channelName);

      // Get the contract from the network
      this.contract = this.network.getContract(this.chaincodeName);

      console.log('Fabric service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Fabric service:', error);
      throw error;
    }
  }

  async createProduct(productData) {
    try {
      const result = await this.contract.submitTransaction('CreateProduct', JSON.stringify(productData));
      return JSON.parse(result.toString());
    } catch (error) {
      console.error('Failed to create product:', error);
      throw error;
    }
  }

  async getProduct(productId) {
    try {
      const result = await this.contract.evaluateTransaction('GetProduct', productId);
      return JSON.parse(result.toString());
    } catch (error) {
      console.error(`Failed to get product ${productId}:`, error);
      throw error;
    }
  }

  async updateProductStatus(productId, status, location, actor) {
    try {
      const result = await this.contract.submitTransaction(
        'UpdateProductStatus',
        productId,
        status,
        JSON.stringify(location),
        actor
      );
      return JSON.parse(result.toString());
    } catch (error) {
      console.error('Failed to update product status:', error);
      throw error;
    }
  }

  async addSupplyChainStep(productId, stepData) {
    try {
      const result = await this.contract.submitTransaction(
        'AddSupplyChainStep',
        productId,
        JSON.stringify(stepData)
      );
      return JSON.parse(result.toString());
    } catch (error) {
      console.error('Failed to add supply chain step:', error);
      throw error;
    }
  }

  async getProductHistory(productId) {
    try {
      const result = await this.contract.evaluateTransaction('GetProductHistory', productId);
      return JSON.parse(result.toString());
    } catch (error) {
      console.error(`Failed to get product history ${productId}:`, error);
      throw error;
    }
  }

  async createFarmer(farmerData) {
    try {
      const result = await this.contract.submitTransaction('CreateFarmer', JSON.stringify(farmerData));
      return JSON.parse(result.toString());
    } catch (error) {
      console.error('Failed to create farmer:', error);
      throw error;
    }
  }

  async getFarmer(farmerId) {
    try {
      const result = await this.contract.evaluateTransaction('GetFarmer', farmerId);
      return JSON.parse(result.toString());
    } catch (error) {
      console.error(`Failed to get farmer ${farmerId}:`, error);
      throw error;
    }
  }

  async queryProductsByFarmer(farmerId) {
    try {
      const result = await this.contract.evaluateTransaction('QueryProductsByFarmer', farmerId);
      return JSON.parse(result.toString());
    } catch (error) {
      console.error(`Failed to query products by farmer ${farmerId}:`, error);
      throw error;
    }
  }

  async addCertificate(certificateData) {
    try {
      const result = await this.contract.submitTransaction('AddCertificate', JSON.stringify(certificateData));
      return JSON.parse(result.toString());
    } catch (error) {
      console.error('Failed to add certificate:', error);
      throw error;
    }
  }

  async getCertificate(certificateId) {
    try {
      const result = await this.contract.evaluateTransaction('GetCertificate', certificateId);
      return JSON.parse(result.toString());
    } catch (error) {
      console.error(`Failed to get certificate ${certificateId}:`, error);
      throw error;
    }
  }

  async disconnect() {
    if (this.gateway) {
      await this.gateway.disconnect();
      console.log('Fabric service disconnected');
    }
  }
}

module.exports = new FabricService();