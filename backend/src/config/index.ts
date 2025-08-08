/**
 * Main Configuration File
 * TaxMaster AI - UAE Corporate Tax Compliance System
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Configuration interface
export interface Config {
  // Server Configuration
  server: {
    port: number;
    host: string;
    apiVersion: string;
    environment: string;
    trustProxy: boolean;
  };

  // Database Configuration
  database: {
    postgres: {
      host: string;
      port: number;
      database: string;
      user: string;
      password: string;
      ssl: boolean;
      poolMin: number;
      poolMax: number;
    };
    mongodb: {
      uri: string;
    };
    redis: {
      host: string;
      port: number;
      password?: string;
      db: number;
      ttl: number;
    };
  };

  // Authentication & Security
  auth: {
    jwtSecret: string;
    jwtExpiresIn: string;
    jwtRefreshSecret: string;
    jwtRefreshExpiresIn: string;
    hashRounds: number;
    encryptionKey: string;
  };

  // File Storage
  storage: {
    type: 'local' | 's3';
    uploadPath: string;
    maxFileSize: number;
    allowedFileTypes: string[];
    aws?: {
      accessKeyId: string;
      secretAccessKey: string;
      region: string;
      bucket: string;
    };
  };

  // Email Configuration
  email: {
    service: string;
    host: string;
    port: number;
    secure: boolean;
    user: string;
    password: string;
    from: string;
  };

  // SMS Configuration
  sms: {
    twilio: {
      accountSid: string;
      authToken: string;
      phoneNumber: string;
    };
  };

  // Government Integrations
  integrations: {
    emiratax: {
      baseUrl: string;
      clientId: string;
      clientSecret: string;
    };
    uaePass: {
      clientId: string;
      clientSecret: string;
      redirectUri: string;
    };
    banks: {
      enbd: {
        apiKey: string;
        apiSecret: string;
        baseUrl: string;
      };
      adcb: {
        apiKey: string;
        apiSecret: string;
        baseUrl: string;
      };
    };
  };

  // AI/ML Configuration
  ai: {
    ocr: {
      service: string;
      apiKey?: string;
      confidenceThreshold: number;
    };
    models: {
      baseUrl: string;
      classificationEndpoint: string;
      extractionEndpoint: string;
      optimizationEndpoint: string;
    };
  };

  // Monitoring & Logging
  monitoring: {
    logLevel: string;
    logFile: string;
    datadogApiKey?: string;
    newRelicLicenseKey?: string;
    sentryDsn?: string;
  };

  // Rate Limiting
  rateLimit: {
    windowMs: number;
    maxRequests: number;
    skipSuccessful: boolean;
  };

  // CORS Configuration
  cors: {
    origin: string[];
    credentials: boolean;
  };

  // Security
  security: {
    helmetEnabled: boolean;
    compressionEnabled: boolean;
  };

  // Message Queue
  messageQueue: {
    kafka: {
      clientId: string;
      brokers: string[];
      consumerGroup: string;
    };
    bull: {
      redis: {
        host: string;
        port: number;
        password?: string;
      };
    };
  };

  // Business Configuration
  business: {
    taxRates: {
      default: number;
      smallBusinessThreshold: number;
      dmttThreshold: number;
      vatThreshold: number;
    };
    documentRetentionYears: number;
    subscriptionLimits: {
      starter: number;
      professional: number;
      enterprise: number;
    };
  };

  // Feature Flags
  features: {
    enableAIClassification: boolean;
    enableBankIntegration: boolean;
    enableFTAIntegration: boolean;
    enableUAEPass: boolean;
    enableDocumentOCR: boolean;
    enableTaxOptimization: boolean;
  };

  // Development/Testing
  development: {
    mockExternalApis: boolean;
    seedDatabase: boolean;
    debugSql: boolean;
    enableSwagger: boolean;
  };
}

// Create configuration object
export const config: Config = {
  server: {
    port: parseInt(process.env.PORT || '3000'),
    host: process.env.HOST || '0.0.0.0',
    apiVersion: process.env.API_VERSION || 'v1',
    environment: process.env.NODE_ENV || 'development',
    trustProxy: process.env.TRUST_PROXY === 'true',
  },

  database: {
    postgres: {
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5432'),
      database: process.env.POSTGRES_DB || 'taxmaster_ai',
      user: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || '',
      ssl: process.env.POSTGRES_SSL === 'true',
      poolMin: parseInt(process.env.POSTGRES_POOL_MIN || '2'),
      poolMax: parseInt(process.env.POSTGRES_POOL_MAX || '10'),
    },
    mongodb: {
      uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/taxmaster_ai_docs',
    },
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD || undefined,
      db: parseInt(process.env.REDIS_DB || '0'),
      ttl: parseInt(process.env.REDIS_TTL || '3600'),
    },
  },

  auth: {
    jwtSecret: process.env.JWT_SECRET || 'your_super_secret_jwt_key',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'your_refresh_token_secret',
    jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    hashRounds: parseInt(process.env.HASH_ROUNDS || '12'),
    encryptionKey: process.env.ENCRYPTION_KEY || 'your_32_character_encryption_key',
  },

  storage: {
    type: (process.env.STORAGE_TYPE as 'local' | 's3') || 'local',
    uploadPath: process.env.UPLOAD_PATH || './uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '52428800'), // 50MB
    allowedFileTypes: (process.env.ALLOWED_FILE_TYPES || 'pdf,jpg,jpeg,png,heic').split(','),
    aws: process.env.STORAGE_TYPE === 's3' ? {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
      region: process.env.AWS_REGION || 'me-south-1',
      bucket: process.env.AWS_S3_BUCKET || '',
    } : undefined,
  },

  email: {
    service: process.env.EMAIL_SERVICE || 'gmail',
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: process.env.EMAIL_SECURE === 'true',
    user: process.env.EMAIL_USER || '',
    password: process.env.EMAIL_PASSWORD || '',
    from: process.env.EMAIL_FROM || 'TaxMaster AI <noreply@taxmaster.ai>',
  },

  sms: {
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID || '',
      authToken: process.env.TWILIO_AUTH_TOKEN || '',
      phoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
    },
  },

  integrations: {
    emiratax: {
      baseUrl: process.env.EMIRATAX_BASE_URL || 'https://tax.gov.ae/api',
      clientId: process.env.EMIRATAX_CLIENT_ID || '',
      clientSecret: process.env.EMIRATAX_CLIENT_SECRET || '',
    },
    uaePass: {
      clientId: process.env.UAE_PASS_CLIENT_ID || '',
      clientSecret: process.env.UAE_PASS_CLIENT_SECRET || '',
      redirectUri: process.env.UAE_PASS_REDIRECT_URI || '',
    },
    banks: {
      enbd: {
        apiKey: process.env.ENBD_API_KEY || '',
        apiSecret: process.env.ENBD_API_SECRET || '',
        baseUrl: process.env.ENBD_BASE_URL || 'https://api.emiratesnbd.com',
      },
      adcb: {
        apiKey: process.env.ADCB_API_KEY || '',
        apiSecret: process.env.ADCB_API_SECRET || '',
        baseUrl: process.env.ADCB_BASE_URL || 'https://api.adcb.com',
      },
    },
  },

  ai: {
    ocr: {
      service: process.env.OCR_SERVICE || 'tesseract',
      apiKey: process.env.OCR_API_KEY,
      confidenceThreshold: parseFloat(process.env.OCR_CONFIDENCE_THRESHOLD || '0.8'),
    },
    models: {
      baseUrl: process.env.ML_MODEL_BASE_URL || 'http://localhost:8000',
      classificationEndpoint: process.env.ML_CLASSIFICATION_ENDPOINT || '/classify-expense',
      extractionEndpoint: process.env.ML_EXTRACTION_ENDPOINT || '/extract-data',
      optimizationEndpoint: process.env.ML_OPTIMIZATION_ENDPOINT || '/optimize-tax',
    },
  },

  monitoring: {
    logLevel: process.env.LOG_LEVEL || 'info',
    logFile: process.env.LOG_FILE || './logs/app.log',
    datadogApiKey: process.env.DATADOG_API_KEY,
    newRelicLicenseKey: process.env.NEW_RELIC_LICENSE_KEY,
    sentryDsn: process.env.SENTRY_DSN,
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    skipSuccessful: process.env.RATE_LIMIT_SKIP_SUCCESSFUL === 'true',
  },

  cors: {
    origin: (process.env.CORS_ORIGIN || 'http://localhost:3001').split(','),
    credentials: process.env.CORS_CREDENTIALS === 'true',
  },

  security: {
    helmetEnabled: process.env.HELMET_ENABLED !== 'false',
    compressionEnabled: process.env.COMPRESSION_ENABLED !== 'false',
  },

  messageQueue: {
    kafka: {
      clientId: process.env.KAFKA_CLIENT_ID || 'taxmaster-ai',
      brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
      consumerGroup: process.env.KAFKA_CONSUMER_GROUP || 'taxmaster-ai-consumers',
    },
    bull: {
      redis: {
        host: process.env.BULL_REDIS_HOST || 'localhost',
        port: parseInt(process.env.BULL_REDIS_PORT || '6379'),
        password: process.env.BULL_REDIS_PASSWORD || undefined,
      },
    },
  },

  business: {
    taxRates: {
      default: parseFloat(process.env.DEFAULT_TAX_RATE || '0.09'),
      smallBusinessThreshold: parseInt(process.env.SMALL_BUSINESS_THRESHOLD || '375000'),
      dmttThreshold: parseInt(process.env.DMTT_THRESHOLD || '750000000'),
      vatThreshold: parseInt(process.env.VAT_THRESHOLD || '187500'),
    },
    documentRetentionYears: parseInt(process.env.DOCUMENT_RETENTION_YEARS || '7'),
    subscriptionLimits: {
      starter: parseInt(process.env.STARTER_PLAN_LIMIT || '5000000'),
      professional: parseInt(process.env.PROFESSIONAL_PLAN_LIMIT || '25000000'),
      enterprise: parseInt(process.env.ENTERPRISE_PLAN_LIMIT || '0'),
    },
  },

  features: {
    enableAIClassification: process.env.ENABLE_AI_CLASSIFICATION === 'true',
    enableBankIntegration: process.env.ENABLE_BANK_INTEGRATION === 'true',
    enableFTAIntegration: process.env.ENABLE_FTA_INTEGRATION === 'true',
    enableUAEPass: process.env.ENABLE_UAE_PASS === 'true',
    enableDocumentOCR: process.env.ENABLE_DOCUMENT_OCR === 'true',
    enableTaxOptimization: process.env.ENABLE_TAX_OPTIMIZATION === 'true',
  },

  development: {
    mockExternalApis: process.env.MOCK_EXTERNAL_APIS === 'true',
    seedDatabase: process.env.SEED_DATABASE === 'true',
    debugSql: process.env.DEBUG_SQL === 'true',
    enableSwagger: process.env.ENABLE_SWAGGER === 'true',
  },
};

// Validation function
export function validateConfig(): void {
  const requiredEnvVars = [
    'POSTGRES_PASSWORD',
    'JWT_SECRET',
    'ENCRYPTION_KEY',
  ];

  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Validate JWT secret length
  if (config.auth.jwtSecret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }

  // Validate encryption key length
  if (config.auth.encryptionKey.length !== 32) {
    throw new Error('ENCRYPTION_KEY must be exactly 32 characters long');
  }
}

// Export default configuration
export default config;