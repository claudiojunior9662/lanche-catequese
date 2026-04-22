// components/FormularioGrupo.js
"use client";
import { useState } from 'react';

export default function FormularioGrupo() {
  const [form, setForm] = useState({ nome: '', telefone: '', alimento: '' });

  const getProximaQuarta = () => {
    let d = new Date();
    d.setDate(d.getDate() + (3 - d.getDay() + 7) % 7);
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('/api/integrantes', {
      method: 'POST',
      body: JSON.stringify({ ...form, dataQuarta: getProximaQuarta() }),
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (res.ok) alert("Cadastrado com sucesso!");
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded shadow">
      <input 
        placeholder="Seu nome" 
        onChange={e => setForm({...form, nome: e.target.value})}
        className="block mb-2 p-2 border"
      />
      <input 
        placeholder="Telefone" 
        onChange={e => setForm({...form, telefone: e.target.value})}
        className="block mb-2 p-2 border"
      />
      <input 
        placeholder="O que vai levar?" 
        onChange={e => setForm({...form, alimento: e.target.value})}
        className="block mb-2 p-2 border"
      />
      <button type="submit" className="bg-blue-500 text-white p-2">Participar</button>
    </form>
  );
}