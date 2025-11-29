// src/db.js
import { supabase } from './supabaseClient';

const initialGoals = { leadsDay: 110, trialsDay: 8, salesDay: 2 };

export const db = {
  // --- BUSCAR TUDO (LEITURA) ---
  getStats: async () => {
    try {
      const [statsRes, clientsRes, notesRes, transRes] = await Promise.all([
        supabase.from('daily_stats').select('*'),
        supabase.from('clients').select('*'),
        supabase.from('notes').select('*').order('updated_at', { ascending: false }),
        supabase.from('transactions').select('*').order('date', { ascending: false })
      ]);

      const dailyStatsObj = {};
      if (statsRes.data) {
        statsRes.data.forEach(item => {
          dailyStatsObj[item.date] = item;
        });
      }

      // [TRADUÇÃO 1] O banco manda 'start_date', nós transformamos em 'startDate' pro React
      const formattedClients = (clientsRes.data || []).map(c => ({
        ...c,
        startDate: c.start_date // <--- O segredo está aqui
      }));

      return {
        goals: initialGoals,
        dailyStats: dailyStatsObj,
        clients: formattedClients, // Manda a lista traduzida
        notes: notesRes.data || [],
        transactions: transRes.data || []
      };
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      return null;
    }
  },

  // --- SALVAR ESTATÍSTICAS ---
  saveDailyInput: async (date, type, count, origin) => {
    const { data: existing } = await supabase.from('daily_stats').select('*').eq('date', date).single();
    const current = existing || { date, contacted: 0, replied: 0, inbound: 0, outbound: 0, indication: 0 };
    
    if (type === 'contacted') {
      current.contacted += count;
      if (origin && origin !== 'all') {
        current[origin] = (current[origin] || 0) + count;
      }
    }
    if (type === 'replied') current.replied += count;

    await supabase.from('daily_stats').upsert(current);
  },

  // --- SALVAR CLIENTE (INSERT) ---
  addClient: async (client) => {
    // [TRADUÇÃO 2] O React manda 'startDate', nós convertemos para 'start_date' pro Banco
    const clientPayload = {
      name: client.name,
      value: client.value,
      plan: client.plan,
      status: client.status,
      origin: client.origin,
      start_date: client.startDate // <--- AQUI ESTAVA O ERRO 400!
    };
    
    await supabase.from('clients').insert([clientPayload]);
  },

  // --- ATUALIZAR STATUS ---
  updateClientStatus: async (id, newStatus, clientData) => {
    await supabase.from('clients').update({ status: newStatus }).eq('id', id);

    if (newStatus === 'active' && clientData) {
      await supabase.from('transactions').insert([{
        description: `Pagamento: ${clientData.name} (${clientData.plan})`,
        value: clientData.value,
        type: 'entrada',
        date: new Date().toISOString().split('T')[0]
      }]);
    }
  },

  // --- NOTAS ---
  saveNote: async (note) => {
    const noteData = { 
      title: note.title, 
      content: note.content, 
      updated_at: new Date().toISOString() 
    };

    if (note.id) {
      await supabase.from('notes').update(noteData).eq('id', note.id);
    } else {
      await supabase.from('notes').insert([noteData]);
    }
  },

  deleteNote: async (id) => {
    await supabase.from('notes').delete().eq('id', id);
  }
};