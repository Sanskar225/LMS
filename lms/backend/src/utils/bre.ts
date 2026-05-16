// ─────────────────────────────────────────────────────────────
//  Business Rule Engine (BRE) — SERVER SIDE ONLY
//  Running on server prevents client-side bypass via DevTools
//  or direct API calls with manipulated payloads.
// ─────────────────────────────────────────────────────────────

export interface BREInput {
  dateOfBirth: Date | string;
  monthlySalary: number;
  pan: string;
  employmentMode: string;
}

export interface BREResult {
  passed: boolean;
  rejectionReasons: string[];
}

// Valid PAN: 5 uppercase letters + 4 digits + 1 uppercase letter
// Example: ABCDE1234F
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

function calculateAge(dob: Date): number {
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

export function runBRE(input: BREInput): BREResult {
  const reasons: string[] = [];

  // Rule 1: Age between 23 and 50
  const age = calculateAge(new Date(input.dateOfBirth));
  if (age < 23 || age > 50) {
    reasons.push(`Age must be between 23 and 50 years. Your current age: ${age} years.`);
  }

  // Rule 2: Monthly salary >= ₹25,000
  if (Number(input.monthlySalary) < 25000) {
    reasons.push(
      `Monthly salary must be at least ₹25,000. Provided: ₹${Number(input.monthlySalary).toLocaleString('en-IN')}.`
    );
  }

  // Rule 3: Valid PAN format
  const panUpper = input.pan.toUpperCase().trim();
  if (!PAN_REGEX.test(panUpper)) {
    reasons.push(
      `Invalid PAN format. Must be 5 letters + 4 digits + 1 letter (e.g., ABCDE1234F). Provided: "${input.pan}"`
    );
  }

  // Rule 4: Must not be unemployed
  if (input.employmentMode === 'unemployed') {
    reasons.push('Employment status is Unemployed. Only Salaried or Self-Employed applicants are eligible.');
  }

  return { passed: reasons.length === 0, rejectionReasons: reasons };
}

// ─────────────────────────────────────────────────────────────
//  Loan calculation: SI = (P × R × T) / (365 × 100)
// ─────────────────────────────────────────────────────────────
export function calculateLoanTerms(
  principal: number,
  tenureDays: number,
  rate = 12
): { simpleInterest: number; totalRepayment: number } {
  const simpleInterest = (principal * rate * tenureDays) / (365 * 100);
  const totalRepayment = principal + simpleInterest;
  return {
    simpleInterest: Math.round(simpleInterest * 100) / 100,
    totalRepayment: Math.round(totalRepayment * 100) / 100,
  };
}
