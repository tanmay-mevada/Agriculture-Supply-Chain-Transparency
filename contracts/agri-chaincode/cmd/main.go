package main

import (
	"log"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
	"github.com/tanmay-mevada/Agriculture-Supply-Chain-Transparency-/contracts/agri-chaincode/chaincode"
)

func main() {
	agriChaincode, err := contractapi.NewChaincode(&chaincode.AgriSupplyChainContract{})
	if err != nil {
		log.Panicf("Error creating agriculture supply chain chaincode: %v", err)
	}

	if err := agriChaincode.Start(); err != nil {
		log.Panicf("Error starting chaincode: %v", err)
	}
}