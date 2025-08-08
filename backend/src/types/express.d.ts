/**
 * Express Type Extensions
 * TaxMaster AI - UAE Corporate Tax Compliance System
 */

declare namespace Express {
  interface Request {
    id?: string;
    user?: {
      id: string;
      email: string;
      companyId?: string;
      role?: string;
      permissions?: any;
    };
    company?: {
      id: string;
      name: string;
      subscription_plan: string;
    };
  }
}