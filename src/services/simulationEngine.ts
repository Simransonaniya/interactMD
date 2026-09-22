import { ClinicalCase, ChatMessage, EvaluationResult, DimensionScore } from '../types/clinical';

export function generatePatientResponse(
  input: string,
  clinicalCase: ClinicalCase,
  conversationHistory: ChatMessage[]
): { response: string; empathyDetected: boolean; category: ChatMessage['category'] } {
  const query = input.toLowerCase().trim();
  const facts = clinicalCase.facts;
  const p = clinicalCase.patient;

  // Check for bedside empathy cues
  const empathyPhrases = [
    'sorry', 'concern', 'take care', 'help you', 'comfortable', 
    'breathe', 'rest', 'right here', 'stay calm', 'don\'t worry', 
    'take your time', 'here for you', 'make you comfortable'
  ];
  const empathyDetected = empathyPhrases.some(phrase => query.includes(phrase));

  // Greetings
  if (query.match(/^(hi|hello|hey|good morning|good afternoon|good evening|doctor)/i) && query.length < 30) {
    return {
      response: `Hello doctor... Thank you for seeing me quickly. ${p.initialStatement}`,
      empathyDetected,
      category: 'General'
    };
  }

  // Empathy recognition if the query is primarily comforting
  if (empathyDetected && query.length < 50 && !query.includes('pain') && !query.includes('when')) {
    return {
      response: `Thank you, doctor. That genuinely means a lot... I was getting really frightened. ${p.mood.includes('Anxious') ? 'I just want to know what is happening to me.' : ''}`,
      empathyDetected: true,
      category: 'General'
    };
  }

  // OPQRST: Onset / Timing
  if (query.includes('when') || query.includes('start') || query.includes('how long') || query.includes('onset') || query.includes('began')) {
    return {
      response: `It ${facts.onset} ${facts.timing}`,
      empathyDetected,
      category: 'HPI'
    };
  }

  // OPQRST: Provocation / Palliation
  if (query.includes('better') || query.includes('worse') || query.includes('aggravat') || query.includes('reliev') || query.includes('trigger') || query.includes('rest')) {
    return {
      response: `Well, ${facts.provocationPalliative}`,
      empathyDetected,
      category: 'HPI'
    };
  }

  // OPQRST: Quality / Description
  if (query.includes('feel like') || query.includes('describe') || query.includes('sharp') || query.includes('dull') || query.includes('crushing') || query.includes('tight') || query.includes('burning') || query.includes('type of pain') || query.includes('kind of pain') || query.includes('nature')) {
    return {
      response: `It feels like ${facts.quality}. It is definitely not a mild ache.`,
      empathyDetected,
      category: 'HPI'
    };
  }

  // OPQRST: Radiation / Spread
  if (query.includes('radiat') || query.includes('spread') || query.includes('move') || query.includes('go anywhere') || query.includes('jaw') || query.includes('arm') || query.includes('back') || query.includes('shoulder') || query.includes('neck')) {
    return {
      response: facts.radiation ? `Yes, ${facts.radiation}` : "No, it stays right where it is. It hasn't moved anywhere else.",
      empathyDetected,
      category: 'HPI'
    };
  }

  // OPQRST: Severity / Scale
  if (query.includes('scale') || query.includes('rate') || query.includes('how bad') || query.includes('severity') || query.includes('1 to 10') || query.includes('1-10') || query.includes('score')) {
    return {
      response: `Right now, ${facts.severity}. It's intensely uncomfortable.`,
      empathyDetected,
      category: 'HPI'
    };
  }

  // Associated Symptoms: Sweating / Diaphoresis
  if (query.includes('sweat') || query.includes('clammy') || query.includes('perspir')) {
    const hasSweat = facts.associatedSymptoms.some(s => s.toLowerCase().includes('sweat') || s.toLowerCase().includes('diaphoresis'));
    return {
      response: hasSweat ? "Yes! I'm drenched in cold sweat, my shirt is soaked through." : "No unusual sweating, just feeling flushed and feverish.",
      empathyDetected,
      category: 'HPI'
    };
  }

  // Associated Symptoms: Nausea / Vomiting
  if (query.includes('nausea') || query.includes('throw up') || query.includes('vomit') || query.includes('sick to your stomach')) {
    const n = facts.associatedSymptoms.find(s => s.toLowerCase().includes('nausea') || s.toLowerCase().includes('vomit'));
    return {
      response: n ? `Yes, I've had ${n.toLowerCase()}.` : "No nausea or vomiting.",
      empathyDetected,
      category: 'HPI'
    };
  }

  // Associated Symptoms: Shortness of Breath / Breathing
  if (query.includes('breath') || query.includes('dyspnea') || query.includes('wheez') || query.includes('winded') || query.includes('air')) {
    const b = facts.associatedSymptoms.find(s => s.toLowerCase().includes('breath') || s.toLowerCase().includes('wheez'));
    return {
      response: b ? `Yes, definitely. ${b}.` : "My breathing feels relatively normal, mostly the pain is troubling me.",
      empathyDetected,
      category: 'HPI'
    };
  }

  // Associated Symptoms: Dizziness / Lightheadedness / Syncope
  if (query.includes('dizzy') || query.includes('lightheaded') || query.includes('pass out') || query.includes('faint') || query.includes('syncope')) {
    const d = facts.associatedSymptoms.find(s => s.toLowerCase().includes('dizz') || s.toLowerCase().includes('lightheaded'));
    return {
      response: d ? `Yes, I felt quite lightheaded and unsteady when I tried standing up.` : "No, I haven't passed out or felt blackouts.",
      empathyDetected,
      category: 'HPI'
    };
  }

  // Cough / Phlegm / Sputum
  if (query.includes('cough') || query.includes('phlegm') || query.includes('sputum') || query.includes('mucus') || query.includes('blood')) {
    const c = facts.associatedSymptoms.find(s => s.toLowerCase().includes('cough') || s.toLowerCase().includes('sputum'));
    return {
      response: c ? `Yes, ${c}.` : "No cough or phlegm at all.",
      empathyDetected,
      category: 'HPI'
    };
  }

  // Fever / Chills / Shivering
  if (query.includes('fever') || query.includes('chill') || query.includes('shiver') || query.includes('temp') || query.includes('hot')) {
    const f = facts.associatedSymptoms.find(s => s.toLowerCase().includes('fever') || s.toLowerCase().includes('chill') || s.toLowerCase().includes('rigor'));
    return {
      response: f ? `Yes, ${f}. I was shaking violently under my blankets.` : "No, I don't feel feverish or have chills.",
      empathyDetected,
      category: 'HPI'
    };
  }

  // Bowel habits / Appetite
  if (query.includes('bowel') || query.includes('stool') || query.includes('diarrhea') || query.includes('constipat') || query.includes('eat') || query.includes('appetite') || query.includes('hunger')) {
    const g = facts.associatedSymptoms.find(s => s.toLowerCase().includes('appetite') || s.toLowerCase().includes('anorexia'));
    return {
      response: g ? `Yes, ${g}.` : "Bowel movements have been normal, no diarrhea or constipation.",
      empathyDetected,
      category: 'HPI'
    };
  }

  // Past Medical History
  if (query.includes('history') || query.includes('past medical') || query.includes('condition') || query.includes('diagnos') || query.includes('chronic') || query.includes('prior') || query.includes('before') || query.includes('hospital') || query.includes('surgery')) {
    return {
      response: `As far as my medical history: ${facts.pastMedicalHistory.join(', ')}.`,
      empathyDetected,
      category: 'PMH'
    };
  }

  // Medications
  if (query.includes('medicat') || query.includes('medicine') || query.includes('pill') || query.includes('drug') || query.includes('prescript') || query.includes('inhaler') || query.includes('taking')) {
    return {
      response: `My current medications are: ${facts.medications.join('; ')}.`,
      empathyDetected,
      category: 'Meds'
    };
  }

  // Allergies
  if (query.includes('allerg') || query.includes('reaction')) {
    return {
      response: `Allergies: ${facts.allergies.join(', ')}.`,
      empathyDetected,
      category: 'Allergies'
    };
  }

  // Social History: Smoking, Alcohol, Drugs, Occupation
  if (query.includes('smoke') || query.includes('cigarette') || query.includes('tobacco') || query.includes('alcohol') || query.includes('drink') || query.includes('beer') || query.includes('wine') || query.includes('cocaine') || query.includes('substance') || query.includes('vape') || query.includes('work') || query.includes('job')) {
    return {
      response: `Regarding my habits and lifestyle: ${facts.socialHistory.join('; ')}.`,
      empathyDetected,
      category: 'Social'
    };
  }

  // Family History
  if (query.includes('family') || query.includes('father') || query.includes('mother') || query.includes('parent') || query.includes('sibling') || query.includes('genetics') || query.includes('relative')) {
    return {
      response: `In my family: ${facts.familyHistory.join('; ')}.`,
      empathyDetected,
      category: 'Social'
    };
  }

  // Tearing back pain / aortic dissection rule out
  if (query.includes('tearing') || query.includes('ripping') || query.includes('shoulder blade') || query.includes('upper back')) {
    return {
      response: facts.pertinentNegatives.find(n => n.includes('tearing')) || "No, it's not a tearing or ripping sensation, and it doesn't go between my shoulder blades.",
      empathyDetected,
      category: 'HPI'
    };
  }

  // Default contextual patient response
  return {
    response: `I'm trying to think, doctor... ${p.appearance.toLowerCase().includes('tachypneic') ? '(pauses to catch breath) ' : ''}Mostly, ${facts.quality.toLowerCase()}, and ${facts.provocationPalliative.toLowerCase()} What else do you need to know?`,
    empathyDetected,
    category: 'General'
  };
}

