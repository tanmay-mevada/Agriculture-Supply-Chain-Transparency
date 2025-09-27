package chaincode

import (
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
	"github.com/tanmay-mevada/Agriculture-Supply-Chain-Transparency-/contracts/agri-chaincode/model"
)

// AgriSupplyChainContract provides functions for managing agricultural supply chain
type AgriSupplyChainContract struct {
	contractapi.Contract
}

// CreateProduct creates a new agricultural product
func (s *AgriSupplyChainContract) CreateProduct(ctx contractapi.TransactionContextInterface, productData string) error {
	var product model.Product
	err := json.Unmarshal([]byte(productData), &product)
	if err != nil {
		return fmt.Errorf("failed to unmarshal product data: %v", err)
	}

	// Check if product already exists
	exists, err := s.ProductExists(ctx, product.ID)
	if err != nil {
		return fmt.Errorf("failed to check if product exists: %v", err)
	}
	if exists {
		return fmt.Errorf("product %s already exists", product.ID)
	}

	// Set timestamps
	product.CreatedAt = time.Now()
	product.UpdatedAt = time.Now()

	productJSON, err := json.Marshal(product)
	if err != nil {
		return fmt.Errorf("failed to marshal product: %v", err)
	}

	return ctx.GetStub().PutState(product.ID, productJSON)
}

// GetProduct retrieves a product by ID
func (s *AgriSupplyChainContract) GetProduct(ctx contractapi.TransactionContextInterface, productID string) (*model.Product, error) {
	productJSON, err := ctx.GetStub().GetState(productID)
	if err != nil {
		return nil, fmt.Errorf("failed to read product %s: %v", productID, err)
	}
	if productJSON == nil {
		return nil, fmt.Errorf("product %s does not exist", productID)
	}

	var product model.Product
	err = json.Unmarshal(productJSON, &product)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal product: %v", err)
	}

	return &product, nil
}

// UpdateProductStatus updates the status of a product
func (s *AgriSupplyChainContract) UpdateProductStatus(ctx contractapi.TransactionContextInterface, productID string, status string, location string, actor string) error {
	product, err := s.GetProduct(ctx, productID)
	if err != nil {
		return err
	}

	// Parse location
	var loc model.Location
	if location != "" {
		err = json.Unmarshal([]byte(location), &loc)
		if err != nil {
			return fmt.Errorf("failed to parse location: %v", err)
		}
	}

	// Update product status
	product.Status = model.ProductStatus(status)
	product.CurrentLocation = loc
	product.CurrentOwner = actor
	product.UpdatedAt = time.Now()

	// Add supply chain step
	step := model.SupplyChainStep{
		ID:          fmt.Sprintf("%s-%d", productID, len(product.SupplyChainSteps)),
		StepType:    status,
		Actor:       actor,
		Location:    loc,
		Timestamp:   time.Now(),
		Description: fmt.Sprintf("Product status updated to %s", status),
	}
	product.SupplyChainSteps = append(product.SupplyChainSteps, step)

	productJSON, err := json.Marshal(product)
	if err != nil {
		return fmt.Errorf("failed to marshal product: %v", err)
	}

	return ctx.GetStub().PutState(productID, productJSON)
}

// AddSupplyChainStep adds a new step to the product's supply chain
func (s *AgriSupplyChainContract) AddSupplyChainStep(ctx contractapi.TransactionContextInterface, productID string, stepData string) error {
	product, err := s.GetProduct(ctx, productID)
	if err != nil {
		return err
	}

	var step model.SupplyChainStep
	err = json.Unmarshal([]byte(stepData), &step)
	if err != nil {
		return fmt.Errorf("failed to unmarshal step data: %v", err)
	}

	step.ID = fmt.Sprintf("%s-%d", productID, len(product.SupplyChainSteps))
	step.Timestamp = time.Now()

	product.SupplyChainSteps = append(product.SupplyChainSteps, step)
	product.UpdatedAt = time.Now()

	productJSON, err := json.Marshal(product)
	if err != nil {
		return fmt.Errorf("failed to marshal product: %v", err)
	}

	return ctx.GetStub().PutState(productID, productJSON)
}

// GetProductHistory retrieves the history of a product
func (s *AgriSupplyChainContract) GetProductHistory(ctx contractapi.TransactionContextInterface, productID string) ([]model.SupplyChainStep, error) {
	product, err := s.GetProduct(ctx, productID)
	if err != nil {
		return nil, err
	}

	return product.SupplyChainSteps, nil
}

