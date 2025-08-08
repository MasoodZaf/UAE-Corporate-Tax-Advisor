// =============================================================================
// TaxMaster AI - MongoDB Collections Schema
// UAE Corporate Tax AI Compliance System - Document Storage
// Version: 1.0
// Created: August 7, 2025
// =============================================================================

// MongoDB collections for document management and unstructured data

// =============================================================================
// 1. DOCUMENT MANAGEMENT COLLECTION
// =============================================================================

db.createCollection("documents", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["companyId", "fileName", "fileType", "uploadedBy", "uploadedAt"],
      properties: {
        _id: {
          bsonType: "objectId"
        },
        companyId: {
          bsonType: "string",
          description: "Reference to PostgreSQL companies.id"
        },
        transactionId: {
          bsonType: ["string", "null"],
          description: "Reference to PostgreSQL transactions.id if linked"
        },
        
        // File Information
        fileName: {
          bsonType: "string",
          minLength: 1,
          maxLength: 255
        },
        originalFileName: {
          bsonType: "string",
          maxLength: 255
        },
        fileType: {
          bsonType: "string",
          enum: ["receipt", "invoice", "bank_statement", "contract", "license", "tax_document", "other"]
        },
        mimeType: {
          bsonType: "string",
          maxLength: 100
        },
        fileSize: {
          bsonType: "long",
          minimum: 0
        },
        
        // Storage Information
        storagePath: {
          bsonType: "string",
          description: "Cloud storage path (S3, etc.)"
        },
        storageProvider: {
          bsonType: "string",
          enum: ["aws_s3", "azure_blob", "google_cloud"]
        },
        
        // OCR and AI Processing
        ocrStatus: {
          bsonType: "string",
          enum: ["pending", "processing", "completed", "failed"],
          default: "pending"
        },
        ocrData: {
          bsonType: "object",
          properties: {
            extractedText: {
              bsonType: "string"
            },
            extractedTextArabic: {
              bsonType: "string"
            },
            confidence: {
              bsonType: "double",
              minimum: 0,
              maximum: 1
            },
            language: {
              bsonType: "string",
              enum: ["en", "ar", "mixed"]
            },
            processingTime: {
              bsonType: "long"
            },
            boundingBoxes: {
              bsonType: "array",
              items: {
                bsonType: "object",
                properties: {
                  text: { bsonType: "string" },
                  x: { bsonType: "double" },
                  y: { bsonType: "double" },
                  width: { bsonType: "double" },
                  height: { bsonType: "double" },
                  confidence: { bsonType: "double" }
                }
              }
            }
          }
        },
        
        // AI Extraction Results
        aiExtraction: {
          bsonType: "object",
          properties: {
            extractedData: {
              bsonType: "object",
              properties: {
                amount: {
                  bsonType: ["double", "null"]
                },
                currency: {
                  bsonType: "string",
                  default: "AED"
                },
                date: {
                  bsonType: ["date", "null"]
                },
                vendor: {
                  bsonType: "string"
                },
                description: {
                  bsonType: "string"
                },
                taxAmount: {
                  bsonType: ["double", "null"]
                },
                taxRate: {
                  bsonType: ["double", "null"]
                },
                category: {
                  bsonType: "string"
                },
                invoiceNumber: {
                  bsonType: "string"
                },
                paymentMethod: {
                  bsonType: "string"
                }
              }
            },
            confidence: {
              bsonType: "double",
              minimum: 0,
              maximum: 1
            },
            modelVersion: {
              bsonType: "string"
            },
            processingTime: {
              bsonType: "long"
            },
            isVerified: {
              bsonType: "bool",
              default: false
            },
            verifiedBy: {
              bsonType: ["string", "null"]
            },
            verifiedAt: {
              bsonType: ["date", "null"]
            }
          }
        },
        
        // Document Metadata
        tags: {
          bsonType: "array",
          items: {
            bsonType: "string"
          }
        },
        notes: {
          bsonType: "string"
        },
        
        // Audit Trail
        uploadedBy: {
          bsonType: "string",
          description: "Reference to PostgreSQL users.id"
        },
        uploadedAt: {
          bsonType: "date"
        },
        lastModifiedBy: {
          bsonType: "string"
        },
        lastModifiedAt: {
          bsonType: "date"
        },
        
        // Document Status
        status: {
          bsonType: "string",
          enum: ["active", "archived", "deleted"],
          default: "active"
        },
        
        // Retention Policy
        retentionYears: {
          bsonType: "int",
          default: 7
        },
        deleteAfter: {
          bsonType: "date"
        }
      }
    }
  }
});

