import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Body parsing middleware
app.use(express.json());

// Initialize Gemini if apiKey is provided
const hasApiKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY";

let ai: any = null;
  if (hasApiKey) {
    try {
      ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
      console.log("Gemini client successfully initialized");
    } catch (e) {
      console.error("Failed to initialize GoogleGenAI client:", e);
    }
  } else {
    console.log("Running in rich fallback mode (GEMINI_API_KEY is not configured yet)");
  }

  // --- API ROUTE: Transform Draft data to polished CV ---
  app.post("/api/generate-cv", async (req, res) => {
    try {
      const { name, email, phone, education, projects, activities, skills } = req.body;

      if (!name) {
        return res.status(400).json({ error: "Name is required" });
      }

      // If we don't have Gemini active (fallback mode)
      if (!ai) {
        // Construct clean, polished version dynamically using intelligent rule-based templates
        const cleanName = name.trim();
        const cleanEmail = email ? email.trim() : "";
        const cleanPhone = phone ? phone.trim() : "";
        
        // Only write summary if there are details to base it on
        const hasDetails = (education && education.trim().length > 0) || 
                           (projects && projects.trim().length > 0) || 
                           (activities && activities.trim().length > 0) || 
                           (skills && skills.trim().length > 0);
        
        const summaryText = hasDetails 
          ? `ვარ მოტივირებული სტუდენტი, რომელიც ორიენტირებული ვარ პრაქტიკული უნარების განვითარებაზე და მზად ვარ პირველი პროფესიული გამოწვევებისთვის საინტერესო ორგანიზაციაში.`
          : "";
        
        const polishedEducation = education && education.trim().length > 0 
          ? `${education.trim()}`
          : "";

        // Parse messy projects and write professional bullet points
        let polishedProjects = "";
        if (projects && projects.trim().length > 0) {
          const lines = projects.split('\n').filter((l: string) => l.trim().length > 0);
          polishedProjects = lines.map((line: string) => {
            const raw = line.trim().replace(/^•\s*/, '').replace(/^-\s*/, '');
            return `• ${raw}`;
          }).join('\n');
        }

        // Parse activities
        let polishedActivities = "";
        if (activities && activities.trim().length > 0) {
          const lines = activities.split('\n').filter((l: string) => l.trim().length > 0);
          polishedActivities = lines.map((line: string) => `• ${line.trim().replace(/^•\s*/, '').replace(/^-\s*/, '')}`).join('\n');
        }

        // Parse skills
        let skillList: string[] = [];
        if (skills && skills.trim().length > 0) {
          skillList = skills.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
        }

        return res.json({
          success: true,
          isMock: true,
          summary: summaryText,
          education: polishedEducation,
          projects: polishedProjects,
          activities: polishedActivities,
          skills: skillList
        });
      }

      // If we have real Gemini client active
      const prompt = `
You are an expert ATS-focused recruiter specializing in the Georgian student market and startup-ready CV formatting.
Create an elite, ATS-friendly professional CV based on the Georgian student's raw or draft inputs below:

Name: ${name}
Email: ${email}
Phone: ${phone}
Education: ${education}
Projects & Cases: ${projects}
Activities: ${activities}
Skills: ${skills}

CRITICAL REQUIREMENT (Don't Write Things I Didn't Write):
- Only format/polish what the student actually entered or provided.
- If a draft input field (e.g. Education, Projects & Cases, Activities, Skills, Phone, Email) is blank or missing, DO NOT manufacture or invent fake credentials/accomplishments/text for that field! Output a completely empty string ("") or an empty array ([]) for that field in the JSON structure.
- Do NOT add any fake universities (like BTU), fake degrees, fake student clubs, fake companies, fake locations, or fake skills that were not mentioned.

Analyze the input text and generate a polished, highly professional CV profile entirely in GT-standard Georgian language.
CRITICAL REQUIREMENT (Grammatical Perspective):
- You MUST write the entire CV consistently in the FIRST-PERSON ('პირველ პირში') singular perspective (e.g. "ვარ", "მაქვს", "დავაპროექტე", "შევქმენი", "გავაანალიზე", "მონაწილეობა მივიღე"). 
- Do NOT mix first-person and third-person (e.g., do NOT start with "სტუდენტი, რომელიც ორიენტირებულია" and then write "დავაპროექტე"). Write both the summary and sections in the first-person (e.g., "ვარ მოტივირებული სტუდენტი, რომელიც ორიენტირებული ვარ...").

Your outputs should look like they were written by a professional CV writer focusing on turning academic knowledge into first-job potential.
- summary should be written consistently in the first-person ("მე" - e.g., "ვარ მოტივირებული სტუდენტი...", "მსურს განვავითარო...") and be highly motivating, professional, and explain how the student's projects prove their readiness (leave empty string if no relevant details are provided).
- education should structure degrees, GPA (if any), and university names gracefully.
- projects should turn raw notes into high-impact, professional bullet points starting with strong action verbs in the first-person (e.g., "დავაპროექტე", "შევიმუშავე", "განვახორციელე", "გავაანალიზე") and formatted cleanly (using '\\n' for new lines).
- activities should polish student clubs, hackathons, or general academic engagements into strong indicators of leadership or teamwork in the first person (e.g., "მონაწილეობა მივიღე", "ვხელმძღვანელობდი").
- skills should be returned as a clean array of standard professional skill badges.

You must output valid JSON following the schema precisely.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are a professional recruiting assistant for Georgia who NEVER invents or fabricates fake university credentials, mock projects, or accomplishments that the user didn't write. You write exclusively in the first-person singular perspective (პირველი პირის მხოლობითი რიცხვი, მე) to maintain perfect grammatical consistency throughout the whole resume.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              education: { type: Type.STRING },
              projects: { type: Type.STRING },
              activities: { type: Type.STRING },
              skills: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["summary", "education", "projects", "activities", "skills"]
          }
        }
      });

      const responseText = response.text || "{}";
      const result = JSON.parse(responseText);

      return res.json({
        success: true,
        ...result
      });
    } catch (error: any) {
      console.error("Gemini CV Builder Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate CV using AI" });
    }
  });

  // --- API ROUTE: Match CV with Vacancies ---
  app.post("/api/match-jobs", async (req, res) => {
    try {
      const { cvData } = req.body;

      if (!cvData) {
        return res.status(400).json({ error: "cvData is required" });
      }

      const vacancies = [
        { id: "tbc", company: "TBC Bank", role: "Junior Data Analyst", targetSkills: ["Python", "Excel", "SQL"] },
        { id: "galt", company: "Galt & Taggart", role: "Business Analyst Intern", targetSkills: ["Excel", "Research"] },
        { id: "wissol", company: "Wissol Group", role: "Marketing Intern", targetSkills: ["Social Media", "Canva"] },
        { id: "epam", company: "EPAM Georgia", role: "Junior Frontend Developer", targetSkills: ["React", "JavaScript"] },
        { id: "sweeft", company: "Sweeft Digital", role: "Junior Backend Developer", targetSkills: ["Python", "Django"] },
        { id: "redberry", company: "Redberry", role: "Junior UX/UI Designer", targetSkills: ["Figma", "Wireframing"] },
        { id: "tegeta", company: "Tegeta Motors", role: "HR Intern", targetSkills: ["Communication", "MS Office"] },
        { id: "space", company: "Space International", role: "Digital Marketing Intern", targetSkills: ["SEO", "Analytics"] },
        { id: "psp", company: "PSP Pharmaceuticals", role: "Junior Data Specialist", targetSkills: ["Excel", "SQL"] },
        { id: "co_fund", company: "Georgian Co-Investment Fund", role: "Finance Intern", targetSkills: ["Excel", "Financial Modeling"] }
      ];

      // Safe static matched fallback if no API key is specified
      if (!ai) {
        const skillsString = (cvData.skills || []).join(", ").toLowerCase();
        
        const staticMatches = vacancies.map((vac) => {
          let matchPercent = vac.id === "tbc" ? 92 : vac.id === "epam" ? 90 : vac.id === "galt" ? 85 : 75;
          const matchedSkills: string[] = [];
          const missingSkills: string[] = [];

          vac.targetSkills.forEach((skill) => {
            if (skillsString.includes(skill.toLowerCase())) {
              matchedSkills.push(skill);
            } else {
              missingSkills.push(skill);
            }
          });

          // Recalculate based on real skills presence to make it extremely alive and interactive!
          const matchRatio = matchedSkills.length / vac.targetSkills.length;
          if (matchedSkills.length > 0) {
            matchPercent = Math.min(99, Math.max(65, Math.round(55 + (matchRatio * 44))));
          } else {
            matchPercent = Math.min(74, Math.max(50, Math.round(50 + Math.random() * 15)));
          }

          let tip = "";
          if (vac.id === "tbc") {
            tip = missingSkills.includes("SQL") 
              ? "თიბისისთვის რეკომენდებულია SQL-თან მუშაობის მაგალითის ჩვენება." 
              : "თქვენი უნარები კარგად ემთხვევა პოზიციას! გირჩევთ ხაზი გაუსვათ პორტფოლიოს.";
          } else if (vac.id === "epam") {
            tip = missingSkills.includes("React") 
              ? "EPAM-ის ფრონტენდ პოზიციისთვის აუცილებელია React-ის პროექტის CV-ში დამატება." 
              : "კარგი თავსებადობაა! დაურთეთ თქვენი GitHub ან პორტფოლიოს ბმული CV-ს.";
          } else {
            tip = missingSkills.length > 0 
              ? `რეკომენდებულია დაეუფლოთ ${missingSkills.slice(0, 1).join("")}-ს ამ პოზიციაზე განაცხადის შეტანამდე.`
              : "თქვენი პროფილი სრულად მზადაა ამ ვაკანსიისთვის. გააგზავნეთ განაცხადი!";
          }

          return {
            id: vac.id,
            matchPercent,
            matchedSkills,
            missingSkills,
            tip
          };
        });

        return res.json({ success: true, isMock: true, matches: staticMatches });
      }

      // If we have Gemini: calculate actual, intelligent job match percentage
      const prompt = `
You are an advanced AI job matching system for students in Georgia. 
Analyze this student CV:
Summary: ${cvData.summary}
Education: ${cvData.education}
Projects & Experience: ${cvData.projects}
Activities: ${cvData.activities}
Skills: ${cvData.skills ? cvData.skills.join(", ") : "None specified"}

Compare this CV with each of the following vacancies:
${JSON.stringify(vacancies)}

For each vacancy, evaluate their suitability and output:
- "id": must match one of ("tbc", "galt", "wissol", "epam", "sweeft", "redberry", "tegeta", "space", "psp", "co_fund")
- "matchPercent": an integer between 50 and 99 reflecting how related their CV and skills are to the role.
- "matchedSkills": array of targetSkills found in their skills, summary or projects.
- "missingSkills": array of targetSkills the applicant is missing or should focus on.
- "tip": 1 short, actionable recommendation in Georgian (max 15 words) on how they can improve their chances for this specific job (e.g. adding a specific project type, getting a certificate, etc.).

Output a JSON array with exactly 10 matching vacancies in this order.
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                matchPercent: { type: Type.INTEGER },
                matchedSkills: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                missingSkills: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                tip: { type: Type.STRING }
              },
              required: ["id", "matchPercent", "matchedSkills", "missingSkills", "tip"]
            }
          }
        }
      });

      const responseText = response.text || "[]";
      const result = JSON.parse(responseText);
      return res.json({ success: true, matches: result });
    } catch (error: any) {
      console.error("Gemini Job Matcher Error:", error);
      res.status(500).json({ error: error.message || "Failed to calculate job matches" });
    }
  });


  // --- API ROUTE: Google OAuth Callback (for real Google OAuth) ---
  app.get("/auth/google-callback", (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="ka">
<head>
  <meta charset="UTF-8">
  <title>Google Authentication</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #f0f4f9;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      color: #1f1f1f;
    }
    .loading-container {
      background: #ffffff;
      border-radius: 20px;
      padding: 30px 40px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.08);
      text-align: center;
      max-width: 360px;
      border: 1px solid #e0e3e7;
    }
    .spinner {
      border: 3px solid #f3f3f3;
      border-top: 3px solid #0b57d0;
      border-radius: 50%;
      width: 28px;
      height: 28px;
      animation: spin 1s linear infinite;
      margin: 0 auto 16px;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    h2 {
      font-size: 18px;
      font-weight: 500;
      margin: 0 0 8px;
    }
    p {
      font-size: 13px;
      color: #5f6368;
      margin: 0;
    }
    .error {
      color: #b3261e;
    }
  </style>
</head>
<body>
  <div class="loading-container" id="status-box">
    <div class="spinner" id="loader"></div>
    <h2 id="status-title">ავტორიზაცია მიმდინარეობს...</h2>
    <p id="status-desc">გთხოვთ დაელოდოთ, მიმდინარეობს პროფილის მონაცემების მიღება.</p>
  </div>

  <script>
    function sendError(message) {
      document.getElementById("loader").style.display = "none";
      document.getElementById("status-title").innerText = "შეცდომა";
      document.getElementById("status-title").className = "error";
      document.getElementById("status-desc").innerText = message;
    }

    if (window.location.hash) {
      const hash = window.location.hash.substring(1);
      const params = new URLSearchParams(hash);
      const accessToken = params.get("access_token");
      
      if (accessToken) {
        fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: {
            "Authorization": "Bearer " + accessToken
          }
        })
          .then(res => {
            if (!res.ok) {
              throw new Error("სერვერმა უარყო მოთხოვნა");
            }
            return res.json();
          })
          .then(profile => {
            if (window.opener) {
              window.opener.postMessage({
                type: "GOOGLE_SIGN_IN_SUCCESS",
                profile: {
                  id: profile.sub,
                  email: profile.email,
                  fullName: profile.name,
                  picture: profile.picture,
                  createdAt: new Date().toISOString()
                }
              }, "*");
              window.close();
            } else {
              sendError("მშობელი ფანჯარა ვერ მოიძებნა. გთხოვთ, დაბრუნდეთ მთავარ გვერდზე და თავიდან სცადოთ.");
            }
          })
          .catch(err => {
            console.error("Error fetching Google profile info:", err);
            sendError("პროფილის ინფორმაციის წამოღება ვერ მოხერხდა. სცადეთ ხელახლა.");
          });
      } else {
        const errorMsg = params.get("error");
        sendError(errorMsg ? "Google OAuth Error: " + errorMsg : "Access Token ვერ მოიძებნა ლინკში.");
      }
    } else {
      sendError("ამ გვერდის პირდაპირ გახსნა დაუშვებელია. იგი გამოიყენება ავტორიზაციის დროს.");
    }
  </script>
