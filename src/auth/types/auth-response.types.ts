// src/auth/types/auth-response.types.ts

/**
 * User response structure (matches frontend UserProfile types)
 */
export interface UserResponse {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: 'ADMIN' | 'R_ADMIN' | 'PENTESTER' | 'CLIENT' | 'PARTNER';
    status: 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED' | 'DELETED';
    isEmailVerified: boolean;
    profileImage?: string | null;
    companyEmail?: string | null;
    companyDomain?: string | null;

    // Extended profile data based on role
    clientProfile?: any;
    partnerProfile?: any;
    pentesterProfile?: any;
}

/**
 * Base response structure
 */
export interface BaseResponse {
    success: boolean;
    message: string;
}

/**
 * OTP request response
 */
export interface RequestOTPResponse extends BaseResponse {
    expiresIn: number; // Seconds until OTP expires
}

/**
 * Login response (after OTP verification or OAuth)
 */
export interface LoginResponse extends BaseResponse {
    user: UserResponse;
}

/**
 * Get current user response
 */
export interface GetMeResponse {
    success: boolean;
    user: UserResponse;
}