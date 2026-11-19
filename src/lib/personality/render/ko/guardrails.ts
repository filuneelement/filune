// Complete words for short Korean terms avoid catching ordinary words such as
// 상관없이, 지지를 보내다, 장점 and 넘어가다.
const forbidden = [
  /\p{Script=Han}/u,
  /용신|상신|구응|병격|정관|편관|식신|비견|겁재|정재|편재|정인|편인|천간|지장간|합거|통근|격국|오행|일간|십성|일주|(?:목|화|수|금|토)의 기운|(?:^|[^가-힣])(?:상관|지지|병|일지)(?:[은는이가을를의에와도만]|[^가-힣]|$)/u,
  /당신|(?:^|[^가-힣])(?:너(?:는|를|도|의|한테|에게)?|네(?:가)?)(?=[^가-힣]|$)/u,
  /배우자|남편|아내|이혼|외도|이별|궁합|결혼|이직|이사|승진|재물복|부자(?:가|로)|사업.{0,4}성공|돈을.{0,6}번|공무원이|대기업에|반드시|무조건|평생 고생|운명|성격이 바뀌/u,
  /질병|수명|통증|병원|두통|소화가 안|(?:^|[^가-힣])(?:몸[이가을은]|사고[가를는]|소화[가를는])/u,
  /[%％★☆]|\d+\s*점|점수|별점|확률|등급|랭크|순위|가장 강한|두 번째로 강|아주 강하게|매우 뚜렷하게|압도적으로/u,
  /\b(?:fact|effect|knowledge|modifier|conflict|sourceFactIds|originScope|day_stem|ten_god|day_pillar|deferred)\b|했지\?|했을 거야/u,
]

export function isCustomerSafeKo(text: string): boolean {
  return !forbidden.some(pattern => pattern.test(text))
}
