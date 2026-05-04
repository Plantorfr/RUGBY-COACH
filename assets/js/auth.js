const sb = window.supabaseClient;

async function login(email, password) {
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

async function logout() {
  await sb.auth.signOut();
  window.location.href = 'index.html';
}

async function getUser() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) return null;
  const { data: profile } = await sb
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single();
  return { ...session.user, profile };
}

async function requireAuth() {
  const user = await getUser();
  if (!user) {
    window.location.href = 'index.html';
    return null;
  }
  return user;
}