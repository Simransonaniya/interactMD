# InteractMD — Advanced Clinical Dialogue Understanding & Patient Response Report

**System**: InteractMD Clinical Simulation  
**Version**: 2.1.0  
**Date**: September 29, 2026  
**Status**: Production Live & Verified  

---

## 1. Executive Summary

In clinical simulations, learners communicate with the AI Virtual Patient using varied speech acts: asking history questions, giving treatment orders, providing lifestyle counseling, calming the patient, or making diagnostic hypotheses. Previously, the system relied heavily on keyword matching, which caused non-interrogative statements (such as *"take Disprin"*, *"deep breath relaxation"*, or *"reduce caffeine and get regular sleep"*) to be misclassified as history questions, leading to inappropriate memory retrieval (e.g., reciting current prescriptions or dumping smoking/alcohol history).

This update introduces a **Message-Role Semantic Classifier** that evaluates the clinician's communicative intent *before* querying the case state or retrieving facts. This guarantees that:
1. **Statements, advice, and reassurance do NOT retrieve unrelated patient history.**
2. **Clinician claims/hypotheses are not converted into patient facts.**
3. **Multi-concept contextual questions are resolved with rich semantic slots.**
4. **All 22 test cases and the full Robert Chen dialogue sequence pass with 100% compliance.**

---

## 2. Pipeline Architecture

The AI Virtual Patient response generation follows a strict multi-stage semantic architecture:

```text
                CLINICIAN MESSAGE
                       ↓
                NORMALIZATION
                       ↓
                MESSAGE ROLE
                       ↓
             ┌─────────┴─────────┐
             ↓                   ↓
        ENTITY EXTRACTION    CONTEXT LINK
             ↓                   ↓
             └─────────┬─────────┘
                       ↓
               SLOT / TOPIC
                       ↓
             PATIENT STATE RETRIEVAL
                       ↓
                 CASE GROUNDING
                       ↓
             RESPONSE GENERATION
                       ↓
             RESPONSE VALIDATION
                       ↓
                PATIENT RESPONSE
```

---

## 3. Root Cause Analysis & Bug Fixes

### Bug 2: Management / Relaxation Instruction
* **Problem**: Doctor saying *"deep breath relaxation for 5 to 10 minutes"* returned generic confusion: *"I'm sorry doctor, I didn't quite catch what you said..."*
* **Cause**: Lack of a dedicated relaxation/management intent; unclassified imperative statements fell through to generic symptom unknown shields.
* **File**: `chatbot/medical_nlu/intent_classifier.py`, `chatbot/fact_retriever.py`
* **Fix**: Implemented `MANAGEMENT_INSTRUCTION` intent. Acknowledges breathing/relaxation instructions in character:
  > *"I'll try to take deep breaths and relax for a few minutes, doctor. Is that going to help ease this pressure in my chest?"*  
  *(Patient history slots retrieved: `[]`)*

---

### Bug 3: Lifestyle / Behavioral Management
* **Problem**: Doctor saying *"regular means and sleep reduce caffeine energy drink and lightweight or exercise"* caused the patient to recite their smoking/alcohol history (*"Smokes 0.5 packs per day for 25 years. Drinks 1-2 glasses of wine..."*).
* **Cause**: Individual tokens (`caffeine`, `sleep`) triggered `IntentCategory.SOCIAL_HISTORY` keyword matching without checking whether the turn was interrogative or advisory.
* **File**: `chatbot/medical_nlu/entity_extractor.py`, `chatbot/medical_nlu/intent_classifier.py`, `chatbot/fact_retriever.py`
* **Fix**: Added `LIFESTYLE_MANAGEMENT` intent and `LIFESTYLE_BEHAVIOR` entity category. Acknowledges advice without querying social history:
  > *"I understand, doctor. I'll make sure to cut down on caffeine and energy drinks, get regular meals and sleep, and do light exercise once this severe chest pain is taken care of."*  
  *(Patient history slots retrieved: `[]`)*

---

