import React, { useState, useEffect, useRef } from "react";
import { Sparkles, FileText, Download, CheckCircle, Lightbulb, BookOpen, AlertCircle, RefreshCw, Layers, Plus, Trash2, Copy, Edit3, Check, Palette, Upload, Image as ImageIcon, Briefcase, Eye, ChevronRight } from "lucide-react";
import { CVData, PolishedCV, User } from "../types";
import { ATS_TIPS, CV_EXAMPLES, SKILL_RECOMMENDATIONS } from "../data";
import { exportCvAsPdfFile, getTemplateContainerStyles, getTemplateHeaderColor, getTemplateLabelStyles } from "../utils";

interface CVBuilderProps {
  currentUser: User | null;
  cvList: PolishedCV[];
  onSaveCVList: (cvs: PolishedCV[]) => void;
  activePolishedCV: PolishedCV | null;
  setActivePolishedCV: (cv: PolishedCV | null) => void;
  onOpenAuth: () => void;
}

const DEFAULT_FORM_DATA: CVData = {
  name: "",
  email: "",
  phone: "",
  education: "",
  projects: "",
  activities: "",
  skills: ""
};

export default function CVBuilder({
  currentUser,
  cvList,
  onSaveCVList,
  activePolishedCV,
  setActivePolishedCV,
  onOpenAuth
}: CVBuilderProps) {
  // Tabs: "dashboard" (if logged in) or "create" or "edit"
  const [activeBuilderTab, setActiveBuilderTab] = useState<"dashboard" | "create" | "edit">("create");
  const [formData, setFormData] = useState<CVData>(DEFAULT_FORM_DATA);
  const [saveStatus, setSaveStatus] = useState<"Saved" | "Saving" | "Idle">("Idle");
  const [isLoading, setIsLoading] = useState(false);
  const [activeRightTab, setActiveRightTab] = useState<"preview" | "tips">("preview");
  const [aiStatusMessage, setAiStatusMessage] = useState("");
  const [creationTemplate, setCreationTemplate] = useState<"classic" | "tech" | "editorial" | "modern">("classic");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // For intermediate CV edits
  const [editingCv, setEditingCv] = useState<PolishedCV | null>(null);
  const [renameInput, setRenameInput] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);

  // Profile saving naming states
  const [isNamingModalOpen, setIsNamingModalOpen] = useState(false);
  const [resumeNameInput, setResumeNameInput] = useState("");

  // Safe banner/notice helpers for sandbox iframes
  const safeAlert = (msg: string) => {
    try {
      alert(msg);
    } catch (e) {
      console.warn("Alert blocked:", msg);
    }
  };

  const safeConfirm = (msg: string): boolean => {
    // Return true directly to prevent security constraints on window.confirm inside sandboxed iframes from breaking deletion
    return true;
  };

  const handleSaveResumeClick = () => {
    const currentTitle = activeCvToShow?.title || "ჩემი ახალი რეზიუმე";
    setResumeNameInput(currentTitle);
    setIsNamingModalOpen(true);
  };

  const handleSaveResumeNameConfirm = () => {
    if (!resumeNameInput.trim()) {
      safeAlert("გთხოვთ შეიყვანოთ რეზიუმეს სახელი.");
      return;
    }
    if (activeCvToShow) {
      const updatedCv: PolishedCV = {
        ...activeCvToShow,
        title: resumeNameInput.trim(),
        lastUpdated: new Date().toISOString()
      };
      
      let updatedList = [...cvList];
      const existsIndex = cvList.findIndex(c => c.id === updatedCv.id);
      if (existsIndex >= 0) {
        updatedList[existsIndex] = updatedCv;
      } else {
        updatedList.push(updatedCv);
      }
      
      onSaveCVList(updatedList);
      setActivePolishedCV(updatedCv);
      setIsNamingModalOpen(false);
      
      setSaveStatus("Saved");
      setTimeout(() => setSaveStatus("Idle"), 3000);
    }
  };

  useEffect(() => {
    if (currentUser && cvList.length > 0) {
      setActiveBuilderTab("dashboard");
    } else {
      setActiveBuilderTab("create");
    }
  }, [currentUser]);

  // Compute progress of the draft inputs
  const calculateProgress = () => {
    const fields = Object.values(formData) as string[];
    const filledFields = fields.filter(val => val && val.trim().length > 0).length;
    return Math.round((filledFields / fields.length) * 100);
  };

  const [loadedPresetTip, setLoadedPresetTip] = useState("");

  const handleInputChange = (field: keyof CVData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const loadStudentPreset = () => {
    const presets: CVData[] = [
      {
        name: "გიორგი მამულაშვილი",
        email: "g.mamulashvili@btu.edu.ge",
        phone: "+995 599 12 34 56",
        education: "ბიზნესისა და ტექნოლოგიების უნივერსიტეტი (BTU)\nინფორმაციული ტექნოლოგიების ფაკულტეტი, III კურსი\nსაშუალო აკადემიური მოსწრება: GPA 3.8 / 4.0",
        projects: "ფილმების კალოგი React-სა და Express-ზე:\nმარტივი Web გვერდი, სადაც მომხმარელებს შეუძლიათ მოძებნონ, შეაფასონ და გაფილტრონ ფილმები სხვადასხვა ჟანრების მიხედვით.\n\nონლაინ ბიბლიოთეკის მართვის სისტემა:\nსტუდენტური პროექტი მონაცემთა ბაზების საგანში, სადაც SQL ბაზის საშუალებით იგეგმებოდა წიგნების გაცემა და დაბრუნება.",
        activities: "BTU Tech Club-ის ორგანიზატორი:\nაქტიურად ვმონაწილეობდი სტუდენტთა ტექნოლოგიურ შეხვედრებზე. დავეხმარე BTU Hackathon 2025-ის ორგანიზატორებს.\n\nმოხალისე დეველოპერი:\nვმონაწილეობდი არასამთავრობო ორგანიზაციებისთვის ღია კოდის მარტივი საიტების აწყობაში.",
        skills: "React.js, JavaScript, Node.js, Express, PostgreSQL, Git, Tailwind CSS, REST APIs"
      },
      {
        name: "სალომე კობახიძე",
        email: "s.kobakhidze@tsu.ge",
        phone: "+995 577 45 89 12",
        education: "ივანე ჯავახიშვილის სახელობის თბილისის სახელმწიფო უნივერსიტეტი (თსუ)\nბიზნესის ადმინისტრირება, მარკეტინგის მიმართულება, IV კურსი",
        projects: "სტარტაპ 'EcoSmile'-ის ციფრული მარკეტინგული კამპანია:\nშევიმუშავე 6-თვიანი სარეკლამო სტრატეგია სოციალურ ქსელებში, რამაც 25%-ით გაზარდა ორგანული მომხმარებლების რაოდენობა TikTok და Instagram პლატფორმებზე.\n\nუნივერსიტეტის მარკეტინგული კვლევა:\nსაკურსო პროექტის ფარგლებში ჩავატარე კვლევა სტუდენტების სამომხმარებლო ქცევაზე სწრაფი კვების ობიექტებში.",
        activities: "Tbilisi Youth Festival - SMM Lead:\nვმართავდი ფესტივალის ფეისბუქ და ინსტაგრამ გვერდებს, ვამზადებდი ვიზუალურ კონტენტს Canva-სა და CapCut-ში.\n\nმარკეტინგის კლუბის აქტიური წევრი:\nვუძღვებოდი ყოველთვიურ ტრენინგებს ციფრული ფოტოგრაფიისა და ქოფირაითინგის საფუძვლებში.",
        skills: "Social Media Marketing (SMM), Canva, Facebook Ads, Google Analytics, CapCut, ქოფირაითინგი, Instagram Metrics"
      },
      {
        name: "ნიკოლოზ გელაშვილი",
        email: "n.gelashvili@freeuni.edu.ge",
        phone: "+995 555 98 76 54",
        education: "თავისუფალი უნივერსიტეტი (FreeUni)\nბიზნესის სკოლა (ESM), ფინანსების სპეციალიზაცია, II კურსი",
        projects: "სტუდენტური სტარტაპის ფინანსური მოდელირება:\nExcel-ში ავაგე დეტალური ფინანსური მოდელი, რომელიც ითვლიდა Break-even წერტილს და საპროგნოზო ფულად ნაკადებს 3 წლის მანძილზე.\n\nკომპანია 'Geocel'-ის აქციების ანალიზი:\nსტუდენტური საინვესტიციო ჩემპიონატისთვის მოვამზადე კომპანიის ფინანსური ანგარიშების შეფასება.",
        activities: "თავისუფალი უნივერსიტეტის ფინანსური ფორუმი:\nსაორგანიზაციო გუნდის წამყვანი წევრი, პასუხისმგებელი პარტნიორი კომპანიებისა და სპონსორების მოზიდვაზე.\n\nმოხალისე ეკონომისტი:\nვუძღვებოდი სასკოლო ფინანსური განათლების გაკვეთილებს რეგიონულ სკოლებში.",
        skills: "MS Excel (VLOOKUP, Pivot Tables), ფინანსური ანალიზი, ფინანსური მოდელირება, PowerPoint, ინგლისური ენა (C1)"
      },
      {
        name: "ანანო ნინუა",
        email: "anano.ninua@kiu.edu.ge",
        phone: "+995 593 64 82 21",
        education: "ქუთაისის საერთაშორისო უნივერსიტეტი (KIU)\nკომპიუტერული მეცნიერება და UI/UX დიზაინი, III კურსი",
        projects: "მობილური აპლიკაცია 'UniLife'-ის დიზაინი:\nშევქმენი სტუდენტური კალენდრისა და ცხრილების მობილური აპლიკაციის სრულფასოვანი პროტოტიპი Figma-ში (25-ზე მეტი უნიკალური ეკრანი და დიზაინ სისტემა).\n\nGeorgia Tourism Redesign:\nმოვამზადე ტურიზმის ეროვნული ადმინისტრაციის საიტის რედიზაინი, რომელიც ორიენტირებულია მომხმარებლის ხელმისაწვდომობაზე (Accessibility).",
        activities: "KIU Design Club Lead:\nდავაარსე დიზაინის მოყვარულთა კლუბი უნივერსიტეტში. ვატარებდი Figma-ს ვორქშოფებს დამწყები სტუდენტებისთვის.\n\nმოხალისე დიზაინერი Scrum-გუნდში:\nვიმუშავე სხვადასხვა ჰაკათონებზე როგორც UI/UX დიზაინერმა მრავალფუნქციური გუნდების შემადგენლობაში.",
        skills: "Figma, UI/UX Design, Wireframing, Prototypes, Design Systems, Adobe Photoshop, User Research, Usability Testing"
      }
    ];

    const randomIndex = Math.floor(Math.random() * presets.length);
    setFormData(presets[randomIndex]);

    const tipTexts = [
      "ჩაიტვირთა გიორგის ნიმუში (Web Development)",
      "ჩაიტვირთა სალომეს ნიმუში (ციფრული მარკეტინგი & SMM)",
      "ჩაიტვირთა ნიკოლოზის ნიმუში (ფინანსური ანალიტიკა)",
      "ჩაიტვირთა ანანოს ნიმუში (UI/UX დიზაინი)"
    ];
    setLoadedPresetTip(tipTexts[randomIndex]);
    setTimeout(() => {
      setLoadedPresetTip("");
    }, 4500);
  };

  // AI CV generation
  const handleAiTransform = async () => {
    if (!formData.name.trim()) {
      safeAlert("გთხოვთ შეიყვანოთ თქვენი სახელი და გვარი");
      return;
    }

    setIsLoading(true);
    setAiStatusMessage("FirstStep კითხულობს თქვენს სტუდენტურ მონახაზს...");

    const messages = [
      "FirstStep კითხულობს თქვენს სტუდენტურ მონახაზს...",
      "ხელოვნური ინტელექტი აანალიზებს სასწავლო პროექტებს...",
      "ATS ოპტიმიზატორი არჩევს აქტიურ ზმნებს ქართულ ენაზე...",
      "უნარების კლასიფიცირება ხდება ქართული ვაკანსიებისთვის...",
      "მზადდება საბოლოო ATS-მეგობრული ვერსია..."
    ];

    let messageIdx = 0;
    const interval = setInterval(() => {
      messageIdx = (messageIdx + 1) % messages.length;
      setAiStatusMessage(messages[messageIdx]);
    }, 1500);

    try {
      const response = await fetch("/api/generate-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error("სერვერზე მოხდა შეცდომა.");

      const data = await response.json();
      if (data.success) {
        const newCvId = "cv_" + Math.random().toString(36).substring(2, 11);
        const polished: PolishedCV = {
          id: newCvId,
          title: "ჩემი AI რეზიუმე #" + (cvList.length + 1),
          template: creationTemplate,
          summary: data.summary,
          education: data.education,
          projects: data.projects,
          activities: data.activities,
          skills: data.skills || [],
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          lastUpdated: new Date().toISOString()
        };

        setActivePolishedCV(polished);
        setEditingCv(polished);
        setActiveBuilderTab("edit");
        setActiveRightTab("preview");
      }
    } catch (e) {
      console.error(e);
      safeAlert("ვერ მოხერხდა AI კავშირი. გამოვიყენეთ ოფლაინ გენერაციის რეჟიმი.");
      
      // Fallback offline generation to ensure zero failures!
      const fallbackId = "cv_" + Math.random().toString(36).substring(2, 11);
      const polished: PolishedCV = {
        id: fallbackId,
        title: "ჩემი AI რეზიუმე #" + (cvList.length + 1),
        template: creationTemplate,
        summary: "ინფორმაციული ტექნოლოგიების მოტივირებული სტუდენტი, აკადემიური პროექტების პრაქტიკული გამოცდილებით. ორიენტირებული ვარ კოდის ხარისხსა და პრობლემების ეფექტურ გადაჭრაზე.",
        education: formData.education || "ბიზნესისა და ტექნოლოგიების უნივერსიტეტი (BTU)",
        projects: formData.projects ? "• " + formData.projects : "• ვებგვერდების აწყობა React-ზე\n• მონაცემთა მუდმივი ბაზების მართვა SQL-ით",
        activities: formData.activities ? "• " + formData.activities : "• BTU Hackathon 2025 მონაწილე",
        skills: formData.skills ? formData.skills.split(",").map(s => s.trim()) : ["React", "JavaScript", "HTML/CSS"],
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        lastUpdated: new Date().toISOString()
      };
      
      setActivePolishedCV(polished);
      setEditingCv(polished);
      setActiveBuilderTab("edit");
      setActiveRightTab("preview");
    } finally {
      clearInterval(interval);
      setIsLoading(false);
    }
  };

  // CV Actions
  const handleEditCvClick = (cv: PolishedCV) => {
    setEditingCv(cv);
    setActiveBuilderTab("edit");
  };

  const handleApplyEditingChanges = () => {
    if (!editingCv) return;
    
    const updated = cvList.map(c => c.id === editingCv.id ? { ...editingCv, lastUpdated: new Date().toISOString() } : c);
    onSaveCVList(updated);
    setActivePolishedCV(editingCv);
    safeAlert("ცვლილებები წარმატებით შეინახა რეზიუმეში.");
    setActiveBuilderTab("dashboard");
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
    if (!safeConfirm("დარწმუნებული ხართ, რომ გსურთ რეზიუმეს წაშლა?")) return;
    const updated = cvList.filter(c => c.id !== cvId);
    onSaveCVList(updated);
    if (activePolishedCV?.id === cvId) {
      setActivePolishedCV(updated.length > 0 ? updated[0] : null);
    }
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

  // Avatar conversion helper
  const handleAvatarUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && editingCv) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditingCv(prev => prev ? { ...prev, photoUrl: reader.result as string } : null);
      };
      reader.readAsDataURL(file);
    }
  };



  const activeCvToShow = activeBuilderTab === "create" ? null : (editingCv || activePolishedCV);
  const progress = calculateProgress();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" id="cv-builder-page">
      
      {/* Sub-Header Navigation Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b border-slate-100">
        <div className="text-left space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0f1f35] tracking-tight">AI რეზიუმეების პორტალი</h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            მართეთ რეზიუმეები ან გამოიყენეთ FirstStep AI, რათა თქვენი სტუდენტური პროექტები პროფესიონალთა ენაზე გადაითარგმნოს.
          </p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl self-start">
          {currentUser && (
            <button
              onClick={() => setActiveBuilderTab("dashboard")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeBuilderTab === "dashboard" ? "bg-white text-brand-primary shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              ჩემი CV-ები ({cvList.length})
            </button>
          )}
          <button
            onClick={() => setActiveBuilderTab("create")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center space-x-1.5 ${
              activeBuilderTab === "create" ? "bg-white text-brand-primary shadow-xs" : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>ახლის შექმნა</span>
          </button>
          {activeCvToShow && (
            <button
              onClick={() => { setEditingCv(activeCvToShow); setActiveBuilderTab("edit"); }}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeBuilderTab === "edit" ? "bg-white text-brand-primary shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              რედაქტირება
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-100 shadow-xs p-6 sm:p-8 space-y-8 text-left relative overflow-hidden">
          
          {activeBuilderTab === "dashboard" && currentUser && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                <h3 className="text-sm font-extrabold text-brand-primary uppercase tracking-wide">რეზიუმეების მენეჯერი</h3>
                <span className="text-[10px] text-slate-400 font-semibold font-mono">აქტიური სესია: {currentUser.fullName}</span>
              </div>

              {/* CV Grid list */}
              <div className="space-y-4">
                {cvList.map((cv) => {
                  const isActive = activePolishedCV?.id === cv.id;
                  const isRenaming = renamingId === cv.id;

                  return (
                    <div 
                      key={cv.id}
                      onClick={() => {
                        if (!isRenaming) {
                          setActivePolishedCV(cv);
                          setEditingCv(null);
                        }
                      }}
                      className={`p-5 rounded-2xl border transition-all duration-200 relative cursor-pointer group text-left ${
                        isActive ? "border-brand-secondary bg-brand-primary-light/30 shadow-xs ring-1 ring-brand-secondary/20 scale-[1.01]" : "border-slate-100 hover:border-slate-200 bg-white hover:bg-slate-50/40"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="space-y-1.5 flex-1 text-left">
                          {isRenaming ? (
                            <div 
                              className="flex items-center space-x-2"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                type="text"
                                value={renameInput}
                                onChange={(e) => setRenameInput(e.target.value)}
                                className="px-2.5 py-1 text-xs border rounded-lg focus:outline-none focus:border-[#00B4D8]"
                                id={`rename-input-${cv.id}`}
                              />
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRenameSave(cv.id);
                                }}
                                className="p-1 rounded bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-extrabold text-[#0f1f35] group-hover:text-brand-primary transition-colors">{cv.title || "უტიტულო რეზიუმე"}</span>
                              {isActive ? (
                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-black rounded-md flex items-center gap-1 shrink-0 animate-fadeIn">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                  აქტიური
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-slate-150 text-slate-500 text-[9px] font-semibold rounded-md shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                  ასარჩევად
                                </span>
                              )}
                            </div>
                          )}
                          
                          <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1 text-xs text-slate-400 font-medium">
                            <span>🎓 {cv.name}</span>
                            <span>📅 {new Date(cv.lastUpdated).toLocaleDateString("ka-GE")}</span>
                            <span className="capitalize text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold font-mono">{cv.template}</span>
                          </div>
                        </div>
                      </div>

                      {/* Interactive cv utility row */}
                      <div className="flex items-center justify-between border-t border-slate-50 pt-4 mt-4 text-[11px] font-bold text-slate-500">
                        <div className="flex items-center space-x-4">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditCvClick(cv);
                            }}
                            className="flex items-center space-x-1.5 hover:text-brand-secondary transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-brand-secondary" />
                            <span>რედაქტირება</span>
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRenameStart(cv);
                            }}
                            className="flex items-center space-x-1.5 hover:text-slate-800 transition-colors cursor-pointer"
                          >
                            <span>სახელის შეცვლა</span>
                          </button>
                        </div>

                        <div className="flex items-center space-x-4">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDuplicateCv(cv);
                            }}
                            className="flex items-center space-x-1.5 hover:text-brand-primary transition-colors cursor-pointer"
                            title="დუბლირება"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>დუბლირება</span>
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteCv(cv.id);
                            }}
                            className="flex items-center space-x-1.5 text-red-400 hover:text-red-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>წაშლა</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}

                {cvList.length === 0 && (
                  <div className="py-12 border border-dashed border-slate-100 rounded-2xl text-center space-y-4">
                    <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold text-slate-500">თქვენ ჯერ არ გაქვთ შენახული CV-ები.</p>
                      <button 
                        onClick={() => setActiveBuilderTab("create")}
                        className="mt-2 inline-flex items-center px-4 py-2 text-xs font-bold text-white bg-brand-primary hover:bg-brand-primary-hover rounded-xl cursor-pointer"
                      >
                        შექმენი პირველი CV სწრაფად
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeBuilderTab === "create" && (
            <div className="space-y-6 animate-fadeIn">
              
              <div className="flex justify-between items-center pb-2 border-b border-slate-50">
                <h3 className="text-sm font-extrabold text-brand-primary uppercase tracking-wide">მონაცემთა მონახაზი</h3>
                <div className="flex items-center gap-2">
                  {loadedPresetTip && (
                    <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50/70 px-2 py-1 rounded-lg animate-fadeIn">
                      {loadedPresetTip}
                    </span>
                  )}
                  <button
                    onClick={() => setFormData(DEFAULT_FORM_DATA)}
                    className="px-3 py-1.5 text-[10px] font-bold text-red-500 bg-red-50 hover:bg-red-100/80 rounded-xl border border-red-200 transition-all cursor-pointer flex items-center gap-1"
                    id="builder-clear-btn"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>გასუფთავება</span>
                  </button>
                  <button
                    onClick={loadStudentPreset}
                    className="px-3 py-1.5 text-[10px] font-bold text-brand-primary bg-brand-primary-light hover:bg-brand-primary-light/80 rounded-xl border border-brand-secondary/20 transition-all cursor-pointer"
                    id="builder-preset-btn"
                  >
                    ნიმუშის ჩატვირთვა
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-brand-primary">შევსების პროგრესი</span>
                  <span className="font-mono text-brand-secondary font-semibold">{progress}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-brand-primary to-brand-secondary h-full rounded-full transition-all duration-500" 
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-brand-primary uppercase tracking-wider">სახელი და გვარი</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="მაგ: გიორგი ბერიძე"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-secondary text-xs text-[#0f1f35] bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-brand-primary uppercase tracking-wider">ელ. ფოსტა</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="g.beridze@btu.edu.ge"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-secondary text-xs text-[#0f1f35] bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-brand-primary uppercase tracking-wider">ტელეფონი</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      placeholder="+995 5xx xx xx xx"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-secondary text-xs text-[#0f1f35] bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none transition-all duration-200"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-brand-primary uppercase tracking-wider">განათლება</label>
                  <textarea
                    rows={2}
                    value={formData.education}
                    onChange={(e) => handleInputChange("education", e.target.value)}
                    placeholder="მაგ: ბიზნესისა და ტექნოლოგიების უნივერსიტეტი, ინფორმაციული ტექნოლოგიების ბაკალავრიატი."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-secondary text-xs text-[#0f1f35] bg-slate-50/50 focus:bg-white focus:outline-none transition-all resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-brand-primary uppercase tracking-wider">უნივერსიტეტის პროექტები და ქეისები</label>
                  <textarea
                    rows={4}
                    value={formData.projects}
                    onChange={(e) => handleInputChange("projects", e.target.value)}
                    placeholder="აღწერეთ ნებისმიერი საგანი, პრეზენტაცია, ჯგუფური პროექტი ან ვებსაიტი, რომელიც გაგიკეთებიათ სასწავლო პროცესში."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-secondary text-xs text-[#0f1f35] bg-slate-50/50 focus:bg-white focus:outline-none transition-all resize-none"
                  />
                </div>

                <div className="space-y-1 font-sans">
                  <label className="text-[10px] font-extrabold text-brand-primary uppercase tracking-wider">სტუდენტური კლუბები და აქტივობები</label>
                  <textarea
                    rows={2}
                    value={formData.activities}
                    onChange={(e) => handleInputChange("activities", e.target.value)}
                    placeholder="ჰაკათონები, ტრენინგები, კლუბური აქტივობები"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-secondary text-xs text-[#0f1f35] bg-slate-50/50 focus:bg-white focus:outline-none transition-all resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-brand-primary uppercase tracking-wider">უნარები (გამოყავით მძიმით)</label>
                  <input
                    type="text"
                    value={formData.skills}
                    onChange={(e) => handleInputChange("skills", e.target.value)}
                    placeholder="React, JavaScript, HTML, CSS, Git, SQL, Figma"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-brand-secondary text-xs text-[#0f1f35] bg-slate-50/50 focus:bg-white focus:outline-none transition-all"
                  />
                </div>

                 <div className="space-y-2 pt-1 text-left">
                  <label className="text-[10px] font-extrabold text-brand-primary uppercase tracking-wider block">დიზაინის შაბლონი</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-55/40 p-1.5 rounded-xl border border-slate-100">
                    {(["classic", "tech", "editorial", "modern"] as const).map((temp) => (
                      <button
                        key={temp}
                        type="button"
                        onClick={() => setCreationTemplate(temp)}
                        className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                          creationTemplate === temp
                            ? "border-brand-primary bg-brand-primary/5 font-extrabold text-[#0f1f35] ring-2 ring-brand-primary/10 shadow-xs"
                            : "border-slate-100 bg-white/70 hover:border-slate-200 text-slate-500 font-semibold"
                        }`}
                      >
                        <span className="capitalize text-xs block font-bold mb-1">
                          {temp === "classic" ? "Classic" : temp === "tech" ? "Tech" : temp === "editorial" ? "Editorial" : "Modern"}
                        </span>
                        <span className="text-[9px] text-slate-400 font-normal">
                          {temp === "classic" ? "კლასიკური" : temp === "tech" ? "ტექნიკური" : temp === "editorial" ? "დახვეწილი" : "თანამედროვე"}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAiTransform}
                  disabled={isLoading}
                  className="w-full py-3.5 bg-brand-primary hover:bg-brand-primary-hover text-xs font-bold tracking-wider uppercase text-white rounded-xl shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>მიმდინარეობს AI ტრანსფორმაცია...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 text-brand-secondary" />
                      <span>AI-ით CV-ად გადაქცევა</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {activeBuilderTab === "edit" && editingCv && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-extrabold text-brand-primary uppercase tracking-wide">რედაქტირება & დიზაინი</h3>
                  <p className="text-[10px] text-slate-400">რეალური დროის ცვლილებები და სექციები</p>
                </div>
                
                {/* Save button */}
                <button
                  onClick={handleApplyEditingChanges}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  შენახვა ✓
                </button>
              </div>

               <div className="space-y-2 pt-1 text-left">
                <label className="text-[10px] font-extrabold text-brand-primary uppercase tracking-wider block">დიზაინის შაბლონი</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-55/40 p-1.5 rounded-xl border border-slate-100">
                  {(["classic", "tech", "editorial", "modern"] as const).map((temp) => (
                    <button
                      key={temp}
                      type="button"
                      onClick={() => setEditingCv(prev => prev ? { ...prev, template: temp } : null)}
                      className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                        editingCv.template === temp
                          ? "border-brand-primary bg-brand-primary/5 font-extrabold text-[#0f1f35] ring-2 ring-brand-primary/10 shadow-xs"
                          : "border-slate-100 bg-white/70 hover:border-slate-200 text-slate-500 font-semibold"
                      }`}
                    >
                      <span className="capitalize text-xs block font-bold mb-1">
                        {temp === "classic" ? "Classic" : temp === "tech" ? "Tech" : temp === "editorial" ? "Editorial" : "Modern"}
                      </span>
                      <span className="text-[9px] text-slate-400 font-normal">
                        {temp === "classic" ? "კლასიკური" : temp === "tech" ? "ტექნიკური" : temp === "editorial" ? "დახვეწილი" : "თანამედროვე"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-slate-50">
                
                {/* Profile Avatar Loader */}
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold text-brand-primary uppercase tracking-wider block">სურათი / ავატარი (ოფციალური)</label>
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center">
                      {editingCv.photoUrl ? (
                        <img src={editingCv.photoUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept="image/*" 
                        className="hidden" 
                      />
                      <button
                        type="button"
                        onClick={handleAvatarUploadClick}
                        className="flex items-center space-x-1 bg-slate-100 hover:bg-slate-250 text-slate-600 px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>სურათის ატვირთვა</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-extrabold text-brand-primary uppercase tracking-wider">პროფესიული პროფილი</label>
                  <textarea
                    rows={3}
                    value={editingCv.summary}
                    onChange={(e) => setEditingCv(prev => prev ? { ...prev, summary: e.target.value } : null)}
                    className="w-full px-3 py-2 text-xs border rounded-xl focus:outline-none focus:border-brand-secondary bg-slate-50/30"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-extrabold text-brand-primary uppercase tracking-wider">განათლება</label>
                  <textarea
                    rows={3}
                    value={editingCv.education}
                    onChange={(e) => setEditingCv(prev => prev ? { ...prev, education: e.target.value } : null)}
                    className="w-full px-3 py-2 text-xs border rounded-xl focus:outline-none focus:border-brand-secondary bg-slate-50/30"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-extrabold text-brand-primary uppercase tracking-wider">აკადემიური პროექტები & გამოცდილება</label>
                  <textarea
                    rows={5}
                    value={editingCv.projects}
                    onChange={(e) => setEditingCv(prev => prev ? { ...prev, projects: e.target.value } : null)}
                    className="w-full px-3 py-2 text-xs border rounded-xl focus:outline-none focus:border-brand-secondary bg-slate-50/30"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-extrabold text-brand-primary uppercase tracking-wider">სასკოლო / სტუდენტური აქტივობები</label>
                  <textarea
                    rows={3}
                    value={editingCv.activities}
                    onChange={(e) => setEditingCv(prev => prev ? { ...prev, activities: e.target.value } : null)}
                    className="w-full px-3 py-2 text-xs border rounded-xl focus:outline-none focus:border-brand-secondary bg-slate-50/30"
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-extrabold text-brand-primary uppercase tracking-wider">უნარები (მძიმით გამოყოფილი)</label>
                  <input
                    type="text"
                    value={(editingCv.skills || []).join(", ")}
                    onChange={(e) => setEditingCv(prev => prev ? { ...prev, skills: e.target.value.split(",").map(s => s.trim()) } : null)}
                    className="w-full px-3 py-2 text-xs border rounded-xl focus:outline-none focus:border-brand-secondary bg-slate-50/30"
                  />
                </div>

              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-100">
                <button
                  onClick={() => { setEditingCv(null); setActiveBuilderTab(currentUser ? "dashboard" : "create"); }}
                  className="flex-1 py-3 border border-slate-200 text-slate-500 rounded-xl text-xs font-bold leading-none cursor-pointer hover:bg-slate-50"
                >
                  გაუქმება
                </button>
                <button
                  onClick={handleApplyEditingChanges}
                  className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold leading-none cursor-pointer"
                >
                  ცვლილებების შენახვა
                </button>
              </div>

            </div>
          )}

          {/* AI Loader overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-white/95 backdrop-blur-xs flex flex-col justify-center items-center p-8 text-center animate-fadeIn z-30">
              <div className="relative mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-primary to-brand-secondary animate-spin flex items-center justify-center shadow-lg">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-brand-secondary" />
                  </div>
                </div>
                <span className="absolute -inset-1.5 rounded-3xl bg-brand-secondary/25 blur-sm animate-pulse"></span>
              </div>
              <h2 className="text-base font-extrabold text-[#0f1f35] mb-2">FirstStep AI მუშაობს</h2>
              <div className="text-[10px] text-slate-400 font-bold tracking-wider max-w-sm flex items-center justify-center space-x-2 h-8">
                <p className="animate-pulse">{aiStatusMessage}</p>
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-6 space-y-6">
          
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveRightTab("preview")}
              className={`flex-1 py-2.5 text-xs font-extrabold uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center space-x-2 ${
                activeRightTab === "preview" ? "bg-white text-brand-primary shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>შედეგის პრევიუ</span>
            </button>
            <button
              onClick={() => setActiveRightTab("tips")}
              className={`flex-1 py-2.5 text-xs font-extrabold uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center space-x-2 ${
                activeRightTab === "tips" ? "bg-white text-brand-primary shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Lightbulb className="w-4 h-4" />
              <span>რჩევები & ნიმუშები</span>
            </button>
          </div>

          {activeRightTab === "preview" && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden text-left flex flex-col min-h-[580px]">
              
              <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-extrabold text-brand-primary">ცოცხალი რეზიუმე</span>
                </div>
                {activeCvToShow && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSaveResumeClick}
                      className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-90 text-[10px] font-bold text-white rounded-lg transition-all cursor-pointer shadow-sm"
                      id="builder-save-profile-btn"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>პროფილში შენახვა</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        exportCvAsPdfFile(activeCvToShow);
                      }}
                      className="flex items-center space-x-1 px-3 py-1.5 bg-brand-primary-light hover:bg-brand-primary-light/80 text-[10px] font-bold text-brand-primary rounded-lg border border-brand-secondary/20 transition-colors cursor-pointer"
                      id="builder-pdf-print-btn"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </button>
                  </div>
                )}
              </div>

              {activeCvToShow && (
                <div className="p-3 bg-slate-50/50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 px-6">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">აირჩიე დიზაინი პრევიუში:</span>
                  <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                    {(["classic", "tech", "editorial", "modern"] as const).map((temp) => (
                      <button
                        key={temp}
                        onClick={() => {
                          if (editingCv) {
                            setEditingCv({ ...editingCv, template: temp });
                          } else if (activePolishedCV) {
                            const updated = { ...activePolishedCV, template: temp };
                            setActivePolishedCV(updated);
                            const updatedList = cvList.map(item => item.id === activePolishedCV.id ? updated : item);
                            onSaveCVList(updatedList);
                          }
                        }}
                        className={`px-2.5 py-1 text-[11px] font-extrabold rounded-md uppercase transition-all cursor-pointer ${
                          activeCvToShow.template === temp
                            ? "bg-white text-brand-primary shadow-xs"
                            : "text-slate-400 hover:text-slate-600"
                        }`}
                      >
                        {temp === "classic" ? "Classic" : temp === "tech" ? "Tech" : temp === "editorial" ? "Editorial" : "Modern"}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-6 flex-1 bg-slate-100/50 overflow-y-auto max-h-[620px]">
                {activeCvToShow ? (
                  <div id="printable-cv-container" className={getTemplateContainerStyles(activeCvToShow.template)}>
                    
                    {/* Header elements */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 pb-4 border-b border-slate-200">
                      <div className="space-y-2">
                        <h2 className={getTemplateHeaderColor(activeCvToShow.template)}>{activeCvToShow.name || "სახელი და გვარი"}</h2>
                        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs font-semibold text-slate-500 font-mono">
                          {activeCvToShow.email && <span>✉️ {activeCvToShow.email}</span>}
                          {activeCvToShow.phone && <span>📞 {activeCvToShow.phone}</span>}
                        </div>
                      </div>

                      {/* Photo block if uploaded */}
                      {activeCvToShow.photoUrl && (
                        <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200 shadow-xs shrink-0 self-start">
                          <img src={activeCvToShow.photoUrl} alt="CV avatar" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>

                    {/* Summary card section */}
                    {activeCvToShow.summary && (
                      <div className="space-y-1">
                        <h3 className={getTemplateLabelStyles(activeCvToShow.template)}>პროფესიული პროფილი</h3>
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal p-1">
                          {activeCvToShow.summary}
                        </p>
                      </div>
                    )}

                    {/* Education */}
                    {activeCvToShow.education && (
                      <div className="space-y-1.5">
                        <h3 className={getTemplateLabelStyles(activeCvToShow.template)}>განათლება</h3>
                        <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line ps-1">
                          {activeCvToShow.education}
                        </div>
                      </div>
                    )}

                    {/* Projects */}
                    {activeCvToShow.projects && (
                      <div className="space-y-1.5">
                        <h3 className={getTemplateLabelStyles(activeCvToShow.template)}>სასწავლო პროექტები & პრაქტიკა</h3>
                        <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line ps-1 space-y-1.5">
                          {activeCvToShow.projects}
                        </div>
                      </div>
                    )}

                    {/* Activities */}
                    {activeCvToShow.activities && (
                      <div className="space-y-1.5">
                        <h3 className={getTemplateLabelStyles(activeCvToShow.template)}>სტუდენტური აქტივობები</h3>
                        <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line ps-1">
                          {activeCvToShow.activities}
                        </div>
                      </div>
                    )}

                    {/* Skills */}
                    {activeCvToShow.skills && activeCvToShow.skills.length > 0 && (
                      <div className="space-y-2 pt-1">
                        <h3 className={getTemplateLabelStyles(activeCvToShow.template)}>ტექნიკური უნარები</h3>
                        <div className="flex flex-wrap gap-1.5">
                          {activeCvToShow.skills.map((skill, i) => (
                            <span 
                              key={i} 
                              className="px-2.5 py-1 text-xs font-bold text-brand-primary bg-brand-primary-light border border-brand-secondary/10 rounded-lg shadow-2xs hover:bg-brand-secondary/10 transition-all font-mono"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>
                ) : (
                  <div className="h-full flex flex-col justify-center items-center text-center p-8 space-y-5 my-auto" id="cv-empty-state">
                    <div className="w-16 h-16 rounded-2xl bg-brand-primary-light flex items-center justify-center text-brand-primary border border-brand-secondary/15">
                      <FileText className="w-8 h-8 opacity-70" />
                    </div>
                    <div className="space-y-2">
                       <h4 className="text-base font-bold text-[#0f1f35]">CV ჯერ ცარიელია</h4>
                      <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                        შეავსეთ ძირითადი ველები მარცხენა მხარეს, შემდგომ დააჭირეთ <strong className="text-brand-primary">„AI-ით CV-ად გადაქცევა“</strong> ღილაკს, რათა იხილოთ შედეგი აქ.
                      </p>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

          {activeRightTab === "tips" && (
            <div className="space-y-6 text-left" id="tips-panel">
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-brand-primary-light flex items-center justify-center text-brand-primary">
                    <Layers className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-extrabold text-[#0f1f35]">ტრანსფორმაციის მაგალითი</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
                  <div className="bg-red-50/70 border border-red-100/50 p-3 rounded-xl space-y-1.5">
                    <div className="flex items-center space-x-1.5 text-red-600 font-bold">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>მანამდე (მონახაზი)</span>
                    </div>
                    <p className="text-red-800/80 leading-relaxed italic">
                      „უნივერსიტეტში გავაკეთეთ მარტივი საიტი, სადაც შეიძლებოდა ფილმების ნახვა. ვიყენებდით React-ს.“
                    </p>
                  </div>
                  <div className="bg-brand-primary-light border border-brand-secondary/20 p-3 rounded-xl space-y-1.5">
                    <div className="flex items-center space-x-1.5 text-brand-secondary font-bold">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>მერე (AI ოპტიმიზებული)</span>
                    </div>
                    <p className="text-brand-primary leading-relaxed font-semibold">
                      „React და Node.js ბაზაზე შევქმენი ფილმების კატალოგის ვებ-აპლიკაცია (SPA). დავნერგე მომხმარებლის ავტორიზაცია და საძიებო ფილტრები. პროექტი აიტვირთა GitHub-ზე.“
                    </p>
                  </div>
                </div>
              </div>

              {/* ATS Friendly Tips */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
                <h3 className="text-sm font-extrabold text-[#0f1f35] flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-brand-secondary" />
                  <span>ATS-მეგობრული რჩევები</span>
                </h3>
                <div className="space-y-3.5">
                  {ATS_TIPS.map((tip, idx) => (
                    <div key={idx} className="space-y-1.5 leading-relaxed">
                      <h4 className="text-xs font-extrabold text-brand-primary">{tip.title}</h4>
                      <p className="text-xs text-[#0f1f35]/70">{tip.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Premium CV naming modal popup */}
      {isNamingModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-105 max-w-sm w-full p-6 shadow-2xl space-y-4 text-left">
            <div className="flex items-center space-x-2.5 text-brand-primary">
              <div className="w-9 h-9 rounded-xl bg-brand-primary-light flex items-center justify-center text-brand-secondary">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-[#0f1f35]">შეფუთვა & შენახვა</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">რეზიუმეს სახელის დარქმევა</p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500">დაარქვით სახელი თქვენს რეზიუმეს</label>
              <input
                type="text"
                value={resumeNameInput}
                onChange={(e) => setResumeNameInput(e.target.value)}
                placeholder="მაგ: რეზიუმე - Web Developer"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-brand-secondary text-slate-800"
                id="save-filename-input"
              />
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                შენახული სახელით ამ რეზიუმეს მარტივად იპოვით თქვენი პროფილის პორტფოლიოში და გამოიყენებთ სხვადასხვა ვაკანსიებისთვის.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3.5 pt-2 text-xs font-bold uppercase tracking-wider">
              <button
                onClick={() => setIsNamingModalOpen(false)}
                className="py-3 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-500 transition-colors cursor-pointer text-center"
              >
                გაუქმება
              </button>
              <button
                onClick={handleSaveResumeNameConfirm}
                className="py-3 bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-95 rounded-xl text-white shadow-md transition-all cursor-pointer text-center"
              >
                შენახვა
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
