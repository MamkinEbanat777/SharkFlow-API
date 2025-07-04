export function generateConfirmationCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}