// =============================================================================
// 2. AI TRAINING DATA COLLECTION
// =============================================================================

db.createCollection("ai_training_data", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["dataType", "inputData", "expectedOutput", "createdAt"],
      properties: {
        _id: {
          bsonType: "objectId"
        },
        
        // Training Data Classification
        dataType: {
          bsonType: "string",
          enum: ["expense_classification", "ocr_correction", "tax_optimization", "compliance_prediction"]
        },
        
        // Input Data
        inputData: {
          bsonType: "object",
          description: "Raw input data for training"
        },
        
        // Expected Output
        expectedOutput: {
          bsonType: "object",
          description: "Correct/expected output for supervised learning"
        },
        
        // Data Quality
        qualityScore: {
          bsonType: "double",
          minimum: 0,
          maximum: 1
        },
        isValidated: {
          bsonType: "bool",
          default: false
        },
        validatedBy: {
          bsonType: "string"
        },
        validatedAt: {
          bsonType: "date"
        },
        
        // Training Metadata
        sourceDocumentId: {
          bsonType: ["objectId", "null"]
        },
        companyId: {
          bsonType: "string"
        },
        industryContext: {
          bsonType: "string"
        },
        
        // Usage Tracking
        usedInTraining: {
          bsonType: "bool",
          default: false
        },
        modelVersions: {
          bsonType: "array",
          items: {
            bsonType: "string"
          }
        },
        
        createdAt: {
          bsonType: "date"
        },
        updatedAt: {
          bsonType: "date"
        }
      }
    }
  }
});

// =============================================================================
// 3. NOTIFICATION TEMPLATES COLLECTION
// =============================================================================

db.createCollection("notification_templates", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["templateCode", "subject", "body", "type"],
      properties: {
        _id: {
          bsonType: "objectId"
        },
        
        // Template Identification
        templateCode: {
          bsonType: "string",
          description: "Unique template identifier"
        },
        name: {
          bsonType: "string"
        },
        description: {
          bsonType: "string"
        },
        
        // Template Content
        subject: {
          bsonType: "object",
          properties: {
            en: { bsonType: "string" },
            ar: { bsonType: "string" }
          }
        },
        body: {
          bsonType: "object",
          properties: {
            en: { bsonType: "string" },
            ar: { bsonType: "string" }
          }
        },
        
        // Template Configuration
        type: {
          bsonType: "string",
          enum: ["email", "sms", "push", "in_app"]
        },
        category: {
          bsonType: "string",
          enum: ["compliance", "payment", "filing", "alert", "marketing", "system"]
        },
        priority: {
          bsonType: "string",
          enum: ["low", "medium", "high", "critical"],
          default: "medium"
        },
        
        // Template Variables
        variables: {
          bsonType: "array",
          items: {
            bsonType: "object",
            properties: {
              name: { bsonType: "string" },
              type: { bsonType: "string" },
              required: { bsonType: "bool" },
              description: { bsonType: "string" }
            }
          }
        },
        
        // Template Status
        isActive: {
          bsonType: "bool",
          default: true
        },
        version: {
          bsonType: "string",
          default: "1.0"
        },
        
        // Audit
        createdBy: {
          bsonType: "string"
        },
        createdAt: {
          bsonType: "date"
        },
        updatedBy: {
          bsonType: "string"
        },
        updatedAt: {
          bsonType: "date"
        }
      }
    }
  }
});

// =============================================================================
// 4. SYSTEM CONFIGURATION COLLECTION
// =============================================================================

