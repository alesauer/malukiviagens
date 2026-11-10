export function normalizeInviteCode(code: string): string {
  return code.trim().toUpperCase();
}

export function signupMetadata(name: string, inviteCode: string) {
  const code = normalizeInviteCode(inviteCode);
  return { full_name: name.trim(), ...(code ? { family_invite_code: code } : {}) };
}