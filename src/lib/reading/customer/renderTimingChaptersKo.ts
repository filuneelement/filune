import { bounds } from '../semanticUnit'
import type { ReadingSemanticUnit } from '../types'
import type { CustomerChapterId } from './types'
import type { TemporalActivation, TemporalContribution } from './timingChapters'

const labels: Record<TemporalActivation['voice'], string> = {
  earning: '만든 결과물이 수익으로 연결되는 경로',
  skill: '익힌 기술을 실제 결과물로 만드는 방식',
  expression: '아이디어와 표현을 실제 결과물로 만드는 방식',
  retention: '확보한 몫을 남기는 데 따르는 제약',
  capacity: '들어온 재원을 남겨 둘 여력의 제약',
  divisionRetention: '확보한 몫이 분산될 수 있어 재원을 남기는 데 생기는 제약',
  division: '확보한 몫의 일부가 나뉘거나 빠져나갈 수 있는 압력',
  protection: '확보한 재원이 약해지는 압력을 완화하는 작용',
  sustainability: '남긴 재원을 여러 차례 이어 쌓는 데 따르는 제약',
  pressure: '수익 활동이 기존 부담을 키울 수 있는 작용',
  supportPressure: '수익을 추구하는 과정에서 필요한 조절 기반이 약해질 수 있는 작용',
  contact: '관계에서 새로운 접점이 생길 여지',
  change: '이미 이어진 관계의 구도가 움직일 여지',
  formation: '관계의 접점이 좀 더 구체적인 관계로 이어질 여지',
  healthPressure: '일상의 리듬을 평소보다 세심히 살필 만한 부담',
  relationshipPressure: '가까운 관계에서 표현과 역할의 기준을 맞추는 데 따르는 부담',
  contract_favorable: '계약을 진행하는 데 힘이 실리는 조건',
  contract_delay: '계약 일정이 늦어질 수 있는 조건',
  contract_process_trouble: '계약 진행 과정에서 마찰이 생길 수 있는 조건',
  contract_termination_or_restructure: '계약을 유지하는 조건을 다시 살펴야 할 가능성',
  business_start_favorable: '사업을 시작하는 계획에 힘이 실리는 조건',
  business_start_delay: '사업 착수에 시간이 더 필요할 수 있는 조건',
  business_expansion_favorable: '사업 확장 계획에 힘이 실리는 조건',
  business_adjustment: '사업 운영 방식을 조정해야 할 가능성',
  business_restructure: '사업 운영 구조를 다시 살펴야 할 가능성',
} as Record<TemporalActivation['voice'], string>

const criteria: Partial<Record<TemporalActivation['voice'], string>> = {
  earning: '만들 수 있는 결과가 실제로 쓰이고 수익에 연결될 조건까지 갖추는지가 판단 기준입니다.',
  formation: '접점이 생기는 단계와 서로 관계를 이어갈 조건이 갖춰지는 단계는 각각 살필 수 있습니다.',
  capacity: '수익이 들어오는 규모와 실제 남길 여력은 따로 볼 수 있습니다.',
  divisionRetention: '들어온 몫과 이후에도 유지할 수 있는 몫 사이에 차이가 생기는지가 판단 기준입니다.',
  division: '확보한 결과와 실제로 남는 몫 사이의 차이를 살펴볼 구간입니다.',
  sustainability: '한 번 남길 여력과 그 상태를 다음에도 이어갈 여력을 구분하는 시기입니다.',
  pressure: '수익화 가능성과 활동을 감당할 부담이 함께 커지는지를 각각 살펴볼 수 있습니다.',
  supportPressure: '수익화 과정에서 그 활동을 조절할 기반을 얼마나 유지할 수 있는지가 판단 기준입니다.',
  healthPressure: '이 구간에는 평소의 생활 리듬을 유지하는 데 부담이 달라지는지 살펴볼 수 있습니다.',
  relationshipPressure: '서로 기대하는 역할과 실제로 표현하는 방식이 어디서 어긋나는지가 판단 기준입니다.',
}
const koDate = new Intl.DateTimeFormat('ko-KR', { timeZone: 'Asia/Seoul', year: 'numeric', month: 'long', day: 'numeric',
  hour: 'numeric', minute: 'numeric', second: 'numeric', hourCycle: 'h23' })
const display = (value: string) => koDate.format(new Date(value))
const scopeTitle = { natal: '원국', daewoon: '대운', sewoon: '세운', month: '월운', day: '일운' }
const range = (item: TemporalActivation) => item.interval
  ? `${scopeTitle[item.scope]} ${display(item.interval[0])}부터 ${display(item.interval[1])} 직전까지` : scopeTitle[item.scope]