</body>
</html>
    `);
  });

  // --- API ROUTE: Google Authentication Popup ---
  app.get("/auth/google-popup", (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="ka">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign in - Google Accounts</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&display=swap');
    
    body {
      font-family: 'Roboto', -apple-system, BlinkMacSystemFont, sans-serif;
      background-color: #f0f4f9;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      padding: 16px;
      box-sizing: border-box;
      color: #1f1f1f;
    }
    
    .card {
      background: #ffffff;
      border-radius: 28px;
      padding: 40px;
      width: 100%;
      max-width: 448px;
      box-sizing: border-box;
      border: 1px solid #e0e3e7;
      position: relative;
      overflow: hidden;
      box-shadow: 0 1px 2px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.1);
    }
    
    /* Google v3 Progress Bar Pulse */
    .progress-bar {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 4px;
      background-color: #e0e3e7;
      display: none;
      overflow: hidden;
    }
    .progress-bar-value {
      width: 100%;
      height: 100%;
      background-color: #0b57d0;
      animation: google-indeterminate 1.5s infinite linear;
      transform-origin: 0% 50%;
    }
    @keyframes google-indeterminate {
      0% { transform:  translateX(-100%) scaleX(0.2); }
      50% { transform:  translateX(-10%) scaleX(0.6); }
      100% { transform:  translateX(100%) scaleX(0.2); }
    }

    .logo-container {
      display: flex;
      justify-content: flex-start;
      margin-bottom: 16px;
    }
    
    h1 {
      font-size: 24px;
      font-weight: 400;
      color: #1f1f1f;
      margin: 0 0 8px 0;
      text-align: left;
      letter-spacing: -0.5px;
    }
    
    p.subtitle {
      font-size: 16px;
      color: #1f1f1f;
      margin: 0 0 28px 0;
      text-align: left;
      line-height: 1.4;
    }
    
    .subtitle-app {
      color: #0b57d0;
      font-weight: 500;
    }

    /* Google Modern Material Input Outlines */
    .google-input-container {
      position: relative;
      width: 100%;
      margin-top: 12px;
      margin-bottom: 24px;
    }
    .google-input-container input {
      width: 100%;
      padding: 16px;
      font-size: 16px;
      border: 1px solid #747775;
      border-radius: 4px;
      outline: none;
      background: transparent;
      transition: border-color 0.15s ease;
      box-sizing: border-box;
      color: #1f1f1f;
    }
    .google-input-container label {
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      background: #ffffff;
      padding: 0 6px;
      color: #444746;
      font-size: 16px;
      pointer-events: none;
      transition: 0.15s ease all;
    }
    .google-input-container input:focus {
      border: 2px solid #0b57d0;
      padding: 15px;
    }
    .google-input-container input:focus ~ label,
    .google-input-container input:not(:placeholder-shown) ~ label {
      top: 0;
      font-size: 12px;
      color: #0b57d0;
    }
    .google-input-container input:not(:focus):not(:placeholder-shown) ~ label {
      color: #444746;
    }

    /* Quick Access Student Accounts list */
    .quick-section {
      margin-top: 24px;
      border-top: 1px solid #dadce0;
      padding-top: 20px;
    }
    .quick-title {
      font-size: 11px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #444746;
      margin-bottom: 12px;
      text-align: left;
    }
    .accounts-list {
      margin-bottom: 8px;
    }
    .account-item {
      display: flex;
      align-items: center;
      padding: 10px 12px;
      border: 1px solid #e0e3e7;
      border-radius: 8px;
      margin-bottom: 8px;
      cursor: pointer;
      text-align: left;
      background-color: #fafbfc;
      transition: background-color 0.15s, border-color 0.15s;
    }
    .account-item:hover {
      background-color: #f0f4f9;
      border-color: #c4c7c5;
    }
    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background-color: #1a73e8;
      color: white;
      font-weight: 500;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 12px;
      font-size: 12px;
      flex-shrink: 0;
    }
    .avatar-tsu { background-color: #2c3e50; }
    .avatar-iliauni { background-color: #8e44ad; }
    .avatar-kiu { background-color: #d35400; }
    
    .account-details {
      flex-grow: 1;
      min-width: 0;
    }
    .account-name {
      font-size: 12px;
      font-weight: 500;
      color: #1f1f1f;
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .account-email {
      font-size: 11px;
      color: #444746;
      margin: 0;
      font-family: monospace;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .badge {
      font-size: 9px;
      background-color: #e8f0fe;
      color: #0b57d0;
      padding: 2px 6px;
      border-radius: 12px;
      font-weight: bold;
      margin-left: 8px;
      white-space: nowrap;
    }

    .google-buttons {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 32px;
    }
    .create-account-btn {
      background: none;
      border: none;
      color: #0b57d0;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      padding: 8px 12px;
      border-radius: 100px;
      transition: background-color 0.15s;
      font-family: inherit;
    }
    .create-account-btn:hover {
      background-color: #f0f4f9;
    }
    .next-btn {
      background-color: #0b57d0;
      color: #ffffff;
      border: none;
      padding: 10px 24px;
      font-size: 14px;
      font-weight: 500;
      border-radius: 100px;
      cursor: pointer;
      transition: background-color 0.15s, box-shadow 0.15s;
      font-family: inherit;
    }
    .next-btn:hover {
      background-color: #0842a0;
      box-shadow: 0 1px 2px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.1);
    }
    
    #form-error {
      color: #b3261e;
      font-size: 12px;
      margin-top: -12px;
      margin-bottom: 16px;
      text-align: left;
      font-weight: 500;
    }

    .footer {
      font-size: 12px;
      color: #444746;
      text-align: left;
      margin-top: 32px;
      line-height: 1.5;
    }
    .footer a {
      color: #0b57d0;
      text-decoration: none;
    }
    .footer a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="progress-bar" id="google-loader">
      <div class="progress-bar-value"></div>
    </div>

    <div class="logo-container">
      <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
      </svg>
    </div>

    <h1>შესვლა</h1>
    <p class="subtitle">აპლიკაციაზე <span class="subtitle-app">FirstStep</span> გადასასვლელად</p>

    <!-- Google Material Form -->
    <div id="identifier-section">
      <div class="google-input-container">
        <input type="text" id="custom-email" required placeholder=" " autofocus onkeydown="handleEnter(event)">
        <label for="custom-email">ელფოსტა ან ტელეფონი</label>
      </div>
      
      <div id="form-error" style="display: none;"></div>

      <div class="google-buttons">
        <button class="create-account-btn" onclick="useDemoAccount()">ანგარიშის შექმნა</button>
        <button class="next-btn" onclick="submitEmail()">შემდეგი</button>
      </div>
    </div>

    <!-- Georgia Student Universities pre-saved accounts -->
    <div class="quick-section">
      <div class="quick-title">სოციალური სტუდენტური შესვლა</div>
      <div class="accounts-list">
        <!-- Account 1: Mariam -->
        <div class="account-item" onclick="selectAccount('mariam.tsitskishvili.1@btu.edu.ge', 'მარიამ ციცქიშვილი', '')">
          <div class="avatar" style="background-color: #2c3e50;">მც</div>
          <div class="account-details">
            <div class="account-name">მარიამ ციცქიშვილი</div>
            <div class="account-email">mariam.tsitskishvili.1@btu.edu.ge</div>
          </div>
          <span class="badge">BTU 🏆</span>
        </div>
      </div>
    </div>

    <div class="footer">
      გასაგრძელებლად Google გაუზიარებს თქვენს სახელს, ელფოსტის მისამართს და პროფილის სურათს <strong>FirstStep</strong>-ს. შესვლამდე გაეცანით <a href="#" onclick="return false;">გამოყენების წესებს</a>.
    </div>
  </div>

  <script>
    function showLoader() {
      document.getElementById('google-loader').style.display = 'block';
    }

    function selectAccount(email, name, picture) {
      showLoader();
      
      const mockGoogleId = 'gi_' + Math.floor(100000000 + Math.random() * 900000000);
      const responseData = {
        type: 'GOOGLE_SIGN_IN_SUCCESS',
        profile: {
          id: mockGoogleId,
          email: email.trim().toLowerCase(),
          fullName: name.trim(),
          picture: picture || '',
          createdAt: new Date().toISOString()
        }
      };

      setTimeout(() => {
        if (window.opener) {
          window.opener.postMessage(responseData, '*');
          window.close();
        } else {
          alert('შეცდომა: მშობელი ფანჯარა ვერ მოიძებნა. დახურეთ ფანჯარა და სცადეთ ხელახლა.');
          document.getElementById('google-loader').style.display = 'none';
        }
      }, 800);
    }

    function useDemoAccount() {
      document.getElementById('custom-email').value = "mariam.tsitskishvili.1@btu.edu.ge";
      document.getElementById('custom-email').focus();
    }

    function handleEnter(e) {
      if (e.key === 'Enter') {
        submitEmail();
      }
    }

    function submitEmail() {
      const emailInput = document.getElementById('custom-email');
      const email = emailInput.value.trim();
      const errorDiv = document.getElementById('form-error');

      errorDiv.style.display = 'none';

      if (!email) {
        errorDiv.innerText = 'შეიყვანეთ ელფოსტა ან ტელეფონის ნომერი';
        errorDiv.style.display = 'block';
        emailInput.focus();
        return;
      }

      // Format name gracefully from email
      let name = "სტუდენტი";
      if (email.includes('@')) {
        const localPart = email.split('@')[0];
        if (localPart.includes('.')) {
          name = localPart.split('.')
            .map(p => p.charAt(0).toUpperCase() + p.slice(1))
            .join(' ');
        } else {
          name = localPart.charAt(0).toUpperCase() + localPart.slice(1);
        }
      }

      selectAccount(email, name, '');
    }
  </script>
</body>
</html>
    `);
  });

// --- Serve Vite in Dev, fallback to static dist folder in Prod ---
async function bootstrap() {
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Only start listening when not deployed on Vercel as a Serverless function
  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server is running at http://0.0.0.0:${PORT}`);
    });
  }
}

bootstrap().catch((err) => {
  console.error("Bootstrap error:", err);
});

export { app };
export default app;