db.createCollection("system_config", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["configKey", "configValue"],
      properties: {
        _id: {
          bsonType: "objectId"
        },
        
        // Configuration Identification
        configKey: {
          bsonType: "string",
          description: "Unique configuration key"
        },
        configGroup: {
          bsonType: "string",
          enum: ["tax_rates", "compliance", "integrations", "ai_models", "notifications", "security"]
        },
        
        // Configuration Value
        configValue: {
          description: "Configuration value (can be any type)"
        },
        
        // Configuration Metadata
        description: {
          bsonType: "string"
        },
        dataType: {
          bsonType: "string",
          enum: ["string", "number", "boolean", "object", "array"]
        },
        isEncrypted: {
          bsonType: "bool",
          default: false
        },
        
        // Environment and Access
        environment: {
          bsonType: "string",
          enum: ["development", "staging", "production"],
          default: "production"
        },
        accessLevel: {
          bsonType: "string",
          enum: ["public", "internal", "restricted", "confidential"],
          default: "internal"
        },
        
        // Version Control
        version: {
          bsonType: "string",
          default: "1.0"
        },
        isActive: {
          bsonType: "bool",
          default: true
        },
        
        // Audit
        createdBy: {
          bsonType: "string"
        },
        createdAt: {
          bsonType: "date"
        },
        updatedBy: {
          bsonType: "string"
        },
        updatedAt: {
          bsonType: "date"
        }
      }
    }
  }
});

// =============================================================================
// 5. ANALYTICS & REPORTS COLLECTION
// =============================================================================

db.createCollection("analytics_data", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["companyId", "metricType", "value", "timestamp"],
      properties: {
        _id: {
          bsonType: "objectId"
        },
        
        // Data Identification
        companyId: {
          bsonType: "string"
        },
        userId: {
          bsonType: ["string", "null"]
        },
        
        // Metric Information
        metricType: {
          bsonType: "string",
          enum: ["revenue", "expenses", "tax_liability", "compliance_score", "user_activity", "system_performance"]
        },
        metricName: {
          bsonType: "string"
        },
        category: {
          bsonType: "string"
        },
        
        // Metric Value
        value: {
          description: "Metric value (number, object, etc.)"
        },
        unit: {
          bsonType: "string"
        },
        
        // Time Dimensions
        timestamp: {
          bsonType: "date"
        },
        period: {
          bsonType: "string",
          enum: ["daily", "weekly", "monthly", "quarterly", "yearly"]
        },
        fiscalYear: {
          bsonType: "int"
        },
        
        // Dimensions
        dimensions: {
          bsonType: "object",
          description: "Additional categorization fields"
        },
        
        // Data Quality
        dataSource: {
          bsonType: "string",
          enum: ["user_input", "system_calculated", "imported", "predicted"]
        },
        confidence: {
          bsonType: "double",
          minimum: 0,
          maximum: 1
        },
        
        // Processing
        isProcessed: {
          bsonType: "bool",
          default: false
        },
        aggregationLevel: {
          bsonType: "string",
          enum: ["raw", "daily", "weekly", "monthly", "quarterly", "yearly"]
        },
        
        createdAt: {
          bsonType: "date"
        }
      }
    }
  }
});

// =============================================================================
// 6. INDEXES FOR PERFORMANCE
// =============================================================================

// Documents Collection Indexes
db.documents.createIndex({ "companyId": 1, "uploadedAt": -1 });
db.documents.createIndex({ "transactionId": 1 });
db.documents.createIndex({ "fileType": 1, "status": 1 });
db.documents.createIndex({ "ocrStatus": 1 });
db.documents.createIndex({ "aiExtraction.extractedData.amount": 1 });
db.documents.createIndex({ "aiExtraction.extractedData.date": 1 });
db.documents.createIndex({ "tags": 1 });
db.documents.createIndex({ "deleteAfter": 1 }); // For automated cleanup

// AI Training Data Indexes
db.ai_training_data.createIndex({ "dataType": 1, "isValidated": 1 });
db.ai_training_data.createIndex({ "companyId": 1 });
db.ai_training_data.createIndex({ "usedInTraining": 1 });
db.ai_training_data.createIndex({ "qualityScore": -1 });

// Notification Templates Indexes
db.notification_templates.createIndex({ "templateCode": 1 }, { unique: true });
db.notification_templates.createIndex({ "type": 1, "category": 1 });
db.notification_templates.createIndex({ "isActive": 1 });

// System Configuration Indexes
db.system_config.createIndex({ "configKey": 1 }, { unique: true });
db.system_config.createIndex({ "configGroup": 1 });
db.system_config.createIndex({ "environment": 1, "isActive": 1 });

