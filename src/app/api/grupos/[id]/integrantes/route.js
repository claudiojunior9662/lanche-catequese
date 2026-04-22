import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function POST(request, context) {
  const { id } = await context.params
  const { nome, telefone, alimento, categoria = 'salgado', tipo = 'Catequisando' } = await request.json()

  try {
    const db = getDb()
    const grupo = db.prepare('SELECT * FROM Grupo WHERE id = ?').get(id)
    if (!grupo) return NextResponse.json({ error: 'Grupo não encontrado' }, { status: 404 })

    const result = db.prepare(
      'INSERT INTO Integrante (nome, telefone, alimento, categoria, tipo, grupoId) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(nome, telefone, alimento, categoria, tipo, id)

    const integrante = db.prepare('SELECT * FROM Integrante WHERE id = ?').get(result.lastInsertRowid)
    return NextResponse.json(integrante, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao adicionar integrante' }, { status: 500 })
  }
}
