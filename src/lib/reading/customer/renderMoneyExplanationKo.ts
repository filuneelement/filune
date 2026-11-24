import type { MoneyAxis } from '../../outcome'
import type { MoneyContrast } from './moneyExplanation'
import type { CustomerReadingParagraphPlan, OutcomeVoice } from './types'

type MoneyVoice = Exclude<OutcomeVoice, 'contact' | 'change' | 'formation' | 'relationshipPressure'>
type Explanation = { readonly text: string; readonly axes: readonly MoneyAxis[]; readonly criterion?: string }

const earningText = '결과물을 수익과 연결할 수 있는 경로가 있습니다.'
const retentionText = '확보한 재원을 남기기 어려울 수 있습니다.'

const explanations: Partial<Record<MoneyVoice, Explanation>> = {
  capacity: {
    text: '이미 확보한 재원을 유지할 여력이 제한되어, 수익이 들어와도 그 몫을 그대로 남기기 어려울 수 있습니다.',
    axes: ['retention'],
  },
  divisionRetention: {
    text: '확보한 몫에 손상이 닿아 수익을 그대로 보유하기 어려울 수 있습니다. 이 유지 제약은 이미 들어온 몫에 작용합니다.',
    axes: ['retention'],
  },
  division: {
    text: '이미 확보한 몫에 직접 손상이 닿는 경로가 있어, 그 일부가 나뉘거나 빠져나갈 여지가 있습니다. 어떤 이유로 줄어드는지나 실제로 어떻게 나뉘는지까지는 이 근거만으로 가려내기 어렵습니다.',
    axes: ['combined_outflow_or_division'],
  },
  sustainability: {
    text: '남겨 둔 수익을 여러 차례 이어서 쌓는 과정에도 제약이 있습니다. 이 제약은 쌓아 가는 과정에 관한 설명이며, 수익이 지속되는 기간은 별도 근거가 필요합니다.',
    axes: ['accumulation_continuity'],
    criterion: '축적을 볼 때는 이미 남긴 몫에 다음에도 남은 몫을 더할 수 있는지를 살핍니다.',
  },
  protection: {
    text: '이미 확보한 몫을 지키는 쪽에 힘이 작동합니다. 재원을 줄이거나 나누는 방향의 압력이 약해져, 들어온 몫이 남을 여지가 생기는 보호입니다.',
    axes: ['protection'],
  },
  pressure: {
    text: '수익을 만드는 활동이 이미 부담을 주는 작용에 힘을 보탤 수 있습니다. 그 영향은 새로운 수익의 유입보다 그 활동을 감당하는 단계에서 드러납니다.',
    axes: ['burden'],
    criterion: '이 경로를 볼 때는 새로 생기는 부담을 추정하기 전에 수익 활동이 기존 부담을 더 강하게 만드는지를 살핍니다.',
  },
  supportPressure: {
    text: '돈을 추구하는 힘이 활동을 조절하는 데 필요한 기반을 약하게 만들 수 있습니다. 제약은 이 조절 기능에 닿으므로 활동을 얼마나 밀고 갈지 조율하는 여지가 줄 수 있습니다.',
    axes: ['burden'],
    criterion: '수익으로 이어지는 부분과, 활동의 균형을 잡는 데 필요한 기반이 계속 작동하는지를 각각 살펴볼 부분입니다.',
  },
}

export function renderMoneyExplanation(voice: OutcomeVoice, plan: CustomerReadingParagraphPlan): Explanation | undefined {
  const axes = plan.moneyAxes ?? []
  if (voice === 'earning') return { text: earningText, axes: [] }
  if (voice === 'retention') return { text: retentionText, axes: [] }
  if (voice === 'contact' || voice === 'change' || voice === 'formation' || voice === 'relationshipPressure') return undefined

  const complete = plan.reasonStatus === 'complete'
  if (voice === 'skill' || voice === 'expression') {
    const hasEarning = axes.includes('earning')
    const hasMethod = complete && axes.includes('earning_method')
    const method = voice === 'skill'
      ? '익힌 기술을 실제 작업 결과로 완성하는 방식입니다. 그 결과가 다른 사람이 받아 쓸 수 있는 형태가 되는 지점에서 기술이 수익과 연결될 수 있습니다.'
      : '아이디어나 표현을 실제로 쓸 수 있는 방식이나 작업 결과로 구체화하는 경로입니다. 표현에 담긴 발상이 다른 사람이 활용할 수 있는 형태로 정리될 때 수익과 맞닿습니다.'
    const criterion = voice === 'skill'
      ? '기술을 얼마나 익혔는지와 그 기술로 무엇을 완성해 전달할 수 있는지는 따로 살핍니다.'
      : '새로운 생각이 떠오른 단계에서는 어떤 결과로 만들어졌는지가 다음 판단 기준입니다.'
    const text = [hasEarning ? earningText : '', hasMethod ? method : ''].filter(Boolean).join(' ')
    return text ? {
      text, axes: [...(hasEarning && hasMethod ? ['earning' as const] : []), ...(hasMethod ? ['earning_method' as const] : [])],
      ...(hasMethod && { criterion }),
    } : undefined
  }

  const explanation = explanations[voice]
  if (!explanation) return undefined
  if (!complete) {
    const conclusions: Partial<Record<MoneyVoice, string>> = {
      capacity: retentionText, divisionRetention: retentionText,
      division: '확보한 몫 일부가 나뉘거나 빠져나갈 여지가 있습니다.',
      sustainability: '남겨 둔 재원을 지속해서 쌓기 어려울 수 있습니다.',
      protection: '확보한 몫을 지키는 방향의 작용이 있습니다.',
      pressure: '재물 경로에서 부담이 커질 수 있습니다.',
      supportPressure: '재물 경로에서 필요한 기반이 약해질 수 있습니다.',
    }
    const text = conclusions[voice]
    return text ? { text, axes: [] } : undefined
  }

  if (voice === 'division' && axes.includes('retention')) return {
    ...explanation,
    text: explanation.text + ' 이 작용은 벌어들이는 단계 이후에 닿으므로, 수익이 생긴 뒤에도 그 몫을 그대로 보유하기 어려울 수 있습니다.',
    axes: [...explanation.axes, 'retention'],
  }
  return explanation.axes.every(axis => axes.includes(axis)) ? explanation : undefined
}

export const moneyContrastCopy: Record<MoneyContrast['kind'], string> = {
  earning_retention: '결과물을 통해 수익이 생길 조건을 확인했다면, 그다음에는 실제 남은 몫을 기준으로 보유력을 따로 판단합니다.',
  retention_accumulation: '한 차례의 수익을 남겼더라도, 그 결과만으로 다음 차례에도 축적이 이어진다고 판단하기는 어렵습니다.',
  damage_protection: '보호가 확인되는 범위와 유출·배분 압력이 드러나는 범위를 각각 살펴야 합니다. 한 범위에서 작동한 보호만으로 다른 범위의 압력까지 해소되는지는 판단하기 어렵습니다.',
  retention_protection: '재원을 남기는 데 제약이 따르는 조건과, 그 제약을 덜어 주는 보호 조건은 따로 볼 수 있습니다.',
  earning_protection: '수익을 새로 만드는 경로가 확인되는 범위와, 이미 들어온 몫을 지키는 힘이 확인되는 범위를 각각 볼 수 있습니다.',
  earning_burden: '수익이 생길 조건이 확인되는 동안에도 이 부담은 함께 작동할 수 있습니다.',
}