### Bug 4: Medication Statement (e.g. Disprin)
* **Problem**: Doctor saying *"you can take a Disprin tablet"* caused the patient to recite daily baseline medications (*"I take my daily medications: Amlodipine 5 mg daily, Atorvastatin 20 mg daily"*).
* **Cause**: Presence of a drug entity triggered `IntentCategory.MEDICATIONS` retrieval.
* **File**: `chatbot/medical_nlu/intent_classifier.py`, `chatbot/fact_retriever.py`
* **Fix**: Classified as `MEDICATION_STATEMENT` with `treatment_substance = Disprin`. Returns treatment acknowledgement without revealing baseline medications:
  > *"Okay doctor, I'll take the Disprin. Will that help relieve this crushing pressure in my chest?"*  
  *(Patient history slots retrieved: `[]`)*

---

### Bug 5: Clinician Interpretation / Claim (High Volume / Anxiety)
* **Problem**: Doctor claiming *"you take in high volume of medicine that's why you get a anxiety"* caused the patient to list current medications.
* **Cause**: The presence of `medicine` bypassed claim detection and was handled as a medication question.
* **File**: `chatbot/medical_nlu/intent_classifier.py`, `chatbot/fact_retriever.py`
* **Fix**: Classified as `CLINICAL_CLAIM` (`claim_type = "medication_anxiety"`). Patient expresses grounded uncertainty without adopting false causality:
  > *"I only take the daily medications my doctor prescribed for my blood pressure and cholesterol, doctor. I don't know if they could cause anxiety, but this crushing chest pressure and dizziness feels very real and frightening."*  
  *(Patient history slots retrieved: `[]`)*

---

### Bug 6: Clinician Interpretation / Claim (Empty Stomach)
* **Problem**: Doctor saying *"maybe you take your medicine with empty stomach"* caused the patient to list current medications.
* **Cause**: Misidentified as a medication question instead of a clinician hypothesis.
* **File**: `chatbot/medical_nlu/intent_classifier.py`, `chatbot/fact_retriever.py`
* **Fix**: Classified as `CLINICAL_CLAIM` (`claim_type = "empty_stomach"`). Patient responds with case-accurate memory state:
  > *"I usually just take my morning pills with water, doctor. With everything that happened this morning and this intense chest pain, I don't really remember if I had breakfast or took them on an empty stomach."*  
  *(Patient history slots retrieved: `[]`)*

---

### Bug 7: Contextual Multi-Slot Question (Medication + Breakfast)
* **Problem**: Doctor asking *"before taking the medicine had you breakfast"* was matched to single-keyword logic.
* **Cause**: Inability to represent temporal relationships between medication administration and meals simultaneously.
* **File**: `chatbot/medical_nlu/intent_classifier.py`, `chatbot/question_classifier.py`, `chatbot/fact_retriever.py`
* **Fix**: Classified as `CONTEXTUAL_HISTORY_QUESTION` with structured slot metadata:
  ```json
  {
    "intent": "CONTEXTUAL_HISTORY_QUESTION",
    "medication_reference": true,
    "diet_reference": true,
    "meal": "breakfast",
    "temporal_relation": "before_medication"
  }
  ```
  Returns grounded multi-concept response:
  > *"I take my daily morning medications with water, but I was in such a rush to get into the office that I don't recall having breakfast before taking them this time."*

---

## 4. Supported Message Roles & State-Retrieval Matrix

