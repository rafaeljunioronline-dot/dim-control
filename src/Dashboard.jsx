import React, { useState, useEffect } from 'react';
import { Plus, Filter, Calendar, X, Check } from 'lucide-react';
import { db } from './db';

export default function Dashboard({ stats, refresh }) {
  // Filtros
  const [dateFilter, setDateFilter] = useState('today'); // today, yesterday, 7days, month, custom
  const [originFilter, setOriginFilter] = useState('all');
  const [customDate, setCustomDate] = useState(new Date().toISOString().split('T')[0]);

  // Modal e Cliente
  const [modalOpen, setModalOpen] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '',
    plan: 'mensal',
    value: 19.90,
    startDate: new Date().toISOString().split('T')[0],
    origin: 'outbound'
  });

  // Inputs
  const [inputLeads, setInputLeads] = useState(0);
  const [inputReplies, setInputReplies] = useState(0);

  // Lógica de Datas
  const getActiveDateRange = () => {
    const today = new Date();
    let start = new Date();
    let end = new Date();
    let isSingleDay = false;

    if (dateFilter === 'today') {
      isSingleDay = true;
    } else if (dateFilter === 'yesterday') {
      start.setDate(today.getDate() - 1);
      end.setDate(today.getDate() - 1);
      isSingleDay = true;
    } else if (dateFilter === 'custom') {
      start = new Date(customDate);
      end = new Date(customDate);
      isSingleDay = true;
    } else if (dateFilter === '7days') {
      start.setDate(today.getDate() - 6);
    } else if (dateFilter === 'month') {
      start = new Date(today.getFullYear(), today.getMonth(), 1);
    }

    return { 
      start: start.toISOString().split('T')[0], 
      end: end.toISOString().split('T')[0], 
      isSingleDay 
    };
  };

  const { start, end, isSingleDay } = getActiveDateRange();

  // Calcular Métricas
  let metrics = { leads: 0, replies: 0, trials: 0 };
  
  // Somar Inputs
  Object.keys(stats.dailyStats).forEach(date => {
    if (date >= start && date <= end) {
      if (originFilter === 'all') {
        metrics.leads += stats.dailyStats[date].contacted || 0;
      } else {
        metrics.leads += stats.dailyStats[date][originFilter] || 0;
      }
      metrics.replies += stats.dailyStats[date].replied || 0;
    }
  });

  // Somar Clientes
  const clientsInPeriod = stats.clients.filter(c => c.startDate >= start && c.startDate <= end);
  metrics.trials = clientsInPeriod.filter(c => (originFilter === 'all' || c.origin === originFilter)).length;

  // Previsão Geral (Todos ativos)
  const currentActiveTrialsValue = stats.clients
    .filter(c => c.status === 'trial')
    .reduce((acc, c) => acc + c.value, 0);

  // Ações
  const handleInput = (type, e) => {
    if (e.key === 'Enter') {
      const val = parseInt(e.target.value);
      if (val > 0 && isSingleDay) {
        db.saveDailyInput(start, type, val, originFilter === 'all' ? 'outbound' : originFilter);
        if(type === 'contacted') setInputLeads(0);
        if(type === 'replied') setInputReplies(0);
        refresh();
      }
    }
  };

  const handleSaveClient = (e) => {
    e.preventDefault();
    if(newClient.name) {
      db.addClient({ ...newClient, status: 'trial' });
      setModalOpen(false);
      setNewClient({ ...newClient, name: '' }); 
      refresh();
    }
  };

  const convReply = metrics.leads > 0 ? ((metrics.replies / metrics.leads) * 100).toFixed(1) : 0;
  const convTrial = metrics.replies > 0 ? ((metrics.trials / metrics.replies) * 100).toFixed(1) : 0;

  return (
    <div className="animate-fade">
      <header className="control-header" style={{flexDirection:'column', alignItems:'flex-start', gap:'15px'}}>
        <div className="title-page">
          <span>Gestão & Controle</span>
          <h2>{isSingleDay ? new Date(start + 'T00:00:00').toLocaleDateString('pt-BR', {day:'numeric', month:'long'}) : 'Relatório Período'}</h2>
        </div>
        
        <div style={{width:'100%', display:'flex', flexDirection:'column', gap:'10px'}}>
          {/* Origem */}
          <div style={{display:'flex', gap:'5px'}}>
            {['all', 'outbound', 'inbound', 'indication'].map(orig => (
              <button key={orig} onClick={() => setOriginFilter(orig)} className="badge" style={{background: originFilter === orig ? 'white' : 'transparent', color: originFilter === orig ? 'black' : '#666', border: '1px solid #333', cursor: 'pointer', padding: '8px 12px'}}>
                {orig === 'all' ? 'TODOS' : orig.toUpperCase()}
              </button>
            ))}
          </div>
          {/* Datas */}
          <div style={{display:'flex', gap:'5px', alignItems:'center'}}>
            <Filter size={14} color="#facc15" />
            {['today', 'yesterday', '7days', 'month'].map(f => (
              <button key={f} onClick={() => setDateFilter(f)} className="badge" style={{background: dateFilter === f ? '#facc15' : 'transparent', color: dateFilter === f ? 'black' : '#888', border: dateFilter === f ? 'none' : '1px solid #333', cursor: 'pointer'}}>
                {f === 'today' ? 'HOJE' : f === 'yesterday' ? 'ONTEM' : f === '7days' ? '7 DIAS' : 'MÊS'}
              </button>
            ))}
            <input type="date" value={customDate} onChange={(e) => { setCustomDate(e.target.value); setDateFilter('custom'); }} style={{background:'#111', border:'1px solid #333', color:'white', padding:'4px', borderRadius:'4px', marginLeft:'10px'}} />
          </div>
        </div>
      </header>

      {/* INPUTS */}
      <div className="input-section">
        <div className={`input-card ${!isSingleDay ? 'opacity-50' : ''}`}>
          <h3 style={{color:'#666', fontSize:'12px', textTransform:'uppercase'}}>1. Entrada de Leads</h3>
          {isSingleDay ? (
            <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
              <input type="number" className="big-input" value={inputLeads || ''} onChange={e=>setInputLeads(e.target.value)} onKeyDown={e=>handleInput('contacted', e)} placeholder="0" autoFocus />
              <span style={{fontSize:'12px', color:'#666'}}>Enter</span>
            </div>
          ) : <div style={{marginTop:'10px', color:'#888', fontStyle:'italic'}}>Selecione um dia único para editar.</div>}
          <p style={{marginTop:'10px', color:'white', fontSize:'14px', fontWeight:'bold'}}>Total: {metrics.leads}</p>
        </div>

        <div className={`input-card ${!isSingleDay ? 'opacity-50' : ''}`}>
          <h3 style={{color:'#666', fontSize:'12px', textTransform:'uppercase'}}>2. Responderam</h3>
          {isSingleDay && (
            <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
              <input type="number" className="big-input" value={inputReplies || ''} onChange={e=>setInputReplies(e.target.value)} onKeyDown={e=>handleInput('replied', e)} placeholder="0" />
              <span style={{fontSize:'12px', color:'#666'}}>Enter</span>
            </div>
          )}
          <p style={{marginTop: isSingleDay ? '30px' : '10px', color:'white', fontSize:'14px', fontWeight:'bold'}}>Total: {metrics.replies}</p>
        </div>

        <div className="input-card" onClick={() => setModalOpen(true)} style={{borderColor:'#facc15', cursor:'pointer'}}>
          <h3 style={{color:'#facc15', fontSize:'12px', textTransform:'uppercase'}}>3. Novo Teste</h3>
          <div style={{display:'flex', gap:'10px', alignItems:'center', marginTop:'5px'}}>
            <Plus color="#facc15" size={32} />
            <span style={{fontWeight:'bold'}}>Cadastrar</span>
          </div>
          <p style={{marginTop:'10px', color:'#888', fontSize:'12px'}}>{metrics.trials} iniciados</p>
        </div>
      </div>

      {/* Funil Visual */}
      <div className="funnel-container">
        <h3 style={{color:'white'}}>Funil do Período</h3>
        <div className="funnel-steps">
          <div className={`step ${metrics.leads > 0 ? 'active' : ''}`}><div className="step-circle">{metrics.leads}</div><p style={{fontSize:'12px', color:'#666'}}>Leads</p></div>
          <div className={`step ${metrics.replies > 0 ? 'active' : ''}`}><div className="step-circle">{metrics.replies}</div><p style={{fontSize:'12px', color:'#666'}}>Respostas ({convReply}%)</p></div>
          <div className={`step ${metrics.trials > 0 ? 'active' : ''}`}><div className="step-circle">{metrics.trials}</div><p style={{fontSize:'12px', color:'#666'}}>Testes ({convTrial}%)</p></div>
          <div className="step"><div className="step-circle" style={{borderColor:'#333', color:'#333'}}>?</div><p style={{fontSize:'12px', color:'#666'}}>14 Dias</p></div>
        </div>
      </div>
      
      <div className="input-card" style={{background:'#1c1917', borderColor:'#facc15'}}>
        <h3 style={{color:'#facc15'}}>Colheita Prevista (Geral)</h3>
        <h1 style={{fontSize:'40px', color:'#facc15'}}>R$ {currentActiveTrialsValue.toFixed(2)}</h1>
        <p style={{color:'#666', fontSize:'12px'}}>Todos os testes ativos hoje.</p>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.8)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:1000}}>
          <div style={{background:'#18181b', padding:'30px', borderRadius:'16px', width:'400px', border:'1px solid #333', boxShadow:'0 20px 25px -5px rgba(0, 0, 0, 0.5)'}}>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px'}}>
              <h2 style={{fontSize:'20px', fontWeight:'bold', color:'white'}}>Novo Cliente</h2>
              <button onClick={() => setModalOpen(false)} style={{background:'transparent', border:'none', color:'#666', cursor:'pointer'}}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveClient}>
              <div style={{marginBottom:'20px'}}>
                <label style={{display:'block', color:'#888', fontSize:'12px', marginBottom:'5px'}}>NOME</label>
                <input required value={newClient.name} onChange={e => setNewClient({...newClient, name: e.target.value})} style={{width:'100%', background:'#09090b', border:'1px solid #333', padding:'12px', borderRadius:'8px', color:'white'}} autoFocus />
              </div>
              <div style={{marginBottom:'20px'}}>
                <label style={{display:'block', color:'#888', fontSize:'12px', marginBottom:'5px'}}>DATA INÍCIO</label>
                <div style={{display:'flex', alignItems:'center', background:'#09090b', border:'1px solid #333', borderRadius:'8px', padding:'0 10px'}}>
                  <Calendar size={16} color="#666" />
                  <input type="date" value={newClient.startDate} onChange={e => setNewClient({...newClient, startDate: e.target.value})} style={{width:'100%', background:'transparent', border:'none', padding:'12px', color:'white'}} />
                </div>
              </div>
              <div style={{marginBottom:'20px'}}>
                <label style={{display:'block', color:'#888', fontSize:'12px', marginBottom:'5px'}}>ORIGEM</label>
                <select value={newClient.origin} onChange={e => setNewClient({...newClient, origin: e.target.value})} style={{width:'100%', background:'#09090b', border:'1px solid #333', padding:'12px', borderRadius:'8px', color:'white'}}>
                  <option value="outbound">📢 Outbound</option>
                  <option value="inbound">🧲 Inbound</option>
                  <option value="indication">🤝 Indicação</option>
                </select>
              </div>
              <div style={{marginBottom:'25px'}}>
                <label style={{display:'block', color:'#888', fontSize:'12px', marginBottom:'10px'}}>PLANO</label>
                <div style={{display:'flex', gap:'10px'}}>
                  <button type="button" onClick={() => setNewClient({...newClient, plan: 'mensal', value: 19.90})} style={{flex: 1, padding:'15px', borderRadius:'8px', cursor:'pointer', border:'1px solid', background: newClient.plan === 'mensal' ? '#facc15' : 'transparent', borderColor: newClient.plan === 'mensal' ? '#facc15' : '#333', color: newClient.plan === 'mensal' ? 'black' : '#666', fontWeight: 'bold'}}>MENSAL<br/><span style={{fontSize:'10px'}}>R$ 19,90</span></button>
                  <button type="button" onClick={() => setNewClient({...newClient, plan: 'anual', value: 197.00})} style={{flex: 1, padding:'15px', borderRadius:'8px', cursor:'pointer', border:'1px solid', background: newClient.plan === 'anual' ? '#facc15' : 'transparent', borderColor: newClient.plan === 'anual' ? '#facc15' : '#333', color: newClient.plan === 'anual' ? 'black' : '#666', fontWeight: 'bold'}}>ANUAL<br/><span style={{fontSize:'10px'}}>R$ 197,00</span></button>
                </div>
              </div>
              <button type="submit" style={{width:'100%', background:'#facc15', color:'black', padding:'15px', borderRadius:'8px', fontWeight:'bold', border:'none', cursor:'pointer'}}>SALVAR</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}