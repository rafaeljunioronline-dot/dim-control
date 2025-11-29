import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, DollarSign, BarChart3, StickyNote } from 'lucide-react';
import { db } from './db';

import './App.css';

import Dashboard from './Dashboard';
import CRM from './CRM';
import Financeiro from './Financeiro';
import Relatorios from './Relatorios';
import Notas from './Notas';

function App() {
  const [view, setView] = useState('dashboard');
  const [stats, setStats] = useState(null);

  // --- MUDANÇA PRINCIPAL: ASYNC/AWAIT ---
  // Agora esperamos a resposta do Supabase
  const refresh = async () => {
    const data = await db.getStats();
    if (data) {
      setStats(data);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  // Tela de Carregamento enquanto conecta no Supabase
  if (!stats) return (
    <div style={{height: '100vh', background: '#09090b', color:'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column'}}>
      <h2 style={{color: '#facc15'}}>Conectando ao DIM Cloud...</h2>
      <p style={{color: '#666', fontSize: '12px'}}>Buscando seus dados seguros.</p>
    </div>
  );

  // Cálculos para as Metas (Sidebar)
  // Proteção: Garante que dailyStats existe antes de tentar ler
  const todayStr = new Date().toISOString().split('T')[0];
  const todayStats = (stats.dailyStats && stats.dailyStats[todayStr]) || { contacted: 0 };
  const todayTrials = stats.clients.filter(c => c.startDate === todayStr).length;

  const leadsPct = Math.min((todayStats.contacted / stats.goals.leadsDay) * 100, 100);
  const trialsPct = Math.min((todayTrials / stats.goals.trialsDay) * 100, 100);

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="brand">
          <h1>DIM.</h1>
          <p style={{fontSize:'10px', color:'#666', marginTop:'-5px'}}>CONTROL V6 (CLOUD)</p>
        </div>
        
        <div style={{marginTop: '40px'}}>
          <div className={`menu-item ${view === 'dashboard' ? 'active' : ''}`} onClick={() => setView('dashboard')}>
            <LayoutDashboard size={18}/> Dashboard
          </div>
          <div className={`menu-item ${view === 'crm' ? 'active' : ''}`} onClick={() => setView('crm')}>
            <Users size={18}/> CRM & Clientes
          </div>
          <div className={`menu-item ${view === 'financeiro' ? 'active' : ''}`} onClick={() => setView('financeiro')}>
            <DollarSign size={18}/> Financeiro
          </div>
          <div className={`menu-item ${view === 'relatorios' ? 'active' : ''}`} onClick={() => setView('relatorios')}>
            <BarChart3 size={18}/> Relatórios
          </div>
          <div className={`menu-item ${view === 'notas' ? 'active' : ''}`} onClick={() => setView('notas')}>
            <StickyNote size={18}/> Notas
          </div>
        </div>

        <div className="goals-widget">
          <h4 style={{color:'white', marginBottom:'10px', fontSize:'12px'}}>METAS DO DIA</h4>
          
          <div style={{marginBottom:'10px'}}>
            <div style={{display:'flex', justifyContent:'space-between', fontSize:'11px', color:'#888', marginBottom:'2px'}}>
              <span>Leads</span>
              <span>{todayStats.contacted}/{stats.goals.leadsDay}</span>
            </div>
            <div className="progress-bar"><div className="progress-fill" style={{width: `${leadsPct}%`}}></div></div>
          </div>

          <div>
            <div style={{display:'flex', justifyContent:'space-between', fontSize:'11px', color:'#888', marginBottom:'2px'}}>
              <span>Testes</span>
              <span>{todayTrials}/{stats.goals.trialsDay}</span>
            </div>
            <div className="progress-bar"><div className="progress-fill" style={{width: `${trialsPct}%`}}></div></div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        {view === 'dashboard' && <Dashboard stats={stats} refresh={refresh} />}
        {view === 'crm' && <CRM clients={stats.clients} refresh={refresh} />}
        {view === 'financeiro' && <Financeiro transactions={stats.transactions} />}
        {view === 'relatorios' && <Relatorios stats={stats} />}
        {view === 'notas' && <Notas notesList={stats.notes} refresh={refresh} />}
      </main>
    </div>
  );
}

export default App;