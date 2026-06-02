import React, { useState } from "react";
import { 
  User as UserIcon, Mail, Calendar, Briefcase, FileText, Plus, Edit3, 
  Trash2, Copy, Check, CheckCircle, Clock, ArrowRight, Download, Sparkles, FolderOpen, AlertCircle, Palette
} from "lucide-react";
import { PolishedCV, User, Job } from "../types";
import { MOCK_JOBS } from "../data";
import { exportCvAsPdfFile } from "../utils";
import VacancyModal from "./VacancyModal";

interface ProfilePageProps {
  currentUser: User | null;
  cvList: PolishedCV[];
  activePolishedCV: PolishedCV | null;
  onSaveCVList: (cvs: PolishedCV[]) => void;
  setActivePolishedCV: (cv: PolishedCV | null) => void;
  onNavigate: (view: string) => void;
  appliedJobIds: string[];
  onViewJobDetails: (jobId: string) => void;
  onApplyJob: (jobId: string, cvId: string) => void;
  onOpenAuth: () => void;
  onOpenBuilder: () => void;
}

export default function ProfilePage({
  currentUser,
  cvList,
  activePolishedCV,
  onSaveCVList,
  setActivePolishedCV,
  onNavigate,
  appliedJobIds,
  onViewJobDetails,
  onApplyJob,
  onOpenAuth,
  onOpenBuilder
}: ProfilePageProps) {
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameInput, setRenameInput] = useState("");
  const [activeTab, setActiveTab] = useState<"cvs" | "applications">("cvs");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [selectedProfileJob, setSelectedProfileJob] = useState<Job | null>(null);

  const getInitials = (name: string) => {
    return name ? name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() : "ST";
  };

  const getTemplateContainerStyles = (template: "classic" | "tech" | "editorial" | "modern") => {
    switch (template) {
      case "tech":
        return "font-mono text-slate-800 tracking-tight bg-slate-50 border-t-4 border-slate-700 p-6 space-y-5 rounded-md text-left";
      case "editorial":
        return "font-serif text-amber-950 tracking-wide bg-[#FAF7F2] p-6 space-y-6 rounded-md text-left";
      case "modern":
        return "font-sans text-slate-800 bg-gradient-to-br from-slate-50 to-[#EBF5FB]/30 p-6 space-y-6 border-l-4 border-brand-secondary rounded-2xl text-left";
      default: // classic
        return "font-sans text-slate-900 bg-white p-6 space-y-5 border-l-4 border-brand-primary rounded-md text-left";
    }
  };

  const getTemplateHeaderColor = (template: "classic" | "tech" | "editorial" | "modern") => {
    switch (template) {
      case "tech": return "text-slate-800 font-extrabold border-b border-dashed border-slate-300 pb-2 text-xl";
      case "editorial": return "text-[#3B1F11] font-normal font-serif text-2xl pb-1 border-b border-amber-800/20";
      case "modern": return "text-brand-primary font-black text-xl tracking-tighter pb-1 border-b-2 border-brand-secondary/20 flex items-center justify-between";
      default: return "text-brand-primary font-black tracking-tight pb-2 border-b-2 border-brand-primary/10 text-xl";
    }
  };

  const getTemplateLabelStyles = (template: "classic" | "tech" | "editorial" | "modern") => {
    switch (template) {
      case "tech": return "text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200 pb-1 block mb-1";
      case "editorial": return "text-xs font-semibold text-amber-900 border-l border-amber-800 px-2 uppercase tracking-wide block mb-1";
      case "modern": return "text-[10px] font-black text-brand-secondary uppercase tracking-widest pl-2.5 border-l-2 border-brand-secondary block mb-1";
      default: return "text-[10px] font-extrabold text-brand-primary uppercase tracking-wider block mb-1";
    }
  };

  const handleDuplicateCv = (cv: PolishedCV) => {
    const duplicated: PolishedCV = {
      ...cv,
      id: "cv_" + Math.random().toString(36).substring(2, 11),
      title: `${cv.title} (კოპია)`,
      lastUpdated: new Date().toISOString()
    };
    const updated = [...cvList, duplicated];
    onSaveCVList(updated);
  };

  const handleDeleteCv = (cvId: string) => {
    setDeleteConfirmId(cvId);
  };

  const handleConfirmDelete = (cvId: string) => {
    const updated = cvList.filter(c => c.id !== cvId);
    onSaveCVList(updated);
    if (activePolishedCV?.id === cvId) {
      setActivePolishedCV(updated.length > 0 ? updated[0] : null);
    }
    setDeleteConfirmId(null);
  };

  const handleRenameStart = (cv: PolishedCV) => {
    setRenamingId(cv.id);
    setRenameInput(cv.title);
  };

  const handleRenameSave = (cvId: string) => {
    if (!renameInput.trim()) return;
    const updated = cvList.map(c => c.id === cvId ? { ...c, title: renameInput.trim(), lastUpdated: new Date().toISOString() } : c);
    onSaveCVList(updated);
    setRenamingId(null);
  };

  const handleEditCv = (cv: PolishedCV) => {
    setActivePolishedCV(cv);
    onNavigate("builder");
  };

  const handlePrintCv = (cv: PolishedCV) => {
    setActivePolishedCV(cv);
    exportCvAsPdfFile(cv);
  };

  // Get matching job details for applied jobs
  const appliedJobsList = MOCK_JOBS.filter(job => appliedJobIds.includes(job.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" id="profile-page">
      
      {/* Bento Layout Profile Header */}
      <div className="bg-gradient-to-r from-slate-900 via-brand-primary to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-10 relative overflow-hidden animate-fadeIn">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-secondary/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-slate-800/20 rounded-full blur-2xl -ml-16 -mb-16 pointer-events-none" />
        
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            {/* User initials logo */}
            <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white font-black text-2xl tracking-tighter shadow-inner">
              {currentUser ? getInitials(currentUser.fullName) : "A"}
            </div>
            <div className="space-y-1.5 text-left">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight" id="profile-username">
                   {currentUser ? currentUser.fullName : "სტუმარი"}
                </h1>
                <span className="px-2.5 py-0.5 bg-brand-secondary/20 text-brand-secondary border border-brand-secondary/20 text-[10px] uppercase font-black rounded-full">
                  სტუდენტი
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-300 font-medium font-mono">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-brand-secondary" />
                  {currentUser ? currentUser.email : "ავტორიზაციის გარეშე"}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-brand-secondary" />
                  რეგისტრირებული: {currentUser ? new Date(currentUser.createdAt).toLocaleDateString("ka-GE") : "დროებითი სესია"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-4 sm:gap-6 bg-white/5 backdrop-blur-xs border border-white/10 p-4 rounded-2xl">
            <div className="text-left px-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">შენახული CV-ები</p>
              <p className="text-2xl font-black text-brand-secondary font-mono mt-0.5">{cvList.length}</p>
            </div>
            <div className="w-px bg-white/15 self-stretch" />
            <div className="text-left px-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">განაცხადები</p>
              <p className="text-2xl font-black text-brand-secondary font-mono mt-0.5">{appliedJobIds.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Section Tabs Navigation */}
        <div className="lg:col-span-3 space-y-3.5 text-left">
          <button 
            onClick={() => setActiveTab("cvs")}
            className={`w-full p-4 rounded-xl border text-xs font-extrabold uppercase tracking-wider flex items-center justify-between transition-all cursor-pointer ${
              activeTab === "cvs" 
                ? "bg-brand-primary text-white border-brand-primary shadow-md" 
                : "bg-white text-slate-600 border-slate-100 hover:bg-slate-50 hover:text-brand-primary"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FileText className="w-4.5 h-4.5" />
              <span>ჩემი რეზიუმეები</span>
            </div>
            <span className="text-[10px] bg-slate-100/10 text-white font-mono font-bold px-2 py-0.5 rounded-md">{cvList.length}</span>
          </button>

          <button 
            onClick={() => setActiveTab("applications")}
            className={`w-full p-4 rounded-xl border text-xs font-extrabold uppercase tracking-wider flex items-center justify-between transition-all cursor-pointer ${
              activeTab === "applications" 
                ? "bg-brand-primary text-white border-brand-primary shadow-md" 
                : "bg-white text-slate-600 border-slate-100 hover:bg-slate-50 hover:text-brand-primary"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Briefcase className="w-4.5 h-4.5" />
              <span>გაგზავნილი განაცხადები</span>
            </div>
            <span className="text-[10px] bg-slate-100/10 text-white font-mono font-bold px-2 py-0.5 rounded-md">{appliedJobIds.length}</span>
          </button>

          <div className="pt-6 border-t border-slate-100 mt-6 space-y-4">
            <button 
              onClick={() => onNavigate("builder")}
              className="w-full py-3 bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-95 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-sm text-center flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>ახალი რეზიუმე</span>
            </button>
            <button 
              onClick={() => onNavigate("jobs")}
              className="w-full py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold uppercase tracking-wider rounded-xl text-center flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>ვაკანსიების დათვალიერება</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Section Content */}
        <div className="lg:col-span-9 bg-white p-6 sm:p-8 rounded-2xl border border-slate-100 shadow-sm min-h-[480px] text-left">
          
          {activeTab === "cvs" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                <h2 className="text-base font-extrabold text-brand-primary uppercase tracking-wide flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-brand-secondary" />
                  <span>რეზიუმეების კოლექცია</span>
                </h2>
                <span className="text-xs text-slate-400 font-semibold">{cvList.length} შენახული ვარიანტი</span>
              </div>

              {(() => {
                const activeCvToShow = activePolishedCV || (cvList.length > 0 ? cvList[0] : null);
                return cvList.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left Column: CV Card List */}
                    <div className="lg:col-span-5 space-y-4">
                      {cvList.map((cv) => {
                        const isActive = activeCvToShow?.id === cv.id;
                        const isRenaming = renamingId === cv.id;

                        return (
                          <div 
                            key={cv.id}
                            onClick={() => {
                              if (!isRenaming) {
                                setActivePolishedCV(cv);
                              }
                            }}
                            className={`p-4 rounded-xl border transition-all duration-300 flex flex-col justify-between cursor-pointer group text-left relative overflow-hidden ${
                              isActive 
                                ? "border-brand-secondary bg-brand-primary-light/20 shadow-xs ring-1 ring-brand-secondary/20 scale-[1.01]" 
                                : "border-slate-100 hover:border-slate-205 bg-white hover:bg-slate-50/50 shadow-3xs hover:-translate-y-0.5"
                            }`}
                          >
                            <div className="space-y-3">
                              <div className="flex justify-between items-start gap-2">
                                <div className="flex-1 space-y-1">
                                  {isRenaming ? (
                                    <div 
                                      className="flex items-center gap-2"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <input
                                        type="text"
                                        value={renameInput}
                                        onChange={(e) => setRenameInput(e.target.value)}
                                        className="px-2.5 py-1 text-xs border rounded-lg focus:outline-none focus:border-brand-secondary text-slate-800 bg-white"
                                        id={`profile-rename-input-${cv.id}`}
                                        autoFocus
                                      />
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleRenameSave(cv.id);
                                        }}
                                        className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors cursor-pointer"
                                      >
                                        <Check className="w-4 h-4" />
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h3 className="text-xs font-black text-[#0f1f35] group-hover:text-brand-primary transition-colors">{cv.title || "უტიტულო რეზიუმე"}</h3>
                                      {isActive ? (
                                        <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-600 text-[8px] font-black rounded-md flex items-center gap-1 shrink-0 animate-fadeIn">
                                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                          აქტიური
                                        </span>
                                      ) : (
                                        <span className="px-2 py-0.5 bg-slate-50 border border-slate-100 text-slate-400 group-hover:text-slate-500 group-hover:bg-slate-100 text-[8px] font-bold rounded-md transition-colors shrink-0">
                                          ასარჩევად
                                        </span>
                                      )}
                                    </div>
                                  )}
                                  <p className="text-[10px] text-slate-400 font-semibold font-mono">
                                    განახლდა: {new Date(cv.lastUpdated).toLocaleDateString("ka-GE")}
                                  </p>
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-1.5 text-[9px] font-black text-slate-500 uppercase tracking-wider">
                                <span className="px-2 py-0.5 bg-slate-50 border border-slate-100 rounded-md">🎓 {cv.name}</span>
                                <span className="px-2 py-0.5 bg-slate-50 border border-slate-100 rounded-md capitalize font-mono text-slate-600 font-bold">{cv.template} სტილი</span>
                              </div>
                            </div>

                            {/* Control Buttons */}
                            <div className="grid grid-cols-2 gap-1.5 mt-4 border-t border-slate-100/60 pt-3 text-[9px] font-extrabold tracking-wider uppercase text-slate-500">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditCv(cv);
                                }}
                                className="py-1.5 px-2 border border-slate-100 hover:border-slate-200 hover:bg-slate-50 rounded-lg flex items-center justify-center gap-1 transition-all text-slate-700 cursor-pointer"
                              >
                                <Edit3 className="w-3 h-3 text-brand-secondary" />
                                <span>რედაქტირება</span>
                              </button>
                              
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePrintCv(cv);
                                }}
                                className="py-1.5 px-2 bg-brand-primary-light hover:bg-brand-primary-light-hover hover:text-brand-primary rounded-lg flex items-center justify-center gap-1 transition-all text-brand-primary cursor-pointer"
                              >
                                <Download className="w-3 h-3" />
                                <span>ჩამოტვირთვა</span>
                              </button>

                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRenameStart(cv);
                                }}
                                className="py-1.5 px-2 border border-slate-100 hover:bg-slate-50 hover:text-slate-700 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer"
                              >
                                <span>გადარქმევა</span>
                              </button>

                              <div className="grid grid-cols-2 gap-1">
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDuplicateCv(cv);
                                  }}
                                  className="py-1.5 border border-slate-100 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-lg flex items-center justify-center cursor-pointer"
                                  title="დუბლირება"
                                >
                                  <Copy className="w-3 h-3" />
                                </button>
                                {deleteConfirmId === cv.id ? (
                                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleConfirmDelete(cv.id);
                                      }}
                                      className="flex-1 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md text-[9px] font-black cursor-pointer text-center"
                                      title="დასტური"
                                    >
                                      კი
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setDeleteConfirmId(null);
                                      }}
                                      className="flex-1 py-1 border border-slate-200 text-slate-500 hover:bg-slate-150 rounded-md text-[9px] font-black cursor-pointer text-center"
                                      title="გაუქმება"
                                    >
                                      არა
                                    </button>
                                  </div>
                                ) : (
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteCv(cv.id);
                                    }}
                                    className="py-1.5 border border-red-50 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-lg flex items-center justify-center cursor-pointer"
                                    title="წაშლა"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Right Column: Live Interactive Styled CV Preview */}
                    <div className="lg:col-span-7 bg-slate-50 rounded-2xl border border-slate-150 p-4 sm:p-5 space-y-4 shadow-3xs max-h-[720px] overflow-y-auto">
                      <div className="flex justify-between items-center pb-2.5 border-b border-slate-200">
                        <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                          <Palette className="w-4 h-4 text-brand-secondary" />
                          <span>შაბლონის წინასწარი ნახვა (<strong className="text-brand-primary lowercase font-black">{activeCvToShow.template}</strong>)</span>
                        </span>
                        
                        <button
                          onClick={() => handlePrintCv(activeCvToShow)}
                          className="px-3 py-1.5 bg-brand-primary hover:bg-brand-primary-hover text-white text-[9px] font-black tracking-wider uppercase rounded-lg shadow-2xs transition-transform hover:-translate-y-0.5 cursor-pointer flex items-center gap-1"
                        >
                          <Download className="w-3 h-3" />
                          <span>ჩამოტვირთვა</span>
                        </button>
                      </div>

                      {/* Styled template display */}
                      <div className={`shadow-xs transform scale-[0.98] origin-top border border-slate-200/40 rounded-xl ${getTemplateContainerStyles(activeCvToShow.template)}`}>
                        {/* Header details */}
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 pb-4 border-b border-slate-200">
                          <div className="space-y-1">
                            <h2 className={getTemplateHeaderColor(activeCvToShow.template)}>{activeCvToShow.name || "სახელი და გვარი"}</h2>
                            <div className="flex flex-wrap gap-x-3.5 gap-y-1 text-[10px] font-bold text-slate-500 font-mono">
                              {activeCvToShow.email && <span>✉️ {activeCvToShow.email}</span>}
                              {activeCvToShow.phone && <span>📞 {activeCvToShow.phone}</span>}
                              <span>📍 თბილისი, საქართველო</span>
                            </div>
                          </div>

                          {activeCvToShow.photoUrl && (
                            <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-200 shadow-3xs shrink-0 self-start animate-fadeIn">
                              <img src={activeCvToShow.photoUrl} alt="Avatar" className="w-full h-full object-cover" />
                            </div>
                          )}
                        </div>

                        {/* Summary section */}
                        {activeCvToShow.summary && (
                          <div className="space-y-1">
                            <span className={getTemplateLabelStyles(activeCvToShow.template)}>პროფესიული პროფილი</span>
                            <p className="text-xs text-slate-700 leading-relaxed font-normal">
                              {activeCvToShow.summary}
                            </p>
                          </div>
                        )}

                        {/* Education section */}
                        {activeCvToShow.education && (
                          <div className="space-y-1">
                            <span className={getTemplateLabelStyles(activeCvToShow.template)}>განათლება</span>
                            <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line font-medium">
                              {activeCvToShow.education}
                            </div>
                          </div>
                        )}

                        {/* Projects section */}
                        {activeCvToShow.projects && (
                          <div className="space-y-1">
                            <span className={getTemplateLabelStyles(activeCvToShow.template)}>სასწავლო პროექტები & პრაქტიკა</span>
                            <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line space-y-1 bg-black/[0.01] p-1.5 rounded-lg border border-black/[0.01]">
                              {activeCvToShow.projects}
                            </div>
                          </div>
                        )}

                        {/* Activities section */}
                        {activeCvToShow.activities && (
                          <div className="space-y-1">
                            <span className={getTemplateLabelStyles(activeCvToShow.template)}>სტუდენტური აქტივობები</span>
                            <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                              {activeCvToShow.activities}
                            </div>
                          </div>
                        )}

                        {/* Skills section */}
                        {activeCvToShow.skills && activeCvToShow.skills.length > 0 && (
                          <div className="space-y-1.5 pt-1">
                            <span className={getTemplateLabelStyles(activeCvToShow.template)}>ტექნიკური უნარები</span>
                            <div className="flex flex-wrap gap-1">
                              {activeCvToShow.skills.map((skill, i) => (
                                <span 
                                  key={i} 
                                  className="px-2 py-0.5 text-[9px] font-bold text-slate-700 bg-slate-100 border border-slate-200/50 rounded-md font-mono"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                    </div>

                  </div>
                ) : (
                  <div className="py-20 border border-dashed border-slate-100 rounded-2xl text-center space-y-4 max-w-lg mx-auto">
                    <div className="w-14 h-14 rounded-2xl bg-brand-primary-light flex items-center justify-center text-brand-primary mx-auto">
                      <FileText className="w-7 h-7 text-brand-secondary" />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-sm font-extrabold text-[#0f1f35]">რეზიუმეების სია ცარიელია</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                      თქვენ ჯერ არ გაქვთ შენახული სივი. გადადით ბილდერზე, რათა შექმნათ სხვადასხვა რეზიუმე სასურველი ვაკანსიისთვის.
                    </p>
                  </div>
                  <button 
                    onClick={() => onNavigate("builder")}
                    className="inline-flex items-center px-4 py-2.5 text-xs font-bold text-white bg-brand-primary hover:bg-brand-primary/95 rounded-xl cursor-pointer shadow-sm transition-all text-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>ახალი რეზიუმეს შექმნა</span>
                  </button>
                </div>
              )})()}
            </div>
          )}

          {activeTab === "applications" && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                <h2 className="text-base font-extrabold text-brand-primary uppercase tracking-wide flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-brand-secondary" />
                  <span>გაგზავნილი განაცხადები</span>
                </h2>
                <span className="text-xs text-slate-400 font-semibold">{appliedJobsList.length} პოზიცია</span>
              </div>

              {appliedJobsList.length > 0 ? (
                <div className="space-y-3.5">
                  {appliedJobsList.map((job) => (
                    <div 
                      key={job.id}
                      className="p-5 border border-slate-100 rounded-2xl hover:border-slate-205 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white"
                    >
                      <div className="flex items-start gap-4">
                        <div 
                           className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-extrabold text-sm shrink-0 shadow-inner"
                           style={{ backgroundColor: job.logoColor || "var(--brand-primary)" }}
                        >
                          {job.logo}
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-sm font-extrabold text-[#0f1f35]">{job.role}</h3>
                          <div className="flex flex-wrap items-center gap-x-3.5 text-xs text-slate-400 font-semibold">
                            <span className="text-brand-primary">{job.company}</span>
                            <span>📍 {job.location}</span>
                            <span>💼 {job.type}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 border-slate-50 pt-3 sm:pt-0">
                        <div className="text-left sm:text-right space-y-0.5">
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 text-[10px] font-black rounded-lg">
                            <CheckCircle className="w-3.5 h-3.5" />
                            გაგზავნილია
                          </span>
                          <p className="text-[10px] text-slate-400 font-medium font-mono sm:mt-1">
                            განხილვის პროცესშია
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedProfileJob(job);
                          }}
                          className="p-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-brand-primary-hover transition-all cursor-pointer"
                          title="ვაკანსიის დეტალები"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-20 border border-dashed border-slate-100 rounded-2xl text-center space-y-4 max-w-lg mx-auto">
                  <div className="w-14 h-14 rounded-2xl bg-brand-primary-light flex items-center justify-center text-brand-primary mx-auto">
                    <Briefcase className="w-7 h-7 text-brand-secondary" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-extrabold text-[#0f1f35]">განაცხადები ცარიელია</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                      თქვენ ჯერ არცერთ ვაკანსიაზე არ გაგიგზავნიათ რეზიუმე. გააგზავნეთ თქვენი აქტიური CV სასურველ სტუდენტურ დასაქმებაზე.
                    </p>
                  </div>
                  <button 
                    onClick={() => onNavigate("jobs")}
                    className="inline-flex items-center px-4 py-2.5 text-xs font-bold text-white bg-brand-secondary hover:bg-brand-secondary/95 rounded-xl cursor-pointer shadow-sm transition-all text-center gap-1.5"
                  >
                    <span>იპოვე ვაკანსია</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

            </div>
          )}

        </div>

      </div>

      <VacancyModal
        isOpen={selectedProfileJob !== null}
        job={selectedProfileJob}
        onClose={() => setSelectedProfileJob(null)}
        currentUser={currentUser}
        cvList={cvList}
        onApply={onApplyJob}
        hasApplied={selectedProfileJob ? appliedJobIds.includes(selectedProfileJob.id) : false}
        onOpenAuth={onOpenAuth}
        onOpenBuilder={onOpenBuilder}
        polishedCV={activePolishedCV}
      />
    </div>
  );
}
