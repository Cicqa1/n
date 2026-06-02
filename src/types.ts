export interface Job {
  id: string;
  company: string;
  logo: string; // Graphic monogram or short uppercase identifier
  logoColor?: string; // HEX or custom brand color
  logoUrl?: string; // Optional real logo image URL (future extension)
  role: string;
  baseMatchPercent: number; // default fallback match percentage
  location: string;
  sector: "IT" | "Finance" | "Marketing" | "Design" | "HR" | "Finance & Analyst";
  type: "Junior" | "Internship";
  skillTags: string[];
  description: string;
  salaryRange: string; // e.g. "500 - 800 ₾" or "ანაზღაურებადი"
  experienceLevel: "Junior" | "Internship" | "No Experience";
  remoteOnsite: "Remote" | "On-site" | "Hybrid";
  fullDescription: string;
  requirements: string[];
  responsibilities: string[];
  companyInfo: string;
}

export interface CVData {
  name: string;
  email: string;
  phone: string;
  education: string;
  projects: string;
  activities: string;
  skills: string; // comma separated input
}

export interface PolishedCV {
  id: string; // CV Unique ID
  title: string; // Custom CV description/title
  template: "classic" | "tech" | "editorial" | "modern"; // Design options
  summary: string;
  education: string;
  projects: string; // polished bullets
  activities: string; // polished bullets
  skills: string[]; // parsed tags
  name: string;
  email: string;
  phone: string;
  lastUpdated: string;
  photoUrl?: string; // Local base64 string or remote photo url
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
  picture?: string;
  password?: string; // stored locally
  preferences?: {
    interestedSectors: string[];
    preferredType: string;
  };
}

export interface JobApplication {
  id: string;
  userId: string;
  jobId: string;
  cvId: string;
  appliedAt: string;
  status: "submitted" | "processing" | "under_review";
}

export interface AIJobMatch {
  id: string;
  matchPercent: number;
  matchedSkills: string[];
  missingSkills: string[];
  tip: string;
}

