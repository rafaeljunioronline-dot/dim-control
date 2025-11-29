import React, { useState } from 'react';

export default function Login({ onLogin }) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    // AQUI É A SUA SENHA MESTRA
    if (user === 'admin' && pass === '123456') {
      localStorage.setItem('dim_auth', 'true'); // Salva que está logado
      onLogin();
    } else {
      setError('Acesso Negado. Tente novamente.');
    }
  };

  return (
    <div style={{height: '100vh', background: '#09090b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'}}>
      <div style={{background: '#18181b', padding: '40px', borderRadius: '16px', border: '1px solid #333', width: '350px', textAlign: 'center'}}>
        <h1 style={{color: '#facc15', fontWeight: '900', fontSize: '32px', marginBottom: '10px'}}>DIM.</h1>
        <p style={{color: '#666', marginBottom: '30px', fontSize: '12px'}}>ÁREA RESTRITA DO CEO</p>
        
        <form onSubmit={handleLogin} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
          <input 
            type="text" placeholder="Usuário" value={user} onChange={e => setUser(e.target.value)}
            style={{padding: '12px', borderRadius: '8px', background: '#09090b', border: '1px solid #333', color: 'white'}}
          />
          <input 
            type="password" placeholder="Senha" value={pass} onChange={e => setPass(e.target.value)}
            style={{padding: '12px', borderRadius: '8px', background: '#09090b', border: '1px solid #333', color: 'white'}}
          />
          
          {error && <p style={{color: '#ef4444', fontSize: '12px'}}>{error}</p>}
          
          <button type="submit" style={{background: '#facc15', color: 'black', padding: '12px', borderRadius: '8px', fontWeight: 'bold', border: 'none', cursor: 'pointer', marginTop: '10px'}}>
            ENTRAR NO SISTEMA
          </button>
        </form>
      </div>
    </div>
  );
}