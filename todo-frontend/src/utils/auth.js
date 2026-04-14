export function getAccessToken() {
  const authToken = localStorage.getItem('authToken');
  if (authToken) {
    return authToken;
  }

  const supabaseAuthKey = Object.keys(localStorage).find(
    (key) => key.startsWith('sb-') && key.endsWith('-auth-token'),
  );

  if (!supabaseAuthKey) {
    return null;
  }

  try {
    const session = JSON.parse(localStorage.getItem(supabaseAuthKey) || '{}');
    return session?.access_token || session?.currentSession?.access_token || null;
  } catch {
    return null;
  }
}
