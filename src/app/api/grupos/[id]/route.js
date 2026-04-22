import { NextResponse } from 'next/server'
import { getDb } from '@/lib/db'

export async function DELETE(request, context) {
  const { id } = await context.params
  const db = getDb()

  try {
    const grupo = db.prepare('SELECT * FROM Grupo WHERE id = ?').get(id)
    if (!grupo) return NextResponse.json({ error: 'Grupo não encontrado' }, { status: 404 })

    db.prepare('DELETE FROM Grupo WHERE id = ?').run(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao remover grupo' }, { status: 500 })
  }
}
