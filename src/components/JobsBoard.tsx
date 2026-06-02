import { useState, useEffect } from "react";
import { Search, MapPin, CheckCircle, ArrowRight, Sparkles, SlidersHorizontal, Info, Award, HelpCircle, Lock, LayoutList, DollarSign, Clock, Landmark, ChevronRight } from "lucide-react";
import { Job, PolishedCV, AIJobMatch, User } from "../types";
import { MOCK_JOBS } from "../data";
import VacancyModal from "./VacancyModal";
import { calculateJobMatchPercent } from "../utils";

interface JobsBoardProps {
  currentUser: User | null;
  cvList: PolishedCV[];
  onNavigate: (view: string) => void;
  onOpenAuth: () => void;
  onOpenBuilder: () => void;
  polishedCV: PolishedCV | null; // legacy fallback
  onApplyJob: (jobId: string, cvId: string) => void;
  appliedJobIds: string[];
  initiallySelectedJobId?: string | null;
  onClearInitiallySelectedJobId?: () => void;
}

export default function JobsBoard({
  currentUser,
  cvList,
  onNavigate,
  onOpenAuth,
  onOpenBuilder,
  polishedCV,
  onApplyJob,
  appliedJobIds,
  initiallySelectedJobId,
  onClearInitiallySelectedJobId
}: JobsBoardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState<string>("ყველა");
  const [selectedType, setSelectedType] = useState<string>("ყველა");
  
  // Advanced filters state
  const [selectedLocation, setSelectedLocation] = useState<string>("ყველა");
  const [selectedWorkStyle, setSelectedWorkStyle] = useState<string>("ყველა");
  const [selectedSalary, setSelectedSalary] = useState<string>("ყველა");

  // Selected active vacancy for modal
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Computed matching Map
  const [matchedResults, setMatchedResults] = useState<Record<string, AIJobMatch>>({});
  const [isMatching, setIsMatching] = useState(false);

  useEffect(() => {
    if (initiallySelectedJobId) {
      const job = MOCK_JOBS.find(j => j.id === initiallySelectedJobId);
      if (job) {
        setSelectedJob(job);
        setIsModalOpen(true);
        onClearInitiallySelectedJobId?.();
      }
    }
  }, [initiallySelectedJobId, onClearInitiallySelectedJobId]);

  // List of active CVs
  const availableCvs = currentUser ? cvList : (polishedCV ? [polishedCV] : []);
  const activeCvObj = availableCvs.length > 0 ? availableCvs[0] : null;

  useEffect(() => {
    // Math matching calculations if we have profile CV data
    if (activeCvObj) {
      setIsMatching(true);
      const timer = setTimeout(() => {
        const resultsMap: Record<string, AIJobMatch> = {};
        
        MOCK_JOBS.forEach((job) => {
          const matchResult = calculateJobMatchPercent(activeCvObj, job);
          
          let tip = "თქვენი უნარების ბაზა კარგად შეესაბამება მოთხოვნებს!";
          if (matchResult.missing.length > 0) {
            tip = `დაამატეთ რეზიუმეში „${matchResult.missing[0]}“ თავსებადობის გაზრდისთვის.`;
          }

          resultsMap[job.id] = {
            id: job.id,
            matchPercent: matchResult.percent,
            matchedSkills: matchResult.matched,
            missingSkills: matchResult.missing,
            tip
          };
        });

        setMatchedResults(resultsMap);
        setIsMatching(false);
      }, 500);

      return () => clearTimeout(timer);
    } else {
      setMatchedResults({});
    }
  }, [currentUser, cvList, polishedCV]);

  // Filters Lists
  const sectors = ["ყველა", "IT", "Finance", "Marketing", "Design", "HR", "Finance & Analyst"];
  const jobTypes = ["ყველა", "Junior", "Internship"];
  const locations = ["ყველა", "თბილისი", "დისტანციური"];
  const workStyles = ["ყველა", "Remote", "On-site", "Hybrid"];
  const salaries = ["ყველა", "ანაზღაურებადი", "1000₾+"];

  // Click on card handler
  const handleOpenVacancy = (job: Job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  // Filter application
  const filteredJobs = MOCK_JOBS.filter((job) => {
    const matchesSearch = 
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.skillTags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSector = selectedSector === "ყველა" || job.sector === selectedSector;
    const matchesType = selectedType === "ყველა" || job.type === selectedType;
    const matchesLocation = selectedLocation === "ყველა" || job.location.includes(selectedLocation);
    const matchesWorkStyle = selectedWorkStyle === "ყველა" || job.remoteOnsite === selectedWorkStyle;
    
    let matchesSalary = true;
    if (selectedSalary === "1000₾+") {
      matchesSalary = job.salaryRange.includes("1000") || job.salaryRange.includes("1200") || job.salaryRange.includes("1400") || job.salaryRange.includes("1500") || job.salaryRange.includes("1800") || job.salaryRange.includes("2000");
    } else if (selectedSalary === "ანაზღაურებადი") {
      matchesSalary = !job.salaryRange.includes("უანაზღაურო");
    }

    return matchesSearch && matchesSector && matchesType && matchesLocation && matchesWorkStyle && matchesSalary;
  });

  const getBrandLogoStyles = (logo: string) => {
    switch (logo) {
      case "TBC": return "bg-[#00A3E0] text-white";
      case "G&T": return "bg-[#1A365D] text-[#00B4D8]";
      case "WIS": return "bg-orange-500 text-white";
      case "EPAM": return "bg-slate-950 text-[#73FF00]";
      case "SWFT": return "bg-[#6C5DD3] text-white";
      case "RDB": return "bg-[#FF3E41] text-white";
      case "TEG": return "bg-[#1E3A5F] text-amber-500";
      case "SPC": return "bg-violet-700 text-white";
      case "PSP": return "bg-[#01579B] text-white";
      case "GCIF": return "bg-emerald-800 text-amber-100";
      default: return "bg-slate-200 text-slate-700";
    }
  };

  const getMatchStyles = (percent: number) => {
    if (percent >= 85) return "bg-emerald-50 text-emerald-700 border border-emerald-100";
    if (percent >= 70) return "bg-amber-50 text-amber-700 border border-amber-100";
    return "bg-slate-50 text-slate-500 border border-slate-100";
  };

  const hasCvData = availableCvs.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" id="jobs-page">
      
      {/* Top AI Sync Info Header */}
      {!currentUser ? (
        <div className="mb-8 p-5 bg-brand-primary-light border border-brand-secondary/20 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left animate-fadeIn">
          <div className="flex items-start space-x-3.5 max-w-2xl">
            <div className="w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center text-brand-primary-light shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-extrabold text-brand-primary">შედით პორტალზე ვაკანსიის AI შეფასებისთვის</h4>
              <p className="text-xs text-[#0f1f35]/80 leading-relaxed">
                შედით სისტემაში ან გაიარეთ რეგისტრაცია, რათა ჩვენმა ალგორითმმა შეადაროს უნივერსიტეტის თქვენი პროექტები ვაკანსიის მოთხოვნებს და გამოთვალოს თავსებადობის ზუსტი კოეფიციენტი.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenAuth}
            className="inline-flex items-center shrink-0 px-5 py-2.5 text-xs font-bold tracking-wider uppercase text-white bg-gradient-to-r from-brand-primary to-brand-secondary rounded-xl shadow-xs hover:opacity-95 transition-all cursor-pointer"
          >
            <span>შესვლა</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </button>
        </div>
      ) : !hasCvData ? (
        <div className="mb-8 p-5 bg-amber-55/10 border border-amber-500/20 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left animate-fadeIn">
          <div className="flex items-start space-x-3.5 max-w-2xl">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
              <Info className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-extrabold text-amber-800">არ გიპოვიათ რეზიუმე პროფილში</h4>
              <p className="text-xs text-amber-700/95 leading-relaxed">
                თქვენ უკვე ავტორიზებული ხართ, თუმცა ჯერ არ გაქვთ შექმნილი CV. შექმენით რეზიუმე AI ბილდერით, რათა გააქტიუროთ AI Match თავსებადობის სისტემა.
              </p>
            </div>
          </div>
          <button
            onClick={onOpenBuilder}
            className="inline-flex items-center shrink-0 px-4 py-2.5 text-xs font-bold text-white bg-amber-600 rounded-xl hover:bg-amber-700 transition-all cursor-pointer"
          >
            CV-ს შექმნა
          </button>
        </div>
      ) : (
        <div className="mb-0 animate-fadeIn">
          {isMatching ? (
            <div className="mb-8 p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center space-x-2 text-xs text-brand-primary font-bold">
              <Sparkles className="w-4 h-4 animate-spin text-brand-secondary" />
              <span>ვადარებთ თქვენს აქტიურ CV-ს („{activeCvObj?.title}“) ვაკანსიის კრიტერიუმებთან...</span>
            </div>
          ) : (
            <div className="mb-8 p-5 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex items-start space-x-3.5 text-left">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold">✓</div>
              <div className="space-y-1">
                <h4 className="text-sm font-extrabold text-emerald-800">AI თავსებადობა აქტიურია და მორგებულია თქვენზე</h4>
                <p className="text-xs text-emerald-700/90 leading-relaxed">
                  თავსებადობის პროცენტი და რეკომენდაციები გამოთვლილია თქვენი აქტიური რეზიუმეს <strong>„{activeCvObj?.title}“</strong> მიხედვით.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Layout containing Side Filters & Job Card Grids */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* LEFT FILTERS SIDEBAR */}
        <div className="w-full lg:w-68 shrink-0 bg-white p-5 sm:p-6 rounded-2xl border border-slate-100 shadow-xs space-y-6 text-left">
          
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="text-xs font-extrabold text-brand-primary tracking-wide uppercase flex items-center space-x-2">
              <SlidersHorizontal className="w-4 h-4 text-brand-secondary" />
              <span>გაფართოებული ფილტრები</span>
            </h3>
            {(selectedSector !== "ყველა" || selectedType !== "ყველა" || selectedLocation !== "ყველა" || selectedWorkStyle !== "ყველა" || selectedSalary !== "ყველა" || searchQuery) && (
              <button 
                onClick={() => {
                  setSelectedSector("ყველა");
                  setSelectedType("ყველა");
                  setSelectedLocation("ყველა");
                  setSelectedWorkStyle("ყველა");
                  setSelectedSalary("ყველა");
                  setSearchQuery("");
                }}
                className="text-[10px] text-brand-secondary hover:underline font-bold"
              >
                გასუფთავება
              </button>
            )}
          </div>

          {/* Search Keywords input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">საკვანძო სიტყვა</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="React, Excel, Python..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:border-brand-secondary text-xs font-semibold text-[#0f1f35] focus:outline-none bg-slate-50/50 focus:bg-white transition-all"
                id="jobs-advanced-search"
              />
            </div>
          </div>

          {/* New Filter 1: Location selection list */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">საოფიცე მდებარეობა</label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-brand-secondary text-xs font-semibold bg-white cursor-pointer"
            >
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc === "ყველა" ? "ყველა ლოკაცია" : loc}
                </option>
              ))}
            </select>
          </div>

          {/* New Filter 2: Work style selectors */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">სამუშაო გრაფიკი</label>
            <select
              value={selectedWorkStyle}
              onChange={(e) => setSelectedWorkStyle(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-brand-secondary text-xs font-semibold bg-white cursor-pointer"
            >
              {workStyles.map((style) => (
                <option key={style} value={style}>
                  {style === "ყველა" ? "ნებისმიერი გრაფიკი" : style === "Remote" ? "დისტანციური (Remote)" : style === "On-site" ? "ოფისი (On-site)" : "ჰიბრიდული (Hybrid)"}
                </option>
              ))}
            </select>
          </div>

          {/* New Filter 3: Minimum Salary ranges */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">ანაზღაურება</label>
            <select
              value={selectedSalary}
              onChange={(e) => setSelectedSalary(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:border-brand-secondary text-xs font-semibold bg-white cursor-pointer"
            >
              {salaries.map((s) => (
                <option key={s} value={s}>
                  {s === "ყველა" ? "ნებისმიერი ანაზღაურება" : s === "ანაზღაურებადი" ? "ანაზღაურებადი ვაკანსია" : "1000 ₾-ზე მეტი"}
                </option>
              ))}
            </select>
          </div>

          {/* Core Sector selector buttons list */}
          <div className="space-y-2 pt-2 border-t border-slate-50">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">სექციები</label>
            <div className="flex flex-wrap gap-1 md:flex-col md:space-y-1">
              {sectors.map((sector) => (
                <button
                  key={sector}
                  onClick={() => setSelectedSector(sector)}
                  className={`px-3 py-2 text-[11px] font-bold rounded-lg text-left cursor-pointer transition-all ${
                    selectedSector === sector
                      ? "bg-brand-primary-light text-brand-primary border-l-2 border-brand-primary"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  {sector === "ყველა" ? "ყველა მიმართულება" : sector}
                </button>
              ))}
            </div>
          </div>

          {/* Core Job Type buttons */}
          <div className="space-y-2">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">პოზიცია</label>
            <div className="flex flex-wrap gap-1 md:flex-col md:space-y-1">
              {jobTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-3 py-2 text-[11px] font-bold rounded-lg text-left cursor-pointer transition-all ${
                    selectedType === type
                      ? "bg-brand-primary-light text-brand-primary border-l-2 border-brand-primary"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  }`}
                >
                  {type === "ყველა" ? "ყველა ტიპი" : type === "Junior" ? "Junior (დამწყები)" : "სტაჟირება (Internship)"}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT VISUAL VA_CARDS GRID */}
        <div className="flex-1 space-y-6 w-full">
          
          <div className="flex justify-between items-center text-xs text-slate-500 font-semibold px-1">
            <span>ნაჩვენებია <strong className="text-[#0f1f35]">{filteredJobs.length}</strong> ვაკანსია</span>
            <span>განახლებულია 1 საათის წინ</span>
          </div>

          {filteredJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="jobs-grid">
              
              {filteredJobs.map((job) => {
                // Determine if we show actual AI match status
                const aiMatch = matchedResults[job.id];
                const hasApplied = appliedJobIds.includes(job.id);

                return (
                  <div 
                    key={job.id}
                    onClick={() => handleOpenVacancy(job)}
                    className="bg-theme-card-bg rounded-2xl border border-theme-card-border hover:border-brand-primary/30 shadow-xs hover:shadow-md transition-all duration-300 p-6 text-left flex flex-col justify-between space-y-5 group relative overflow-hidden cursor-pointer"
                  >
                    
                    {/* Brand header details with logo circle */}
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-3">
                        {/* Custom visual branding logos */}
                        {job.logoUrl ? (
                          <img 
                            src={job.logoUrl} 
                            className="w-11 h-11 rounded-xl object-cover shrink-0 shadow-sm border border-slate-100" 
                            alt={job.company} 
                            referrerPolicy="no-referrer" 
                          />
                        ) : (
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xs font-black tracking-tight shrink-0 shadow-sm ${getBrandLogoStyles(job.logo)}`}>
                            {job.logo}
                          </div>
                        )}
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">{job.company}</span>
                          <h4 className="text-sm font-black text-theme-text group-hover:text-brand-secondary leading-tight transition-colors">{job.role}</h4>
                        </div>
                      </div>

                      {/* AI Match percentage display conditioning rule satisfy */}
                      {currentUser && hasCvData && aiMatch ? (
                        <div className={`px-2.5 py-1 text-[10px] font-black rounded-lg h-7 flex items-center justify-center shrink-0 ${getMatchStyles(aiMatch.matchPercent)}`}>
                          {aiMatch.matchPercent}% Match
                        </div>
                      ) : currentUser ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenBuilder();
                          }}
                          className="px-2.5 py-1 text-[10px] font-bold rounded-lg h-7 bg-amber-50 text-amber-600 flex items-center justify-center space-x-1 border border-amber-100 shrink-0 cursor-pointer hover:bg-amber-150 transition-all"
                        >
                          <Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                          <span>ველოდებით CV-ს</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenAuth();
                          }}
                          className="px-2.5 py-1 text-[10px] font-bold rounded-lg h-7 bg-theme-input-bg hover:bg-brand-primary-light text-theme-text-muted hover:text-brand-primary flex items-center justify-center space-x-1 border border-theme-card-border hover:border-brand-primary/30 shrink-0 cursor-pointer transition-all"
                        >
                          <Lock className="w-3.5 h-3.5 transition-colors" />
                          <span>შესვლა AI-სთვის</span>
                        </button>
                      )}
                    </div>

                    {/* Vacancy description snippet */}
                    <p className="text-xs text-slate-500 leading-relaxed flex-1">
                      {job.description}
                    </p>

                    {/* Embedded skill indicators */}
                    <div className="space-y-3 pt-2">
                      <div className="flex flex-wrap gap-1">
                        {job.skillTags.map((tag, idx) => (
                          <span 
                            key={idx} 
                            className="px-2 py-0.5 bg-slate-50 text-slate-600 border border-slate-100 text-[9px] font-bold rounded-md"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      {/* Lower card metadata details */}
                      <div className="flex items-center justify-between pt-2.5 border-t border-slate-50 text-[10px] font-bold text-slate-400">
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-3.5 h-3.5 text-brand-secondary" />
                          <span>{job.location}</span>
                          <span>•</span>
                          <span>{job.salaryRange}</span>
                        </div>
                        
                        {hasApplied ? (
                          <span className="text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg flex items-center">
                            <CheckCircle className="w-3.5 h-3.5 mr-1" /> გაგზავნილია
                          </span>
                        ) : (
                          <span className="text-brand-primary group-hover:text-brand-secondary flex items-center transition-colors">
                            <span>ნახვა</span>
                            <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                          </span>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}

            </div>
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-slate-100 text-center space-y-4 max-w-sm mx-auto my-12">
              <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300 mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-xs font-black text-[#0f1f35]">ვაკანსიები ვერ მოიძებნა</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed mt-1">
                  შეცვალეთ ფილტრები ან საძიებო სიტყვა სხვა შედეგების სანახავად.
                </p>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Pop-up Vacancy detailed dialog */}
      <VacancyModal
        isOpen={isModalOpen}
        job={selectedJob}
        onClose={() => setIsModalOpen(false)}
        currentUser={currentUser}
        cvList={cvList}
        onApply={onApplyJob}
        hasApplied={selectedJob ? appliedJobIds.includes(selectedJob.id) : false}
        onOpenAuth={() => { setIsModalOpen(false); onOpenAuth(); }}
        onOpenBuilder={() => { setIsModalOpen(false); onOpenBuilder(); }}
        polishedCV={polishedCV}
      />

    </div>
  );
}
