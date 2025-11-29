import React, { useState, useEffect } from 'react';
import { Calendar, Filter, ArrowDown } from 'lucide-react';

export default function Relatorios({ stats }) {
  const [filter, setFilter] = useState('7days'); // today, 7days, month, custom
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [metrics, setMetrics] = useState({ leads: 0, replies: 0, trials: 0, sales: 0 });

  // 1. O Motor de Filtragem
  useEffect(() => {
    calculateMetrics();
  }, [filter, customStart, customEnd, stats]);

  const calculateMetrics = () => {
    const today = new Date();
    let startDate = new Date();
    let endDate = new Date();

    // Lógica das Datas
    if (filter === 'today') {
      // Já está configurado para hoje
    } else if (filter === '7days') {
      startDate.setDate(today.getDate() - 7);
    } else if (filter === 'month') {
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
    } else if (filter === 'custom') {
      if (!customStart || !customEnd) return; // Espera preencher
      startDate = new Date(customStart);
      endDate = new Date(customEnd);
      // Ajuste de fuso horário simples para garantir inclusão do dia
      startDate.setHours(0,0,0,0);
      endDate.setHours(23,59,59,999);
    }

    // Formatar datas para comparação (YYYY-MM-DD)
    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    // --- AGREGAÇÃO DOS DADOS ---
    
    // 1. Somar Inputs Diários (Leads e Respostas)
    let totalLeads = 0;
    let totalReplies = 0;
    const dailyData = stats.today ? { ...stats.dailyStats, [new Date().toISOString().split('T')[0]]: stats.today } : stats.dailyStats; // Inclui hoje se não estiver salvo ainda

    Object.keys(dailyData).forEach(date => {
      if (date >= startStr && date <= endStr) {
        totalLeads += dailyData[date].contacted || 0;
        totalReplies += dailyData[date].replied || 0;
      }
    });

    // 2. Somar Clientes (Testes e Vendas iniciados no período)
    const clientsInPeriod = stats.clients.filter(c => c.startDate >= startStr && c.startDate <= endStr);
    const totalTrials = clientsInPeriod.length;
    
    // Vendas: Consideramos vendas DE QUEM ENTROU NESSE PERÍODO (Cohort)
    // Isso mostra a qualidade da safra de leads daquele período
    const totalSales = clientsInPeriod.filter(c => c.status === 'active').length;

    setMetrics({ leads: totalLeads, replies: totalReplies, trials: totalTrials, sales: totalSales });
  };

  // Cálculos de Conversão Visual
  const convReply = metrics.leads > 0 ? ((metrics.replies / metrics.leads) * 100).toFixed(1) : 0;
  const convTrial = metrics.replies > 0 ? ((metrics.trials / metrics.replies) * 100).toFixed(1) : 0;
  const convSale = metrics.trials > 0 ? ((metrics.sales / metrics.trials) * 100).toFixed(1) : 0;

  return (
    <div className="animate-fade">
      <header className="control-header" style={{flexDirection:'column', alignItems:'flex-start', gap:'15px'}}>
        <div className="title-page">
          <h2>Relatório de Performance</h2>
          <p style={{color:'#666'}}>Análise do Funil por Período.</p>
        </div>

        {/* BARRA DE FILTROS */}
        <div style={{display:'flex', gap:'10px', flexWrap:'wrap', background:'#18181b', padding:'10px', borderRadius:'8px', border:'1px solid #333', width:'100%'}}>
          <div style={{display:'flex', alignItems:'center', gap:'5px', color:'#facc15', marginRight:'10px'}}>
            <Filter size={16} /> <span style={{fontSize:'12px', fontWeight:'bold'}}>FILTRAR:</span>
          </div>
          
          {['today', '7days', 'month', 'custom'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              style={{
                background: filter === f ? '#facc15' : 'transparent',
                color: filter === f ? 'black' : '#888',
                border: filter === f ? 'none' : '1px solid #333',
                padding: '5px 15px', borderRadius:'4px', cursor:'pointer', fontSize:'12px', fontWeight:'bold',
                textTransform: 'uppercase'
              }}
            >
              {f === 'today' ? 'Hoje' : f === '7days' ? '7 Dias' : f === 'month' ? 'Este Mês' : 'Data'}
            </button>
          ))}

          {/* Inputs de Data Customizada */}
          {filter === 'custom' && (
            <div style={{display:'flex', gap:'5px', marginLeft:'auto'}}>
              <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} style={{background:'#111', color:'white', border:'1px solid #333', padding:'4px', borderRadius:'4px'}} />
              <span style={{color:'#666'}}>-</span>
              <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} style={{background:'#111', color:'white', border:'1px solid #333', padding:'4px', borderRadius:'4px'}} />
            </div>
          )}
        </div>
      </header>

      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'30px'}}>
        
        {/* COLUNA 1: O FUNIL VISUAL (Passo a Passo) */}
        <div className="funnel-container" style={{height:'fit-content'}}>
          <h3 style={{color:'white', marginBottom:'20px', borderBottom:'1px solid #333', paddingBottom:'10px'}}>
            Raio-X do Funil
            <span style={{float:'right', fontSize:'12px', color:'#facc15'}}>Baseado na data selecionada</span>
          </h3>

          <div style={{display:'flex', flexDirection:'column', gap:'0px'}}>
            
            {/* ETAPA 1: LEADS */}
            <div style={{background:'#27272a', padding:'15px', borderRadius:'8px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div>
                <div style={{fontSize:'12px', color:'#a1a1aa', textTransform:'uppercase'}}>1. Contatados (Leads)</div>
                <div style={{fontSize:'24px', fontWeight:'bold', color:'white'}}>{metrics.leads}</div>
              </div>
              <div style={{opacity:0.2}}><Filter size={32} /></div>
            </div>

            {/* Conector */}
            <div style={{display:'flex', alignItems:'center', justifyContent:'center', height:'30px'}}>
              <div style={{background:'#333', padding:'2px 8px', borderRadius:'10px', fontSize:'10px', color:'#fff', display:'flex', alignItems:'center', gap:'4px'}}>
                <ArrowDown size={10} /> {convReply}%
              </div>
            </div>

            {/* ETAPA 2: RESPOSTAS */}
            <div style={{background:'#27272a', padding:'15px', borderRadius:'8px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div>
                <div style={{fontSize:'12px', color:'#a1a1aa', textTransform:'uppercase'}}>2. Responderam</div>
                <div style={{fontSize:'24px', fontWeight:'bold', color:'white'}}>{metrics.replies}</div>
              </div>
              <div style={{opacity:0.2}}><Calendar size={32} /></div>
            </div>

            {/* Conector */}
            <div style={{display:'flex', alignItems:'center', justifyContent:'center', height:'30px'}}>
              <div style={{background:'#333', padding:'2px 8px', borderRadius:'10px', fontSize:'10px', color:'#fff', display:'flex', alignItems:'center', gap:'4px'}}>
                <ArrowDown size={10} /> {convTrial}%
              </div>
            </div>

            {/* ETAPA 3: TESTES */}
            <div style={{background: 'rgba(250, 204, 21, 0.1)', border:'1px solid rgba(250, 204, 21, 0.3)', padding:'15px', borderRadius:'8px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div>
                <div style={{fontSize:'12px', color:'#facc15', textTransform:'uppercase', fontWeight:'bold'}}>3. Testes Iniciados</div>
                <div style={{fontSize:'24px', fontWeight:'bold', color:'#facc15'}}>{metrics.trials}</div>
              </div>
              <div style={{color:'#facc15'}}><Calendar size={32} /></div>
            </div>

            {/* Conector */}
            <div style={{display:'flex', alignItems:'center', justifyContent:'center', height:'30px'}}>
              <div style={{background:'#333', padding:'2px 8px', borderRadius:'10px', fontSize:'10px', color:'#fff', display:'flex', alignItems:'center', gap:'4px'}}>
                <ArrowDown size={10} /> {convSale}% (Eficiência Real)
              </div>
            </div>

            {/* ETAPA 4: VENDAS (COHORT) */}
            <div style={{background: 'rgba(34, 197, 94, 0.1)', border:'1px solid rgba(34, 197, 94, 0.3)', padding:'15px', borderRadius:'8px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div>
                <div style={{fontSize:'12px', color:'#22c55e', textTransform:'uppercase', fontWeight:'bold'}}>4. Pagantes (Desta Safra)</div>
                <div style={{fontSize:'24px', fontWeight:'bold', color:'#22c55e'}}>{metrics.sales}</div>
              </div>
              <div style={{color:'#22c55e'}}><Filter size={32} /></div>
            </div>

          </div>
        </div>

        {/* COLUNA 2: RESUMO E INSIGHTS */}
        <div>
           {/* Card Custo/Esforço */}
           <div className="input-card" style={{marginBottom:'20px'}}>
            <h3 style={{color:'#888'}}>Taxa Global de Conversão</h3>
            <div style={{marginTop:'10px', fontSize:'42px', fontWeight:'bold', color:'white'}}>
              {metrics.leads > 0 ? ((metrics.sales / metrics.leads) * 100).toFixed(2) : 0}%
            </div>
            <p style={{fontSize:'12px', color:'#666'}}>
              De cada 100 contatos feitos nesse período, {metrics.leads > 0 ? ((metrics.sales / metrics.leads) * 100).toFixed(1) : 0} viram dinheiro.
            </p>
          </div>

          <div className="input-card">
            <h3 style={{color:'#facc15'}}>Insight do CEO</h3>
            <div style={{marginTop:'15px', lineHeight:'1.6', fontSize:'14px', color:'#ccc'}}>
              {metrics.leads === 0 ? (
                "Sem dados nesse período. Selecione outra data ou trabalhe mais!"
              ) : (
                <>
                  Neste período, você precisou falar com <strong>{Math.round(metrics.leads / (metrics.trials || 1))} pessoas</strong> para conseguir 1 Teste.
                  <br /><br />
                  Se quiser dobrar suas vendas mantendo essa taxa, você precisa aumentar seus contatos para <strong>{metrics.leads * 2}</strong>.
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}