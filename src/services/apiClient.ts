import { ClinicalCase, ChatMessage, EvaluationResult, Specialty, DifficultyLevel } from '../types/clinical';
import { generatePatientResponse, evaluateClinicalEncounter } from './simulationEngine';

const BACKEND_BASE_URL = 'http://localhost:8000';

export interface BackendStatus {
  isOnline: boolean;
  provider?: string;
  statusText: string;
}

export interface BackendCaseSummary {
  id: string;
  title: string;
  specialty: string;
  description: string;
  difficulty: string;
  is_published: boolean;
  patient_name?: string;
  patient_age?: number;
  patient_gender?: string;
  chief_complaint?: string;
  created_at: string;
}

let cachedStatus: BackendStatus | null = null;
let lastCheckTime = 0;

/**
 * Checks connectivity to the FastAPI AI Patient Backend.
 */
export async function checkBackendStatus(forceCheck = false): Promise<BackendStatus> {
  const now = Date.now();
  if (!forceCheck && cachedStatus && (now - lastCheckTime < 5000)) {
    return cachedStatus;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(`${BACKEND_BASE_URL}/api/health`, {
      method: 'GET',
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      cachedStatus = {
        isOnline: true,
        provider: data.provider || 'AI Patient Core',
        statusText: `AI Backend Online (${data.provider || 'Active'})`
      };
    } else {
      cachedStatus = {
        isOnline: false,
        statusText: 'Backend Offline'
      };
    }
  } catch {
    cachedStatus = {
      isOnline: false,
      statusText: 'Backend Offline'
    };
  }

  lastCheckTime = now;
  return cachedStatus;
}

export function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('interactmd_jwt_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/**
 * Fetches all clinical cases dynamically from PostgreSQL DB via API.
 * Returns empty array if database has 0 cases.
 */
export async function fetchCases(specialty?: string): Promise<ClinicalCase[]> {
  const url = specialty && specialty !== 'All'
    ? `${BACKEND_BASE_URL}/api/v1/cases?specialty=${encodeURIComponent(specialty)}`
    : `${BACKEND_BASE_URL}/api/v1/cases`;

  const res = await fetch(url, { headers: getAuthHeaders() });
  if (!res.ok) {
    throw new Error('Unable to load clinical cases from backend.');
  }

  const summaries: BackendCaseSummary[] = await res.json();
  
  // Transform backend summaries into frontend ClinicalCase representation
  return summaries.map(s => ({
    id: s.id,
    title: s.title,
    shortDescription: s.description,
    specialty: (s.specialty as Specialty) || 'Cardiology',
    difficulty: (s.difficulty as DifficultyLevel) || 'Intermediate',
    estimatedMinutes: 15,
    tags: [s.specialty, s.difficulty, 'OSCE Simulation'],
    learningObjectives: ['Complete targeted clinical history', 'Perform physical exam', 'Establish differential diagnosis'],
    triageNurseNote: s.chief_complaint || s.description,
    patient: {
      id: `pt-${s.id}`,
      name: s.patient_name || 'Patient',
      age: s.patient_age || 45,
      gender: (s.patient_gender as 'Male' | 'Female' | 'Other') || 'Male',
      avatarUrl: s.patient_gender === 'Female' 
        ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      occupation: 'Patient',
      presentationComplaint: s.chief_complaint || s.description,
      initialStatement: `Hello, doctor. ${s.chief_complaint || s.description}`,
      mood: 'Anxious, seeking medical attention',
      appearance: 'Alert, visibly distressed by symptoms.'
    },
    initialVitals: {
      heartRate: 88,
      bloodPressure: '128/84',
      respiratoryRate: 16,
      oxygenSaturation: 98,
      temperature: 37.0,
      painScore: 7
    },
    physicalFindings: [
      {
        id: `pf-cv-${s.id}`,
        system: 'Cardiovascular',
        name: 'Precordial Auscultation',
        actionLabel: 'Auscultate S1, S2, murmurs, and JVP',
        findingDescription: 'S1 and S2 present. Regular rate and rhythm.',
        isAbnormal: false
      },
      {
        id: `pf-pulm-${s.id}`,
        system: 'Respiratory',
        name: 'Lung Auscultation',
        actionLabel: 'Auscultate lung fields bilaterally',
        findingDescription: 'Clear to auscultation bilaterally.',
        isAbnormal: false
      }
    ],
    investigations: [
      {
        id: `inv-ecg-${s.id}`,
        category: 'Cardiology / Point-of-Care',
        name: '12-Lead Electrocardiogram',
        turnaroundMinutes: 2,
        interpretation: 'Sinus rhythm.',
        isAbnormal: false,
        findingsDetail: ['Standard 12-lead ECG completed.']
      }
    ],
    diagnosisOptions: [
      {
        id: `dx-${s.id}-primary`,
        name: s.title,
        category: s.specialty,
        isCorrectPrimary: true,
        isHighDifferential: true,
        rationale: 'Primary diagnostic presentation.'
      }
    ],
    managementProtocols: [
      {
        id: `mgmt-1-${s.id}`,
        label: 'Initiate targeted guideline medical therapy',
        isCorrect: true,
        feedback: 'Appropriate first-line management.'
      }
    ],
    facts: {
      onset: 'Started recently',
      provocationPalliative: 'Aggravated by exertion',
      quality: 'Persistent discomfort',
      radiation: 'None reported',
      severity: 'Moderate to severe',
      timing: 'Continuous',
      associatedSymptoms: ['Discomfort', 'Fatigue'],
      pertinentNegatives: ['No fever', 'No trauma'],
      pastMedicalHistory: ['Hypertension'],
      medications: ['Prescription maintenance therapy'],
      allergies: ['No known drug allergies'],
      familyHistory: ['No early familial disease'],
      socialHistory: ['Non-smoker'],
      reviewOfSystems: {}
    },
    scoringRubric: {
      criticalActions: ['Take full history', 'Order indicated tests', 'Formulate differential'],
      highValueQuestions: ['Onset and timing', 'Character of symptoms', 'Past medical history'],
      redFlagsToScreen: ['Acute hemodynamic instability', 'Severe pain']
    }
  }));
}

/**
 * Fetches full detail for a single case.
 */
export async function fetchCaseDetail(caseId: string): Promise<ClinicalCase | null> {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/api/v1/cases/${caseId}`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) return null;
    const data = await res.json();

    return {
      id: data.id,
      title: data.title,
      shortDescription: data.description,
      specialty: data.specialty,
      difficulty: data.difficulty,
      estimatedMinutes: 15,
      tags: [data.specialty, data.difficulty],
      learningObjectives: ['Complete focused history', 'Conduct physical exam', 'Deliver guideline management'],
      triageNurseNote: data.description,
      patient: {
        id: `pt-${data.id}`,
        name: data.patient?.name || 'Patient',
        age: data.patient?.age || 45,
        gender: data.patient?.gender || 'Male',
        avatarUrl: data.patient?.gender === 'Female'
          ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        occupation: data.patient?.occupation || 'Patient',
        presentationComplaint: data.description,
        initialStatement: `Hello, doctor. ${data.description}`,
        mood: data.patient?.persona || 'Seeking medical care',
        appearance: 'Alert, cooperative.'
      },
      initialVitals: {
        heartRate: 86,
        bloodPressure: '130/85',
        respiratoryRate: 16,
        oxygenSaturation: 98,
        temperature: 37.0,
        painScore: 7
      },
      physicalFindings: (data.physical_findings || []).map((pf: any) => ({
        id: pf.id,
        system: pf.system,
        name: pf.finding,
        actionLabel: `Examine ${pf.system}: ${pf.finding}`,
        findingDescription: pf.value,
        isAbnormal: pf.value?.toLowerCase().includes('abnormal') || pf.value?.toLowerCase().includes('gallop') || false,
        clinicalSignificance: pf.description
      })),
      investigations: (data.investigations || []).map((inv: any) => ({
        id: inv.id,
        category: inv.category,
        name: inv.name,
        turnaroundMinutes: 15,
        value: inv.result,
        interpretation: inv.result,
        normalRange: inv.reference_range,
        isAbnormal: inv.result?.toLowerCase().includes('elevation') || inv.result?.toLowerCase().includes('abnormal') || false,
        findingsDetail: [inv.result]
      })),
      diagnosisOptions: [
        {
          id: `dx-${data.id}`,
          name: data.title,
          category: data.specialty,
          isCorrectPrimary: true,
          isHighDifferential: true,
          rationale: 'Primary differential.'
        }
      ],
      managementProtocols: [
        {
          id: `mgmt-${data.id}`,
          label: 'Initiate appropriate clinical protocol',
          isCorrect: true,
          feedback: 'Clinical protocol selected.'
        }
      ],
      facts: {
        onset: 'Recent onset',
        provocationPalliative: 'Variable with activity',
        quality: 'Symptomatic discomfort',
        radiation: 'None reported',
        severity: 'Moderate',
        timing: 'Continuous',
        associatedSymptoms: [],
        pertinentNegatives: [],
        pastMedicalHistory: [],
        medications: [],
        allergies: [],
        familyHistory: [],
        socialHistory: [],
        reviewOfSystems: {}
      },
      scoringRubric: {
        criticalActions: ['Take full history'],
        highValueQuestions: ['Onset and timing', 'Character of symptoms'],
        redFlagsToScreen: ['Acute instability']
      }
    };
  } catch (err) {
    console.warn('Failed to fetch case detail:', err);
    return null;
  }
}

/**
 * Creates a persistent simulation session in PostgreSQL.
 */
export async function startSimulationSession(caseId: string): Promise<string | null> {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/api/v1/sessions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ case_id: caseId })
    });
    if (res.ok) {
      const data = await res.json();
      return data.id;
    }
  } catch (err) {
    console.warn('Could not create DB session:', err);
  }
  return null;
}

/**
 * Fetches past simulation sessions for current user.
 */
export async function fetchUserSessions(): Promise<any[]> {
  try {
    const res = await fetch(`${BACKEND_BASE_URL}/api/v1/sessions`, {
      headers: getAuthHeaders()
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Could not fetch user sessions:', err);
  }
  return [];
}

/**
 * Sends a student message to the AI Patient.
 * Connects directly to backend `/api/v1/sessions/{sessionId}/messages` or `/api/simulation/chat`.
 */
export async function sendPatientChatMessage(
  clinicalCase: ClinicalCase,
  userMessage: string,
  conversationHistory: ChatMessage[],
  sessionId?: string | null
): Promise<{
  response: string;
  empathyDetected: boolean;
  category: ChatMessage['category'];
  provider: string;
  suggestedTopics?: string[];
  sessionId?: string;
}> {
  // If session ID exists, use persistent session message endpoint
  if (sessionId) {
    try {
      const res = await fetch(`${BACKEND_BASE_URL}/api/v1/sessions/${sessionId}/messages`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ message: userMessage })
      });
      if (res.ok) {
        const msg = await res.json();
        return {
          response: msg.message,
          empathyDetected: msg.metadata_json?.empathy_detected || false,
          category: (msg.metadata_json?.category as ChatMessage['category']) || 'General',
          provider: msg.metadata_json?.provider || 'AI Backend',
          suggestedTopics: msg.metadata_json?.suggested_topics || [],
          sessionId
        };
      }
    } catch {
      // fallback to simulation chat
    }
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${BACKEND_BASE_URL}/api/simulation/chat`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        case_id: clinicalCase.id,
        session_id: sessionId,
        message: userMessage,
        conversation_history: conversationHistory.map(m => ({
          id: m.id,
          sender: m.sender,
          text: m.text,
          category: m.category,
          empathyDetected: m.empathyDetected
        }))
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return {
        response: data.reply,
        empathyDetected: data.empathy_detected,
        category: (data.category as ChatMessage['category']) || 'General',
        provider: data.provider || 'AI Backend',
        suggestedTopics: data.suggested_topics,
        sessionId: data.session_id
      };
    }
  } catch {
    // Offline heuristic fallback
  }

  const fallback = generatePatientResponse(userMessage, clinicalCase, conversationHistory);
  return {
    response: fallback.response,
    empathyDetected: fallback.empathyDetected,
    category: fallback.category,
    provider: 'Local Engine'
  };
}

