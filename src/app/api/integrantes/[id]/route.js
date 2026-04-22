import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function DELETE(request, context) {
  const { id } = await context.params

  try {
    const integrante = db.prepare('SELECT * FROM Integrante WHERE id = ?').get(id)
    if (!integrante) return NextResponse.json({ error: 'Integrante não encontrado' }, { status: 404 })

    db.prepare('DELETE FROM Integrante WHERE id = ?').run(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Erro ao remover integrante' }, { status: 500 })
  }
}
