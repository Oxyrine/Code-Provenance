// ponytail: covers common chapter regions, not the full ITU-T E.164 list. Add entries when a real signup needs one.
export interface CountryCode {
  code: string;
  country: string;
  digits: [min: number, max: number];
}

export const COUNTRY_CODES: CountryCode[] = [
  { code: '+91', country: 'India', digits: [10, 10] },
  { code: '+1', country: 'US / Canada', digits: [10, 10] },
  { code: '+44', country: 'United Kingdom', digits: [10, 10] },
  { code: '+61', country: 'Australia', digits: [9, 9] },
  { code: '+65', country: 'Singapore', digits: [8, 8] },
  { code: '+971', country: 'UAE', digits: [8, 9] },
  { code: '+81', country: 'Japan', digits: [9, 10] },
  { code: '+49', country: 'Germany', digits: [10, 11] },
  { code: '+33', country: 'France', digits: [9, 9] },
  { code: '+86', country: 'China', digits: [11, 11] },
];

export function isValidLocalNumber(countryCode: string, localNumber: string): boolean {
  const digits = localNumber.replace(/\D/g, '');
  const entry = COUNTRY_CODES.find(c => c.code === countryCode);
  if (!entry) return false;
  const [min, max] = entry.digits;
  return digits.length >= min && digits.length <= max;
}

// Splits a stored "+91 9876543210" style phone string back into its parts for editing.
export function parsePhone(phone: string): { countryCode: string; localNumber: string } {
  const match = phone.trim().match(/^(\+\d{1,3})\s*(.*)$/);
  if (match && COUNTRY_CODES.some(c => c.code === match[1])) {
    return { countryCode: match[1], localNumber: match[2].replace(/\D/g, '') };
  }
  return { countryCode: '+91', localNumber: phone.replace(/\D/g, '') };
}
