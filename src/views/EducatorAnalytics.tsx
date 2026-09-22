import React, { useState } from 'react';
import { 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  Send, 
  Award, 
  Clock 
} from 'lucide-react';

export const EducatorAnalytics: React.FC = () => {
  const [selectedCohort, setSelectedCohort] = useState('MS3 Internal Medicine Clerkship - Block 2');

  const students = [
    {
      id: 'std-1',
      name: 'Sarah Jenkins',
      email: 'sjenkins@med.jh.edu',
      casesCompleted: 18,
      avgScore: 89,
      status: 'High Honors',
      lastActive: 'Today',
      weakArea: 'Pulsus paradoxus check in dyspnea'
    },
    {
      id: 'std-2',
      name: 'Michael Chang',
      email: 'mchang@med.jh.edu',
      casesCompleted: 16,
      avgScore: 86,
      status: 'Honors',
      lastActive: 'Yesterday',
      weakArea: 'Sepsis Hour-1 bundle fluids'
    },
    {
      id: 'std-3',
      name: 'Amina Patel',
      email: 'apatel@med.jh.edu',
      casesCompleted: 19,
      avgScore: 93,
      status: 'High Honors',
      lastActive: 'Today',
      weakArea: 'None (Top Decile)'
    },
    {
      id: 'std-4',
      name: 'David Kowalski',
      email: 'dkowalski@med.jh.edu',
      casesCompleted: 8,
      avgScore: 68,
      status: 'Needs Remediation',
      lastActive: '4 days ago',
      weakArea: 'Aortic dissection screening'
    },
    {
      id: 'std-5',
      name: 'Rachel Torres',
      email: 'rtorres@med.jh.edu',
      casesCompleted: 14,
      avgScore: 82,
      status: 'Pass',
      lastActive: '2 days ago',
      weakArea: 'Pediatric vitals interpretation'
    }
  ];

  return (
    <div className="max-w-[1700px] mx-auto px-4 sm:px-8 lg:px-12 py-10 space-y-9">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#14302F]/10 border border-[#39605B]/30 text-[#39605B] text-xs font-semibold mb-2">
            <Users className="w-3.5 h-3.5 text-[#39605B]" />
            <span>Institutional Educator Portal • Class Analytics</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-normal text-[#1A2928] tracking-tight">
            Cohort Performance & Blind Spots
          </h1>
          <p className="mt-2 text-sm sm:text-base text-[#1A2928]/70 max-w-2xl font-normal">
            Monitor real-time learner OSCE competencies, assign scenarios, and identify curriculum blind spots.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={selectedCohort}
            onChange={(e) => setSelectedCohort(e.target.value)}
            className="py-2.5 px-4 rounded-full border border-[#39605B]/20 text-xs font-semibold bg-white text-[#1A2928] focus:ring-2 focus:ring-[#39605B] cursor-pointer"
          >
            <option>MS3 Internal Medicine Clerkship - Block 2</option>
            <option>Emergency Medicine PGY-1 Residency Cohort</option>
            <option>Advanced Clinical Skills Transition Course</option>
          </select>

          <button 
            onClick={() => alert("Assigned 'Acute Crushing Retrosternal Chest Pain' to all 48 learners in cohort!")}
            className="px-5 py-2.5 rounded-full bg-[#F2D7B8] hover:bg-[#F8E9D7] text-[#1A2928] font-bold text-xs shadow-xs flex items-center space-x-1.5 transition-all shrink-0 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 text-[#1A2928]" />
            <span>Assign Case</span>
          </button>
        </div>
      </div>

      {/* Cohort Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-white p-6 rounded-3xl border border-[#39605B]/15 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#39605B] uppercase tracking-wider">Cohort Learners</span>
            <div className="font-serif text-3xl font-bold text-[#1A2928] mt-1.5">48</div>
            <span className="text-[11px] text-[#39605B] font-semibold mt-1 block">
              96% Participation rate
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#14302F] text-[#F2D7B8] flex items-center justify-center">
            <Users className="w-6 h-6 text-[#F2D7B8]" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#39605B]/15 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#39605B] uppercase tracking-wider">Class OSCE Avg</span>
            <div className="font-serif text-3xl font-bold text-[#1A2928] mt-1.5">84.6%</div>
            <span className="text-[11px] text-[#39605B] font-semibold flex items-center mt-1">
              <TrendingUp className="w-3 h-3 mr-1 text-[#39605B]" />
              +5.1% vs Block 1
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#14302F] text-[#F2D7B8] flex items-center justify-center">
            <Award className="w-6 h-6 text-[#F2D7B8]" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#39605B]/15 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#39605B] uppercase tracking-wider">Total Encounters</span>
            <div className="font-serif text-3xl font-bold text-[#1A2928] mt-1.5">412</div>
            <span className="text-[11px] text-[#1A2928]/60 font-medium mt-1 block">
              8.6 cases/student avg
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#14302F] text-[#F2D7B8] flex items-center justify-center">
            <Clock className="w-6 h-6 text-[#F2D7B8]" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#39605B]/15 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-[#426C62] uppercase tracking-wider">Flagged Learners</span>
            <div className="font-serif text-3xl font-bold text-[#14302F] mt-1.5">3</div>
            <span className="text-[11px] text-[#426C62] font-semibold mt-1 block">
              Remediation recommended
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#14302F] text-[#F2D7B8] flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-[#F2D7B8]" />
          </div>
        </div>

      </div>

      {/* Cohort High-Yield Blind Spot Alert Banner (#14302F Deep Teal) */}
      <div className="p-7 rounded-3xl bg-[#14302F] border border-[#39605B]/40 text-[#F7F4EE] flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-lg">
        <div className="flex items-start space-x-3.5">
          <AlertTriangle className="w-5 h-5 text-[#F2D7B8] shrink-0 mt-0.5" />
          <div>
            <h3 className="font-serif font-bold text-base text-[#F7F4EE]">
              Curriculum Blind Spot Detected: Aortic Dissection Screening in Acute Chest Pain
            </h3>
            <p className="text-xs text-[#F7F4EE]/80 mt-1 leading-relaxed max-w-2xl font-normal">
              38% of learners in this cohort omitted checking for pulse differentials or asking about tearing back pain prior to initiating antiplatelet therapy for acute myocardial infarction.
            </p>
          </div>
        </div>
        <button 
          onClick={() => alert("Remediation module 'Aortic Dissection vs ACS Screening' assigned to flagged students.")}
          className="px-5 py-2.5 rounded-full bg-[#F2D7B8] hover:bg-[#F8E9D7] text-[#1A2928] font-bold text-xs shrink-0 transition-colors cursor-pointer"
        >
          Assign Remediation Module
        </button>
      </div>

      {/* Learner Roster Table */}
      <div className="bg-white rounded-3xl border border-[#39605B]/15 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-[#39605B]/15 flex items-center justify-between">
          <h2 className="font-serif text-xl font-normal text-[#1A2928]">Student Roster & OSCE Readiness</h2>
          <span className="text-xs text-[#1A2928]/60">Showing 5 of 48 active learners</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F4EE] text-[#39605B] font-semibold border-b border-[#39605B]/15 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3.5">Learner Name & Email</th>
                <th className="px-5 py-3.5">Cases Completed</th>
                <th className="px-5 py-3.5">Avg OSCE Score</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Identified Weak Area</th>
                <th className="px-5 py-3.5">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#39605B]/10 text-[#1A2928]">
              {students.map((s) => (
                <tr key={s.id} className="hover:bg-[#F7F4EE]/60 transition-colors">
                  <td className="px-5 py-4">
                    <span className="font-bold text-[#1A2928] block text-xs">{s.name}</span>
                    <span className="text-[10px] text-[#1A2928]/50 font-mono">{s.email}</span>
                  </td>
                  <td className="px-5 py-4 font-mono">{s.casesCompleted} cases</td>
                  <td className="px-5 py-4 font-bold font-mono text-[#1A2928]">{s.avgScore}%</td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      s.status === 'High Honors'
                        ? 'bg-[#F2D7B8] text-[#1A2928]'
                        : s.status === 'Honors'
                        ? 'bg-[#14302F] text-[#F2D7B8]'
                        : s.status === 'Pass'
                        ? 'bg-[#39605B]/15 text-[#39605B]'
                        : 'bg-[#102528] text-[#F7F4EE]'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-[#1A2928]/70">{s.weakArea}</td>
                  <td className="px-5 py-4 text-[#1A2928]/50">{s.lastActive}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