// Analytics Data Indexes
db.analytics_data.createIndex({ "companyId": 1, "timestamp": -1 });
db.analytics_data.createIndex({ "metricType": 1, "timestamp": -1 });
db.analytics_data.createIndex({ "period": 1, "fiscalYear": 1 });
db.analytics_data.createIndex({ "timestamp": 1 }); // For time-series queries

// =============================================================================
// 7. INITIAL DATA SETUP
// =============================================================================

// Insert default system configuration
db.system_config.insertMany([
  {
    configKey: "tax_rates_uae",
    configGroup: "tax_rates",
    configValue: {
      "corporate_tax": {
        "rate_0": 0.00,
        "threshold_0": 375000,
        "rate_standard": 0.09,
        "rate_dmtt": 0.15,
        "dmtt_threshold": 750000000
      },
      "vat": {
        "standard_rate": 0.05,
        "zero_rate": 0.00,
        "exempt_rate": null
      }
    },
    description: "UAE Tax Rates Configuration",
    dataType: "object",
    environment: "production",
    accessLevel: "public",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    configKey: "ai_confidence_thresholds",
    configGroup: "ai_models",
    configValue: {
      "ocr_minimum": 0.80,
      "classification_minimum": 0.85,
      "amount_extraction": 0.90,
      "auto_approval": 0.95
    },
    description: "AI Model Confidence Thresholds",
    dataType: "object",
    environment: "production",
    accessLevel: "internal",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    configKey: "document_retention_years",
    configGroup: "compliance",
    configValue: 7,
    description: "Document retention period in years",
    dataType: "number",
    environment: "production",
    accessLevel: "internal",
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// Insert default notification templates
db.notification_templates.insertMany([
  {
    templateCode: "FILING_DUE_REMINDER",
    name: "Filing Due Date Reminder",
    description: "Reminds users about upcoming filing due dates",
    subject: {
      en: "Corporate Tax Filing Due in {days} Days",
      ar: "موعد تقديم إقرار ضريبة الشركات خلال {days} أيام"
    },
    body: {
      en: "Dear {companyName},\n\nThis is a reminder that your corporate tax filing is due on {dueDate}. Please ensure all required documents are submitted on time to avoid penalties.\n\nBest regards,\nTaxMaster AI Team",
      ar: "عزيزي {companyName}،\n\nهذا تذكير بأن موعد تقديم إقرار ضريبة الشركات الخاص بك هو {dueDate}. يرجى التأكد من تقديم جميع المستندات المطلوبة في الوقت المحدد لتجنب الغرامات.\n\nمع أطيب التحيات،\nفريق تاكس ماستر AI"
    },
    type: "email",
    category: "compliance",
    priority: "high",
    variables: [
      { name: "companyName", type: "string", required: true, description: "Company name" },
      { name: "dueDate", type: "date", required: true, description: "Filing due date" },
      { name: "days", type: "number", required: true, description: "Days until due date" }
    ],
    isActive: true,
    version: "1.0",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    templateCode: "PAYMENT_CONFIRMATION",
    name: "Payment Confirmation",
    description: "Confirms successful tax payment",
    subject: {
      en: "Tax Payment Confirmation - {amount} AED",
      ar: "تأكيد دفع الضريبة - {amount} درهم"
    },
    body: {
      en: "Dear {companyName},\n\nYour tax payment of {amount} AED has been successfully processed.\n\nTransaction ID: {transactionId}\nPayment Date: {paymentDate}\n\nThank you for your compliance.\n\nBest regards,\nTaxMaster AI Team",
      ar: "عزيزي {companyName}،\n\nتم معالجة دفعة الضريبة بمبلغ {amount} درهم بنجاح.\n\nرقم المعاملة: {transactionId}\nتاريخ الدفع: {paymentDate}\n\nشكراً لالتزامكم.\n\nمع أطيب التحيات،\nفريق تاكس ماستر AI"
    },
    type: "email",
    category: "payment",
    priority: "medium",
    variables: [
      { name: "companyName", type: "string", required: true, description: "Company name" },
      { name: "amount", type: "number", required: true, description: "Payment amount" },
      { name: "transactionId", type: "string", required: true, description: "Transaction ID" },
      { name: "paymentDate", type: "date", required: true, description: "Payment date" }
    ],
    isActive: true,
    version: "1.0",
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// =============================================================================
// END OF MongoDB SCHEMA
// =============================================================================