// ProductExists checks if a product exists
func (s *AgriSupplyChainContract) ProductExists(ctx contractapi.TransactionContextInterface, productID string) (bool, error) {
	productJSON, err := ctx.GetStub().GetState(productID)
	if err != nil {
		return false, fmt.Errorf("failed to read product %s: %v", productID, err)
	}

	return productJSON != nil, nil
}

// CreateFarmer creates a new farmer profile
func (s *AgriSupplyChainContract) CreateFarmer(ctx contractapi.TransactionContextInterface, farmerData string) error {
	var farmer model.Farmer
	err := json.Unmarshal([]byte(farmerData), &farmer)
	if err != nil {
		return fmt.Errorf("failed to unmarshal farmer data: %v", err)
	}

	// Check if farmer already exists
	farmerJSON, err := ctx.GetStub().GetState(farmer.ID)
	if err != nil {
		return fmt.Errorf("failed to check if farmer exists: %v", err)
	}
	if farmerJSON != nil {
		return fmt.Errorf("farmer %s already exists", farmer.ID)
	}

	farmer.CreatedAt = time.Now()

	farmerJSON, err = json.Marshal(farmer)
	if err != nil {
		return fmt.Errorf("failed to marshal farmer: %v", err)
	}

	return ctx.GetStub().PutState(farmer.ID, farmerJSON)
}

// GetFarmer retrieves a farmer by ID
func (s *AgriSupplyChainContract) GetFarmer(ctx contractapi.TransactionContextInterface, farmerID string) (*model.Farmer, error) {
	farmerJSON, err := ctx.GetStub().GetState(farmerID)
	if err != nil {
		return nil, fmt.Errorf("failed to read farmer %s: %v", farmerID, err)
	}
	if farmerJSON == nil {
		return nil, fmt.Errorf("farmer %s does not exist", farmerID)
	}

	var farmer model.Farmer
	err = json.Unmarshal(farmerJSON, &farmer)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal farmer: %v", err)
	}

	return &farmer, nil
}

// AddCertificate adds a certificate to the ledger
func (s *AgriSupplyChainContract) AddCertificate(ctx contractapi.TransactionContextInterface, certificateData string) error {
	var certificate model.Certificate
	err := json.Unmarshal([]byte(certificateData), &certificate)
	if err != nil {
		return fmt.Errorf("failed to unmarshal certificate data: %v", err)
	}

	certificateJSON, err := json.Marshal(certificate)
	if err != nil {
		return fmt.Errorf("failed to marshal certificate: %v", err)
	}

	return ctx.GetStub().PutState(certificate.ID, certificateJSON)
}

// GetCertificate retrieves a certificate by ID
func (s *AgriSupplyChainContract) GetCertificate(ctx contractapi.TransactionContextInterface, certificateID string) (*model.Certificate, error) {
	certificateJSON, err := ctx.GetStub().GetState(certificateID)
	if err != nil {
		return nil, fmt.Errorf("failed to read certificate %s: %v", certificateID, err)
	}
	if certificateJSON == nil {
		return nil, fmt.Errorf("certificate %s does not exist", certificateID)
	}

	var certificate model.Certificate
	err = json.Unmarshal(certificateJSON, &certificate)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal certificate: %v", err)
	}

	return &certificate, nil
}

// QueryProductsByFarmer retrieves all products for a specific farmer
func (s *AgriSupplyChainContract) QueryProductsByFarmer(ctx contractapi.TransactionContextInterface, farmerID string) ([]*model.Product, error) {
	queryString := fmt.Sprintf(`{"selector":{"farmerID":"%s"}}`, farmerID)
	
	resultsIterator, err := ctx.GetStub().GetQueryResult(queryString)
	if err != nil {
		return nil, fmt.Errorf("failed to query products: %v", err)
	}
	defer resultsIterator.Close()

	var products []*model.Product
	for resultsIterator.HasNext() {
		queryResult, err := resultsIterator.Next()
		if err != nil {
			return nil, fmt.Errorf("failed to get next result: %v", err)
		}

		var product model.Product
		err = json.Unmarshal(queryResult.Value, &product)
		if err != nil {
			return nil, fmt.Errorf("failed to unmarshal product: %v", err)
		}
		products = append(products, &product)
	}

	return products, nil
}

// InitLedger initializes the ledger with sample data
func (s *AgriSupplyChainContract) InitLedger(ctx contractapi.TransactionContextInterface) error {
	log.Println("Initializing Agriculture Supply Chain ledger")
	return nil
}