import React from 'react';

export default function Financeiro({ transactions }) {
  const total = transactions.reduce((acc, t) => acc + (t.type === 'entrada' ? t.value : -t.value), 0);

  return (
    <div>
      <div className="control-header">
        <div className="title-page">
          <h2>Financeiro</h2>
          <p style={{color:'#666'}}>Extrato automático de vendas.</p>
        </div>
        <div className="input-card" style={{padding:'10px 20px', borderColor: total >= 0 ? '#22c55e' : '#ef4444'}}>
          <span style={{color:'#666', fontSize:'12px'}}>CAIXA ATUAL</span>
          <div style={{fontSize:'24px', fontWeight:'bold', color:'white'}}>R$ {total.toFixed(2)}</div>
        </div>
      </div>

      <div className="input-card" style={{padding:'0'}}>
        <table className="dim-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Descrição</th>
              <th>Tipo</th>
              <th style={{textAlign:'right'}}>Valor</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(t => (
              <tr key={t.id}>
                <td>{new Date(t.date).toLocaleDateString('pt-BR')}</td>
                <td>{t.desc}</td>
                <td>
                  <span className={`badge`} style={{color: t.type === 'entrada' ? '#22c55e' : '#ef4444'}}>
                    {t.type.toUpperCase()}
                  </span>
                </td>
                <td style={{textAlign:'right', fontWeight:'bold', color: t.type === 'entrada' ? '#22c55e' : '#ef4444'}}>
                  {t.type === 'entrada' ? '+' : '-'} R$ {t.value.toFixed(2)}
                </td>
              </tr>
            ))}
            {transactions.length === 0 && <tr><td colSpan="4" style={{textAlign:'center', padding:'20px', color:'#666'}}>Sem movimentações.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}