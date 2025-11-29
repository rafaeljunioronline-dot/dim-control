import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, FileText } from 'lucide-react';
import { db } from './db';

export default function Notas({ notesList, refresh }) {
  const [activeNote, setActiveNote] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // Carregar a primeira nota ao abrir, se existir
  useEffect(() => {
    if (!activeNote && notesList && notesList.length > 0) {
      selectNote(notesList[0]);
    }
  }, [notesList]);

  const selectNote = (note) => {
    setActiveNote(note);
    setTitle(note.title);
    setContent(note.content);
  };

  const createNew = () => {
    const blank = { id: null, title: '', content: '' };
    setActiveNote(blank);
    setTitle('');
    setContent('');
  };

  const handleSave = () => {
    if (!title.trim() && !content.trim()) return;
    
    // Salva no banco
    db.saveNote({ 
      id: activeNote?.id, 
      title: title || 'Sem Título', 
      content 
    });
    
    refresh(); // Atualiza a lista na esquerda
    // Se era nova, precisamos pegar o ID novo, mas por simplicidade vamos manter assim e o refresh atualiza a lista
    if(!activeNote?.id) {
       // Pequeno hack para limpar seleção após criar para forçar usuário a selecionar na lista (ou selecionar a primeira)
       setActiveNote(null);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Tem certeza que quer apagar essa nota?')) {
      db.deleteNote(id);
      refresh();
      if (activeNote?.id === id) {
        setActiveNote(null);
        setTitle('');
        setContent('');
      }
    }
  };

  return (
    <div className="animate-fade" style={{height: 'calc(100vh - 60px)', display: 'flex', flexDirection: 'column'}}>
      <header className="control-header" style={{marginBottom: '20px'}}>
        <div className="title-page">
          <h2>Bloco de Notas</h2>
          <p style={{color:'#666'}}>Seu segundo cérebro.</p>
        </div>
      </header>

      <div style={{display: 'flex', gap: '20px', flex: 1, overflow: 'hidden'}}>
        
        {/* COLUNA ESQUERDA: LISTA */}
        <div style={{width: '300px', display: 'flex', flexDirection: 'column', gap: '10px'}}>
          <button 
            onClick={createNew}
            style={{
              width: '100%', background: '#facc15', color: 'black', border: 'none', padding: '12px', 
              borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}
          >
            <Plus size={18} /> NOVA NOTA
          </button>

          <div style={{flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '5px'}}>
            {notesList && notesList.map(note => (
              <div 
                key={note.id}
                onClick={() => selectNote(note)}
                style={{
                  background: activeNote?.id === note.id ? '#27272a' : '#18181b',
                  border: activeNote?.id === note.id ? '1px solid #facc15' : '1px solid #333',
                  padding: '15px', borderRadius: '8px', cursor: 'pointer', transition: '0.2s'
                }}
              >
                <h4 style={{color: 'white', marginBottom: '5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                  {note.title || 'Sem Título'}
                </h4>
                <p style={{color: '#666', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                  {note.content || '...'}
                </p>
                <p style={{color: '#444', fontSize: '10px', marginTop: '8px', textAlign: 'right'}}>
                  {new Date(note.updatedAt).toLocaleDateString('pt-BR')}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* COLUNA DIREITA: EDITOR */}
        <div style={{flex: 1, background: '#18181b', borderRadius: '12px', border: '1px solid #333', display: 'flex', flexDirection: 'column', padding: '30px'}}>
          
          {/* Barra de Ferramentas da Nota */}
          <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '20px'}}>
            <input 
              type="text" 
              placeholder="Título da Nota" 
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={{
                background: 'transparent', border: 'none', color: 'white', fontSize: '24px', fontWeight: 'bold', width: '100%', outline: 'none'
              }}
            />
            <div style={{display: 'flex', gap: '10px'}}>
              {activeNote?.id && (
                <button onClick={() => handleDelete(activeNote.id)} style={{background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', padding: '8px', borderRadius: '6px', cursor: 'pointer'}}>
                  <Trash2 size={18} />
                </button>
              )}
              <button onClick={handleSave} style={{background: '#facc15', border: 'none', color: 'black', padding: '8px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'}}>
                <Save size={18} /> Salvar
              </button>
            </div>
          </div>

          <textarea 
            placeholder="Comece a escrever..." 
            value={content}
            onChange={e => setContent(e.target.value)}
            style={{
              flex: 1, background: 'transparent', border: 'none', color: '#ccc', fontSize: '16px', lineHeight: '1.6', resize: 'none', outline: 'none'
            }}
          />
        </div>

      </div>
    </div>
  );
}