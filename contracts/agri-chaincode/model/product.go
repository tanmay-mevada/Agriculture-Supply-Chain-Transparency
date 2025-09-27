package model

import (
	"time"
)

// Product represents an agricultural product in the supply chain
type Product struct {
	ID                string            `json:"id"`
	Name              string            `json:"name"`
	BatchNumber       string            `json:"batchNumber"`
	FarmerID          string            `json:"farmerID"`
	FarmLocation      Location          `json:"farmLocation"`
	PlantingDate      time.Time         `json:"plantingDate"`
	HarvestDate       time.Time         `json:"harvestDate"`
	Quality           string            `json:"quality"`
	Certifications    []string          `json:"certifications"`
	CurrentOwner      string            `json:"currentOwner"`
	CurrentLocation   Location          `json:"currentLocation"`
	Status            ProductStatus     `json:"status"`
	SupplyChainSteps  []SupplyChainStep `json:"supplyChainSteps"`
	IPFSHash          string            `json:"ipfsHash"`
	QRCode            string            `json:"qrCode"`
	CreatedAt         time.Time         `json:"createdAt"`
	UpdatedAt         time.Time         `json:"updatedAt"`
}

// Location represents geographical coordinates
type Location struct {
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
	Address   string  `json:"address"`
}

// ProductStatus represents the current status of the product
type ProductStatus string

const (
	StatusPlanted    ProductStatus = "PLANTED"
	StatusHarvested  ProductStatus = "HARVESTED"
	StatusProcessed  ProductStatus = "PROCESSED"
	StatusInTransit  ProductStatus = "IN_TRANSIT"
	StatusDelivered  ProductStatus = "DELIVERED"
	StatusSold       ProductStatus = "SOLD"
)

// SupplyChainStep represents a step in the supply chain
type SupplyChainStep struct {
	ID          string            `json:"id"`
	StepType    string            `json:"stepType"`
	Actor       string            `json:"actor"`
	Location    Location          `json:"location"`
	Timestamp   time.Time         `json:"timestamp"`
	Description string            `json:"description"`
	Metadata    map[string]string `json:"metadata"`
}

// Certificate represents quality/organic certifications
type Certificate struct {
	ID          string    `json:"id"`
	ProductID   string    `json:"productID"`
	Type        string    `json:"type"`
	IssuedBy    string    `json:"issuedBy"`
	IssuedDate  time.Time `json:"issuedDate"`
	ValidUntil  time.Time `json:"validUntil"`
	IPFSHash    string    `json:"ipfsHash"`
	Status      string    `json:"status"`
}

// Farmer represents a farmer in the system
type Farmer struct {
	ID            string            `json:"id"`
	Name          string            `json:"name"`
	Email         string            `json:"email"`
	Phone         string            `json:"phone"`
	FarmLocation  Location          `json:"farmLocation"`
	Certifications []string         `json:"certifications"`
	Verified      bool              `json:"verified"`
	Metadata      map[string]string `json:"metadata"`
	CreatedAt     time.Time         `json:"createdAt"`
}