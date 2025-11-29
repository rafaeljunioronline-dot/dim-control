import { createClient } from '@supabase/supabase-js';

// SUBSTITUA COM OS DADOS DO SEU PROJETO SUPABASE
const supabaseUrl = 'https://jlztzhlbinhizrzjgnpy.supabase.co';
const supabaseKey = 'sb_publishable_sPqfjojwtTs1BNQLj2TGyw_ftFPyrPn';

export const supabase = createClient(supabaseUrl, supabaseKey);