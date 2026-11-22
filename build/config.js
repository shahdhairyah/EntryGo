// EntryGo configuration. This is the only file you edit to host your own copy.
// Supabase → Project Settings → API: copy the Project URL and the anon / public key.
// The anon key is meant to be public; Row Level Security in schema.sql protects the data.
// Never put the service_role key here.
window.GATEPASS = window.ENTRYGO = window.ZENTRYX = {
  supabaseUrl: "https://pzdjojumxynhlwrwgkbp.supabase.co",
  supabaseAnonKey: "sb_publishable_8kYROWQuDTwuHw13E7iBsw_TOLgAGAp",

  // Organiser sign-in methods.
  // emailSignIn: magic link by email (needs the Email provider on; for more than a few emails an hour, custom SMTP).
  // googleSignIn: "Continue with Google" (needs the Google provider set up in Supabase → Authentication → Providers).
  // The hosted copy uses Google only, because its shared Supabase project has email sign-ups switched off.
  emailSignIn: false,
  googleSignIn: true,
};