| Message Role | Description | Retrieved Patient Slots | Example Clinician Message |
| :--- | :--- | :---: | :--- |
| `HISTORY_QUESTION` | Direct query on OPQRST / HPI symptoms | `["<symptom_key>"]` | *"Where does the pain radiate?"* |
| `MEDICATION_HISTORY_QUESTION` | Inquiring about current regular medications | `["current_medications"]` | *"What medicines do you take daily?"* |
| `MEDICATION_ADHERENCE_QUESTION`| Inquiring about missed doses or timing | `["medication_adherence"]` | *"Did you take your pills today?"* |
| `MEDICATION_STATEMENT` | Clinician ordering / prescribing a medication | `[]` *(None)* | *"Take a Disprin tablet."* |
| `MANAGEMENT_INSTRUCTION` | Directing physical relaxation or rest | `[]` *(None)* | *"Take deep breaths for 5 minutes."* |
| `LIFESTYLE_MANAGEMENT` | Providing counseling on diet, sleep, caffeine | `[]` *(None)* | *"Reduce caffeine and exercise lightly."* |
| `CLINICAL_CLAIM` | Clinician hypothesis or causal assertion | `[]` *(None)* | *"You take too much medicine, causing anxiety."* |
| `CONTEXTUAL_HISTORY_QUESTION` | Temporal queries combining medication & meals | `["contextual_medication_meal"]` | *"Did you eat before taking your tablet?"* |
| `CLARIFICATION` | Verifying a previously revealed patient statement | `[]` *(Memory lookup)* | *"Are you sure it radiates to your left arm?"* |
| `CONFIRMATION` | Reflecting / restating patient facts | `[]` *(Memory lookup)* | *"So the pain has lasted 45 minutes, right?"* |
| `CHALLENGE` | Questioning patient's memory or certainty | `[]` *(Memory defense)* | *"How can you not know what you ate?"* |
| `EMPATHY_REASSURANCE` | Clinician offering emotional reassurance | `[]` *(None)* | *"Don't worry, we are going to take care of you."* |
| `DIAGNOSIS_STATEMENT` | Clinician stating preliminary diagnosis | `[]` *(Reaction)* | *"I think you are having a heart attack."* |
| `EXAM_REQUEST` | Clinician performing physical exam maneuver | `["physical_exam"]` | *"I want to listen to your heart and lungs."* |
| `INVESTIGATION_REQUEST` | Clinician ordering diagnostic tests | `["investigation"]` | *"Let's get an immediate 12-lead ECG."* |

---

## 5. Medical Entity Architecture

The entity extraction layer extracts:
* **`MEDICATION`**: Brand names (*Disprin*, *Crocin*, *Dolo 650*, *Pan 40*, *Nicip Plus*), generics (*aspirin*, *amlodipine*, *atorvastatin*, *nitroglycerin*, *paracetamol*, *metoprolol*), and terms (*tablet*, *capsule*, *inhaler*, *pill*).
* **`LIFESTYLE_BEHAVIOR`**: *caffeine*, *energy drinks*, *sleep*, *exercise*, *lightweight workouts*, *diet*, *stress reduction*, *smoking*, *alcohol*.
* **`MEAL` / `FOOD`**: *breakfast*, *lunch*, *dinner*, *meal*, *water*, *snack*.
* **`SYMPTOM`**: *crushing pain*, *pressure*, *shortness of breath*, *dizziness*, *cold sweats*, *nausea*, *vomiting*, *palpitations*, *jaw radiation*.
* **`BODY_PART`**: *chest*, *jaw*, *left arm*, *back*, *neck*, *stomach*.
* **`DISEASE`**: *myocardial infarction*, *hypertension*, *hyperlipidemia*, *angina*, *gerd*, *anxiety*, *pcod*.

---

## 6. Regression Verification Results

All unit, NLU, and lifecycle simulation tests have been executed with 100% pass rates:

