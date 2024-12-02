import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kxxcqnfxgacalntxdpoz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4eGNxbmZ4Z2FjYWxudHhkcG96Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzMxMzg5MTgsImV4cCI6MjA0ODcxNDkxOH0.10xq8wS94r-s3af_NGjNKLQRQ1_1mGKogHEnNQwkDng';

export const supabase = createClient(supabaseUrl, supabaseKey);