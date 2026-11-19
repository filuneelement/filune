const forbidden = [
  /[\p{Script=Hangul}\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u,
  /\b(?:day[ -](?:master|pillar)|month commander|heavenly stems?|earthly branches?|hidden stems?|ten gods?|companion|rob wealth|eating god|hurting officer|(?:in)?direct (?:wealth|officer|resource)|seven killings|structure|yong shen|xiang shen|bing|jiu ying|rooted|combined away|(?:luck|annual|monthly) pillars?|ba[ -]?zi|qi)\b/iu,
  /\b(?:personalityfact|rolemodifier|structuralrolepersonalitymodifier|source(?:fact|modifier|conflict)ids?|confirmed|contextual|contextualizes|provenance)\b/iu,
  /\b(?:thou|thy|fated|doomed|the stars foretell|destiny decrees|danger|disaster|doom|curse|misfortune|beware)\b/iu,
  /\b(?:mr\.|ms\.|mrs\.|dear\b|seeker\b)|\b(?:your husband|your wife|your children|your kids|your boss|your company)\b/iu,
  /\b(?:changed jobs|broke up|had conflict|you (?:failed|succeeded)|(?:you'll|you will) (?:succeed|fail|leave your job|meet someone)|pain|stiffness|blocked|hospital|check[ -]?up)\b/iu,
  /[%％★]|\b(?:scores?|odds|ratings?|stars?|ranks?|rankings?|strongest|most dominant|number[ -]one|greatest strength)\b/iu,
  /\b(?:always|definitely|certainly|without fail|guiding principle|deepest value|basis of every choice|perfect balance|solves everything)\b/iu,
  /\b(?:contradictory personality|two-faced|split personality|inconsistent person|bad personality|flawed personality|toxic|problematic person)\b/iu,
  /\b(?:for entertainment only|everyone is different|your fate is in your hands|that's okay|don't worry|you should embrace this|trust yourself|soulmate|buying opportunity|invest in)\b/iu,
]

export function isCustomerSafeEn(text: string): boolean {
  const normalized = text.normalize('NFKC').replaceAll('’', "'")
  return normalized.trim().length > 0 && forbidden.every(pattern => !pattern.test(normalized))
}