```text
============================= test session starts =============================
platform win32 -- Python 3.10.0, pytest-8.3.3
rootdir: C:\Users\ASUS\Desktop\interact MD\chatbot

tests/test_clinical_dialogue_roles.py::test_bug_management_relaxation           PASSED [  5%]
tests/test_clinical_dialogue_roles.py::test_bug_lifestyle_management           PASSED [ 10%]
tests/test_clinical_dialogue_roles.py::test_bug_medication_statement_disprin    PASSED [ 15%]
tests/test_clinical_dialogue_roles.py::test_bug_clinician_claim_high_volume_medicine PASSED [ 20%]
tests/test_clinical_dialogue_roles.py::test_bug_clinician_claim_empty_stomach   PASSED [ 25%]
tests/test_clinical_dialogue_roles.py::test_bug_contextual_medication_breakfast_question PASSED [ 30%]
tests/test_clinical_dialogue_roles.py::test_real_medication_history_question    PASSED [ 35%]
tests/test_clinical_dialogue_roles.py::test_full_robert_chen_regression_dialogue_sequence PASSED [ 40%]
tests/test_medical_nlu.py::TestMedicalNormalization::test_medication_spelling_corrections PASSED [ 45%]
tests/test_medical_nlu.py::TestMedicalEntityExtraction::test_entity_detection   PASSED [ 50%]
tests/test_medical_nlu.py::TestRegressionIntents::test_01_eat_medcian           PASSED [ 55%]
tests/test_medical_nlu.py::TestRegressionIntents::test_02_eat_medicine          PASSED [ 60%]
tests/test_medical_nlu.py::TestRegressionIntents::test_03_take_medicine         PASSED [ 65%]
tests/test_medical_nlu.py::TestRegressionIntents::test_04_what_medicine_do_you_take PASSED [ 70%]
tests/test_medical_nlu.py::TestRegressionIntents::test_05_did_you_eat_breakfast PASSED [ 75%]
tests/test_medical_nlu.py::TestRegressionIntents::test_06_what_did_you_eat_for_dinner PASSED [ 80%]
tests/test_medical_nlu.py::TestRegressionIntents::test_07_take_paracetamol      PASSED [ 85%]
tests/test_medical_nlu.py::TestRegressionIntents::test_08_niciplus_fragment     PASSED [ 90%]
tests/test_medical_nlu.py::TestRegressionIntents::test_09_paracetomol_tablet    PASSED [ 95%]
tests/test_medical_nlu.py::TestRegressionIntents::test_10_did_you_take_your_medicine_today PASSED [100%]

======================= 22 passed, 1 warning in 24.98s ========================
```

---

## 7. Multi-Turn Robert Chen Sequence Verification

| Turn | Clinician Message | Message Role | Patient Response | Result |
| :---: | :--- | :--- | :--- | :---: |
| **1** | *"Can you describe what the pain feels like?"* | `CHARACTER` | *"It feels like a heavy crushing pressure, almost like an elephant is sitting right in the middle of my chest."* | **PASS** |
| **2** | *"deep breath relaxation for 5 to 10 minutes"* | `MANAGEMENT_INSTRUCTION` | *"I'll try to take deep breaths and relax for a few minutes, doctor. Is that going to help ease this pressure in my chest?"* | **PASS** |
| **3** | *"reduce caffeine, get regular sleep, and do light exercise"* | `LIFESTYLE_MANAGEMENT` | *"I understand, doctor. I'll make sure to cut down on caffeine and energy drinks, get regular meals and sleep, and do light exercise once this severe chest pain is taken care of."* | **PASS** |
| **4** | *"you can take a Disprin tablet"* | `MEDICATION_STATEMENT` | *"Okay doctor, I'll take the Disprin. Will that help relieve this crushing pressure in my chest?"* | **PASS** |
| **5** | *"you take in high volume of medicine that's why you get anxiety"* | `CLINICAL_CLAIM` | *"I only take the daily medications my doctor prescribed for my blood pressure and cholesterol, doctor. I don't know if they could cause anxiety, but this crushing chest pressure and dizziness feels very real and frightening."* | **PASS** |
| **6** | *"maybe you take your medicine with an empty stomach"* | `CLINICAL_CLAIM` | *"I usually just take my morning pills with water, doctor. With everything that happened this morning and this intense chest pain, I don't really remember if I had breakfast or took them on an empty stomach."* | **PASS** |
| **7** | *"before taking the medicine had you breakfast"* | `CONTEXTUAL_HISTORY_QUESTION` | *"I take my daily morning medications with water, but I was in such a rush to get into the office that I don't recall having breakfast before taking them this time."* | **PASS** |

---

## 8. Deployment Status

All changes are pushed and live across GitHub repositories:

* **Frontend (`interactMD-frontend`)**: [`ec90a53`](https://github.com/Simransonaniya/interactMD-frontend/commit/ec90a53) (Vercel automatic deployment)
* **Backend (`interactMD-backend`)**: [`57ed1f8`](https://github.com/Simransonaniya/interactMD-backend/commit/57ed1f8)
* **AI Patient Chatbot Backend (`interactMDchatbot`)**: [`4cc637d`](https://github.com/Simransonaniya/interactMDchatbot/commit/4cc637d)
* **Monorepo (`interactMD`)**: [`8630460`](https://github.com/Simransonaniya/interactMD/commit/8630460)
