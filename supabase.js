
import { createClient } from '@supabase/supabase-js'

const supabaseUrl ='https://gesostfaalokzhvtozcf.supabase.co'
 
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdlc29zdGZhYWxva3podnRvemNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1NTQ3MzIsImV4cCI6MjA5NTEzMDczMn0.PRDYkKUCyVrIbu05aUKHiu91MNZscwanid8FSkhnDuk'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)