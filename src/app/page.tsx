"use client";
import { useState, useEffect } from 'react';
import { getProximaQuarta, getNumeroGrupoAtual } from '../utils/dates';

interface Integrante {
  id: number;
  nome: string;
  telefone: string;
  alimento: string;
  categoria: string;
  grupoId: number;
}

interface Grupo {
  id: number;
  numero: number;
  integrantes: Integrante[];
}

interface FormState {
  nome: string;
  telefone: string;
  alimento: string;
  categoria: string;
}

export default function Home() {
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [forms, setForms] = useState<Record<number, FormState>>({});
  const [loadingAdicionarGrupo, setLoadingAdicionarGrupo] = useState(false);
  const [loadingRemoverGrupo, setLoadingRemoverGrupo] = useState<number | null>(null);
  const [loadingAdicionarIntegrante, setLoadingAdicionarIntegrante] = useState<number | null>(null);
  const [loadingRemoverIntegrante, setLoadingRemoverIntegrante] = useState<number | null>(null);
  const proximaQuarta = getProximaQuarta();
  const grupoAtualNumero = getNumeroGrupoAtual(grupos.length);

  const fetchGrupos = async () => {
    const res = await fetch('/api/grupos');
    const data = await res.json();
    setGrupos(data);
  };

  useEffect(() => { fetchGrupos(); }, []);

  const getForm = (grupoId: number): FormState =>
    forms[grupoId] ?? { nome: '', telefone: '', alimento: '', categoria: 'salgado' };

  const CATEGORIAS = [
    { key: 'bebida',  label: 'Bebidas',  badge: 'bg-sky-100 text-sky-900',    dot: 'bg-sky-600' },
    { key: 'salgado', label: 'Salgados', badge: 'bg-amber-100 text-amber-900', dot: 'bg-amber-600' },
    { key: 'doce',    label: 'Doces',    badge: 'bg-rose-100 text-rose-900',   dot: 'bg-rose-500' },
  ];

  const setForm = (grupoId: number, partial: Partial<FormState>) =>
    setForms(prev => ({ ...prev, [grupoId]: { ...getForm(grupoId), ...partial } }));

  const adicionarGrupo = async () => {
    if (loadingAdicionarGrupo) return;
    setLoadingAdicionarGrupo(true);
    await fetch('/api/grupos', { method: 'POST' });
    await fetchGrupos();
    setLoadingAdicionarGrupo(false);
  };

  const removerGrupo = async (id: number) => {
    if (loadingRemoverGrupo !== null) return;
    const senha = window.prompt('Digite a senha para remover o grupo:');
    if (senha === null) return; // cancelou
    setLoadingRemoverGrupo(id);
    const res = await fetch(`/api/grupos/${id}`, {
      method: 'DELETE',
      headers: { 'x-delete-password': senha },
    });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error ?? 'Erro ao remover grupo');
      setLoadingRemoverGrupo(null);
      return;
    }
    await fetchGrupos();
    setLoadingRemoverGrupo(null);
  };

  const adicionarIntegrante = async (grupoId: number) => {
    if (loadingAdicionarIntegrante !== null) return;
    const form = getForm(grupoId);
    if (!form.nome || !form.telefone || !form.alimento) return;
    setLoadingAdicionarIntegrante(grupoId);
    await fetch(`/api/grupos/${grupoId}/integrantes`, {
      method: 'POST',
      body: JSON.stringify(form),
      headers: { 'Content-Type': 'application/json' },
    });
    setForms(prev => ({ ...prev, [grupoId]: { nome: '', telefone: '', alimento: '', categoria: 'salgado' } }));
    await fetchGrupos();
    setLoadingAdicionarIntegrante(null);
  };

  const removerIntegrante = async (id: number) => {
    if (loadingRemoverIntegrante !== null) return;
    if (!confirm('Remover este integrante deste grupo?')) return;
    setLoadingRemoverIntegrante(id);
    await fetch(`/api/integrantes/${id}`, { method: 'DELETE' });
    await fetchGrupos();
    setLoadingRemoverIntegrante(null);
  };

  return (
    <main className="max-w-2xl mx-auto px-4 py-6 min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Cabeçalho */}
      <div className="text-center mb-6">
        <div className="text-3xl mb-1">✝️</div>
        <h1 className="text-2xl font-bold text-amber-900 tracking-wide">Lanche da Catequese</h1>
        <div className="mt-3 inline-block bg-amber-800 text-amber-50 rounded-xl px-4 py-2 text-sm">
          <span className="opacity-80">Próxima quarta: </span>
          <strong>{proximaQuarta.toLocaleDateString('pt-BR')}</strong>
        </div>
        {grupoAtualNumero !== null && (
          <p className="mt-2 text-purple-900 font-bold text-lg">🍽️ Grupo da vez: Grupo {grupoAtualNumero}</p>
        )}
      </div>

      <div className="space-y-6">
        {grupos.map(grupo => {
          const isAtual = grupo.numero === grupoAtualNumero;
          const form = getForm(grupo.id);

          return (
            <div
              key={grupo.id}
              className={`rounded-2xl border-2 p-4 shadow-sm ${isAtual ? 'border-purple-500 bg-purple-50' : 'border-amber-200 bg-white'}`}
            >
              {/* Cabeçalho do grupo */}
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                  <h2 className={`text-base font-bold ${isAtual ? 'text-purple-900' : 'text-amber-900'}`}>Grupo {grupo.numero}</h2>
                  {isAtual && (
                    <span className="bg-purple-700 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full">
                      Esta quarta ✓
                    </span>
                  )}
                </div>
                <button
                  onClick={() => removerGrupo(grupo.id)}
                  disabled={loadingRemoverGrupo !== null}
                  className="text-xs text-stone-300 hover:text-red-500 transition-colors disabled:opacity-50"
                  title="Remover grupo"
                >
                  {loadingRemoverGrupo === grupo.id ? '…' : '···'}
                </button>
              </div>

              {/* Lista de integrantes agrupada por categoria */}
              <div className="mb-4 space-y-3">
                {grupo.integrantes.length === 0 ? (
                  <p className="text-sm text-gray-400 italic py-1">Nenhum integrante</p>
                ) : (
                  CATEGORIAS.map(cat => {
                    const lista = grupo.integrantes.filter(i => i.categoria === cat.key);
                    if (lista.length === 0) return null;
                    return (
                      <div key={cat.key}>
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full mb-1 ${cat.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cat.dot}`} />
                          {cat.label}
                        </span>
                        <ul className="divide-y divide-amber-100">
                          {lista.map(i => (
                            <li key={i.id} className="flex justify-between items-start py-2 text-sm gap-2">
                              <span className="flex-1 min-w-0">
                                <span className="font-semibold text-amber-900">{i.nome}</span>
                                <span className="text-stone-500"> levará </span>
                                <span className="text-green-800 font-medium">{i.alimento}</span>
                                <span className="block text-stone-400 text-xs mt-0.5">{i.telefone}</span>
                              </span>
                              <button
                                onClick={() => removerIntegrante(i.id)}
                                disabled={loadingRemoverIntegrante !== null}
                                className="shrink-0 text-red-400 hover:text-red-600 text-base leading-none mt-0.5 disabled:opacity-40"
                                title="Remover"
                              >
                                {loadingRemoverIntegrante === i.id ? '…' : '✕'}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Formulário para adicionar integrante */}
              <div className="mt-3 pt-3 border-t border-amber-100 space-y-2">
                <div className="flex gap-2">
                  <input
                    className="border border-amber-300 rounded-lg px-3 py-2 text-sm flex-1 bg-amber-50 text-amber-900 placeholder-amber-400 focus:outline-none focus:border-amber-500 focus:bg-white"
                    placeholder="Nome"
                    value={form.nome}
                    onChange={e => setForm(grupo.id, { nome: e.target.value })}
                  />
                  <input
                    className="border border-amber-300 rounded-lg px-3 py-2 text-sm flex-1 bg-amber-50 text-amber-900 placeholder-amber-400 focus:outline-none focus:border-amber-500 focus:bg-white"
                    placeholder="Telefone"
                    value={form.telefone}
                    onChange={e => setForm(grupo.id, { telefone: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    className="border border-amber-300 rounded-lg px-3 py-2 text-sm bg-amber-50 text-amber-900 focus:outline-none focus:border-amber-500"
                    value={form.categoria}
                    onChange={e => setForm(grupo.id, { categoria: e.target.value })}
                  >
                    <option value="bebida">Bebida</option>
                    <option value="salgado">Salgado</option>
                    <option value="doce">Doce</option>
                  </select>
                  <input
                    className="border border-amber-300 rounded-lg px-3 py-2 text-sm flex-1 bg-amber-50 text-amber-900 placeholder-amber-400 focus:outline-none focus:border-amber-500 focus:bg-white"
                    placeholder="O que vai levar?"
                    value={form.alimento}
                    onChange={e => setForm(grupo.id, { alimento: e.target.value })}
                  />
                  <button
                    onClick={() => adicionarIntegrante(grupo.id)}
                    disabled={loadingAdicionarIntegrante !== null}
                    className="bg-amber-800 text-amber-50 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-amber-900 active:scale-95 transition shrink-0 disabled:opacity-60"
                  >
                    {loadingAdicionarIntegrante === grupo.id ? '…' : '+ Add'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={adicionarGrupo}
        disabled={loadingAdicionarGrupo}
        className="mt-6 w-full border-2 border-dashed border-amber-400 rounded-2xl p-4 text-amber-700 font-semibold hover:bg-amber-100 active:scale-95 transition disabled:opacity-60"
      >
        {loadingAdicionarGrupo ? 'Adicionando…' : '+ Adicionar novo grupo'}
      </button>
    </main>
  );
}