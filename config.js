// Supabase configuration
const SUPABASE_URL = 'https://zomnqqonzciwtdshrhvp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvbW5xcW9uemNpd3Rkc2hyaHZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA2NzIxMTEsImV4cCI6MjA1NjI0ODExMX0.KMMvKspPD4a7adqD-wakGSAWMhNBIUBkqWOSjXRghlo';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY); 