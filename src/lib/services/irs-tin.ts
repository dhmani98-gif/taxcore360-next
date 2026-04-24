/**
 * IRS TIN Matching API Service
 * Validates TIN (Taxpayer Identification Number) against IRS database
 * Rate limit: 10,000 requests per day
 */

import { prisma } from '@/lib/prisma';

export interface VerifyTINParams {
  tin: string;
  name: string;
  type: 'EIN' | 'SSN';
}

export interface TINVerificationResult {
  success: boolean;
  match: boolean;
  code?: string;
  message?: string;
  cached?: boolean;
}

export interface BulkVerificationResult {
  total: number;
  matched: number;
  mismatched: number;
  errors: number;
  results: Array<{
    vendorId: string;
    result: TINVerificationResult;
  }>;
}

// Cache TIN verification results for 30 days
const CACHE_DAYS = 30;

/**
 * Verify a single TIN against IRS database
 * Uses caching to avoid duplicate API calls
 */
export async function verifyTIN({
  tin,
  name,
  type
}: VerifyTINParams): Promise<TINVerificationResult> {
  try {
    // Check cache first
    const cached = await checkCache(tin, name);
    if (cached) {
      return { ...cached, cached: true };
    }

    // Call IRS TIN Matching API
    const result = await callIRSTINAPI({ tin, name, type });
    
    // Cache the result
    await cacheResult(tin, name, result);
    
    return result;
  } catch (error) {
    console.error('TIN verification error:', error);
    return {
      success: false,
      match: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Bulk verify TINs with rate limiting
 * Processes 10 TINs per minute to stay within IRS limits
 */
export async function bulkVerifyTINs(
  vendors: Array<{ id: string; taxId: string; legalName: string; taxIdType: string }>
): Promise<BulkVerificationResult> {
  const results: BulkVerificationResult['results'] = [];
  let matched = 0;
  let mismatched = 0;
  let errors = 0;

  // Process in batches of 10 with delay
  for (let i = 0; i < vendors.length; i += 10) {
    const batch = vendors.slice(i, i + 10);
    
    const batchPromises = batch.map(async (vendor) => {
      try {
        const result = await verifyTIN({
          tin: vendor.taxId,
          name: vendor.legalName,
          type: vendor.taxIdType === 'SSN' ? 'SSN' : 'EIN'
        });

        // Update vendor record
        await prisma.vendor.update({
          where: { id: vendor.id },
          data: {
            tinVerified: result.match,
            tinVerifiedAt: new Date(),
            tinVerificationCode: result.code || null,
            tinMatchName: result.match ? vendor.legalName : null
          }
        });

        if (result.match) matched++;
        else if (result.success) mismatched++;
        else errors++;

        return { vendorId: vendor.id, result };
      } catch (error) {
        errors++;
        return {
          vendorId: vendor.id,
          result: {
            success: false,
            match: false,
            message: 'Verification failed'
          }
        };
      }
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);

    // Wait 60 seconds before next batch (10 per minute = 600 per hour)
    if (i + 10 < vendors.length) {
      await delay(60000);
    }
  }

  return {
    total: vendors.length,
    matched,
    mismatched,
    errors,
    results
  };
}

/**
 * Call IRS TIN Matching API
 * Note: This is a mock implementation. Real implementation requires:
 * - IRS TIN Matching API credentials
 * - SOAP/XML request format
 * - Proper error handling for IRS-specific codes
 */
async function callIRSTINAPI({
  tin,
  name,
  type
}: VerifyTINParams): Promise<TINVerificationResult> {
  const apiKey = process.env.IRS_TIN_API_KEY;
  
  if (!apiKey) {
    // Mock implementation for development
    console.log(`[MOCK] Verifying TIN: ${tin} for ${name}`);
    
    // Simulate IRS response codes
    const lastDigit = parseInt(tin.slice(-1));
    
    if (lastDigit === 0) {
      // Match
      return {
        success: true,
        match: true,
        code: '0',
        message: 'Name/TIN combination matches IRS records'
      };
    } else if (lastDigit === 1) {
      // TIN not found
      return {
        success: true,
        match: false,
        code: '1',
        message: 'TIN not found in IRS database'
      };
    } else if (lastDigit === 2) {
      // Name doesn't match
      return {
        success: true,
        match: false,
        code: '2',
        message: 'TIN found but name does not match'
      };
    } else if (lastDigit === 3) {
      // Invalid TIN format
      return {
        success: false,
        match: false,
        code: '3',
        message: 'Invalid TIN format'
      };
    } else {
      // Generic mismatch
      return {
        success: true,
        match: false,
        code: '4',
        message: 'Name/TIN combination does not match'
      };
    }
  }

  // Real IRS TIN Matching API implementation would go here
  // This requires SOAP/XML requests to IRS FIRE system
  throw new Error('IRS TIN API not yet implemented');
}

/**
 * Check if we have a cached result for this TIN/name combination
 */
async function checkCache(tin: string, name: string): Promise<TINVerificationResult | null> {
  // In production, use Redis or database cache
  // For now, return null to always call API (or mock)
  return null;
}

/**
 * Cache TIN verification result
 */
async function cacheResult(
  tin: string,
  name: string,
  result: TINVerificationResult
): Promise<void> {
  // In production, store in Redis with TTL of CACHE_DAYS
  // await redis.setex(`tin:${tin}:${name}`, CACHE_DAYS * 24 * 60 * 60, JSON.stringify(result));
}

/**
 * Delay function for rate limiting
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Format TIN for display (mask all but last 4)
 */
export function maskTIN(tin: string): string {
  if (tin.length === 9) {
    // EIN: XX-XXX****
    return `XX-XXX${tin.slice(-4)}`;
  } else if (tin.length === 11) {
    // SSN with dashes: XXX-XX-****
    return `XXX-XX-${tin.slice(-4)}`;
  } else if (tin.length === 9) {
    // SSN without dashes
    return `XXX-XX-${tin.slice(-4)}`;
  }
  return 'XXX-XX-XXXX';
}

/**
 * Validate TIN format
 */
export function validateTINFormat(tin: string, type: 'EIN' | 'SSN'): boolean {
  // Remove dashes and spaces
  const cleanTIN = tin.replace(/[-\s]/g, '');
  
  if (type === 'EIN') {
    // EIN: 9 digits, first two digits must be valid
    const validPrefixes = ['01', '02', '03', '04', '05', '06', '10', '11', '12', '13', '14', '15', '16', '20', '21', '22', '23', '24', '25', '26', '27', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59', '60', '61', '62', '63', '64', '65', '66', '67', '68', '71', '72', '73', '74', '75', '76', '77', '80', '81', '82', '83', '84', '85', '86', '87', '88', '90', '91', '92', '93', '94', '95', '98', '99'];
    
    if (cleanTIN.length !== 9) return false;
    const prefix = cleanTIN.slice(0, 2);
    return validPrefixes.includes(prefix);
  } else {
    // SSN: 9 digits, cannot be all zeros or start with 000, 666, or 900-999
    if (cleanTIN.length !== 9) return false;
    
    const area = cleanTIN.slice(0, 3);
    const group = cleanTIN.slice(3, 5);
    const serial = cleanTIN.slice(5, 9);
    
    // Invalid area numbers
    if (area === '000' || area === '666' || area.startsWith('9')) return false;
    // Invalid group or serial
    if (group === '00' || serial === '0000') return false;
    
    return true;
  }
}

/**
 * Get TIN verification status badge
 */
export function getTINStatusBadge(verified: boolean | null): {
  text: string;
  color: string;
} {
  if (verified === true) {
    return { text: 'Verified', color: 'bg-green-100 text-green-800' };
  } else if (verified === false) {
    return { text: 'Mismatch', color: 'bg-red-100 text-red-800' };
  }
  return { text: 'Unverified', color: 'bg-yellow-100 text-yellow-800' };
}
