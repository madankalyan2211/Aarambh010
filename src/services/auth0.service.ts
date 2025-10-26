import { env } from '../config/env';

interface MFAStatusResponse {
  success: boolean;
  data?: {
    mfaEnabled: boolean;
  };
  message?: string;
}

interface MFAResponse {
  success: boolean;
  message?: string;
}

interface UserRoleResponse {
  success: boolean;
  data?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  message?: string;
}

/**
 * Check if MFA is enabled for a user
 */
export const checkMFAStatus = async (email: string): Promise<MFAStatusResponse> => {
  try {
    const response = await fetch(`${env.apiBaseUrl}/auth0/mfa/check?email=${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error checking MFA status:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error checking MFA status',
    };
  }
};

/**
 * Enable MFA for a user
 */
export const enableMFA = async (email: string): Promise<MFAResponse> => {
  try {
    const response = await fetch(`${env.apiBaseUrl}/auth0/mfa/enable`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error enabling MFA:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error enabling MFA',
    };
  }
};

/**
 * Disable MFA for a user
 */
export const disableMFA = async (email: string): Promise<MFAResponse> => {
  try {
    const response = await fetch(`${env.apiBaseUrl}/auth0/mfa/disable`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error disabling MFA:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error disabling MFA',
    };
  }
};

/**
 * Update user role
 */
export const updateUserRole = async (email: string, role: string): Promise<UserRoleResponse> => {
  try {
    const response = await fetch(`${env.apiBaseUrl}/auth0/role/update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, role }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating user role:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error updating user role',
    };
  }
};