export function validTimingContribution(value: TemporalContribution, units: ReadonlyMap<string, ReadingSemanticUnit>, chapterId: CustomerChapterId) {
  if (!value.activations.length
    || (value.role === 'current_change' && (chapterId !== 'CR-04' || value.status !== 'current'))
    || (value.role === 'long_term_transition' && (chapterId !== 'CR-08' || !value.boundary || !value.change))
    || (value.change && !value.evaluatedPair)
    || ((value.role === 'opportunity_window' || value.role === 'caution_window') && chapterId !== 'CR-09')) return false
  if (value.boundary && (value.evaluatedPair?.[0].interval?.[1] !== value.boundary
    || value.evaluatedPair[1].interval?.[0] !== value.boundary)) return false
  const entries = [...(value.before ? [value.before] : []), ...value.activations]
  return entries.length > 0 && entries.every(item => {
    const unit = units.get(item.semanticUnitId)
    return unit && unit.status !== 'deferred' && item.role === value.role && Object.hasOwn(labels, item.voice)
      && unit.meaningRef.recordId === item.sourceId && unit.scope === item.scope && unit.certainty === item.certainty
      && unit.period?.periodId === item.periodRef && JSON.stringify(bounds(unit.period)) === JSON.stringify(item.interval)
      && unit.lifecycle === item.lifecycle && (unit.direction ?? unit.eventDirection) === item.direction
      && (unit.meaningRef.kind === 'outcome_fact'
        || (value.origin === 'comparison' && unit.meaningRef.kind === 'structural_function' && item.lifecycle === 'stopped'
          && Boolean(value.structuralEvidenceIds?.length) && (value.change === 'suppression' || value.change === 'burden_ended')) || (value.origin === 'event_timing' && unit.eventType === item.voice))
  })
}

export function renderTimingContribution(value: TemporalContribution): string | undefined {
  const first = value.activations[0]
  if (!first) return undefined
  const label = labels[first.voice]
  const earningCause = first.voice !== 'earning' ? '' : first.mechanism === 'skill_production'
    ? ' 익힌 기술이 실제로 쓸 수 있는 결과물로 정리될 때 수익에 연결되는 방식입니다.'
    : ' 아이디어와 표현이 실제로 쓸 수 있는 결과물로 구체화될 때 수익에 연결되는 방식입니다.'
  const qualification = [...value.activations, ...(value.before ? [value.before] : [])].some(item => item.certainty !== 'confirmed')
    ? ' 조건이 유지되는 범위에서 볼 수 있는 해석입니다.' : ''
  if (value.role === 'current_change' || value.role === 'long_term_transition') {
    const prefix = value.boundary ? `${display(value.boundary)}에 대운의 경계가 있습니다. ` : ''
    const prior = value.before && labels[value.before.voice]
    const span = first.interval ? ` 적용 범위는 ${value.activations.map(range).join(', 그 안의 ')}입니다.` : ''
    switch (value.change) {
      case 'new_activation':
      case 'burden_change':
        return prefix + (prior
          ? `${value.before?.scope === 'natal' ? '원래' : '앞선 범위에서'} 확인된 ‘${prior}’에 이 구간의 별도 작용이 더해집니다.`
          : `앞선 평가와 비교해 이번 구간에는 ‘${label}’이 새로 활성될 수 있습니다.`)
          + earningCause + span + qualification
      case 'protection_change':
      case 'direction_change':
        return prefix + `${value.before?.scope === 'natal' ? '원래' : '앞선 범위에서'} ‘${prior}’이 확인됩니다. 이 범위에서는 같은 대상에 ‘${label}’이 나타날 수 있습니다.` + span + qualification
      case 'release':
        return prefix + `앞선 평가에서 제어되던 작용이 이 구간에서는 다시 작동할 수 있습니다. 해당 작용은 ‘${label}’입니다.`
          + earningCause + span + qualification
      case 'suppression':
      case 'burden_ended':
        return prefix + `앞선 평가에서 작동했던 ‘${label}’은 이 구간에서는 그 경로의 작동이 제어됩니다.` + span + qualification
      case 'weakening':
      case 'strengthening':
        return prefix + `‘${label}’이 이어지며, 앞선 범위보다 작용이 ${value.change === 'weakening' ? '줄어들' : '회복될'} 수 있습니다.` + span + qualification
      default:
        return `현재 평가 구간에서는 ‘${label}’이 확인됩니다.` + earningCause + span + qualification
    }
  }
  const judgment = criteria[first.voice] ?? (value.origin === 'event_timing'
    ? '진행 조건이 실제로 갖춰졌는지가 구간을 해석하는 기준입니다.'
    : '이 작용이 현재 판단할 대상에 해당하는지 살펴볼 수 있습니다.')
  const role = value.role === 'opportunity_window' ? '활용할 수 있는 조건' : '신중히 볼 조건'
  const timing = value.activations.map(range).join(', 그 안의 ')
  const timingLead = first.scope === 'daewoon' ? '장기 배경이 작동하는 범위는'
    : value.status === 'current' ? '현재 진행 중인 적용 구간은' : '적용 구간은'
  return `${role}은 ‘${label}’입니다.${earningCause} ${judgment} ${timingLead} ${timing}입니다(한국 시간).` + qualification
}
