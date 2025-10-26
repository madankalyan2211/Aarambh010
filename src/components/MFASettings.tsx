import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, Shield } from 'lucide-react';
import { checkMFAStatus, enableMFA, disableMFA } from '../services/auth0.service';

interface MFASettingsProps {
  userEmail: string;
  onMFAChange?: (enabled: boolean) => void;
}

export function MFASettings({ userEmail, onMFAChange }: MFASettingsProps) {
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load MFA status on component mount
  useEffect(() => {
    loadMFAStatus();
  }, [userEmail]);

  const loadMFAStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await checkMFAStatus(userEmail);
      
      if (response.success && response.data) {
        setMfaEnabled(response.data.mfaEnabled);
      } else {
        setError(response.message || 'Failed to load MFA status');
      }
    } catch (err) {
      setError('Failed to load MFA status');
      console.error('Error loading MFA status:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMFAChange = async (enabled: boolean) => {
    try {
      setUpdating(true);
      setError(null);
      setSuccess(null);
      
      let response;
      
      if (enabled) {
        response = await enableMFA(userEmail);
      } else {
        response = await disableMFA(userEmail);
      }
      
      if (response.success) {
        setMfaEnabled(enabled);
        setSuccess(enabled ? 'MFA enabled successfully' : 'MFA disabled successfully');
        if (onMFAChange) {
          onMFAChange(enabled);
        }
      } else {
        setError(response.message || 'Failed to update MFA settings');
      }
    } catch (err) {
      setError('Failed to update MFA settings');
      console.error('Error updating MFA:', err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Security Settings
        </CardTitle>
        <CardDescription>
          Manage your multi-factor authentication settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {success && (
          <Alert>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}
        
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="mfa-switch" className="text-base">
              Multi-Factor Authentication
            </Label>
            <p className="text-sm text-muted-foreground">
              Add an extra layer of security to your account
            </p>
          </div>
          <Switch
            id="mfa-switch"
            checked={mfaEnabled}
            onCheckedChange={handleMFAChange}
            disabled={updating}
          />
        </div>
        
        {mfaEnabled && (
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">How MFA works</h4>
            <p className="text-sm text-muted-foreground">
              When you sign in, you'll need to provide a code sent to your email or phone in addition to your password.
            </p>
          </div>
        )}
        
        <div className="flex justify-end">
          <Button
            variant="outline"
            onClick={loadMFAStatus}
            disabled={updating}
          >
            {updating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Refresh
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}