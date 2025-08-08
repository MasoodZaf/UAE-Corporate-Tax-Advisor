/**
 * Document Model (MongoDB)
 * TaxMaster AI - UAE Corporate Tax Compliance System
 */

import mongoose, { Document, Schema } from 'mongoose';

// OCR Data Interface
interface IOCRData {
  extractedText?: string;
  extractedTextArabic?: string;
  confidence?: number;
  language?: 'en' | 'ar' | 'mixed';
  processingTime?: number;
  boundingBoxes?: Array<{
    text: string;
    x: number;
    y: number;
    width: number;
    height: number;
    confidence: number;
  }>;
}

// AI Extraction Interface
interface IAIExtraction {
  extractedData?: {
    amount?: number;
    currency?: string;
    date?: Date;
    vendor?: string;
    description?: string;
    taxAmount?: number;
    taxRate?: number;
    category?: string;
    invoiceNumber?: string;
    paymentMethod?: string;
  };
  confidence?: number;
  modelVersion?: string;
  processingTime?: number;
  isVerified?: boolean;
  verifiedBy?: string;
  verifiedAt?: Date;
}

// Document Interface
export interface IDocument extends Document {
  companyId: string;
  transactionId?: string;
  
  // File Information
  fileName: string;
  originalFileName?: string;
  fileType: 'receipt' | 'invoice' | 'bank_statement' | 'contract' | 'license' | 'tax_document' | 'other';
  mimeType?: string;
  fileSize?: number;
  
  // Storage Information
  storagePath?: string;
  storageProvider?: 'aws_s3' | 'azure_blob' | 'google_cloud';
  
  // OCR and AI Processing
  ocrStatus: 'pending' | 'processing' | 'completed' | 'failed';
  ocrData?: IOCRData;
  aiExtraction?: IAIExtraction;
  
  // Document Metadata
  tags?: string[];
  notes?: string;
  
  // Audit Trail
  uploadedBy: string;
  uploadedAt: Date;
  lastModifiedBy?: string;
  lastModifiedAt?: Date;
  
  // Document Status
  status: 'active' | 'archived' | 'deleted';
  
  // Retention Policy
  retentionYears?: number;
  deleteAfter?: Date;
}

// Document Schema
const documentSchema = new Schema<IDocument>({
  companyId: { 
    type: String, 
    required: true, 
    index: true 
  },
  transactionId: { 
    type: String, 
    index: true 
  },
  
  // File Information
  fileName: { 
    type: String, 
    required: true, 
    maxlength: 255 
  },
  originalFileName: { 
    type: String, 
    maxlength: 255 
  },
  fileType: {
    type: String,
    required: true,
    enum: ['receipt', 'invoice', 'bank_statement', 'contract', 'license', 'tax_document', 'other'],
    index: true
  },
  mimeType: { 
    type: String, 
    maxlength: 100 
  },
  fileSize: { 
    type: Number, 
    min: 0 
  },
  
  // Storage Information
  storagePath: String,
  storageProvider: {
    type: String,
    enum: ['aws_s3', 'azure_blob', 'google_cloud']
  },
  
  // OCR and AI Processing
  ocrStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
    index: true
  },
  ocrData: {
    extractedText: String,
    extractedTextArabic: String,
    confidence: {
      type: Number,
      min: 0,
      max: 1
    },
    language: {
      type: String,
      enum: ['en', 'ar', 'mixed']
    },
    processingTime: Number,
    boundingBoxes: [{
      text: String,
      x: Number,
      y: Number,
      width: Number,
      height: Number,
      confidence: Number
    }]
  },
  
  aiExtraction: {
    extractedData: {
      amount: Number,
      currency: {
        type: String,
        default: 'AED'
      },
      date: Date,
      vendor: String,
      description: String,
      taxAmount: Number,
      taxRate: Number,
      category: String,
      invoiceNumber: String,
      paymentMethod: String
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1
    },
    modelVersion: String,
    processingTime: Number,
    isVerified: {
      type: Boolean,
      default: false
    },
    verifiedBy: String,
    verifiedAt: Date
  },
  
  // Document Metadata
  tags: [{
    type: String,
    index: true
  }],
  notes: String,
  
  // Audit Trail
  uploadedBy: { 
    type: String, 
    required: true 
  },
  uploadedAt: { 
    type: Date, 
    required: true, 
    default: Date.now,
    index: true 
  },
  lastModifiedBy: String,
  lastModifiedAt: Date,
  
  // Document Status
  status: {
    type: String,
    enum: ['active', 'archived', 'deleted'],
    default: 'active',
    index: true
  },
  
  // Retention Policy
  retentionYears: {
    type: Number,
    default: 7
  },
  deleteAfter: {
    type: Date,
    index: true
  }
}, {
  timestamps: false, // We're handling timestamps manually
  collection: 'documents'
});

