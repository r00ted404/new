export interface CardType {
  name: string;
  pattern: RegExp;
  maxLength: number;
  cvvLength: number;
  icon: string;
}

export const CARD_TYPES: CardType[] = [
  {
    name: "Visa",
    pattern: /^4/,
    maxLength: 16,
    cvvLength: 3,
    icon: "💳",
  },
  {
    name: "Mastercard",
    pattern: /^5[1-5]/,
    maxLength: 16,
    cvvLength: 3,
    icon: "💳",
  },
  {
    name: "American Express",
    pattern: /^3[47]/,
    maxLength: 15,
    cvvLength: 4,
    icon: "💳",
  },
  {
    name: "Discover",
    pattern: /^6(?:011|5)/,
    maxLength: 16,
    cvvLength: 3,
    icon: "💳",
  },
];

export function detectCardType(number: string): CardType | null {
  const cleanNumber = number.replace(/\D/g, "");
  return CARD_TYPES.find((type) => type.pattern.test(cleanNumber)) || null;
}

export function formatCardNumber(value: string): string {
  const cleanValue = value.replace(/\D/g, "");
  const cardType = detectCardType(cleanValue);

  if (cardType?.name === "American Express") {
    return cleanValue.replace(/(\d{4})(\d{6})(\d{5})/, "$1 $2 $3").trim();
  }

  return cleanValue.replace(/(\d{4})/g, "$1 ").trim();
}

export function formatExpiryDate(value: string): string {
  const cleanValue = value.replace(/\D/g, "");
  if (cleanValue.length >= 2) {
    return cleanValue.substring(0, 2) + "/" + cleanValue.substring(2, 4);
  }
  return cleanValue;
}

export function validateExpiryDate(value: string): boolean {
  const [month, year] = value.split("/");
  if (!month || !year || month.length !== 2 || year.length !== 2) return false;

  const monthNum = parseInt(month);
  const yearNum = parseInt("20" + year);
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  if (monthNum < 1 || monthNum > 12) return false;
  if (
    yearNum < currentYear ||
    (yearNum === currentYear && monthNum < currentMonth)
  )
    return false;

  return true;
}

export function formatSSN(value: string): string {
  const cleanValue = value.replace(/\D/g, "");
  return cleanValue.replace(/(\d{3})(\d{2})(\d{4})/, "$1-$2-$3").trim();
}

export function validateSSN(value: string): boolean {
  const cleanValue = value.replace(/\D/g, "");
  return cleanValue.length === 9;
}

export function formatZip(value: string): string {
  const cleanValue = value.replace(/\D/g, "");
  return cleanValue.substring(0, 5);
}


