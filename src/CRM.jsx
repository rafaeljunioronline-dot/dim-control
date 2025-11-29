import React from 'react';
import { db } from './db';

export default function CRM({ clients, refresh }) {
  
  // --- MUDANÇA PRINCIPAL: Enviar o objeto client inteiro ---
  const updateStatus = async (id, status) => {
    if(window.confirm(`Mudar status para ${status}?`)) {
      // 1. Acha o cliente na lista atual
      const client = clients.find(c => c.id === id);
      
      // 2. Manda para o banco atualizar (passando os dados para gerar o financeiro se for 'active')
      await db.updateClientStatus(id, status, client);
      
      // 3. Recarrega a tela
      refresh();
    }
  };

  // Cálculo de dias restantes (Simples)
  const getDaysLeft = (startDate) => {
    if (!startDate) return 0;
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(end.getDate() + 14);
    const today = new Date();
    // Diferença em milissegundos convertida para dias
    const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  // Função para calcular data de recebimento
  const getPayDate = (startDate) => {
    if (!startDate) return '-';
    const d = new Date(startDate);
    d.setDate(d.getDate() + 14);
    return d.toLocaleDateString('pt-BR');
  };

  return (
    <div className="animate-fade">
      <div className="control-header">
        <div className="title-page">
          <h2>CRM & Clientes</h2>
          <p style={{color:'#666'}}>Gerencie seus testes e renovações.</p>
        </div>
      </div>

      <div className="input-card" style={{padding:'0', overflow:'hidden', border:'1px solid #333'}}>
        <table className="dim-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Origem</th>
              <th>Inicio Teste</th>
              <th>Status</th>
              <th>Previsão Receb.</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {clients && clients.length > 0 ? clients.map(client => {
              const daysLeft = getDaysLeft(client.startDate);
              return (
                <tr key={client.id}>
                  <td>
                    <div style={{fontWeight:'bold', color:'white'}}>{client.name}</div>
                    <div style={{fontSize:'11px', color:'#666'}}>
                      {client.plan ? client.plan.toUpperCase() : 'MENSAL'} • R$ {client.value}
                    </div>
                  </td>
                  <td><span className="badge" style={{background:'#27272a', color:'#fff'}}>{client.origin}</span></td>
                  <td>{new Date(client.startDate).toLocaleDateString('pt-BR')}</td>
                  <td>
                    <span className={`badge ${client.status}`}>
                      {client.status === 'trial' ? `Testando (${daysLeft}d rest)` : 
                       client.status === 'active' ? 'Ativo (Pagante)' : 'Cancelado'}
                    </span>
                  </td>
                  <td style={{color: client.status === 'trial' ? '#facc15' : '#666', fontWeight: client.status === 'trial' ? 'bold' : 'normal'}}>
                    {client.status === 'trial' ? getPayDate(client.startDate) : '-'}
                  </td>
                  <td>
                    {client.status === 'trial' && (
                      <div style={{display:'flex'}}>
                        <button onClick={() => updateStatus(client.id, 'active')} className="btn-action" title="Cliente Pagou">✅ Fechou</button>
                        <button onClick={() => updateStatus(client.id, 'churned')} className="btn-action btn-danger" title="Cliente Cancelou">❌ Cancelou</button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan="6" style={{textAlign:'center', padding:'40px', color:'#666'}}>
                  Nenhum cliente no banco de dados ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}