export function evaluateClinicalEncounter(
  clinicalCase: ClinicalCase,
  chatMessages: ChatMessage[],
  performedExamIds: string[],
  orderedInvestigationIds: string[],
  primaryDiagnosisId: string,
  differentialDiagnosisIds: string[],
  selectedManagementIds: string[],
  clinicalRationale: string,
  durationSeconds: number
): EvaluationResult {
  const studentMessages = chatMessages.filter(m => m.sender === 'student');
  const studentTextCombined = studentMessages.map(m => m.text.toLowerCase()).join(' ');

  // 1. Interview Completeness
  let completenessScore = 30; // base score for beginning
  const highValueHits: string[] = [];
  const missedHighValue: string[] = [];

  const checks = [
    { label: 'Pain Onset & Timing', keywords: ['when', 'start', 'how long', 'onset', 'time', 'duration'] },
    { label: 'Pain Quality & Character', keywords: ['feel like', 'describe', 'sharp', 'crushing', 'heavy', 'tight', 'nature'] },
    { label: 'Radiation Pattern', keywords: ['radiat', 'spread', 'jaw', 'arm', 'back', 'neck', 'shoulder'] },
    { label: 'Severity Scale (1-10)', keywords: ['scale', 'rate', '1-10', '1 to 10', 'severity', 'how bad'] },
    { label: 'Associated Symptoms (Sweat/Dyspnea/Nausea)', keywords: ['sweat', 'nausea', 'breath', 'vomit', 'dizzy', 'wheez', 'fever'] },
    { label: 'Past Medical History', keywords: ['history', 'medical', 'condition', 'past', 'hospital', 'before'] },
    { label: 'Medications & Adherence', keywords: ['medicat', 'medicine', 'pill', 'inhaler', 'taking', 'prescript'] },
    { label: 'Allergies', keywords: ['allerg'] },
    { label: 'Social & Risk Factors (Smoking/Substances)', keywords: ['smoke', 'alcohol', 'drink', 'tobacco', 'cocaine', 'work', 'lifestyle'] },
    { label: 'Family History', keywords: ['family', 'father', 'mother', 'heart attack', 'genetic'] }
  ];

  checks.forEach(check => {
    if (check.keywords.some(k => studentTextCombined.includes(k))) {
      completenessScore += 7;
      highValueHits.push(check.label);
    } else {
      missedHighValue.push(check.label);
    }
  });
  completenessScore = Math.min(100, Math.max(40, completenessScore));

  // 2. Clinical Reasoning & Diagnosis
  const isPrimaryCorrect = clinicalCase.diagnosisOptions.some(
    d => d.id === primaryDiagnosisId && d.isCorrectPrimary
  );
  
  let reasoningScore = isPrimaryCorrect ? 60 : 35;
  // Award points for appropriate high differential inclusion
  const correctHighDiffs = clinicalCase.diagnosisOptions.filter(d => d.isHighDifferential).map(d => d.id);
  const matchedHighDiffs = differentialDiagnosisIds.filter(id => correctHighDiffs.includes(id));
  reasoningScore += Math.min(25, matchedHighDiffs.length * 12);
  
  // Award points for rationale depth
  if (clinicalRationale.trim().length > 80) {
    reasoningScore += 15;
  } else if (clinicalRationale.trim().length > 20) {
    reasoningScore += 8;
  }
  reasoningScore = Math.min(100, Math.max(30, reasoningScore));

  // 3. Communication
  let commScore = 75;
  // Deduct if student used overly aggressive jargon without explanation
  const jargonWords = ['ischemic penumbra', 'transmural necrosis', 'pathognomonic', 'atherothrombotic cascade'];
  if (jargonWords.some(j => studentTextCombined.includes(j))) {
    commScore -= 10;
  }
  if (studentMessages.length >= 6) {
    commScore += 15;
  }
  commScore = Math.min(100, commScore);

  // 4. Bedside Empathy
  const empathyCount = studentMessages.filter(m => {
    const t = m.text.toLowerCase();
    return ['sorry', 'help', 'comfort', 'take care', 'breathe', 'right here', 'worry', 'understand', 'ease'].some(k => t.includes(k));
  }).length;
  
  let empathyScore = 65;
  if (empathyCount >= 3) empathyScore = 96;
  else if (empathyCount >= 1) empathyScore = 84;
  else empathyScore = 60;

  // 5. Management & Next Steps
  const correctMgmt = clinicalCase.managementProtocols.filter(m => m.isCorrect).map(m => m.id);
  const incorrectMgmt = clinicalCase.managementProtocols.filter(m => !m.isCorrect).map(m => m.id);
  
  const chosenCorrect = selectedManagementIds.filter(id => correctMgmt.includes(id)).length;
  const chosenIncorrect = selectedManagementIds.filter(id => incorrectMgmt.includes(id)).length;

  let mgmtScore = 40;
  if (correctMgmt.length > 0) {
    mgmtScore += Math.round((chosenCorrect / correctMgmt.length) * 55);
  }
  mgmtScore -= (chosenIncorrect * 25);
  mgmtScore = Math.min(100, Math.max(30, mgmtScore));

  // Weighted overall calculation
  // Completeness (25%), Reasoning (30%), Comm (15%), Empathy (10%), Management (20%)
  const overallScore = Math.round(
    completenessScore * 0.25 +
    reasoningScore * 0.30 +
    commScore * 0.15 +
    empathyScore * 0.10 +
    mgmtScore * 0.20
  );

  let overallGrade: EvaluationResult['overallGrade'] = 'Pass';
  if (overallScore >= 90) overallGrade = 'High Honors';
  else if (overallScore >= 80) overallGrade = 'Honors';
  else if (overallScore >= 65) overallGrade = 'Pass';
  else overallGrade = 'Remediate';

  // Strengths & Missed
  const strengths: string[] = [];
  if (isPrimaryCorrect) {
    strengths.push(`Accurately recognized and established primary diagnosis of ${clinicalCase.diagnosisOptions.find(d => d.id === primaryDiagnosisId)?.name || 'the primary pathology'}.`);
  }
  if (highValueHits.length >= 6) {
    strengths.push(`Thorough history-taking covering essential clinical dimensions: ${highValueHits.slice(0, 3).join(', ')}.`);
  }
  if (performedExamIds.length >= 2) {
    strengths.push(`Appropriately targeted focused physical examination to rule in critical findings.`);
  }
  if (empathyCount > 0) {
    strengths.push(`Demonstrated supportive bedside communication, calming patient anxiety effectively.`);
  }
  if (strengths.length === 0) {
    strengths.push(`Initiated initial patient assessment and gathered foundational clinical facts.`);
  }

  const missedOpportunities: string[] = [];
  if (missedHighValue.length > 0) {
    missedOpportunities.push(`Incomplete history gathering in: ${missedHighValue.slice(0, 3).join(', ')}.`);
  }
  if (!isPrimaryCorrect) {
    missedOpportunities.push(`Primary working diagnosis was inaccurate or misidentified based on presented telemetry and lab findings.`);
  }
  if (chosenIncorrect > 0) {
    missedOpportunities.push(`Selected contraindicated or hazardous management intervention. Carefully check evidence-based clinical guidelines.`);
  }
  if (performedExamIds.length === 0) {
    missedOpportunities.push(`Did not perform bedside physical examination prior to submitting diagnosis.`);
  }

  // Critical Red Flags
  const criticalRedFlagsAddressed = clinicalCase.scoringRubric.redFlagsToScreen.map(redFlag => {
    const flagKey = redFlag.toLowerCase();
    let addressed = false;
    let comment = 'Omitted direct clinical screening for this emergency condition.';
    if (flagKey.includes('dissection') && (studentTextCombined.includes('back') || studentTextCombined.includes('tearing') || studentTextCombined.includes('dissect'))) {
      addressed = true;
      comment = 'Properly screened for tearing back pain and pulse differentials.';
    } else if (flagKey.includes('pe') || flagKey.includes('pulmonary embolism')) {
      if (studentTextCombined.includes('calf') || studentTextCombined.includes('leg') || studentTextCombined.includes('travel') || studentTextCombined.includes('dvt')) {
        addressed = true;
        comment = 'Appropriately inquired regarding venous thromboembolism risk factors.';
      }
    } else if (flagKey.includes('perforation') || flagKey.includes('shock')) {
      if (performedExamIds.includes('exam-abd-marcus') || studentTextCombined.includes('fever') || studentTextCombined.includes('lighthead')) {
        addressed = true;
        comment = 'Monitored for hemodynamic compromise and acute peritoneal breakdown.';
      }
    } else if (studentTextCombined.length > 100) {
      addressed = true;
      comment = 'Considered within clinical encounter context.';
    }
    return { item: redFlag, addressed, comment };
  });

  const nextCaseMap: Record<string, string> = {
    'case-acs-1': 'case-dyspnea-2',
    'case-dyspnea-2': 'case-abdomen-3',
    'case-abdomen-3': 'case-cap-4',
    'case-cap-4': 'case-acs-1',
  };

  const getGrade = (s: number): DimensionScore['grade'] => {
    if (s >= 88) return 'Excellent';
    if (s >= 75) return 'Proficient';
    if (s >= 60) return 'Developing';
    return 'Needs Practice';
  };

  return {
    sessionId: `ses-${Date.now()}`,
    caseId: clinicalCase.id,
    overallScore,
    overallGrade,
    durationSeconds,
    questionsAskedCount: studentMessages.length,
    examsPerformedCount: performedExamIds.length,
    investigationsOrderedCount: orderedInvestigationIds.length,
    dimensions: {
      interviewCompleteness: {
        name: 'Interview Completeness',
        score: completenessScore,
        weight: 25,
        grade: getGrade(completenessScore),
        feedback: completenessScore >= 80 ? 'Comprehensive exploration of HPI, OPQRST attributes, and pertinent risk factors.' : 'Focus on systematic OPQRST inquiry and asking about pertinent negatives.',
        keyPoints: highValueHits
      },
      clinicalReasoning: {
        name: 'Clinical Reasoning',
        score: reasoningScore,
        weight: 30,
        grade: getGrade(reasoningScore),
        feedback: isPrimaryCorrect ? 'Excellent diagnostic synthesis and correlation with clinical findings.' : 'Review diagnostic criteria and correlation of ECG/lab findings with presenting symptom timeline.',
        keyPoints: [isPrimaryCorrect ? 'Correct primary diagnosis' : 'Misidentified primary diagnosis', `Differential breadth: ${differentialDiagnosisIds.length} candidate conditions`]
      },
      communication: {
        name: 'Communication & Clarity',
        score: commScore,
        weight: 15,
        grade: getGrade(commScore),
        feedback: 'Communicated clearly in an approachable, patient-centered tone.',
        keyPoints: ['Professional tone', 'Appropriate question phrasing']
      },
      empathy: {
        name: 'Bedside Empathy & Rapport',
        score: empathyScore,
        weight: 10,
        grade: getGrade(empathyScore),
        feedback: empathyScore >= 80 ? 'Exceptional bedside presence, acknowledged patient anxiety and validated concerns.' : 'Remember to offer reassurance when patients express acute distress or fear.',
        keyPoints: [`${empathyCount} empathetic statements detected`]
      },
      management: {
        name: 'Management & Next Steps',
        score: mgmtScore,
        weight: 20,
        grade: getGrade(mgmtScore),
        feedback: mgmtScore >= 80 ? 'Appropriate guideline-directed acute resuscitation and therapeutic choices.' : 'Ensure prompt initiation of first-line therapies and check contraindications.',
        keyPoints: [`${chosenCorrect} evidence-based interventions selected`, `${chosenIncorrect} contraindicated choices`]
      }
    },
    strengths,
    missedOpportunities,
    criticalRedFlagsAddressed,
    primaryDiagnosisSubmitted: clinicalCase.diagnosisOptions.find(d => d.id === primaryDiagnosisId)?.name || 'None Selected',
    isPrimaryCorrect,
    differentialSubmitted: differentialDiagnosisIds.map(id => clinicalCase.diagnosisOptions.find(d => d.id === id)?.name || id),
    managementActionsSubmitted: selectedManagementIds.map(id => clinicalCase.managementProtocols.find(m => m.id === id)?.label || id),
    aiAttendingSummary: isPrimaryCorrect 
      ? `Dr. Attending Note: Strong clinical encounter for ${clinicalCase.patient.name}. You recognized the acute presentation rapidly, verified objective diagnostic data, and instituted critical evidence-based therapies in a timely manner. Keep up the high level of clinical rigor.`
      : `Dr. Attending Note: Encounter completed for ${clinicalCase.patient.name}. While you engaged with the patient well, the core diagnostic hypothesis required closer correlation with the objective test results and triage findings. Re-read the case debrief and retry.`,
    nextRecommendedCaseId: nextCaseMap[clinicalCase.id] || 'case-acs-1'
  };
}
