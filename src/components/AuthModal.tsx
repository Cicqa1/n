import React, { useState, useEffect } from "react";
import { X, Sparkles, ShieldCheck, CheckCircle, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { User as UserType } from "../types";
import mascotLogo from "../assets/images/firststep_new_mascot_logo_1780132225263.png";
import { auth } from "../lib/firebase";
import { GoogleAuthProvider, signInWithPopup, signInAnonymously, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { saveUserProfile } from "../lib/db";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserType) => void;
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<"login" | "signup" | "forgot">("login");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSetupInstructions, setShowSetupInstructions] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);

  // Form Field States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setError(null);
      setSuccess(false);
      setLoading(false);
      setShowSetupInstructions(false);
      setResetSuccessMessage(null);
      setActiveTab("login");
      // Reset inputs
      setEmail("");
      setPassword("");
      setFullName("");
      setConfirmPassword("");
    }
  }, [isOpen]);

  useEffect(() => {
    const handleOAuthMessage = (event: MessageEvent) => {
      // Validate origin is from standard run.app or localhost
      const origin = event.origin;
      if (!origin.endsWith(".run.app") && !origin.includes("localhost")) {
        return;
      }

      if (event.data?.type === "GOOGLE_SIGN_IN_SUCCESS") {
        const { id, email, fullName, picture, createdAt } = event.data.profile;
        handleSignInSuccess({ id, email, fullName, picture, createdAt });
      }
    };

    window.addEventListener("message", handleOAuthMessage);
    return () => window.removeEventListener("message", handleOAuthMessage);
  }, []);

  const handleSignInSuccess = async (profile: { id: string; email: string; fullName: string; picture?: string; createdAt: string }) => {
    setLoading(true);
    setError(null);

    // Resolve the final authenticated Firebase ID
    let finalId = profile.id;
    if (auth.currentUser) {
      finalId = auth.currentUser.uid;
    } else {
      const stablePassword = `StablePass_${profile.email.replace(/[^a-zA-Z0-9]/g, "")}_123!`;
      try {
        // Try to sign in using stable Credentials mapping to bypass anonymous session volatility
        const fbResult = await signInWithEmailAndPassword(auth, profile.email.toLowerCase(), stablePassword);
        finalId = fbResult.user.uid;
      } catch (authErr: any) {
        if (authErr && (authErr.code === "auth/user-not-found" || authErr.code === "auth/invalid-credential" || authErr.code === "auth/wrong-password")) {
          try {
            const fbResult = await createUserWithEmailAndPassword(auth, profile.email.toLowerCase(), stablePassword);
            finalId = fbResult.user.uid;
          } catch (createErr) {
            console.warn("Firebase stable user creation failed, falling back to anonymous auth:", createErr);
            try {
              const fbResult = await signInAnonymously(auth);
              finalId = fbResult.user.uid;
            } catch (fbInitErr) {
              console.warn("Firebase Anonymous Auth failed. Using original profile ID:", fbInitErr);
            }
          }
        } else {
          console.warn("Firebase stable auth failed, falling back to anonymous auth:", authErr);
          try {
            const fbResult = await signInAnonymously(auth);
            finalId = fbResult.user.uid;
          } catch (fbInitErr) {
            console.warn("Firebase Anonymous Auth failed. Using original profile ID:", fbInitErr);
          }
        }
      }
    }

    // Load existing users to register or login dynamically
    let usersList: UserType[] = [];
    try {
      const saved = localStorage.getItem("firststep_users");
      usersList = saved ? JSON.parse(saved) : [];
    } catch {
      usersList = [];
    }

    let existingUser = usersList.find((u) => u.email.toLowerCase() === profile.email.toLowerCase());

    if (!existingUser) {
      // Create user record if first-time oauth sign-in
      existingUser = {
        id: finalId,
        email: profile.email.toLowerCase(),
        fullName: profile.fullName,
        createdAt: profile.createdAt || new Date().toISOString(),
        picture: profile.picture || "",
        preferences: {
          interestedSectors: [],
          preferredType: "ყველა"
        }
      };
      usersList.push(existingUser);
      localStorage.setItem("firststep_users", JSON.stringify(usersList));
    } else {
      // Migrate previous localStorage cached CV list and application records to the new stable ID
      if (existingUser.id !== finalId) {
        const oldCvKey = `firststep_cvs_${existingUser.id}`;
        const newCvKey = `firststep_cvs_${finalId}`;
        const oldJobsKey = `firststep_applied_jobs_${existingUser.id}`;
        const newJobsKey = `firststep_applied_jobs_${finalId}`;
        
        try {
          const oldCvs = localStorage.getItem(oldCvKey);
          if (oldCvs) {
            localStorage.setItem(newCvKey, oldCvs);
          }
        } catch (migErr) {
          console.warn("Local storage CV migration failed:", migErr);
        }

        try {
          const oldJobs = localStorage.getItem(oldJobsKey);
          if (oldJobs) {
            localStorage.setItem(newJobsKey, oldJobs);
          }
        } catch (migErr) {
          console.warn("Local storage Jobs migration failed:", migErr);
        }
      }

      // Keep profile updated and ensure ID matches the active authenticated Firebase configuration
      existingUser.id = finalId;
      existingUser.picture = profile.picture || existingUser.picture || "";
      existingUser.fullName = profile.fullName;
      localStorage.setItem("firststep_users", JSON.stringify(usersList));
    }

    const activeUser: UserType = {
      id: existingUser.id,
      email: existingUser.email,
      fullName: existingUser.fullName,
      createdAt: existingUser.createdAt,
      picture: existingUser.picture,
      preferences: existingUser.preferences || { interestedSectors: [], preferredType: "ყველა" }
    };

    try {
      // Save profile securely to Firestore database
      await saveUserProfile(activeUser.id, activeUser);
    } catch (saveErr) {
      console.error("Firestore user profile sync error:", saveErr);
    }

    localStorage.setItem("firststep_active_user", JSON.stringify(activeUser));

    setSuccess(true);
    setLoading(false);

    setTimeout(() => {
      onAuthSuccess(activeUser);
      setSuccess(false);
      onClose();
    }, 1200);
  };

  const handleNativeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formattedEmail = email.trim().toLowerCase();
    const formattedName = fullName.trim();

    if (activeTab === "forgot") {
      if (!formattedEmail) {
        setError("გთხოვთ მიუთითოთ ელ. ფოსტა.");
        setLoading(false);
        return;
      }

      // Load existing users from LocalStorage
      let usersList: UserType[] = [];
      try {
        const saved = localStorage.getItem("firststep_users");
        usersList = saved ? JSON.parse(saved) : [];
      } catch {
        usersList = [];
      }

      const matchedUser = usersList.find((u) => u.email.toLowerCase() === formattedEmail);
      if (!matchedUser) {
        setError("მოცემული ელ. ფოსტით მომხმარებელი ვერ მოიძებნა.");
        setLoading(false);
        return;
      }

      // Found user profile, show custom demo password
      const demoPassword = matchedUser.password || "123456";
      matchedUser.password = demoPassword;
      localStorage.setItem("firststep_users", JSON.stringify(usersList));

      setPassword(demoPassword);
      setResetSuccessMessage(`პაროლის აღდგენის მოთხოვნა წარმატებულია! თქვენი დემო პაროლია: "${demoPassword}"`);
      setLoading(false);
      return;
    }

    if (!formattedEmail || !password) {
      setError("გთხოვთ შეავსოთ ყველა აუცილებელი ველი.");
      setLoading(false);
      return;
    }

    // Load existing users from space isolated localStorage
    let usersList: UserType[] = [];
    try {
      const saved = localStorage.getItem("firststep_users");
      usersList = saved ? JSON.parse(saved) : [];
    } catch {
      usersList = [];
    }

    if (activeTab === "signup") {
      if (!formattedName) {
        setError("გთხოვთ მიუთითოთ სახელი და გვარი.");
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError("პაროლები არ ემთხვევა ერთმანეთს.");
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError("პაროლი უნდა შედგებოდეს მინიმუმ 6 სიმბოლოსგან.");
        setLoading(false);
        return;
      }

      // Check if user already exists
      const emailExists = usersList.some((u) => u.email.toLowerCase() === formattedEmail);
      if (emailExists) {
        setError("მოცემული ელ. ფოსტით მომხმარებელი უკვე რეგისტრირებულია.");
        setLoading(false);
        return;
      }

      try {
        // Authenticate the user with Firebase using stable Email/Password credentials
        let fbUid = `offline_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
        try {
          const fbResult = await createUserWithEmailAndPassword(auth, formattedEmail, password);
          fbUid = fbResult.user.uid;
        } catch (signUpErr: any) {
          console.warn("Firebase email/password signup failed, attempting login/anonymous fallback:", signUpErr);
          try {
            const fbResult = await signInWithEmailAndPassword(auth, formattedEmail, password);
            fbUid = fbResult.user.uid;
          } catch (signInErr: any) {
            try {
              const fbResult = await signInAnonymously(auth);
              fbUid = fbResult.user.uid;
            } catch (fbInitErr) {
              console.warn("Firebase Anonymous Auth failed or is disabled. Proceeding with offline UID fallback...", fbInitErr);
            }
          }
        }

        const newUser: UserType = {
          id: fbUid,
          email: formattedEmail,
          fullName: formattedName,
          createdAt: new Date().toISOString(),
          password: password, // For simulation/demo purposes locally
          preferences: {
            interestedSectors: [],
            preferredType: "ყველა"
          }
        };

        // Write directly to our secure Firestore collection
        try {
          await saveUserProfile(fbUid, newUser);
        } catch (saveErr) {
          console.warn("Firestore user profile sync warning:", saveErr);
        }

        usersList.push(newUser);
        localStorage.setItem("firststep_users", JSON.stringify(usersList));
        localStorage.setItem("firststep_active_user", JSON.stringify(newUser));

        setSuccess(true);
        setLoading(false);
        setTimeout(() => {
          onAuthSuccess(newUser);
          setSuccess(false);
          onClose();
        }, 1200);
      } catch (fbErr: any) {
        console.error("Firebase Auth sign-up error:", fbErr);
        setError("ავტორიზაციის შეცდომა: " + (fbErr.message || fbErr));
        setLoading(false);
      }

    } else {
      // Handle native login
      const matchedUser = usersList.find(
        (u) => u.email.toLowerCase() === formattedEmail && u.password === password
      );

      if (!matchedUser) {
        setError("ელ. ფოსტა ან პაროლი არასწორია. გთხოვთ სცადოთ თავიდან.");
        setLoading(false);
        return;
      }

      try {
        // Authenticate session symmetrically on Firebase Auth
        let fbUid = matchedUser.id || `offline_${Date.now()}`;
        try {
          const fbResult = await signInWithEmailAndPassword(auth, formattedEmail, password);
          fbUid = fbResult.user.uid;
        } catch (signInErr: any) {
          console.warn("Firebase stable auth failed or is disabled. Attempting anonymous auth fallback...", signInErr);
          try {
            const fbResult = await signInAnonymously(auth);
            fbUid = fbResult.user.uid;
          } catch (fbInitErr) {
            console.warn("Firebase Anonymous Auth failed or is disabled. Proceeding with fallback UID...", fbInitErr);
          }
        }

        if (matchedUser.id !== fbUid) {
          // Migrate cached locally stored records
          const oldCvKey = `firststep_cvs_${matchedUser.id}`;
          const newCvKey = `firststep_cvs_${fbUid}`;
          const oldJobsKey = `firststep_applied_jobs_${matchedUser.id}`;
          const newJobsKey = `firststep_applied_jobs_${fbUid}`;
          
          try {
            const oldCvs = localStorage.getItem(oldCvKey);
            if (oldCvs) localStorage.setItem(newCvKey, oldCvs);
          } catch {}
          try {
            const oldJobs = localStorage.getItem(oldJobsKey);
            if (oldJobs) localStorage.setItem(newJobsKey, oldJobs);
          } catch {}
          
          // Symmetrically keep matchedUser updated in usersList
          matchedUser.id = fbUid;
          localStorage.setItem("firststep_users", JSON.stringify(usersList));
        }

        const mappedUser: UserType = {
          ...matchedUser,
          id: fbUid
        };

        // Sync local user attributes to Firestore
        try {
          await saveUserProfile(fbUid, mappedUser);
        } catch (saveErr) {
          console.warn("Firestore user profile sync warning:", saveErr);
        }

        localStorage.setItem("firststep_active_user", JSON.stringify(mappedUser));
        setSuccess(true);
        setLoading(false);
        setTimeout(() => {
          onAuthSuccess(mappedUser);
          setSuccess(false);
          onClose();
        }, 1200);
      } catch (fbErr: any) {
        console.error("Firebase Auth sign-in error:", fbErr);
        setError("ავტორიზაციის შეცდომა: " + (fbErr.message || fbErr));
        setLoading(false);
      }
    }
  };

  const handleContinueWithGoogle = async () => {
    setError(null);
    setLoading(true);

    try {
      // Standard recommended Firebase popup Google Provider Authentication
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const fbUser = result.user;

      const profile: UserType = {
        id: fbUser.uid,
        email: fbUser.email?.toLowerCase() || "",
        fullName: fbUser.displayName || "სტუდენტი",
        createdAt: new Date().toISOString(),
        picture: fbUser.photoURL || "",
        preferences: {
          interestedSectors: [],
          preferredType: "ყველა"
        }
      };

      await handleSignInSuccess(profile);
    } catch (fbErr: any) {
      if (fbErr && (fbErr.code === "auth/popup-closed-by-user" || fbErr.message?.includes("closed-by-user") || fbErr.message?.includes("popup_closed_by_user") || fbErr.message?.includes("cancelled"))) {
        console.log("Firebase Google standard popup closed by user or cancelled.");
        setLoading(false);
        setError("ავტორიზაციის ფანჯარა დაიხურა მომხმარებლის მიერ.");
        return;
      }

      console.warn("Firebase Google Auth standard popup aborted or error, attempting custom OAuth flow fallback...", fbErr);
      
      const rawClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
      const googleClientId = rawClientId.trim().replace(/^['"]|['"]$/g, "");
      const hasRealClientId = googleClientId !== "" && googleClientId !== "YOUR_GOOGLE_CLIENT_ID";

      const width = 500;
      const height = 660;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      const redirectUri = `${window.location.origin}/auth/google-callback`;
      const popupUrl = hasRealClientId 
        ? `https://accounts.google.com/o/oauth2/v2/auth?client_id=${googleClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent("openid profile email")}&prompt=select_account`
        : "/auth/google-popup";

      console.log(hasRealClientId ? "Opening standard Google OAuth configuration popup..." : "Opening mockup social database login...");
      const authWindow = window.open(
        popupUrl,
        "google_oauth_popup",
        `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes`
      );

      if (!authWindow) {
        setLoading(false);
        setError("ფანჯრის გახსნა დაიბლოკა. გთხოვთ ჩართოთ Popup-ების უფლება ბრაუზერში.");
        return;
      }

      const checkTimer = setInterval(() => {
        if (!authWindow || authWindow.closed) {
          clearInterval(checkTimer);
          setLoading(false);
        }
      }, 500);
    }
  };

  if (!isOpen) return null;

  if (showSetupInstructions) {
    return (
      <div 
        className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn animate-duration-150 cursor-pointer" 
        id="auth-modal-overlay"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <div className="relative w-full max-w-md bg-theme-card-bg rounded-2xl shadow-2xl border border-theme-card-border overflow-hidden transform transition-all duration-300 scale-100 flex flex-col p-6 cursor-default" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center pb-4 border-b border-theme-card-border mb-4">
            <h3 className="text-sm font-extrabold text-theme-text flex items-center gap-2">
              <svg className="w-5 h-5 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
              <span>სისტემის კონფიგურაცია საჭიროა</span>
            </h3>
            <button
              onClick={() => setShowSetupInstructions(false)}
              className="p-1 px-2.5 bg-theme-input-bg text-theme-text hover:bg-theme-card-border rounded-lg text-[11px] font-bold cursor-pointer"
            >
              უკან
            </button>
          </div>

          <div className="space-y-4 text-xs text-theme-text text-left">
            <p className="leading-relaxed text-theme-text/80 font-sans">
              ბრაუზერის <strong>რეალური Google ანგარიშების</strong> გამოყენებისთვის აუცილებელია Google Cloud Console-ზე თქვენი აპლიკაციის რეგისტრაცია და <span className="font-mono bg-theme-input-bg px-1 rounded text-rose-500">VITE_GOOGLE_CLIENT_ID</span> პარამეტრის მინიჭება.
            </p>

            <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-xl space-y-2">
              <h4 className="font-extrabold text-amber-600 text-[11px] font-sans">როგორ დავაკონფიგურიროთ?</h4>
              <ol className="list-decimal list-inside space-y-1.5 text-[11px] leading-normal text-theme-text/80 font-sans">
                <li>გახსენით <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-brand-primary underline hover:text-brand-primary/80 font-bold font-sans">Google Cloud Console</a></li>
                <li>შექმენით <strong>OAuth Web App Client ID</strong></li>
                <li>დაამატეთ ორივე ქვემოთ მოცემული მისამართი შესაბამის ველებში (Origins და Redirect URIs)</li>
                <li>დააკოპირეთ მიღებული <code className="bg-theme-card-bg px-1 py-0.5 rounded border border-theme-card-border font-mono text-[10px]">Client ID</code></li>
                <li>ჩაწერეთ იგი პროექტის settings-ში (Environment Variables) ან <code className="bg-theme-card-bg px-1 py-0.5 rounded border border-theme-card-border font-mono text-[10px]">.env</code> ფაილში:
                  <div className="mt-1.5 font-mono text-[10px] bg-theme-card-bg p-2 rounded border border-theme-card-border break-all text-emerald-500 select-all">
                    VITE_GOOGLE_CLIENT_ID="თქვენი-client-id"
                  </div>
                </li>
              </ol>
            </div>

            <div className="space-y-3">
              <div className="space-y-1 bg-theme-input-bg p-3 rounded-xl border border-theme-card-border">
                <span className="font-black text-[10px] uppercase text-theme-text/40 block font-sans">სავალდებულო Authorized JavaScript Origins:</span>
                <div className="font-mono text-[10px] space-y-1 text-theme-text/70 select-all">
                  <div className="p-1.5 bg-theme-card-bg rounded border border-theme-card-border truncate">http://localhost:3000</div>
                  <div className="p-1.5 bg-theme-card-bg rounded border border-theme-card-border truncate">https://ais-dev-l4ge4rifaxvgu7gl2ddtji-320144871901.europe-west2.run.app</div>
                  <div className="p-1.5 bg-theme-card-bg rounded border border-theme-card-border truncate">https://ais-pre-l4ge4rifaxvgu7gl2ddtji-320144871901.europe-west2.run.app</div>
                </div>
              </div>

              <div className="space-y-1 bg-theme-input-bg p-3 rounded-xl border border-theme-card-border border-amber-500/30">
                <span className="font-black text-[10px] uppercase text-amber-500 block font-sans">სავალდებულო Authorized Redirect URIs:</span>
                <div className="font-mono text-[10px] space-y-1 text-theme-text/70 select-all">
                  <div className="p-1.5 bg-theme-card-bg rounded border border-theme-card-border truncate font-bold text-amber-500">http://localhost:3000/auth/google-callback</div>
                  <div className="p-1.5 bg-theme-card-bg rounded border border-theme-card-border truncate font-bold text-amber-500">https://ais-dev-l4ge4rifaxvgu7gl2ddtji-320144871901.europe-west2.run.app/auth/google-callback</div>
                  <div className="p-1.5 bg-theme-card-bg rounded border border-theme-card-border truncate font-bold text-amber-500">https://ais-pre-l4ge4rifaxvgu7gl2ddtji-320144871901.europe-west2.run.app/auth/google-callback</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-theme-card-border flex flex-col gap-2">
            <button
              onClick={() => setShowSetupInstructions(false)}
              className="w-full py-2 bg-theme-input-bg text-theme-text border border-theme-card-border hover:bg-theme-card-border text-xs font-bold text-center rounded-xl cursor-pointer font-sans"
            >
              გასაგებია, უკან დაბრუნება
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn animate-duration-150 cursor-pointer" 
      id="auth-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="relative w-full max-w-md bg-theme-card-bg rounded-2xl shadow-2xl border border-theme-card-border overflow-hidden transform transition-all duration-300 scale-100 flex flex-col cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Success Overlay state */}
        {success && (
          <div className="absolute inset-0 z-50 bg-theme-card-bg/98 flex flex-col items-center justify-center p-8 text-center animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-black text-theme-text font-sans">
              ავტორიზაცია წარმატებულია!
            </h3>
            <p className="text-xs text-theme-text/60 mt-1">მზადდება თქვენი სამუშაო სივრცე...</p>
          </div>
        )}

        {/* Modal Header */}
        <div className="px-6 pt-6 pb-2 flex justify-between items-center bg-transparent">
          <div className="flex items-center space-x-2">
            <img
              src={mascotLogo}
              alt="FirstStep Logo"
              className="h-8 w-8 object-contain rounded-lg"
              referrerPolicy="no-referrer"
            />
            <span className="text-sm font-extrabold tracking-tight text-theme-text">
              First<span className="text-brand-secondary font-normal">Step</span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-theme-text/40 hover:bg-theme-input-bg hover:text-theme-text transition-colors cursor-pointer"
            id="auth-modal-close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Navigation / Tabs */}
        {activeTab !== "forgot" && (
          <div className="px-6 mt-4">
            <div className="flex border-b border-theme-card-border">
              <button
                onClick={() => { setActiveTab("login"); setError(null); }}
                className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                  activeTab === "login"
                    ? "border-brand-primary text-brand-primary"
                    : "border-transparent text-theme-text/50 hover:text-theme-text/80"
                }`}
              >
                შესვლა
              </button>
              <button
                onClick={() => { setActiveTab("signup"); setError(null); }}
                className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                  activeTab === "signup"
                    ? "border-brand-primary text-brand-primary"
                    : "border-transparent text-theme-text/50 hover:text-theme-text/80"
                }`}
              >
                რეგისტრაცია
              </button>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[80vh]">
          
          <div className="text-left space-y-1">
            <h2 className="text-lg font-black text-theme-text leading-snug font-sans">
              {activeTab === "forgot" 
                ? "პაროლის აღდგენა" 
                : activeTab === "login" 
                  ? "ანგარიშზე შესვლა" 
                  : "ახალი ანგარიშის შექმნა"}
            </h2>
            <p className="text-xs text-theme-text/60 font-sans">
              {activeTab === "forgot"
                ? "შეიყვანეთ თქვენი ელ. ფოსტა დემო პაროლის აღსადგენად"
                : activeTab === "login" 
                  ? "შეიყვანეთ მონაცემები პორტალზე შესასვლელად"
                  : "შექმენით ანგარიში რათა გამოიყენოთ ყველა სტუდენტური სერვისი"
              }
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-[11px] text-red-500 rounded-xl leading-relaxed font-semibold text-left">
              ⚠️ {error}
            </div>
          )}

          {resetSuccessMessage && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-500 rounded-xl leading-relaxed font-semibold text-left font-sans animate-fadeIn">
              ✨ {resetSuccessMessage}
            </div>
          )}

          {/* Form Content */}
          <form onSubmit={handleNativeSubmit} className="space-y-4 text-left">
            
            {activeTab === "signup" && (
              <div className="space-y-1.5 animate-fadeIn">
                <label className="text-xs font-bold text-theme-text/75">სახელი და გვარი</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-theme-text/30">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="მაგ: გიორგი ბერიძე"
                    className="w-full pl-9 pr-4 py-2.5 text-xs bg-theme-input-bg border border-theme-card-border rounded-xl text-theme-text placeholder-theme-text/30 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-theme-text/75 font-sans">ელ. ფოსტა</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-theme-text/30">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="მაგ: g.beridze@edu.ge"
                  className="w-full pl-9 pr-4 py-2.5 text-xs bg-theme-input-bg border border-theme-card-border rounded-xl text-theme-text placeholder-theme-text/30 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 outline-none transition-all"
                />
              </div>
            </div>

            {activeTab !== "forgot" && (
              <div className="space-y-1.5 animate-fadeIn">
                <label className="text-xs font-bold text-theme-text/75 font-sans">პაროლი</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-theme-text/30">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 text-xs bg-theme-input-bg border border-theme-card-border rounded-xl text-theme-text placeholder-theme-text/30 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-theme-text/30 hover:text-theme-text/50 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {activeTab === "login" && (
              <div className="flex justify-end pr-1">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("forgot");
                    setError(null);
                    setResetSuccessMessage(null);
                  }}
                  className="text-[10px] text-brand-primary hover:underline font-bold cursor-pointer font-sans"
                >
                  დაგავიწყდათ პაროლი?
                </button>
              </div>
            )}

            {activeTab === "signup" && (
              <div className="space-y-1.5 animate-fadeIn">
                <label className="text-xs font-bold text-theme-text/75 font-sans">გაიმეორეთ პაროლი</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-theme-text/30">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-4 py-2.5 text-xs bg-theme-input-bg border border-theme-card-border rounded-xl text-theme-text placeholder-theme-text/30 focus:border-brand-primary focus:ring-1 focus:ring-brand-primary/20 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 mt-2 text-xs font-black tracking-wider uppercase text-white bg-brand-primary hover:bg-brand-primary/95 rounded-xl transition-all shadow-md active:scale-99 cursor-pointer flex items-center justify-center gap-2 font-sans"
            >
              <span>{activeTab === "forgot" ? "პაროლის აღდგენა" : activeTab === "login" ? "შესვლა" : "რეგისტრაცია"}</span>
            </button>

            {activeTab === "forgot" && (
              <button
                type="button"
                onClick={() => {
                  setActiveTab("login");
                  setError(null);
                  setResetSuccessMessage(null);
                }}
                className="text-[11px] text-brand-primary hover:underline font-bold block mx-auto text-center cursor-pointer mt-2 font-sans"
              >
                უკან ავტორიზაციაზე
              </button>
            )}
          </form>

          {activeTab !== "forgot" && (
            <>
              {/* Separator */}
              <div className="relative flex py-1 items-center animate-fadeIn font-sans">
                <div className="flex-grow border-t border-theme-card-border"></div>
                <span className="flex-shrink mx-3 text-[9px] uppercase font-bold text-theme-text/30 tracking-wider">ან გააგრძელეთ</span>
                <div className="flex-grow border-t border-theme-card-border"></div>
              </div>

              {/* Google SSO Button */}
              <div className="space-y-2 animate-fadeIn">
                <button
                  onClick={handleContinueWithGoogle}
                  disabled={loading}
                  className="w-full py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 active:bg-slate-100 dark:active:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-2.5 shadow-sm hover:shadow active:scale-99 disabled:opacity-75 font-sans"
                  id="auth-google-btn"
                  type="button"
                >
                  {loading ? (
                    <div className="w-4 h-4 rounded-full border-2 border-slate-300 border-t-slate-600 animate-spin" />
                  ) : (
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                    </svg>
                  )}
                  <span>ავტორიზაცია Google-ით</span>
                </button>
              </div>
            </>
          )}

          <div className="pt-4 border-t border-theme-card-border flex items-center justify-center gap-1.5 text-[10px] text-theme-text/45 font-bold font-sans">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>დაცული ავტორიზაცია და დაშიფრული კავშირი</span>
          </div>
        </div>

        <div className="bg-theme-input-bg/15 px-6 py-4 border-t border-theme-card-border text-center font-sans">
          <p className="text-[10px] text-theme-text/40 leading-relaxed max-w-xs mx-auto">
            შესვლით თქვენ ეთანხმებით პორტალის წესებს და უზრუნველყოფთ თქვენი მონაცემების უსაფრთხო დამუშავებას.
          </p>
        </div>

      </div>
    </div>
  );
}
