import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function PATCH(request, context) {
  const { id } = await context.params
  const { nome, telefone, alimento, categoria, tipo } = await request.json()

  try {
    const db = getDb()
    const integrante = db.prepare('SELECT * FROM Integrante WHERE id = ?').get(id)
    if (!integrante) return NextResponse.json({ error: 'Integrante não encontrado' }, { status: 404 })

    db.prepare(
      'UPDATE Integrante SET nome = ?, telefone = ?, alimento = ?, categoria = ?, tipo = ? WHERE id = ?'
    ).run(nome, telefone, alimento, categoria, tipo, id)

    const atualizado = db.prepare('SELECT * FROM Integrante WHERE id = ?').get(id)
    return NextResponse.json(atualizado)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao atualizar integrante' }, { status: 500 })
  }
}

export async function DELETE(request, context) {
  const { id } = await context.params

  try {
    const db = getDb()
    const integrante = db.prepare('SELECT * FROM Integrante WHERE id = ?').get(id)
    if (!integrante) return NextResponse.json({ error: 'Integrante não encontrado' }, { status: 404 })

    db.prepare('DELETE FROM Integrante WHERE id = ?').run(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao remover integrante' }, { status: 500 })
  }
}
