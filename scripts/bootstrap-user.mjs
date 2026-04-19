#!/usr/bin/env node
// Bootstrap the initial user (owner account) using Supabase Admin API.
// Run once after Supabase is provisioned and migrations are applied.
//
// Required env:
//   NEXT_PUBLIC_SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY
//   BOOTSTRAP_EMAIL
//   BOOTSTRAP_PASSWORD
//   BOOTSTRAP_FULL_NAME (optional)
//   BOOTSTRAP_ORG_NAME  (optional)

import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.BOOTSTRAP_EMAIL;
const password = process.env.BOOTSTRAP_PASSWORD;
const fullName = process.env.BOOTSTRAP_FULL_NAME ?? '本舘 ヒロム';
const orgName = process.env.BOOTSTRAP_ORG_NAME ?? 'detect株式会社';

if (!url || !serviceKey || !email || !password) {
  console.error('Missing required env vars.');
  process.exit(1);
}

const admin = createClient(url, serviceKey, { auth: { persistSession: false } });

// Create the auth user with email already confirmed.
// The signup trigger (0003_signup_trigger.sql) will automatically
// create a matching organization + profile row.
const { data, error } = await admin.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
  user_metadata: {
    full_name: fullName,
    organization_name: orgName,
  },
});

if (error) {
  if (error.message.includes('already been registered')) {
    console.log(`User ${email} already exists. Updating password...`);
    const { data: list } = await admin.auth.admin.listUsers();
    const existing = list.users.find((u) => u.email === email);
    if (existing) {
      await admin.auth.admin.updateUserById(existing.id, { password });
      console.log(`Updated password for ${email} (id=${existing.id})`);
      process.exit(0);
    }
  }
  console.error('Error creating user:', error.message);
  process.exit(1);
}

console.log(`Created user: ${data.user.email} (id=${data.user.id})`);
