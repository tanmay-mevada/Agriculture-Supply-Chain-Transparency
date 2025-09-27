class Product {
  final String id;
  final String name;
  final String batchNumber;
  final String farmerID;
  final Location farmLocation;
  final DateTime plantingDate;
  final DateTime harvestDate;
  final String quality;
  final List<String> certifications;
  final String currentOwner;
  final Location currentLocation;
  final ProductStatus status;
  final List<SupplyChainStep> supplyChainSteps;
  final String? ipfsHash;
  final String? qrCode;
  final DateTime createdAt;
  final DateTime updatedAt;

  Product({
    required this.id,
    required this.name,
    required this.batchNumber,
    required this.farmerID,
    required this.farmLocation,
    required this.plantingDate,
    required this.harvestDate,
    required this.quality,
    required this.certifications,
    required this.currentOwner,
    required this.currentLocation,
    required this.status,
    required this.supplyChainSteps,
    this.ipfsHash,
    this.qrCode,
    required this.createdAt,
    required this.updatedAt,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'] ?? '',
      name: json['name'] ?? '',
      batchNumber: json['batchNumber'] ?? '',
      farmerID: json['farmerID'] ?? '',
      farmLocation: Location.fromJson(json['farmLocation'] ?? {}),
      plantingDate: DateTime.parse(json['plantingDate']),
      harvestDate: DateTime.parse(json['harvestDate']),
      quality: json['quality'] ?? '',
      certifications: List<String>.from(json['certifications'] ?? []),
      currentOwner: json['currentOwner'] ?? '',
      currentLocation: Location.fromJson(json['currentLocation'] ?? {}),
      status: ProductStatusExtension.fromString(json['status'] ?? 'PLANTED'),
      supplyChainSteps: (json['supplyChainSteps'] as List<dynamic>?)
              ?.map((step) => SupplyChainStep.fromJson(step))
              .toList() ??
          [],
      ipfsHash: json['ipfsHash'],
      qrCode: json['qrCode'],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'batchNumber': batchNumber,
      'farmerID': farmerID,
      'farmLocation': farmLocation.toJson(),
      'plantingDate': plantingDate.toIso8601String(),
      'harvestDate': harvestDate.toIso8601String(),
      'quality': quality,
      'certifications': certifications,
      'currentOwner': currentOwner,
      'currentLocation': currentLocation.toJson(),
      'status': status.toString().split('.').last,
      'supplyChainSteps': supplyChainSteps.map((step) => step.toJson()).toList(),
      'ipfsHash': ipfsHash,
      'qrCode': qrCode,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}

class Location {
  final double latitude;
  final double longitude;
  final String address;

  Location({
    required this.latitude,
    required this.longitude,
    required this.address,
  });

  factory Location.fromJson(Map<String, dynamic> json) {
    return Location(
      latitude: (json['latitude'] ?? 0.0).toDouble(),
      longitude: (json['longitude'] ?? 0.0).toDouble(),
      address: json['address'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'latitude': latitude,
      'longitude': longitude,
      'address': address,
    };
  }
}

enum ProductStatus {
  planted,
  harvested,
  processed,
  inTransit,
  delivered,
  sold,
}

extension ProductStatusExtension on ProductStatus {
  String get displayName {
    switch (this) {
      case ProductStatus.planted:
        return 'Planted';
      case ProductStatus.harvested:
        return 'Harvested';
      case ProductStatus.processed:
        return 'Processed';
      case ProductStatus.inTransit:
        return 'In Transit';
      case ProductStatus.delivered:
        return 'Delivered';
      case ProductStatus.sold:
        return 'Sold';
    }
  }

  static ProductStatus fromString(String status) {
    switch (status.toUpperCase()) {
      case 'PLANTED':
        return ProductStatus.planted;
      case 'HARVESTED':
        return ProductStatus.harvested;
      case 'PROCESSED':
        return ProductStatus.processed;
      case 'IN_TRANSIT':
        return ProductStatus.inTransit;
      case 'DELIVERED':
        return ProductStatus.delivered;
      case 'SOLD':
        return ProductStatus.sold;
      default:
        return ProductStatus.planted;
    }
  }
}

class SupplyChainStep {
  final String id;
  final String stepType;
  final String actor;
  final Location location;
  final DateTime timestamp;
  final String description;
  final Map<String, String> metadata;

  SupplyChainStep({
    required this.id,
    required this.stepType,
    required this.actor,
    required this.location,
    required this.timestamp,
    required this.description,
    required this.metadata,
  });

  factory SupplyChainStep.fromJson(Map<String, dynamic> json) {
    return SupplyChainStep(
      id: json['id'] ?? '',
      stepType: json['stepType'] ?? '',
      actor: json['actor'] ?? '',
      location: Location.fromJson(json['location'] ?? {}),
      timestamp: DateTime.parse(json['timestamp']),
      description: json['description'] ?? '',
      metadata: Map<String, String>.from(json['metadata'] ?? {}),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'stepType': stepType,
      'actor': actor,
      'location': location.toJson(),
      'timestamp': timestamp.toIso8601String(),
      'description': description,
      'metadata': metadata,
    };
  }
}