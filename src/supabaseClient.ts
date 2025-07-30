// supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

// Remplace par tes vraies infos Supabase (console > Project Settings > API)
const supabaseUrl = 'https://dcsipoavwwwjosdairym.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjc2lwb2F2d3d3am9zZGFpcnltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MzQ4MDQsImV4cCI6MjA2OTQxMDgwNH0.rBD4OEB9xoxCAlS9jUg3BPLJamysrH9jUohdLt6iBqc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
