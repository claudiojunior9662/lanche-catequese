import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

// GET: Lista todos os grupos e seus integrantes
export async function GET() {
  const db = getDb()
  const grupos = db.prepare(`
    SELECT g.id, g.dataQuarta,
      json_group_array(
        CASE WHEN i.id IS NOT NULL THEN
          json_object('id', i.id, 'nome', i.nome, 'telefone', i.telefone, 'alimento', i.alimento, 'grupoId', i.grupoId)
        END
      ) as integrantes
    FROM Grupo g
    LEFT JOIN Integrante i ON i.grupoId = g.id
    GROUP BY g.id
    ORDER BY g.dataQuarta ASC
  `).all()

  const result = grupos.map(g => ({
    ...g,
    integrantes: JSON.parse(g.integrantes).filter(Boolean)
  }))

  return NextResponse.json(result);
}

// POST: Cria grupo (se não existir) e adiciona integrante
export async function POST(request) {
  const db = getDb()
  const { nome, telefone, alimento, dataQuarta } = await request.json();

  try {
    const dataFormatada = new Date(dataQuarta).toISOString()

    db.prepare(`INSERT OR IGNORE INTO Grupo (dataQuarta) VALUES (?)`).run(dataFormatada)
    const grupo = db.prepare(`SELECT * FROM Grupo WHERE dataQuarta = ?`).get(dataFormatada)

    const result = db.prepare(`
      INSERT INTO Integrante (nome, telefone, alimento, grupoId) VALUES (?, ?, ?, ?)
    `).run(nome, telefone, alimento, grupo.id)

    const novoIntegrante = db.prepare(`SELECT * FROM Integrante WHERE id = ?`).get(result.lastInsertRowid)

    return NextResponse.json(novoIntegrante, { status: 201 });
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Erro ao salvar integrante" }, { status: 500 });
  }
}