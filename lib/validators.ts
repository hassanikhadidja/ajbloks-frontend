const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export function isValidEmail(email: string): boolean {
  return emailRegex.test(email);
}

const passwordSymbols = "!@#$%^&*()_+-=[]{}|;':\",./<>?";

export function isValidPassword(password: string): boolean {
  if (password.length < 6) return false;

  let upper = 0;
  let lower = 0;
  let digit = 0;
  let symbol = 0;

  for (const ch of password) {
    if (ch >= "A" && ch <= "Z") upper++;
    if (ch >= "a" && ch <= "z") lower++;
    if (ch >= "0" && ch <= "9") digit++;
    if (passwordSymbols.includes(ch)) symbol++;
  }

  return upper > 0 && lower > 0 && digit > 0 && symbol > 0;
}