/**
 * Evaluates the clinical encounter via backend.
 */
export async function submitEncounterEvaluation(
  clinicalCase: ClinicalCase,
  chatMessages: ChatMessage[],
  performedExamIds: string[],
  orderedInvestigationIds: string[],
  primaryDiagnosisId: string,
  differentialDiagnosisIds: string[],
  selectedManagementIds: string[],
  clinicalRationale: string,
  durationSeconds: number,
  sessionId?: string | null
): Promise<EvaluationResult> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const res = await fetch(`${BACKEND_BASE_URL}/api/simulation/evaluate`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        case_id: clinicalCase.id,
        session_id: sessionId,
        conversation_history: chatMessages.map(m => ({
          sender: m.sender,
          text: m.text
        })),
        performed_exam_ids: performedExamIds,
        ordered_investigation_ids: orderedInvestigationIds,
        primary_diagnosis_id: primaryDiagnosisId,
        differential_diagnosis_ids: differentialDiagnosisIds,
        selected_management_ids: selectedManagementIds,
        clinical_rationale: clinicalRationale,
        duration_seconds: durationSeconds
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const isPrimaryCorrect = data.pass_status || false;
      const getGrade = (s: number): 'Excellent' | 'Proficient' | 'Developing' | 'Needs Practice' => {
        if (s >= 88) return 'Excellent';
        if (s >= 75) return 'Proficient';
        if (s >= 60) return 'Developing';
        return 'Needs Practice';
      };

      const dimMap = (name: string, fallbackScore: number) => {
        const found = data.dimensions?.find((d: any) => d.dimension?.toLowerCase().includes(name.toLowerCase()));
        const score = found ? found.score : fallbackScore;
        return {
          name: found?.dimension || name,
          score,
          weight: 20,
          grade: getGrade(score),
          feedback: found?.feedback || '',
          keyPoints: found?.highValueHits || []
        };
      };

      return {
        sessionId: data.session_id || `ses-${Date.now()}`,
        caseId: clinicalCase.id,
        overallScore: data.overall_score || 75,
        overallGrade: (data.overall_score >= 90 ? 'High Honors' : data.overall_score >= 80 ? 'Honors' : data.overall_score >= 70 ? 'Pass' : 'Remediate'),
        durationSeconds,
        questionsAskedCount: chatMessages.filter(m => m.sender === 'student').length,
        examsPerformedCount: performedExamIds.length,
        investigationsOrderedCount: orderedInvestigationIds.length,
        dimensions: {
          interviewCompleteness: dimMap('History', 75),
          clinicalReasoning: dimMap('Reasoning', 75),
          communication: dimMap('Manner', 80),
          empathy: dimMap('Manner', 80),
          management: dimMap('Management', 75)
        },
        strengths: data.strengths || ['Completed standardized clinical simulation'],
        missedOpportunities: data.areas_to_improve || [],
        criticalRedFlagsAddressed: (clinicalCase.scoringRubric?.redFlagsToScreen || []).map(rf => ({
          item: rf,
          addressed: true,
          comment: 'Screened during encounter'
        })),
        primaryDiagnosisSubmitted: clinicalCase.diagnosisOptions.find(d => d.id === primaryDiagnosisId)?.name || primaryDiagnosisId || 'None',
        isPrimaryCorrect,
        differentialSubmitted: differentialDiagnosisIds.map(id => clinicalCase.diagnosisOptions.find(d => d.id === id)?.name || id),
        managementActionsSubmitted: selectedManagementIds.map(id => clinicalCase.managementProtocols.find(m => m.id === id)?.label || id),
        aiAttendingSummary: data.attending_physician_notes || 'Attending evaluation completed.',
        nextRecommendedCaseId: clinicalCase.id
      };
    }
  } catch {
    // Offline evaluation
  }

  return evaluateClinicalEncounter(
    clinicalCase,
    chatMessages,
    performedExamIds,
    orderedInvestigationIds,
    primaryDiagnosisId,
    differentialDiagnosisIds,
    selectedManagementIds,
    clinicalRationale,
    durationSeconds
  );
}
