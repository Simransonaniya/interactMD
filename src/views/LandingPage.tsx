import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  ArrowRight, 
  CheckCircle2, 
  Stethoscope, 
  BrainCircuit, 
  Clock, 
  Play
} from 'lucide-react';
import { ClinicalCase } from '../types/clinical';
import { fetchCases } from '../services/apiClient';

interface LandingPageProps {
  onStartCase: (c: ClinicalCase) => void;
  onExploreLibrary: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStartCase, onExploreLibrary }) => {
  const [cases, setCases] = useState<ClinicalCase[]>([]);
  const [previewChat, setPreviewChat] = useState<{ sender: 'student' | 'patient'; text: string }[]>([
    { sender: 'patient', text: "Doctor, thank you for seeing me. I've been having some concerning symptoms that started recently." }
  ]);
  const [selectedPromptIndex, setSelectedPromptIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchCases()
      .then(data => {
        setCases(data);
        if (data.length > 0) {
          setPreviewChat([
            { sender: 'patient', text: data[0].patient.initialStatement }
          ]);
        }
      })
      .catch(() => {});
  }, []);

  const previewCase = cases.length > 0 ? cases[0] : null;

  const samplePrompts = [
    {
      q: "Can you describe what the symptom feels like?",
      a: previewCase 
        ? `It feels like ${previewCase.shortDescription.toLowerCase()}` 
        : "It feels like a persistent, uncomfortable pressure that comes on with exertion."
    },
    {
      q: "Does the discomfort radiate or spread anywhere else?",
      a: "It tends to stay in the central chest and upper neck area."
    },
    {
      q: "When exactly did this begin?",
      a: "It started about 45 minutes ago while I was going about my normal morning routine."
    }
  ];

  const handleTestPrompt = (idx: number) => {
    setSelectedPromptIndex(idx);
    const item = samplePrompts[idx];
    const initialText = previewCase ? previewCase.patient.initialStatement : "Doctor, thank you for seeing me.";
    setPreviewChat([
      { sender: 'patient', text: initialText },
      { sender: 'student', text: item.q },
      { sender: 'patient', text: item.a }
    ]);
  };

  return (
    <div className="min-h-screen bg-[#F7F4EE] text-[#1A2928] selection:bg-[#F2D7B8] selection:text-[#1A2928]">
      
      {/* Top Announcement Bar */}
      <div className="bg-[#102528] border-b border-[#39605B]/30 text-[#F7F4EE] text-[11px] sm:text-xs py-2 sm:py-2.5 px-3 sm:px-4 text-center font-medium flex flex-wrap items-center justify-center gap-1.5 sm:gap-2.5">
        <span className="px-2 py-0.5 rounded-full bg-[#F2D7B8] text-[#1A2928] text-[9px] sm:text-[10px] font-bold uppercase tracking-wider shrink-0">
          PostgreSQL Connected
        </span>
        <span className="text-[#F7F4EE]/90">
          InteractMD is connected to PostgreSQL database for dynamic patient encounters and user persistence
        </span>
        <ArrowRight className="w-3.5 h-3.5 inline ml-0.5 text-[#F2D7B8] shrink-0" />
      </div>

      {/* Hero Section with exact required gradient */}
      <section 
        className="relative overflow-hidden pt-8 pb-16 sm:pt-14 sm:pb-24 lg:pt-20 lg:pb-32 text-[#F7F4EE]"
        style={{
          background: 'linear-gradient(180deg, #102528 0%, #14302F 35%, #39605B 75%, #426C62 100%)'
        }}
      >
        {/* Subtle organic light accent */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[#39605B]/20 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[1700px] mx-auto px-4 sm:px-8 lg:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-16 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-5 sm:space-y-7 text-center lg:text-left">
              
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#102528]/80 border border-[#39605B]/60 text-[#F2D7B8] text-[11px] sm:text-xs font-semibold backdrop-blur-xs">
                <BrainCircuit className="w-4 h-4 text-[#F2D7B8]" />
                <span>Structured AI Virtual Patient Simulation</span>
              </div>

              <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-normal tracking-tight text-[#F7F4EE] leading-[1.12]">
                Master Bedside <br className="hidden sm:block" />
                <span className="italic font-light text-[#F2D7B8]">Clinical Encounters</span> Before Your Next OSCE
              </h1>

              <p className="text-sm sm:text-lg lg:text-xl text-[#F7F4EE]/85 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                InteractMD gives medical students, residents, and clinical learners a realistic, repeatable virtual clinic. Practice natural patient interviews, order physical exams and labs, establish differentials, and receive instant 5-dimension objective feedback.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                {previewCase ? (
                  <button
                    onClick={() => onStartCase(previewCase)}
                    className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#F2D7B8] hover:bg-[#F8E9D7] text-[#1A2928] font-bold text-sm shadow-sm hover:shadow-md flex items-center justify-center space-x-2.5 transition-all group cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-[#1A2928] text-[#1A2928] transition-transform group-hover:scale-110" />
                    <span>Start Case: {previewCase.title}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                ) : (
                  <button
                    onClick={onExploreLibrary}
                    className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-[#F2D7B8] hover:bg-[#F8E9D7] text-[#1A2928] font-bold text-sm shadow-sm hover:shadow-md flex items-center justify-center space-x-2.5 transition-all group cursor-pointer"
                  >
                    <Stethoscope className="w-4 h-4 text-[#1A2928]" />
                    <span>Explore Case Library</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                )}

                <button
                  onClick={onExploreLibrary}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-transparent hover:bg-[#F7F4EE]/10 text-[#F7F4EE] font-medium text-sm border border-[#F7F4EE]/30 hover:border-[#F7F4EE]/60 flex items-center justify-center space-x-2.5 transition-all cursor-pointer"
                >
                  <span>Browse Database Scenarios</span>
                </button>
              </div>

              {/* Trust badges */}
              <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-[#F7F4EE]/80 font-medium">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#F2D7B8]" />
                  <span>OSCE & USMLE Step 2 CS Aligned</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#F2D7B8]" />
                  <span>Controlled Clinical Guardrails</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-[#F2D7B8]" />
                  <span>Real Diagnostic Labs & ECGs</span>
                </div>
              </div>

            </div>

            {/* Right: Interactive Live Simulation Teaser */}
            <div className="lg:col-span-5 space-y-5">
              
              <div className="bg-[#102528]/95 backdrop-blur-md rounded-3xl shadow-2xl border border-[#39605B]/40 p-5 text-[#F7F4EE] relative overflow-hidden">
                
                {/* Header with Telemetry */}
                <div className="flex items-center justify-between pb-3.5 border-b border-[#39605B]/40">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-[#14302F] border border-[#39605B] flex items-center justify-center text-[#F2D7B8]">
                        <Stethoscope className="w-5 h-5" />
                      </div>
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#F2D7B8] border-2 border-[#102528] rounded-full" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-[#F7F4EE]">
                          {previewCase ? previewCase.patient.name : 'Virtual Patient'}
                        </span>
                        <span className="text-[10px] bg-[#14302F] text-[#F2D7B8] font-semibold px-2 py-0.5 rounded-full border border-[#39605B]/50">
                          {previewCase ? `${previewCase.specialty}` : 'Simulation Active'}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#F7F4EE]/65 font-mono">
                        {previewCase ? `HR: ${previewCase.initialVitals.heartRate} bpm | BP: ${previewCase.initialVitals.bloodPressure} | SpO2: ${previewCase.initialVitals.oxygenSaturation}%` : 'Standard OSCE Telemetry Online'}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-[#F7F4EE]/60 uppercase tracking-widest font-mono">OSCE Timer</span>
                    <div className="text-sm font-mono font-bold text-[#F2D7B8]">15:00</div>
                  </div>
                </div>

                {/* Telemetry Strip */}
                <div className="my-3 py-2 px-3.5 rounded-2xl bg-[#14302F] border border-[#39605B]/40 relative overflow-hidden flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-[#F2D7B8] animate-pulse" />
                    <span className="text-[11px] font-mono text-[#F7F4EE] tracking-wider font-semibold">
                      {previewCase ? `${previewCase.title}` : 'Dynamic AI Dialogue Engine'}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[#1A2928] bg-[#F2D7B8] px-2 py-0.5 rounded-full font-bold">LIVE TELEMETRY</span>
                </div>

                {/* Live Dialog Feed */}
                <div className="space-y-2.5 my-3.5 min-h-[140px] max-h-[180px] overflow-y-auto pr-1 text-xs">
                  {previewChat.map((msg, i) => (
                    <div 
                      key={i} 
                      className={`flex ${msg.sender === 'student' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                    >
                      <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                        msg.sender === 'student' 
                          ? 'bg-[#39605B] text-[#F7F4EE] rounded-br-xs border border-[#426C62]' 
                          : 'bg-[#14302F] text-[#F7F4EE]/90 border border-[#39605B]/50 rounded-bl-xs'
                      }`}>
                        <div className="text-[10px] text-[#F2D7B8] font-semibold mb-0.5">
                          {msg.sender === 'student' ? 'Student Doctor' : (previewCase ? `${previewCase.patient.name} (Patient)` : 'Patient')}
                        </div>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Interactive Question Prompts */}
                <div className="pt-3 border-t border-[#39605B]/40">
                  <div className="text-[11px] text-[#F7F4EE]/70 mb-2 font-medium flex items-center justify-between">
                    <span>Try asking a clinical history question:</span>
                    <span className="text-[10px] text-[#F2D7B8] font-semibold">Click to test</span>
                  </div>
                  <div className="space-y-1.5">
                    {samplePrompts.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleTestPrompt(idx)}
                        className={`w-full text-left text-xs px-3 py-2 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                          selectedPromptIndex === idx
                            ? 'bg-[#39605B]/50 border-[#F2D7B8] text-[#F7F4EE]'
                            : 'bg-[#14302F]/80 hover:bg-[#14302F] border-[#39605B]/50 text-[#F7F4EE]/80'
                        }`}
                      >
                        <span className="truncate">{item.q}</span>
                        <ArrowRight className="w-3 h-3 ml-2 shrink-0 text-[#F2D7B8]" />
                      </button>
                    ))}
                  </div>

                  {previewCase ? (
                    <button
                      onClick={() => onStartCase(previewCase)}
                      className="w-full mt-3 py-2.5 rounded-xl bg-[#F2D7B8] text-[#1A2928] text-xs font-bold hover:bg-[#F8E9D7] transition-all flex items-center justify-center space-x-1.5 shadow-md cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-[#1A2928]" />
                      <span>Launch Full Encounter ({previewCase.title})</span>
                    </button>
                  ) : (
                    <button
                      onClick={onExploreLibrary}
                      className="w-full mt-3 py-2.5 rounded-xl bg-[#F2D7B8] text-[#1A2928] text-xs font-bold hover:bg-[#F8E9D7] transition-all flex items-center justify-center space-x-1.5 shadow-md cursor-pointer"
                    >
                      <span>Open Clinical Catalog</span>
                    </button>
                  )}
                </div>

              </div>

            </div>

          </div>
        </div>
      </section>

      {/* Core Scenarios Showcase */}
      <section className="py-20 bg-[#F7F4EE] border-b border-[#39605B]/15">
        <div className="max-w-[1700px] mx-auto px-4 sm:px-8 lg:px-12">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#14302F]/10 border border-[#39605B]/30 text-[#39605B] text-xs font-semibold mb-3">
                <span>Database Clinical Scenarios</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#1A2928] tracking-tight">
                High-Yield OSCE Practice.
              </h2>
            </div>
            
            <button
              onClick={onExploreLibrary}
              className="mt-4 md:mt-0 inline-flex items-center text-xs font-bold text-[#39605B] hover:text-[#102528] transition-colors cursor-pointer"
            >
              <span>View catalog ({cases.length} cases in DB)</span>
              <ArrowRight className="w-4 h-4 ml-1.5 text-[#39605B]" />
            </button>
          </div>

          {cases.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-[#39605B]/20 p-8">
              <Activity className="w-10 h-10 text-[#39605B] mx-auto mb-3" />
              <h4 className="text-base font-bold text-[#1A2928]">PostgreSQL database ready</h4>
              <p className="text-xs text-[#1A2928]/60 mt-1 max-w-sm mx-auto">
                No clinical cases are published yet. Create cases via the Admin CMS or seed development cases to populate the catalog.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {cases.slice(0, 4).map((c) => (
                <div 
                  key={c.id}
                  className="bg-white border border-[#39605B]/15 rounded-3xl p-6 flex flex-col justify-between hover:shadow-lg hover:border-[#39605B]/40 transition-all group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3.5">
                      <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-[#14302F] text-[#F2D7B8]">
                        {c.specialty}
                      </span>
                      <span className="text-[11px] text-[#1A2928]/60 font-medium flex items-center">
                        <Clock className="w-3 h-3 mr-1 text-[#39605B]" />
                        {c.estimatedMinutes} min
                      </span>
                    </div>

                    <h3 className="font-bold text-[#1A2928] text-base mb-2 group-hover:text-[#39605B] transition-colors line-clamp-2">
                      {c.title}
                    </h3>
                    <p className="text-xs text-[#1A2928]/70 line-clamp-3 mb-4 leading-relaxed font-normal">
                      {c.shortDescription}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center space-x-2.5 pt-3.5 border-t border-[#39605B]/15 mb-3.5">
                      <img src={c.patient.avatarUrl} alt={c.patient.name} className="w-8 h-8 rounded-full object-cover border border-[#39605B]/30" />
                      <div className="text-[11px]">
                        <span className="font-bold text-[#1A2928]">{c.patient.name}</span>
                        <span className="text-[#1A2928]/60"> ({c.patient.age}y, {c.patient.gender})</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onStartCase(c)}
                      className="w-full py-2.5 px-3 rounded-full bg-[#F7F4EE] border border-[#39605B]/30 group-hover:bg-[#F2D7B8] group-hover:border-[#F2D7B8] group-hover:text-[#1A2928] text-[#1A2928] text-xs font-bold transition-all flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Start Simulation</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </section>

    </div>
  );
};
