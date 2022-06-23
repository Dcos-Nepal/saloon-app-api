import { createHash } from 'crypto';

export const generateHash = (input) => {
  return createHash('md5').update(input).digest('hex');
};

/**
 * Get Property Address
 * @param address  Address
 * @returns String
 */
export const formatAddress = (address: { street1?: string; street2?: string; city?: string; state?: string; postalCode?: string; country?: string }) => {
  if (!address) {
    return '';
  }

  const addressStack = [];

  if (address?.street1) addressStack.push(address?.street1);
  if (address?.street2) addressStack.push(address?.street2);
  if (address?.city) addressStack.push(address?.city);
  if (address?.state) addressStack.push(address?.state);
  if (address?.postalCode) addressStack.push(address?.postalCode);
  if (address?.country) addressStack.push(address?.country);

  return addressStack.join(', ');
};
