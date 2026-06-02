import { useState, useEffect } from "react";
import { X, MapPin, Briefcase, DollarSign, Clock, CheckCircle2, AlertCircle, Sparkles, Send, LayoutList, ChevronRight } from "lucide-react";
import { Job, PolishedCV, User, JobApplication } from "../types";
import { calculateJobMatchPercent } from "../utils";

interface VacancyModalProps {
  isOpen: boolean;
  job: Job | null;
  onClose: () => void;
  currentUser: User | null;
  cvList: PolishedCV[];
  onApply: (jobId: string, cvId: string) => void;
  hasApplied: boolean;
  onOpenAuth: () => void;
  onOpenBuilder: () => void;
  polishedCV: PolishedCV | null; // single-CV fallback
}

export default function VacancyModal({
  isOpen,
  job,
  onClose,
  currentUser,
  cvList,
  onApply,
  hasApplied,
  onOpenAuth,
  onOpenBuilder,
  polishedCV
}: VacancyModalProps) {
  const [selectedCvId, setSelectedCvId] = useState<string>("");
  const [suggestedCvId, setSuggestedCvId] = useState<string>("");
  const [applyStep, setApplyStep] = useState<"detail" | "select_cv" | "success">("detail");

  // Determine active list of CVs (using authenticated list or fallbacks)
  const availableCvs = currentUser ? cvList : (polishedCV ? [polishedCV] : []);

  useEffect(() => {
    if (isOpen && job) {
      setApplyStep("detail");
      
      if (availableCvs.length > 0) {
        // AI Suggestion algorithm: Count skill matches
        let bestCvId = availableCvs[0].id || "default";
        let bestScore = -1;

        availableCvs.forEach(cv => {
          let score = 0;
          const cvSkills = cv.skills || [];
          cvSkills.forEach(skill => {
            if (job.skillTags.some(t => t.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(t.toLowerCase()))) {
              score += 2;
            }
          });
          // Also check education/summary overlap
          if (cv.summary && cv.summary.toLowerCase().includes(job.sector.toLowerCase())) score += 1;
          
          if (score > bestScore) {
            bestScore = score;
            bestCvId = cv.id || "default";
          }
        });

        setSuggestedCvId(bestCvId);
        setSelectedCvId(bestCvId);
      }
    }
  }, [isOpen, job, cvList, currentUser, polishedCV]);

  if (!isOpen || !job) return null;

  const handleApplySubmit = () => {
    if (!selectedCvId) return;
    onApply(job.id, selectedCvId);
    setApplyStep("success");
  };

  const getMatchPercentColor = (percent: number) => {
    if (percent >= 85) return "text-emerald-500 bg-emerald-50 border-emerald-100";
    if (percent >= 70) return "text-amber-500 bg-amber-50 border-amber-100";
    return "text-slate-400 bg-slate-50 border-slate-100";
  };

  const selectedCvObj = availableCvs.find(c => (c.id || "default") === selectedCvId);
  const matchResult = selectedCvObj ? calculateJobMatchPercent(selectedCvObj, job) : null;
  const currentMatchPercent = matchResult ? matchResult.percent : job.baseMatchPercent;

  return (
    <div 
      className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn" 
      id="vacancy-modal-overlay"
      onClick={(e) => {
        if ((e.target as HTMLElement).id === "vacancy-modal-overlay") {
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] transition-all">
        
        {/* Modal Header */}
        <div className="px-6 py-5 bg-slate-50 border-b border-slate-100 flex justify-between items-center shrink-0">
          <div className="flex items-center space-x-3">
            {job.logoUrl ? (
              <img 
                src={job.logoUrl} 
                className="w-10 h-10 rounded-xl object-cover shrink-0 shadow-sm border border-slate-100" 
                alt={job.company} 
                referrerPolicy="no-referrer" 
              />
            ) : (
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-extrabold text-xs shadow-inner"
                style={{ backgroundColor: job.logoColor || "var(--brand-primary)" }}
              >
                {job.logo}
              </div>
            )}
            <div className="text-left">
              <span className="text-[10px] font-black tracking-wider uppercase text-slate-400">{job.company}</span>
              <h3 className="text-base font-black text-[#0f1f35] leading-none">{job.role}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
            id="vacancy-modal-close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto flex-grow space-y-6 text-left">
          
          {applyStep === "detail" && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Highlight Stats Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-brand-primary-light rounded-xl border border-brand-secondary/10 text-xs">
                <div className="space-y-1">
                  <span className="text-slate-400 font-extrabold uppercase tracking-wide text-[9px]">ანაზღაურება</span>
                  <p className="font-extrabold text-brand-primary flex items-center">
                    <DollarSign className="w-3.5 h-3.5 mr-1 text-brand-secondary" />
                    {job.salaryRange}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 font-extrabold uppercase tracking-wide text-[9px]">მდებარეობა</span>
                  <p className="font-extrabold text-brand-primary flex items-center">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-brand-secondary" />
                    {job.location}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 font-extrabold uppercase tracking-wide text-[9px]">სამუშაო გრაფიკი</span>
                  <p className="font-extrabold text-brand-primary flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1 text-brand-secondary" />
                    {job.remoteOnsite === "Remote" ? "დისტანციური" : job.remoteOnsite === "Hybrid" ? "ჰიბრიდი" : "ოფისი"}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-slate-400 font-extrabold uppercase tracking-wide text-[9px]">გამოცდილება</span>
                  <p className="font-extrabold text-brand-primary flex items-center">
                    <Briefcase className="w-3.5 h-3.5 mr-1 text-brand-secondary" />
                    {job.experienceLevel === "No Experience" ? "გამოცდ. გარეშე" : job.experienceLevel === "Internship" ? "სტაჟირება" : "Junior"}
                  </p>
                </div>
              </div>

              {/* Match Percentage Display Panel */}
              <div className="p-4 bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-between">
                <div className="space-y-1.5 max-w-md">
                  <h4 className="text-xs font-extrabold text-brand-primary flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-brand-secondary" />
                    <span>AI თავსებადობის ანალიზი</span>
                  </h4>
                  {currentUser ? (
                    availableCvs.length > 0 ? (
                      <p className="text-xs sm:text-sm text-theme-text/95 leading-relaxed font-semibold">
                        თქვენი რეკომენდებული CV <strong className="text-brand-primary font-black">„{selectedCvObj?.title}“</strong> ამ ვაკანსიასთან ემთხვევა <strong className="text-emerald-800 dark:text-emerald-400 font-extrabold">{currentMatchPercent}%</strong>-ით.
                      </p>
                    ) : (
                      <p className="text-xs sm:text-sm text-theme-text-muted leading-relaxed font-bold">
                        თქვენ არ გაქვთ აქტიური CV. <button onClick={onOpenBuilder} className="text-brand-primary underline cursor-pointer font-black hover:text-brand-secondary transition-all">შექმენით ახალი CV ბილდერში</button>, რათა მიიღოთ ზუსტი AI თავსებადობის კოეფიციენტი.
                      </p>
                    )
                  ) : (
                    <p className="text-xs sm:text-sm text-theme-text-muted leading-relaxed font-medium">
                      თავსებადობის ზუსტი კოეფიციენტი ხელმისაწვდომია ავტორიზებული მომხმარებლებისთვის.
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-center shrink-0 ml-4">
                  {currentUser && availableCvs.length > 0 ? (
                    <div className="w-14 h-14 rounded-full border-4 border-emerald-500/20 bg-emerald-50 flex items-center justify-center font-black text-xs text-emerald-700">
                      {currentMatchPercent}%
                    </div>
                  ) : currentUser ? (
                    <button
                      onClick={onOpenBuilder}
                      className="px-3 py-1.5 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-[10px] font-bold text-amber-600 dark:text-amber-400 rounded-lg flex items-center space-x-1 shrink-0 cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-all"
                    >
                      <Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                      <span>ველოდებით CV-ს</span>
                    </button>
                  ) : (
                    <button
                      onClick={onOpenAuth}
                      className="px-3 py-1.5 bg-brand-primary-light border border-brand-secondary/20 text-[10px] font-bold text-brand-primary rounded-lg cursor-pointer hover:bg-brand-secondary/10 transition-all"
                    >
                      შესვლა
                    </button>
                  )}
                </div>
              </div>

              {/* Detailed Responsibilities & JDs */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <h4 className="text-xs font-extrabold text-brand-primary uppercase tracking-wider">ვაკანსიის აღწერა</h4>
                  <p className="text-xs sm:text-sm text-[#0f1f35]/90 leading-relaxed whitespace-pre-line">{job.fullDescription}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-2">
                    <h4 className="text-xs font-extrabold text-brand-primary uppercase tracking-wider">საკვანძო მოთხოვნები</h4>
                    <ul className="space-y-2 ps-1">
                      {job.requirements.map((req, i) => (
                        <li key={i} className="text-xs text-[#0f1f35]/85 leading-relaxed flex items-start">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-secondary shrink-0 mt-2 mr-2" />
                          <span>{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-extrabold text-brand-primary uppercase tracking-wider">მოვალეობები</h4>
                    <ul className="space-y-2 ps-1">
                      {job.responsibilities.map((resp, i) => (
                        <li key={i} className="text-xs text-[#0f1f35]/85 leading-relaxed flex items-start">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0 mt-2 mr-2" />
                          <span>{resp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="space-y-1.5 pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-extrabold text-brand-primary uppercase tracking-wider">კომპანიის შესახებ</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{job.companyInfo}</p>
                </div>
              </div>

            </div>
          )}

          {applyStep === "select_cv" && (
            <div className="space-y-6 animate-fadeIn min-h-[300px] flex flex-col justify-between">
              <div className="space-y-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-extrabold text-brand-primary">აირჩიეთ გასაგზავნი რეზიუმე</h4>
                  <p className="text-xs text-slate-400">
                    ჩვენ ავტომატურად შევადარეთ თქვენი CV მოთხოვნებს და გირჩევთ საუკეთესოდ მორგებულ ვერსიას.
                  </p>
                </div>

                {/* Multiple CVs select list */}
                <div className="space-y-3">
                  {availableCvs.map((cv) => {
                    const isSuggested = (cv.id || "default") === suggestedCvId;
                    const isSelected = (cv.id || "default") === selectedCvId;

                    return (
                      <div
                        key={cv.id || "default"}
                        onClick={() => setSelectedCvId(cv.id || "default")}
                        className={`p-4 rounded-xl border transition-all cursor-pointer text-left flex items-center justify-between ${
                          isSelected
                            ? "border-brand-secondary bg-brand-primary-light"
                            : "border-slate-100 bg-white hover:border-slate-200"
                        }`}
                      >
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-extrabold text-brand-primary">{cv.title || "უტიტულო CV"}</span>
                            {isSuggested && (
                              <span className="px-2 py-0.5 bg-brand-secondary/10 text-brand-secondary font-bold text-[9px] rounded-full flex items-center">
                                <Sparkles className="w-2.5 h-2.5 mr-0.5 fill-current" /> რეკომენდებული
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                            ბოლოს განახლდა: {new Date(cv.lastUpdated || Date.now()).toLocaleDateString("ka-GE")}
                          </p>
                        </div>

                        <div className="flex items-center space-x-2">
                          {/* Radial indicator */}
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            isSelected ? "border-brand-secondary" : "border-slate-200"
                          }`}>
                            {isSelected && <div className="w-2 h-2 rounded-full bg-brand-secondary" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {availableCvs.length === 0 && (
                  <div className="p-8 border border-dashed border-slate-200 rounded-xl text-center space-y-4">
                    <AlertCircle className="w-8 h-8 text-slate-300 mx-auto" />
                    <div>
                      <p className="text-xs font-bold text-slate-500">თქვენ არ გაქვთ აქტიური CV-ები რეზიუმის მენეჯერში.</p>
                      <button
                        onClick={() => { onClose(); onOpenBuilder(); }}
                        className="mt-3 inline-flex items-center px-4 py-2 text-xs font-bold text-white bg-brand-primary rounded-xl transition-all cursor-pointer"
                      >
                        CV-ს შექმნა
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {availableCvs.length > 0 && selectedCvObj && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2 text-xs leading-relaxed">
                  <span className="text-[9px] font-black tracking-wide uppercase text-slate-400">განაცხადის პრევიუ</span>
                  <p className="text-slate-500 font-medium">
                    კომპანია <strong>{job.company}</strong> მიიღებს თქვენს რეზიუმეს: <strong>{selectedCvObj.name}</strong> ({selectedCvObj.email}).
                  </p>
                </div>
              )}

            </div>
          )}

          {applyStep === "success" && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-5 animate-fadeIn">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-black text-[#0f1f35]">განაცხადი წარმატებით გაიგზავნა!</h3>
                <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                  თქვენი რეზიუმე გადაგზავნილია რეკრუტერების პორტალზე. კომპანიის წარმომადგენელი უახლოეს პერიოდში დაგიკავშირდებათ მითითებულ ელ-ფოსტაზე ან ტელეფონის ნომერზე.
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2.5 text-xs font-bold text-brand-primary bg-brand-primary-light hover:bg-brand-primary-light/80 rounded-xl transition-all font-sans cursor-pointer"
                id="vacancy-success-close"
              >
                ვაკანსიებზე დაბრუნება
              </button>
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end items-center gap-3 shrink-0">
          {applyStep === "detail" && (
            <>
              {hasApplied ? (
                <span className="inline-flex items-center text-xs font-extrabold text-emerald-600 bg-emerald-50 px-4 py-3 rounded-xl border border-emerald-100">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  <span>განაცხადი გაგზავნილია ✓</span>
                </span>
              ) : currentUser ? (
                <button
                  onClick={() => setApplyStep("select_cv")}
                  className="px-6 py-3 text-xs font-extrabold tracking-wider uppercase text-white rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-95 shadow-md shadow-slate-100 hover:-translate-y-0.5 transition-all cursor-pointer"
                  id="vacancy-apply-step-1"
                >
                  განაცხადის შეტანა
                </button>
              ) : (
                <div className="flex items-center space-x-2.5">
                  <span className="text-[10px] font-bold text-slate-400">განაცხადისთვის შედით:</span>
                  <button
                    onClick={onOpenAuth}
                    className="px-5 py-3 text-xs font-extrabold tracking-wider uppercase text-white rounded-xl bg-brand-primary transition-all cursor-pointer"
                    id="vacancy-apply-login"
                  >
                    ავტორიზაცია 🔑
                  </button>
                </div>
              )}
            </>
          )}

          {applyStep === "select_cv" && (
            <>
              <button
                onClick={() => setApplyStep("detail")}
                className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                უკან
              </button>
              <button
                onClick={handleApplySubmit}
                disabled={!selectedCvId}
                className="px-6 py-3 inline-flex items-center space-x-2 text-xs font-extrabold tracking-wider uppercase text-white rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-95 shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                id="vacancy-apply-submit"
              >
                <span>გაგზავნა</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