// Indexes for performance
documentSchema.index({ companyId: 1, uploadedAt: -1 });
documentSchema.index({ fileType: 1, status: 1 });
documentSchema.index({ 'aiExtraction.extractedData.amount': 1 });
documentSchema.index({ 'aiExtraction.extractedData.date': 1 });
documentSchema.index({ deleteAfter: 1 }); // For automated cleanup

// Text search index
documentSchema.index({
  fileName: 'text',
  'ocrData.extractedText': 'text',
  'ocrData.extractedTextArabic': 'text',
  'aiExtraction.extractedData.description': 'text',
  'aiExtraction.extractedData.vendor': 'text'
});

// Virtual for file URL (if using cloud storage)
documentSchema.virtual('fileUrl').get(function() {
  if (this.storageProvider && this.storagePath) {
    // Construct URL based on storage provider
    switch (this.storageProvider) {
      case 'aws_s3':
        return `https://s3.${process.env.AWS_REGION}.amazonaws.com/${process.env.AWS_S3_BUCKET}/${this.storagePath}`;
      default:
        return this.storagePath;
    }
  }
  return null;
});

// Pre-save middleware to set deleteAfter date
documentSchema.pre('save', function(next) {
  if (this.isNew && !this.deleteAfter && this.retentionYears) {
    const deleteDate = new Date();
    deleteDate.setFullYear(deleteDate.getFullYear() + this.retentionYears);
    this.deleteAfter = deleteDate;
  }
  
  if (this.isModified() && !this.isNew) {
    this.lastModifiedAt = new Date();
  }
  
  next();
});

// Static methods
documentSchema.statics.findByCompany = function(companyId: string, options: any = {}) {
  const query = this.find({ companyId, status: 'active' });
  
  if (options.fileType) {
    query.where({ fileType: options.fileType });
  }
  
  if (options.dateFrom) {
    query.where({ uploadedAt: { $gte: options.dateFrom } });
  }
  
  if (options.dateTo) {
    query.where({ uploadedAt: { $lte: options.dateTo } });
  }
  
  if (options.tags && options.tags.length > 0) {
    query.where({ tags: { $in: options.tags } });
  }
  
  return query.sort({ uploadedAt: -1 })
              .limit(options.limit || 50)
              .skip(options.offset || 0);
};

documentSchema.statics.findPendingOCR = function(limit = 10) {
  return this.find({ 
    ocrStatus: 'pending',
    status: 'active'
  })
  .sort({ uploadedAt: 1 })
  .limit(limit);
};

documentSchema.statics.findNeedingVerification = function(companyId?: string, limit = 20) {
  const query: any = {
    'aiExtraction.isVerified': false,
    'ocrStatus': 'completed',
    'status': 'active'
  };
  
  if (companyId) {
    query.companyId = companyId;
  }
  
  return this.find(query)
             .sort({ uploadedAt: 1 })
             .limit(limit);
};

documentSchema.statics.search = function(companyId: string, searchTerm: string, options: any = {}) {
  const searchQuery = {
    $and: [
      { companyId },
      { status: 'active' },
      {
        $or: [
          { fileName: new RegExp(searchTerm, 'i') },
          { 'ocrData.extractedText': new RegExp(searchTerm, 'i') },
          { 'ocrData.extractedTextArabic': new RegExp(searchTerm, 'i') },
          { 'aiExtraction.extractedData.description': new RegExp(searchTerm, 'i') },
          { 'aiExtraction.extractedData.vendor': new RegExp(searchTerm, 'i') },
          { tags: new RegExp(searchTerm, 'i') }
        ]
      }
    ]
  };
  
  return this.find(searchQuery)
             .sort({ uploadedAt: -1 })
             .limit(options.limit || 20)
             .skip(options.offset || 0);
};

