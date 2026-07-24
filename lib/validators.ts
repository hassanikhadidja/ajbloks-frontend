const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function isValidEmail(email: string): boolean {
  return emailRegex.test(email);
}

/** At least 6 chars, with one uppercase letter. Lowercase and digits are allowed. */
export function isValidPassword(password: string): boolean {
  if (typeof password !== "string" || password.length < 6) return false;
  return /[A-Z]/.test(password);
}

export function passwordRequirementsMessage(): string {
  return "Le mot de passe doit contenir au moins 6 caractères, dont une majuscule (A–Z).";
}
