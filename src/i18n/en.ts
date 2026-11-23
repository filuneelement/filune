import type ja from './ja'
const en: { [K in keyof typeof ja]: unknown } = {
  flow: { heroMain: 'Read the story in your chart', start: 'Explore My Fortune', luneName: 'LUNE', guideLine: '', permissionTitle: 'May I take a look at your story?', birthInputTitle: 'First, tell me about yourself', permissionBody: 'To read your story, I’ll need your name,\nbirth date and time, and birthplace.', permissionAccept: 'Yes, continue', back: 'Back', next: 'Continue', topicIntroTitle: 'Tell me what you’re most curious about', topicEyebrow: 'Topic', topics: ['Personality & Strengths', 'Love & Marriage', 'Work & Career', 'Money & Wealth'], followUp: 'Tell me a little more', relationshipQuestion: 'What is your current relationship status?', relationshipStatuses: ['Single', 'Dating', 'Married'], careerQuestion: 'What is your current work situation?', careerStatuses: ['Looking for work', 'Employed', 'Running a business'], transition: 'All right.\nLet’s connect the patterns in your chart, one by one.', loading: 'Reading your chart' },
  language: 'Language', country: 'Birth country', countryNames: { JP: 'Japan', KR: 'South Korea', US: 'United States' },
  entryTitle: 'BaZi Chart', brandSubline: 'A Four Pillars reading, made personal', entryCta: 'View My Four Pillars', profile: 'Profile', name: 'Name', gender: 'Gender', female: 'Female', male: 'Male', birthDate: 'Date of birth', birthDateTime: 'Date and time of birth', year: 'Year', month: 'Month', day: 'Day', birthTime: 'Time of birth', hour: 'Hour', minute: 'Minute', unknownTime: 'I don’t know the birth time',
  birthplace: 'Birthplace', searchLocation: 'Search city', locationAria: 'Search birthplace', locationPlaceholder: { JP: 'e.g. Tokyo, Shinjuku, Yokohama', KR: 'e.g. 서울, 강남, 수원', US: 'e.g. New York, Los Angeles, Chicago' }, candidates: 'Birthplace suggestions', noCandidates: 'No locations found', selectedLocation: 'Selected birthplace', useCorrection: 'Apply local time correction', submit: 'View BaZi Chart',
  errors: { year: 'Enter a four-digit year.', month: 'Enter a month from 1 to 12.', day: 'Enter a numeric day.', date: 'Enter a valid date for the selected month.', hour: 'Enter an hour from 0 to 23.', minute: 'Enter a minute from 0 to 59.', calculate: 'Could not calculate the entered date and time.' },
  back: 'Back to input', resultTitle: 'BaZi Chart', birthTimeUnknown: 'Birth time unknown', correctionOriginal: 'Recorded time', correction: 'Longitude correction', calculationTime: 'Calculation time', solarNotice: 'This date is a solar-term boundary, so the year or month pillar may depend on the birth time.', basicChart: 'Four Pillars',
  pillars: { 年柱: 'Year', 月柱: 'Month', 日柱: 'Day', 時柱: 'Hour' }, dayMaster: 'Day Master', tenGod: 'Ten Gods', twelveStagesTitle: 'Twelve Life Stages', hiddenStems: 'Hidden Stems', minuteUnit: ' min', roles: { residual: 'Residual', middle: 'Middle', main: 'Main' }, expandHidden: 'Show hidden stems', collapseHidden: 'Hide details', fortuneFlow: 'Fortune cycles', greatLuck: '10-year cycle', yearlyLuck: 'Yearly cycle', monthlyLuck: 'Monthly cycle',
  direction: { 順行: 'Forward', 逆行: 'Reverse' }, greatLuckList: '10-year cycles', yearlyLuckList: 'Yearly cycles', displayYear: 'Displayed year', previousYear: 'Previous year', nextYear: 'Next year', unknownStartAge: 'Start timing is approximate because the birth time is unknown.', startAge: 'Start', monthSuffix: ' mo', yearsSuffix: ' yrs', ageSeparator: ' / ', genderRequired: 'Select a gender to show the 10-year cycle.', ambiguousLuck: 'The birth time is unknown on a solar-term boundary, so the year and month pillars are uncertain.',
  tenGods: { 比肩: 'Peer', 劫財: 'Rob Wealth', 食神: 'Eating God', 傷官: 'Hurting Officer', 偏財: 'Indirect Wealth', 正財: 'Direct Wealth', 偏官: 'Seven Killings', 正官: 'Direct Officer', 偏印: 'Indirect Resource', 印綬: 'Direct Resource' },
  stages: { 長生: 'Birth', 沐浴: 'Bath', 冠帯: 'Youth', 建禄: 'Growth', 帝旺: 'Peak', 衰: 'Decline', 病: 'Illness', 死: 'Death', 墓: 'Tomb', 絶: 'Extinction', 胎: 'Conception', 養: 'Nurture' }, elements: { 木: 'Wood', 火: 'Fire', 土: 'Earth', 金: 'Metal', 水: 'Water' },
  resultNatalChart: 'Birth chart',
  dailyCalendar: { previousMonth: 'Previous month', nextMonth: 'Next month', stem: 'Stem Ten God', branch: 'Branch Ten God' },
  resultDailyPillar: 'Daily pillar',
  resultChapterCopy: {
    densePairs: ["You may {first}. You may also {second}, depending on what the situation asks of you.", "Another tendency is to {first}. There are also times when you {second}.", "Alongside a tendency to {first}, you may find that you {second}."],
    selectedTopicTitle: 'A closer look at {topic}',
    "synthesisPair": "These tendencies can go together: you may {first} and also {second}.",
    "currentPair": "In this period, you may be inclined both to {first} and to {second}.",
    "currentPeriod": "This reading uses the current long-term period ({years}).",
    "topicLens": {
      "job_seeking": "If you are looking for work, consider this when deciding what to apply for.",
      "employed": "If you are employed, consider how often your current role lets you work this way.",
      "business": "If you run a business, consider this when deciding how you want to work.",
      "single": "If you are single, consider this as you get to know someone.",
      "dating": "If you are dating, consider this as the relationship becomes closer.",
      "married": "If you are married, consider this when you and your partner talk things through."
    },
    "current": ["Right now, you may be more inclined to {trait}.", "In some situations, you may also find that you {trait}."],
    "supported": [
      [
        "You tend to {trait}.",
        "Another part of how you approach things is that you {trait}.",
        "You also tend to {trait}.",
        "A further tendency is to {trait}."
      ],
      [
        "One of your strengths is that you {trait}.",
        "You also have a knack for finding ways to {trait}.",
        "Another strength is your ability to {trait}.",
        "You can also draw on your ability to {trait}."
      ],
      [
        "In familiar situations, you tend to {trait}.",
        "Another response you return to is to {trait}.",
        "You also tend to {trait}.",
        "A further pattern is that you {trait}."
      ]
    ],
    "qualified": [
      [
        "Depending on the situation, you may {trait}.",
        "At times, you also {trait}.",
        "You may find that you {trait} in some settings.",
        "There are also situations in which you {trait}."
      ],
      [
        "In the right setting, it can be a strength to {trait}.",
        "At times, you can draw on your ability to {trait}.",
        "Another ability that can help is to {trait}.",
        "Some situations bring out your ability to {trait}."
      ],
      [
        "In similar situations, you may {trait}.",
        "At times, your response is to {trait}.",
        "You may also notice a tendency to {trait}.",
        "In some settings, you are more inclined to {trait}."
      ]
    ]
  },
  resultPreview: {
    "paidLabel": "Paid reading contents",
    "indexTitle": "What the full reading covers",
    "selectedLabel": "Your selected topic",
    "selectedDescription": "The full reading covers your chart as a whole and takes a closer look at the topic that matters most to you now.",
    "differenceTitle": "A Four Pillars reading that notices what makes the difference",
    "focusTitle": "A closer look at what matters most to you",
    "focusBody": "The full reading covers your chart as a whole and gives extra attention to the topic you chose.",
    "testimonialsTitle": "User reviews",
    "offerTitle": "Full Four Pillars reading",
    "offerTopic": "A closer look at your chosen topic",
    "cta": "View the full reading",
    "checkoutStatus": "The full reading is currently unavailable for purchase.",
    "chapters": [
      {
        "title": "What kind of period am I in now?",
        "description": "The changes and influences most active in your life now"
      },
      {
        "title": "Why do similar relationship patterns repeat?",
        "description": "Patterns to notice in dating, marriage, and close relationships"
      },
      {
        "title": "What work and environments bring out my strengths?",
        "description": "Which environments and approaches draw out your abilities, and which make progress harder"
      },
      {
        "title": "How do I earn, and where does my money go?",
        "description": "How you earn income, where money tends to slip away, and what helps you keep it"
      },
      {
        "title": "When might change become more noticeable?",
        "description": "When your circumstances or direction may shift significantly"
      },
      {
        "title": "When should I move, and when should I wait?",
        "description": "When it may be easier to move forward and when to give a decision more time"
      }
    ],
    "difference": [
      {
        "before": "The same financial cycle can raise one person’s income while bringing someone else more expenses and responsibility alongside what they earn.",
        "emphasis": "",
        "after": ""
      },
      {
        "before": "The same period of change can bring an opportunity for one person and decisions marked by uncertainty or conflict for another.",
        "emphasis": "",
        "after": ""
      },
      {
        "before": "",
        "emphasis": "Judging a period as good or bad from a single factor can hide the differences that matter.",
        "after": ""
      },
      {
        "before": "FILUNE looks beyond personality descriptions and good-or-bad forecasts. It explores ",
        "emphasis": "why similar problems recur, when your strengths are most useful, whether to hold steady or prepare for change, what to watch for in relationships, work, and money, and when to act or proceed with care",
        "after": "."
      },
      {
        "before": "Seeing your current situation alongside the periods ahead gives you ",
        "emphasis": "a clearer basis for deciding what to continue, what to change, and when to move.",
        "after": ""
      },
      {
        "before": "A reading can take you from “Why do I do this?” to ",
        "emphasis": "“What can I do now?”",
        "after": " That is the result FILUNE wants to give you."
      }
    ],
    "sampleLabel": "Paid reading preview",
    "sampleContinuation": "The full reading explores how this period connects with work, relationships, and money, including the timing of those changes.",
    "pricePending": "Price to be confirmed"
  },
  reading: { freeTemperament: 'My basic tendencies', freePatterns: 'Recurring behavior patterns', brandLine: 'LUNE · FILUNE', heroBrand: 'LUNE', heroNamed: 'Let’s read the patterns\nin {name}’s Four Pillars.', heroGeneral: 'Let’s read the patterns\nin your Four Pillars.', core: 'Your defining core', personality: 'Your nature', strengths: 'My strengths', cautions: 'Patterns to watch', balance: 'Five Elements balance', evidence: 'What your chart shows', dayMaster: 'Your Day Master', dayBranch: 'Your Day Branch', elements: 'Five Elements', tenGods: 'Key Ten Gods', yin: 'Yin', yang: 'Yang', disclosure: 'View the chart behind this reading', topicsIntro: 'From here, let’s get more specific.', topics: ['Love & marriage', 'Work & talent', 'Money', '2027', 'Overview'], preview: 'Preview', previewOpen: 'See the opening', locked: 'Continue reading', previewUnavailable: 'Personalized readings are coming soon.', previewLabel: 'Preview', luneLine: 'Let’s start with you.', howTitle: 'One element alone cannot complete the story.', readingPath: ['Day Master', 'Month Command', 'Ten Gods', '10-year cycle'], howBody: 'FILUNE reads the patterns connected across a chart instead of judging any one element on its own.', selectedTopicLead: 'Let’s continue with the topic you chose.', premiumTitle: 'A deeper reading', premiumLoveItems: ['Who you may be drawn to', 'Patterns in lasting relationships', 'Patterns that repeat in relationships', 'How things shift over time'] },
  compatibility: { introTitle: 'May Lune take a look at your relationship?', introBody: 'To explore your relationship, I’ll need each person’s birth date and time, and birthplace.', entry: 'Explore Our Compatibility', title: 'Enter both people’s details', inputYou: 'You', inputOtherPerson: 'The other person', inputBack: 'Back', personA: 'First person', personB: 'Second person', pairIdentity: 'The two people in this result', navigation: 'Compatibility result navigation', backToInput: 'Back to input', home: 'Back to start', optionalName: 'Name (optional)', country: 'Birth country', timeCorrection: 'Apply local time correction', relationshipStatus: 'Current relationship (optional)', noRelationshipStatus: 'Not specified', single: 'Not currently dating', dating: 'Dating', partnered: 'Partnered', married: 'Married', calculate: 'View compatibility', calculating: 'Reading both sets of details', timeline: 'Timeline', error: 'We couldn’t create the result. Check the details and try again.', invalidDate: 'Enter a valid birth date.', invalidTime: 'Enter a valid birth time or select unknown time.' },
}
export default en as typeof ja
