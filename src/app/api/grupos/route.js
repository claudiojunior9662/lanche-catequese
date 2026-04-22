import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function GET() {
  const db = getDb()
  const grupos = db.prepare(`
    SELECT g.id, g.numero,
      json_group_array(
        CASE WHEN i.id IS NOT NULL THEN
          json_object('id', i.id, 'nome', i.nome, 'telefone', i.telefone, 'alimento', i.alimento, 'categoria', i.categoria)
        END
      ) as integrantes
    FROM Grupo g
    LEFT JOIN Integrante i ON i.grupoId = g.id
    GROUP BY g.id
    ORDER BY g.numero ASC
  `).all()

  const result = grupos.map(g => ({
    ...g,
    integrantes: JSON.parse(g.integrantes).filter(Boolean)
  }))

  return NextResponse.json(result)
}

export async function POST() {
  const db = getDb()
  const ultimo = db.prepare('SELECT MAX(numero) as max FROM Grupo').get()
  const proximoNumero = (ultimo.max ?? 0) + 1

  const result = db.prepare('INSERT INTO Grupo (numero) VALUES (?)').run(proximoNumero)
  const grupo = db.prepare('SELECT * FROM Grupo WHERE id = ?').get(result.lastInsertRowid)

  return NextResponse.json(grupo, { status: 201 })
}
