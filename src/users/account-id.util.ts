const ACCOUNT_ID_PREFIX = 'MTB';
const ACCOUNT_ID_DIGITS = 5;

export function formatUserAccountId(accountNumber: number): string {
  return `${ACCOUNT_ID_PREFIX}-${accountNumber
    .toString()
    .padStart(ACCOUNT_ID_DIGITS, '0')}`;
}
