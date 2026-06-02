import { useState } from "react";
import { Menu, X, ArrowRight, LogOut, User as UserIcon, Sparkles, GraduationCap, Palette, ChevronDown, Sun, Moon } from "lucide-react";
import { User } from "../types";
import mascotLogo from "../assets/images/firststep_new_mascot_logo_1780132225263.png";

interface NavbarProps {
  activeView: string;
  onNavigate: (view: string) => void;
  currentUser: User | null;
  onLogout: () => void;
  onOpenAuth: () => void;
  theme: string;
  onThemeChange: (theme: string) => void;
  mode: "light" | "dark";
  onModeChange: (mode: "light" | "dark") => void;
}

export default function Navbar({ 
  activeView, 
  onNavigate, 
  currentUser, 
  onLogout, 
  onOpenAuth, 
  theme, 
  onThemeChange,
  mode,
  onModeChange
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);

  const themesList = [
    { id: "mascot", name: "ამულეტი (Mascot Purple)", previewBg: "bg-[#7B2CBF]", previewSec: "bg-[#00B4D8]" },
    { id: "classic", name: "კლასიკური (Royal Navy)", previewBg: "bg-[#1E3A5F]", previewSec: "bg-[#00B4D8]" },
    { id: "emerald", name: "ზურმუხტი (Emerald Tech)", previewBg: "bg-[#0F766E]", previewSec: "bg-[#10B981]" },
    { id: "sunset", name: "ზაფხული (Sunset Amber)", previewBg: "bg-[#E11D48]", previewSec: "bg-[#F97316]" },
  ];

  const navLinks = [
    { id: "home", label: "მთავარი" },
    { id: "builder", label: "CV ბილდერი" },
    { id: "jobs", label: "ვაკანსიები" },
  ];

  const getInitials = (name: string) => {
    return name ? name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() : "ST";
  };

  return (
    <nav className="sticky top-0 z-50 bg-theme-nav-bg/95 backdrop-blur-md border-b border-theme-card-border/50 transition-all duration-300" id="navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-18 items-center">
          
          {/* Logo */}
          <div 
            onClick={() => { onNavigate("home"); setIsOpen(false); }}
            className="flex items-center space-x-2.5 cursor-pointer select-none group"
            id="nav-logo"
          >
            <img
              src={mascotLogo}
              alt="FirstStep Logo"
              className="h-11 w-11 object-contain rounded-xl shadow-xs group-hover:scale-105 transition-all duration-300 bg-transparent"
              referrerPolicy="no-referrer"
            />
            <span className="text-xl font-extrabold tracking-tight text-theme-text flex items-center">
              First<span className="text-brand-primary font-bold ml-0.5">Step</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-3 bg-theme-input-bg/40 p-1.5 rounded-2xl border border-theme-card-border/40">
            {navLinks.map((link) => {
              const isActive = activeView === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => onNavigate(link.id)}
                  className={`text-sm font-bold tracking-wide transition-all duration-200 cursor-pointer px-4 py-1.5 rounded-xl flex items-center gap-1.5 ${
                    isActive
                      ? "bg-brand-primary text-white shadow-sm ring-1 ring-brand-primary/20"
                      : "text-theme-text/80 hover:bg-theme-input-bg/70 hover:text-brand-primary"
                  }`}
                  id={`nav-${link.id}`}
                >
                  <span>{link.label}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Desktop Auth State / CTA Button combo / Theme selector */}
          <div className="hidden md:flex items-center space-x-4">
            
            {/* Design Customizer Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsThemeOpen(!isThemeOpen)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-theme-text/80 hover:bg-theme-card-bg/80 border border-theme-card-border/50 transition-all cursor-pointer"
                title="დიზაინის შეცვლა"
              >
                <Palette className="w-4 h-4 text-brand-primary" />
                <span>დიზაინი</span>
                <ChevronDown className={`w-3.5 h-3.5 text-theme-text-muted transition-transform ${isThemeOpen ? "rotate-180" : ""}`} />
              </button>

              {isThemeOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsThemeOpen(false)} />
                  <div className="absolute right-0 mt-2 w-64 bg-theme-card-bg border border-theme-card-border rounded-2xl shadow-xl p-3 z-20 space-y-1 animate-fadeIn text-left">
                    <p className="text-[10px] font-extrabold text-theme-text-muted uppercase tracking-widest px-2 pb-1 border-b border-theme-card-border/40 mb-1">აირჩიე დიზაინი</p>
                    {themesList.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          onThemeChange(t.id);
                          setIsThemeOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl transition-all text-xs font-semibold ${
                          theme === t.id 
                            ? "bg-brand-primary-light text-brand-primary" 
                            : "text-theme-text/80 hover:bg-brand-primary-light/30"
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <div className="flex space-x-1 shrink-0 p-0.5 bg-theme-bg/20 rounded-full border border-theme-card-border/60">
                            <span className={`w-2.5 h-2.5 rounded-full ${t.previewBg}`} />
                            <span className={`w-2.5 h-2.5 rounded-full ${t.previewSec}`} />
                          </div>
                          <span>{t.name}</span>
                        </div>
                        {theme === t.id && (
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Mode Switcher Toggle (Light/Dark) */}
            <button
              onClick={() => onModeChange(mode === "light" ? "dark" : "light")}
              className="flex items-center justify-center p-2 rounded-xl text-theme-text-muted hover:text-brand-primary hover:bg-theme-card-bg/80 border border-theme-card-border/50 transition-all cursor-pointer"
              title={mode === "light" ? "მუქი რეჟიმი" : "ნათელი რეჟიმი"}
            >
              {mode === "light" ? (
                <Moon className="w-4 h-4 text-brand-primary animate-fadeIn" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500 animate-fadeIn" />
              )}
            </button>

            {currentUser ? (
              <div className="flex items-center space-x-3.5 pl-4 border-l border-theme-card-border/50">
                {/* Profile indicator */}
                <button
                  onClick={() => onNavigate("profile")}
                  className="flex items-center space-x-2.5 px-3 py-1.5 rounded-xl bg-brand-primary-light border border-brand-secondary/15 hover:opacity-90 transition-all cursor-pointer text-left"
                  title="ჩემი პროფილი"
                  id="navbar-profile-trigger"
                >
                  {currentUser.picture ? (
                    <img
                      src={currentUser.picture}
                      alt={currentUser.fullName}
                      className="w-6.5 h-6.5 rounded-md object-cover border border-brand-primary/10"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-6.5 h-6.5 rounded-md bg-brand-primary text-white flex items-center justify-center text-[10px] font-black tracking-tight uppercase">
                      {getInitials(currentUser.fullName)}
                    </div>
                  )}
                  <span className="text-xs font-bold text-brand-primary max-w-[120px] truncate">
                    {currentUser.fullName}
                  </span>
                </button>

                {/* Log out icon link */}
                <button
                  onClick={onLogout}
                  className="p-2 text-theme-text-muted hover:text-red-500 hover:bg-theme-card-bg/80 rounded-xl transition-all cursor-pointer"
                  title="გამოსვლა"
                  id="navbar-logout-btn"
                >
                  <LogOut className="w-4.5 h-4.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <button
                  onClick={onOpenAuth}
                  className="px-4 py-2 text-xs font-bold text-brand-primary hover:text-brand-secondary transition-colors cursor-pointer"
                  id="navbar-login-btn"
                >
                  შესვლა
                </button>
                <button
                  onClick={() => onNavigate("builder")}
                  className="relative inline-flex items-center justify-center px-5 py-2.5 text-xs font-bold tracking-wider uppercase text-white rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary hover:opacity-95 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
                  id="nav-cta-desktop"
                >
                  <span>დაიწყე უფასოდ</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile hamburger menu */}
          <div className="flex md:hidden items-center">
            {currentUser && (
              <button
                onClick={() => { onNavigate("profile"); setIsOpen(false); }}
                className="w-7 h-7 rounded-lg overflow-hidden border border-brand-secondary/20 flex items-center justify-center text-[9px] font-extrabold text-brand-primary mr-3 cursor-pointer hover:opacity-90 transition-all"
                title="ჩემი პროფილი"
              >
                {currentUser.picture ? (
                  <img
                    src={currentUser.picture}
                    alt={currentUser.fullName}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span>{getInitials(currentUser.fullName)}</span>
                )}
              </button>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2.5 rounded-xl text-theme-text hover:bg-theme-card-bg/80 transition-colors focus:outline-none"
              aria-label="Toggle Menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-theme-nav-bg/95 border-b border-theme-card-border/50 backdrop-blur-md absolute top-18 left-0 right-0 py-4 px-4 shadow-xl space-y-3 z-50 animate-fadeIn text-theme-text">
          {navLinks.map((link) => {
            const isActive = activeView === link.id;
            return (
              <button
                key={link.id}
                onClick={() => {
                  onNavigate(link.id);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-3 text-sm font-bold rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-between ${
                  isActive
                    ? "bg-brand-primary text-white shadow-sm"
                    : "text-theme-text/85 hover:bg-theme-card-bg/80 hover:text-brand-primary"
                }`}
              >
                <span>{link.label}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                )}
              </button>
            );
          })}
          
          {/* Mobile Design Customizer */}
          <div className="p-3 bg-theme-card-bg border border-theme-card-border/40 rounded-xl space-y-2">
            <span className="text-[10px] font-black uppercase text-theme-text-muted tracking-wider flex items-center gap-1 px-1">
              <Palette className="w-3.5 h-3.5 text-brand-primary" />
              <span>დიზაინის შეცვლა</span>
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {themesList.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    onThemeChange(t.id);
                  }}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg border text-[10px] font-bold transition-all ${
                    theme === t.id 
                      ? "bg-brand-primary-light border-brand-primary/30 text-brand-primary shadow-xs" 
                      : "bg-theme-card-bg/50 border-theme-card-border text-theme-text-muted hover:text-theme-text"
                  }`}
                >
                  <div className="flex space-x-1 mb-1 p-0.5 rounded-full bg-theme-bg/10">
                    <span className={`w-2.5 h-2.5 rounded-full ${t.previewBg}`} />
                    <span className={`w-2.5 h-2.5 rounded-full ${t.previewSec}`} />
                  </div>
                  <span className="text-[9px] truncate max-w-full">{t.name.split(" ")[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Mode Customizer */}
          <div className="p-3 bg-theme-card-bg border border-theme-card-border/40 rounded-xl space-y-2">
            <span className="text-[10px] font-black uppercase text-theme-text-muted tracking-wider flex items-center gap-1.5 px-1">
              {mode === "light" ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-brand-primary" />}
              <span>რეჟიმი ({mode === "light" ? "ნათელი" : "მუქი"})</span>
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => onModeChange("light")}
                className={`py-2 rounded-lg border text-[10px] font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  mode === "light"
                    ? "bg-brand-primary-light text-brand-primary border-brand-primary/30"
                    : "bg-theme-card-bg border-theme-card-border text-theme-text-muted hover:text-theme-text"
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>ნათელი</span>
              </button>
              <button
                onClick={() => onModeChange("dark")}
                className={`py-2 rounded-lg border text-[10px] font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  mode === "dark"
                    ? "bg-brand-primary-light text-brand-primary border-brand-primary/30"
                    : "bg-theme-card-bg border-theme-card-border text-theme-text-muted hover:text-theme-text"
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>მუქი</span>
              </button>
            </div>
          </div>
          
          <div className="pt-2 border-t border-theme-card-border/40 space-y-2">
            {currentUser ? (
              <div className="space-y-2">
                <div 
                  onClick={() => { onNavigate("profile"); setIsOpen(false); }}
                  className="flex items-center justify-between p-3 bg-theme-card-bg border border-theme-card-border rounded-xl cursor-pointer transition-colors"
                >
                  <span className="text-xs font-bold text-brand-primary flex items-center gap-1.5">
                    <UserIcon className="w-4 h-4 text-brand-secondary" />
                    <span>პროფილი ({currentUser.fullName})</span>
                  </span>
                </div>
                <button
                  onClick={() => { onLogout(); setIsOpen(false); }}
                  className="w-full text-left p-3 text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50/10 rounded-xl cursor-pointer flex items-center space-x-1 border border-transparent"
                >
                  <LogOut className="w-4 h-4" />
                  <span>გამოსვლა</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => { onOpenAuth(); setIsOpen(false); }}
                  className="px-4 py-3 border border-theme-card-border/60 text-xs font-bold rounded-xl text-theme-text-muted cursor-pointer text-center"
                >
                  შესვლა
                </button>
                <button
                  onClick={() => { onNavigate("builder"); setIsOpen(false); }}
                  className="px-4 py-3 text-xs font-bold text-white bg-gradient-to-r from-brand-primary to-brand-secondary rounded-xl cursor-pointer text-center"
                >
                  დაიწყე
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
