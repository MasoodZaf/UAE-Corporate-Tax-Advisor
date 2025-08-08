/**
 * Authentication Service
 * TaxMaster AI - UAE Corporate Tax Compliance System
 */

import apiService from './api';
import { User, AuthTokens, LoginCredentials, RegisterData, ApiResponse } from '../types';

class AuthService {
  // Login
  public async login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await apiService.post<{ user: User; tokens: AuthTokens }>('/auth/login', credentials);
    
    if (response.success) {
      this.storeAuthData(response.data);
    }
    
    return response.data;
  }

  // Register
  public async register(userData: RegisterData): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await apiService.post<{ user: User; tokens: AuthTokens }>('/auth/register', userData);
    
    if (response.success) {
      this.storeAuthData(response.data);
    }
    
    return response.data;
  }

  // Logout
  public async logout(): Promise<void> {
    try {
      await apiService.post('/auth/logout');
    } catch (error) {
      console.warn('Logout API call failed:', error);
    } finally {
      this.clearAuthData();
    }
  }

  // Refresh token
  public async refreshToken(): Promise<AuthTokens> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiService.post<AuthTokens>('/auth/refresh', {
      refresh_token: refreshToken
    });

    if (response.success) {
      this.storeTokens(response.data);
    }

    return response.data;
  }

  // Get current user profile
  public async getCurrentUser(): Promise<User> {
    const response = await apiService.get<User>('/auth/me');
    return response.data;
  }

  // Update user profile
  public async updateProfile(userData: Partial<User>): Promise<User> {
    const response = await apiService.put<User>('/auth/profile', userData);
    
    if (response.success) {
      this.updateStoredUser(response.data);
    }
    
    return response.data;
  }

  // Change password
  public async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiService.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword
    });
  }

  // Forgot password
  public async forgotPassword(email: string): Promise<void> {
    await apiService.post('/auth/forgot-password', { email });
  }

  // Reset password
  public async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiService.post('/auth/reset-password', {
      token,
      new_password: newPassword
    });
  }

  // Verify email
  public async verifyEmail(token: string): Promise<void> {
    await apiService.post('/auth/verify-email', { token });
  }

  // Resend verification email
  public async resendVerificationEmail(): Promise<void> {
    await apiService.post('/auth/resend-verification');
  }

  // Check authentication status
  public isAuthenticated(): boolean {
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  }

  // Clear authentication data
  public clearAuth(): void {
    this.clearAuthData();
  }

  // Get stored user
  public getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  // Get stored token
  public getStoredToken(): string | null {
    return localStorage.getItem('access_token');
  }

  // Private helper methods
  private storeAuthData(data: { user: User; tokens: AuthTokens }): void {
    this.storeTokens(data.tokens);
    this.updateStoredUser(data.user);
  }

  private storeTokens(tokens: AuthTokens): void {
    localStorage.setItem('access_token', tokens.access_token);
    localStorage.setItem('refresh_token', tokens.refresh_token);
    localStorage.setItem('token_expires_at', (Date.now() + tokens.expires_in * 1000).toString());
  }

  private updateStoredUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  private clearAuthData(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token_expires_at');
    localStorage.removeItem('user');
  }

  // Token expiry check
  public isTokenExpired(): boolean {
    const expiresAt = localStorage.getItem('token_expires_at');
    if (!expiresAt) return true;
    
    return Date.now() >= parseInt(expiresAt);
  }

  // Get user role
  public getUserRole(): string | null {
    const user = this.getStoredUser();
    return user?.role || null;
  }

  // Check if user has permission
  public hasPermission(permission: string): boolean {
    const user = this.getStoredUser();
    if (!user) return false;

    // Simple role-based permissions
    const rolePermissions = {
      admin: ['*'], // Admin has all permissions
      accountant: ['view_transactions', 'create_transactions', 'edit_transactions', 'view_reports', 'upload_documents'],
      user: ['view_transactions', 'create_transactions', 'upload_documents'],
      viewer: ['view_transactions', 'view_reports']
    };

    const userPermissions = rolePermissions[user.role as keyof typeof rolePermissions] || [];
    return userPermissions.includes('*') || userPermissions.includes(permission);
  }
}

// Create singleton instance
const authService = new AuthService();
export default authService;