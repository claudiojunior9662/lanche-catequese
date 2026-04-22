export function getProximaQuarta() {
  const hoje = new Date();
  const diaDaSemana = hoje.getDay();
  const diasAteQuarta = (3 - diaDaSemana + 7) % 7 || 7;
  const proximaQuarta = new Date(hoje);
  proximaQuarta.setDate(hoje.getDate() + diasAteQuarta);
  proximaQuarta.setHours(0, 0, 0, 0);
  return proximaQuarta;
}

// Referência: 08/04/2026 = Grupo 1 → 22/04/2026 (2 semanas depois) = Grupo 3
const REFERENCIA = new Date(2026, 3, 8) // mês é 0-indexado

export function getNumeroGrupoAtual(totalGrupos) {
  if (totalGrupos === 0) return null
  const proxQuarta = getProximaQuarta()
  const diffMs = proxQuarta.getTime() - REFERENCIA.getTime()
  const diffSemanas = Math.round(diffMs / (7 * 24 * 60 * 60 * 1000))
  return (((diffSemanas % totalGrupos) + totalGrupos) % totalGrupos) + 1
}
