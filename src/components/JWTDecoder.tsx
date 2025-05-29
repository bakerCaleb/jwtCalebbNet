import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Copy, Check, AlertTriangle, Shield, Clock, Key } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface DecodedJWT {
  header: any;
  payload: any;
  signature: string;
  isValidFormat: boolean;
  isExpired: boolean;
  errors: string[];
  expirationErrors: string[];
}

const JWTDecoder = () => {
  const [token, setToken] = useState('');
  const [decoded, setDecoded] = useState<DecodedJWT | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const sampleToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjk5OTk5OTk5OTl9.Lkf7aUQYhao0Lut3xrGD5iEiA2Bpg3YZGjmlh_s8_mY';
  const decodeJWT = (jwtToken: string): DecodedJWT | null => {
    if (!jwtToken.trim()) return null;
    try {
      const parts = jwtToken.split('.');
      if (parts.length !== 3) {
        return {
          header: {},
          payload: {},
          signature: '',
          isValidFormat: false,
          isExpired: false,
          errors: ['Invalid JWT format - must have 3 parts separated by dots'],
          expirationErrors: []
        };
      }
      const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      const signature = parts[2];
      const errors: string[] = [];
      const expirationErrors: string[] = [];
      let isExpired = false;

      // Check expiration
      if (payload.exp) {
        const expDate = new Date(payload.exp * 1000);
        const now = new Date();
        if (expDate < now) {
          isExpired = true;
          expirationErrors.push(`Token expired on ${expDate.toLocaleString()} (exp claim)`);
        }
      }

      // Check issued at
      if (payload.iat) {
        const iatDate = new Date(payload.iat * 1000);
        const now = new Date();
        if (iatDate > now) {
          expirationErrors.push(`Token issued in the future (iat claim): ${iatDate.toLocaleString()}`);
        }
      }

      // Check not before
      if (payload.nbf) {
        const nbfDate = new Date(payload.nbf * 1000);
        const now = new Date();
        if (nbfDate > now) {
          isExpired = true;
          expirationErrors.push(`Token not valid before ${nbfDate.toLocaleString()} (nbf claim)`);
        }
      }
      return {
        header,
        payload,
        signature,
        isValidFormat: true,
        isExpired,
        errors,
        expirationErrors
      };
    } catch (error) {
      return {
        header: {},
        payload: {},
        signature: '',
        isValidFormat: false,
        isExpired: false,
        errors: ['Invalid JWT format - unable to decode'],
        expirationErrors: []
      };
    }
  };
  useEffect(() => {
    setDecoded(decodeJWT(token));
  }, [token]);
  const copyToClipboard = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      toast({
        description: `${section} copied to clipboard`,
        duration: 2000
      });
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (err) {
      toast({
        description: 'Failed to copy to clipboard',
        variant: 'destructive',
        duration: 2000
      });
    }
  };
  const loadSample = () => {
    setToken(sampleToken);
  };
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return {
      readable: date.toLocaleString(),
      relative: getRelativeTime(date)
    };
  };
  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  const getClaimDisplayName = (claim: string, value: any) => {
    const claimMappings: { [key: string]: string } = {
      'alg': 'Algorithm',
      'typ': 'Type',
      'kid': 'Key ID',
      'sub': 'Subject',
      'iss': 'Issuer',
      'aud': 'Audience',
      'exp': 'Expiration Time',
      'iat': 'Issued At',
      'nbf': 'Not Before',
      'jti': 'JWT ID',
      'scope': 'Scope',
      'azp': 'Authorized Party',
      'name': 'Name',
      'email': 'Email',
      'email_verified': 'Email Verified',
      'family_name': 'Family Name',
      'given_name': 'Given Name',
      'picture': 'Picture',
      'roles': 'Roles',
      'permissions': 'Permissions'
    };

    const displayName = claimMappings[claim] || claim;
    
    // Special handling for algorithm values
    if (claim === 'alg') {
      const algMappings: { [key: string]: string } = {
        'HS256': 'HMAC SHA-256',
        'HS384': 'HMAC SHA-384',
        'HS512': 'HMAC SHA-512',
        'RS256': 'RSA SHA-256',
        'RS384': 'RSA SHA-384',
        'RS512': 'RSA SHA-512',
        'ES256': 'ECDSA SHA-256',
        'ES384': 'ECDSA SHA-384',
        'ES512': 'ECDSA SHA-512',
        'PS256': 'RSA PSS SHA-256',
        'PS384': 'RSA PSS SHA-384',
        'PS512': 'RSA PSS SHA-512'
      };
      
      const algDescription = algMappings[value] || value;
      return `${displayName} (${claim}): ${algDescription}`;
    }

    // Handle timestamp claims
    if (['exp', 'iat', 'nbf'].includes(claim) && typeof value === 'number') {
      const date = new Date(value * 1000);
      return `${displayName} (${claim}): ${date.toLocaleString()}`;
    }

    // Handle boolean values
    if (typeof value === 'boolean') {
      return `${displayName} (${claim}): ${value ? 'Yes' : 'No'}`;
    }

    // Handle arrays
    if (Array.isArray(value)) {
      return `${displayName} (${claim}): ${value.join(', ')}`;
    }

    // Default handling
    return `${displayName} (${claim}): ${value}`;
  };

  const renderClaimDetails = (claims: any) => {
    return Object.entries(claims).map(([key, value]) => (
      <div key={key} className="text-sm text-[#475569]">
        {getClaimDisplayName(key, value)}
      </div>
    ));
  };

  return <div className="w-full max-w-6xl mx-auto p-6 space-y-6 bg-[#fafafa] min-h-screen">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <img src="/lovable-uploads/45f8c2c2-0a52-436d-972b-2bad8957e9db.png" alt="JWT Decoder Icon" className="w-12 h-12 object-contain" />
          <h1 className="text-3xl font-bold text-[#1e40af]">
            JWT Decoder
          </h1>
        </div>
        <p className="text-[#64748b] max-w-2xl mx-auto">
          Decode, validate, and debug JSON Web Tokens securely in your browser. Perfect for learning, troubleshooting, and development.
        </p>
      </div>

      {/* Input Section */}
      <Card className="p-6 bg-white border-[#e2e8f0]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-[#1e293b]">
              <Key className="w-5 h-5 text-[#1e40af]" />
              Token Input
            </h2>
            <Button variant="outline" size="sm" onClick={loadSample} className="border-[#e2e8f0] text-[#1e40af] hover:text-white bg-green-600 hover:bg-green-500">
              Load Sample
            </Button>
          </div>
          <Textarea 
            placeholder="Paste your JWT token here..." 
            value={token} 
            onChange={e => setToken(e.target.value)} 
            className="min-h-[120px] font-mono text-sm border-[#e2e8f0] bg-white text-[#1e293b]" 
          />
          {decoded && (
            <div className="flex flex-wrap gap-2">
              {decoded.isValidFormat ? (
                <Badge className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20">
                  <Shield className="w-3 h-3" />
                  Valid Format
                </Badge>
              ) : (
                <Badge className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-[#ef4444]/10 text-[#ef4444] border border-[#ef4444]/20">
                  <AlertTriangle className="w-3 h-3" />
                  Invalid Format
                </Badge>
              )}
              {(decoded.isExpired || decoded.expirationErrors.length > 0) && (
                <Badge className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-[#f59e0b]/10 text-[#f59e0b] border border-[#f59e0b]/20">
                  <Clock className="w-3 h-3" />
                  Expired
                </Badge>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Decoded Sections */}
      {decoded && decoded.isValidFormat && <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Header */}
          <Card className="p-6 bg-white border-[#e2e8f0]">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-[#f59e0b]">Header</h3>
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(JSON.stringify(decoded.header, null, 2), 'Header')} className="hover:bg-[#93c5fd]/20">
                  {copiedSection === 'Header' ? <Check className="w-4 h-4 text-[#10b981]" /> : <Copy className="w-4 h-4 text-[#64748b]" />}
                </Button>
              </div>
              <div className="bg-[#fafafa] border border-[#e2e8f0] rounded-lg p-4 font-mono text-sm">
                <pre className="text-xs whitespace-pre-wrap break-words text-[#1e293b]">
                  {JSON.stringify(decoded.header, null, 2)}
                </pre>
              </div>
              <div className="space-y-1">
                {renderClaimDetails(decoded.header)}
              </div>
            </div>
          </Card>

          {/* Payload */}
          <Card className="p-6 bg-white border-[#e2e8f0]">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-[#3b82f6]">Payload</h3>
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(JSON.stringify(decoded.payload, null, 2), 'Payload')} className="hover:bg-[#93c5fd]/20">
                  {copiedSection === 'Payload' ? <Check className="w-4 h-4 text-[#10b981]" /> : <Copy className="w-4 h-4 text-[#64748b]" />}
                </Button>
              </div>
              <div className="bg-[#fafafa] border border-[#e2e8f0] rounded-lg p-4 font-mono text-sm">
                <pre className="text-xs whitespace-pre-wrap break-words text-[#1e293b]">
                  {JSON.stringify(decoded.payload, null, 2)}
                </pre>
              </div>
              
              <div className="space-y-1">
                {renderClaimDetails(decoded.payload)}
              </div>

              {/* Timestamp interpretations */}
              <div className="space-y-2 text-sm">
                {decoded.payload.iat && <div className="flex justify-between">
                    <span className="text-[#475569]">Issued:</span>
                    <span className="text-[#3b82f6] font-medium">
                      {formatTimestamp(decoded.payload.iat).relative}
                    </span>
                  </div>}
                {decoded.payload.exp && <div className="flex justify-between">
                    <span className="text-[#475569]">Expires:</span>
                    <span className={decoded.isExpired ? 'text-[#ef4444] font-medium' : 'text-[#10b981] font-medium'}>
                      {formatTimestamp(decoded.payload.exp).relative}
                    </span>
                  </div>}
              </div>
            </div>
          </Card>

          {/* Signature */}
          <Card className="p-6 bg-white border-[#e2e8f0]">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-[#10b981]">Signature</h3>
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(decoded.signature, 'Signature')} className="hover:bg-[#93c5fd]/20">
                  {copiedSection === 'Signature' ? <Check className="w-4 h-4 text-[#10b981]" /> : <Copy className="w-4 h-4 text-[#64748b]" />}
                </Button>
              </div>
              <div className="bg-[#fafafa] border border-[#e2e8f0] rounded-lg p-4 font-mono text-sm">
                <pre className="text-xs whitespace-pre-wrap break-words font-mono text-[#1e293b]">
                  {decoded.signature}
                </pre>
              </div>
              <div className="text-sm text-[#475569]">
                Signature verification requires the secret key
              </div>
              <div className="text-sm text-[#475569]">
                Length: {decoded.signature.length} characters
              </div>
            </div>
          </Card>
        </div>}

      {/* Errors */}
      {decoded && (decoded.errors.length > 0 || decoded.expirationErrors.length > 0) && (
        <Card className={`p-6 ${decoded.expirationErrors.length > 0 && decoded.errors.length === 0 ? 'border-[#f59e0b]/20 bg-[#f59e0b]/5' : 'border-[#ef4444]/20 bg-[#ef4444]/5'}`}>
          <div className="space-y-3">
            <h3 className={`font-semibold flex items-center gap-2 ${decoded.expirationErrors.length > 0 && decoded.errors.length === 0 ? 'text-[#f59e0b]' : 'text-[#ef4444]'}`}>
              {decoded.expirationErrors.length > 0 && decoded.errors.length === 0 ? (
                <Clock className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
              {decoded.expirationErrors.length > 0 && decoded.errors.length === 0 ? 'Expiration Issues' : 'Issues Found'}
            </h3>
            <ul className="space-y-1">
              {decoded.errors.map((error, index) => (
                <li key={`error-${index}`} className="text-sm text-[#ef4444] flex items-start gap-2">
                  <span className="w-1 h-1 bg-[#ef4444] rounded-full mt-2 flex-shrink-0" />
                  {error}
                </li>
              ))}
              {decoded.expirationErrors.map((error, index) => (
                <li key={`exp-error-${index}`} className={`text-sm flex items-start gap-2 ${decoded.errors.length === 0 ? 'text-[#f59e0b]' : 'text-[#ef4444]'}`}>
                  <span className={`w-1 h-1 rounded-full mt-2 flex-shrink-0 ${decoded.errors.length === 0 ? 'bg-[#f59e0b]' : 'bg-[#ef4444]'}`} />
                  {error}
                </li>
              ))}
            </ul>
          </div>
        </Card>
      )}

      {/* Educational footer */}
      <div className="text-center text-xs text-[#6b7280]">
        <p>All processing happens in your browser. No tokens are sent to any server.</p>
      </div>
    </div>;
};

export default JWTDecoder;