documentSchema.statics.getStatistics = function(companyId: string) {
  return this.aggregate([
    { $match: { companyId, status: 'active' } },
    {
      $group: {
        _id: null,
        totalDocuments: { $sum: 1 },
        totalSize: { $sum: '$fileSize' },
        ocrCompleted: {
          $sum: { $cond: [{ $eq: ['$ocrStatus', 'completed'] }, 1, 0] }
        },
        aiVerified: {
          $sum: { $cond: ['$aiExtraction.isVerified', 1, 0] }
        },
        byFileType: {
          $push: {
            fileType: '$fileType',
            count: 1
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        totalDocuments: 1,
        totalSize: 1,
        ocrCompleted: 1,
        aiVerified: 1,
        ocrCompletionRate: {
          $divide: ['$ocrCompleted', '$totalDocuments']
        },
        aiVerificationRate: {
          $divide: ['$aiVerified', '$totalDocuments']
        }
      }
    }
  ]);
};

// Instance methods
documentSchema.methods.updateOCRStatus = function(status: string, ocrData?: IOCRData) {
  this.ocrStatus = status;
  if (ocrData) {
    this.ocrData = ocrData;
  }
  this.lastModifiedAt = new Date();
  return this.save();
};

documentSchema.methods.updateAIExtraction = function(aiExtraction: IAIExtraction) {
  this.aiExtraction = aiExtraction;
  this.lastModifiedAt = new Date();
  return this.save();
};

documentSchema.methods.verifyAIExtraction = function(userId: string, isCorrect: boolean, corrections?: any) {
  if (!this.aiExtraction) {
    this.aiExtraction = {};
  }
  
  this.aiExtraction.isVerified = true;
  this.aiExtraction.verifiedBy = userId;
  this.aiExtraction.verifiedAt = new Date();
  
  if (!isCorrect && corrections) {
    this.aiExtraction.extractedData = {
      ...this.aiExtraction.extractedData,
      ...corrections
    };
  }
  
  this.lastModifiedAt = new Date();
  return this.save();
};

documentSchema.methods.addTags = function(tags: string[]) {
  if (!this.tags) {
    this.tags = [];
  }
  
  const newTags = tags.filter(tag => !this.tags!.includes(tag));
  this.tags.push(...newTags);
  this.lastModifiedAt = new Date();
  return this.save();
};

documentSchema.methods.removeTags = function(tags: string[]) {
  if (!this.tags) {
    return this.save();
  }
  
  this.tags = this.tags.filter(tag => !tags.includes(tag));
  this.lastModifiedAt = new Date();
  return this.save();
};

documentSchema.methods.archive = function() {
  this.status = 'archived';
  this.lastModifiedAt = new Date();
  return this.save();
};

documentSchema.methods.softDelete = function() {
  this.status = 'deleted';
  this.lastModifiedAt = new Date();
  return this.save();
};

// Create and export the model
export const DocumentModel = mongoose.model<IDocument>('Document', documentSchema);

// Document service class for additional business logic
export class DocumentService {
  // Get documents for a company with pagination and filtering
  static async getDocuments(
    companyId: string,
    options: {
      page?: number;
      limit?: number;
      fileType?: string;
      dateFrom?: Date;
      dateTo?: Date;
      tags?: string[];
      status?: string;
    } = {}
  ) {
    const page = options.page || 1;
    const limit = options.limit || 20;
    const offset = (page - 1) * limit;

    const query: any = { companyId };
    
    if (options.status) {
      query.status = options.status;
    } else {
      query.status = 'active';
    }
    
    if (options.fileType) {
      query.fileType = options.fileType;
    }
    
    if (options.dateFrom || options.dateTo) {
      query.uploadedAt = {};
      if (options.dateFrom) {
        query.uploadedAt.$gte = options.dateFrom;
      }
      if (options.dateTo) {
        query.uploadedAt.$lte = options.dateTo;
      }
    }
    
    if (options.tags && options.tags.length > 0) {
      query.tags = { $in: options.tags };
    }

    const [documents, total] = await Promise.all([
      DocumentModel.find(query)
        .sort({ uploadedAt: -1 })
        .limit(limit)
        .skip(offset),
      DocumentModel.countDocuments(query)
    ]);

    return {
      documents,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Cleanup expired documents
  static async cleanupExpiredDocuments() {
    const now = new Date();
    
    const expiredDocuments = await DocumentModel.find({
      deleteAfter: { $lte: now },
      status: { $ne: 'deleted' }
    });

    // Mark as deleted (soft delete for audit trail)
    await DocumentModel.updateMany(
      {
        deleteAfter: { $lte: now },
        status: { $ne: 'deleted' }
      },
      {
        status: 'deleted',
        lastModifiedAt: now
      }
    );

    return expiredDocuments.length;
  }

  // Get document processing queue statistics
  static async getProcessingStats() {
    const stats = await DocumentModel.aggregate([
      {
        $group: {
          _id: '$ocrStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    const result = {
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0
    };

    stats.forEach(stat => {
      result[stat._id as keyof typeof result] = stat.count;
    });

    return result;
  }
}