import { ArrowRight, BookOpen, Star, Sparkles, AlertCircle, FileText, CheckCircle2, ChevronRight, Compass, GraduationCap } from "lucide-react";
import mascotLogo from "../assets/images/firststep_new_mascot_logo_1780132225263.png";

interface LandingPageProps {
  onNavigate: (view: string) => void;
}

export default function LandingPage({ onNavigate }: LandingPageProps) {
  return (
    <div className="bg-white" id="landing-page">
      
      {/* Hero Section */}
      <section className="relative pt-12 pb-24 md:pt-20 md:pb-32 overflow-hidden bg-[#FFFFFF]" id="hero">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[radial-gradient(#e0f2fe_1px,transparent_1px)] [background-size:24px_24px] opacity-60 pointer-events-none" />
        
        {/* Abstract gradients like Stripe/Framer */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-brand-secondary/10 to-brand-primary/5 blur-3xl rounded-full pointer-events-none" />
 
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-8 text-left">
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-brand-primary-light border border-brand-secondary/20">
                <Sparkles className="w-4 h-4 text-brand-primary" />
                <span className="text-xs font-semibold tracking-wide uppercase text-brand-primary">AI-პლატფორმა სტუდენტებისთვის</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#0f1f35] leading-[1.12]">
                გადააქციე შენი <span className="text-brand-primary">უნივერსიტეტური</span> გამოცდილება პირველ სამსახურად
              </h1>
              
              <p className="text-lg text-[#0f1f35]/80 leading-relaxed max-w-2xl">
                AI გადაჰყავს შენი პროექტები პროფესიონალურ CV-ად. შექმენი რეზიუმე რამდენიმე წამში და ავტომატურად შეუსაბამე წამყვანი ქართული კომპანიების სტაჟირებებსა და უმცროს ვაკანსიებს.
              </p>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={() => onNavigate("builder")}
                  className="inline-flex items-center justify-center px-8 py-4 text-sm font-bold tracking-wider uppercase text-white rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary shadow-lg shadow-slate-200 hover:shadow-xl hover:opacity-95 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
                  id="hero-cta-primary"
                >
                  <span>CV-ს შექმნა</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
                <button
                  onClick={() => onNavigate("jobs")}
                  className="inline-flex items-center justify-center px-8 py-4 text-sm font-bold tracking-wider uppercase text-brand-primary bg-white border border-slate-200 rounded-xl hover:border-slate-300 hover:bg-slate-50 shadow-sm hover:shadow transition-all duration-300 cursor-pointer"
                  id="hero-cta-secondary"
                >
                  ვაკანსიების ნახვა
                </button>
              </div>
            </div>
 
            {/* Right Dashboard Mockup Visual */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-[450px] lg:max-w-none">
                
                {/* Floating UI Card 1 */}
                <div className="absolute -top-10 -left-6 bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-lg border border-slate-100 z-10 w-52 animate-bounce-subtle pointer-events-none">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-primary-light flex items-center justify-center text-brand-primary">
                      <Sparkles className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-medium text-slate-400">AI ტრანსფორმაცია</p>
                      <p className="text-xs font-bold text-[#0f1f35]">CV გადამუშავდა</p>
                    </div>
                  </div>
                </div>
 
                {/* Floating UI Card 2 */}
                <div className="absolute -bottom-6 -right-4 bg-white/95 backdrop-blur-md p-4 rounded-xl shadow-lg border border-slate-100 z-10 w-48 pointer-events-none">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[#0f1f35]">TBC-სთან თავსებადობა</span>
                    <span className="text-xs font-extrabold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">92%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: "92%" }}></div>
                  </div>
                </div>
 
                {/* Main Mockup Container */}
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 shadow-xl overflow-hidden relative">
                  <div className="bg-white rounded-[13px] p-5 shadow-sm border border-slate-100/80 min-h-[380px] flex flex-col justify-between">
                    
                    {/* Mockup Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                      </div>
                      <div className="px-3 py-1 rounded-md bg-brand-primary-light text-[10px] text-brand-primary font-mono">
                        firststep.ge/preview
                      </div>
                    </div>
                    
                    {/* Mockup CV Body */}
                    <div className="flex-1 py-4 space-y-4 text-left">
                      <div className="space-y-1">
                        <div className="h-4 bg-slate-900 w-1/3 rounded-md"></div>
                        <div className="h-2.5 bg-brand-primary w-20 rounded-sm"></div>
                      </div>
 
                      <div className="space-y-1.5 pt-2">
                        <div className="h-2 w-full bg-slate-100 rounded-sm"></div>
                        <div className="h-2 w-11/12 bg-slate-100 rounded-sm"></div>
                        <div className="h-2 w-10/12 bg-slate-100 rounded-sm"></div>
                      </div>
 
                      <div className="border border-slate-100 rounded-lg p-3 bg-slate-50/50 space-y-2">
                        <div className="flex items-center space-x-1.5">
                          <div className="w-2 h-2 rounded-full bg-brand-primary"></div>
                          <div className="h-2.5 bg-slate-700 w-24 rounded-sm"></div>
                        </div>
                        <div className="h-2 bg-slate-200 w-full rounded-sm"></div>
                        <div className="h-2 bg-slate-200 w-5/6 rounded-sm"></div>
                      </div>
 
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <span className="px-2 py-1 bg-brand-primary-light text-brand-primary text-[9px] font-bold rounded-md">React</span>
                        <span className="px-2 py-1 bg-brand-primary-light text-brand-primary text-[9px] font-bold rounded-md">Excel</span>
                        <span className="px-2 py-1 bg-brand-primary-light text-brand-primary text-[9px] font-bold rounded-md">Figma</span>
                        <span className="px-2 py-1 bg-brand-primary-light text-brand-primary text-[9px] font-bold rounded-md">SQL</span>
                      </div>
                    </div>
 
                    <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                      <div className="flex items-center space-x-1.5">
                        <img
                          src={mascotLogo}
                          alt="FirstStep logo"
                          className="h-6 w-6 object-contain rounded-md"
                          referrerPolicy="no-referrer"
                        />
                        <span className="text-[10px] font-semibold text-slate-400">FirstStep CV Builder</span>
                      </div>
                      <div className="w-16 h-5 bg-brand-secondary/15 rounded-md flex items-center justify-center">
                        <span className="text-[9px] font-extrabold text-brand-secondary">დახვეწილი</span>
                      </div>
                    </div>
                  </div>
                </div>
 
              </div>
            </div>
 
          </div>
        </div>
      </section>
 
      {/* Feature Badges below Hero */}
      <section className="bg-slate-50 border-y border-slate-100 py-12" id="features-highlights">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300 text-left">
              <div className="w-11 h-11 rounded-xl bg-brand-primary-light flex items-center justify-center text-brand-primary mb-4">
                <BookOpen className="w-5.5 h-5.5" />
              </div>
              <h3 className="text-base font-bold text-[#0f1f35] mb-2">Built for Students</h3>
              <p className="text-sm text-[#0f1f35]/70 leading-relaxed">
                გადააქციეთ უნივერსიტეტის პროექტები, საგნები და თეორიული ქეისები პროფესიონალურ სამუშაო უნარებად.
              </p>
            </div>
 
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300 text-left">
              <div className="w-11 h-11 rounded-xl bg-brand-primary-light flex items-center justify-center text-brand-primary mb-4">
                <Compass className="w-5.5 h-5.5" />
              </div>
              <h3 className="text-base font-bold text-[#0f1f35] mb-2">ქართული ბაზრისთვის</h3>
              <p className="text-sm text-[#0f1f35]/70 leading-relaxed">
                შედეგები ზუსტად ემთხვევა წამყვანი ქართული ბანკების, სააგენტოებისა და ტექ-გიგანტების მოთხოვნებს.
              </p>
            </div>
 
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow duration-300 text-left">
              <div className="w-11 h-11 rounded-xl bg-brand-primary-light flex items-center justify-center text-brand-primary mb-4">
                <Star className="w-5.5 h-5.5" />
              </div>
              <h3 className="text-base font-bold text-[#0f1f35] mb-2">პირველი სამსახურისთვის</h3>
              <p className="text-sm text-[#0f1f35]/70 leading-relaxed">
                პლატფორმა კონცენტრირებულია თქვენს პოტენციალზე, ამბიციასა და უნარებზე, მაშინაც კი, თუ სამუშაო გამოცდილება ნულია.
              </p>
            </div>
 
          </div>
        </div>
      </section>
 
      {/* Problem Section */}
      <section className="py-24 bg-white" id="problems">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-16">
          
          <div className="max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0f1f35] tracking-tight">
              სად არის სტუდენტების მთავარი პრობლემა?
            </h2>
            <p className="text-base text-[#0f1f35]/75 leading-relaxed">
              პირველი სამუშაოს ძიება სავსეა ბარიერებით, რომლებსაც ტრადიციული პლატფორმები არ ითვალისწინებენ.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Card 1 */}
            <div className="group bg-brand-primary-light/50 hover:bg-brand-primary-light/80 p-8 rounded-2xl border border-brand-secondary/10 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 text-left">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-brand-primary mb-6 shadow-sm">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#0f1f35] mb-3">CV ცარიელია</h3>
              <p className="text-sm text-[#0f1f35]/80 leading-relaxed mb-6">
                არ იცით, რა დაწეროთ რეზიუმეში, როდესაც მხოლოდ უნივერსიტეტში სწავლობდით და ოფიციალური სამუშაო ჯერ არ გქონიათ.
              </p>
              {/* Minimal SVG Illustration */}
              <div className="relative h-14 w-full bg-white/40 rounded-lg overflow-hidden border border-slate-100 flex items-center px-4">
                <div className="w-full space-y-2">
                  <div className="h-1.5 w-1/3 bg-brand-primary/20 rounded"></div>
                  <div className="h-1.5 w-1/2 bg-slate-200 rounded"></div>
                  <div className="h-1.5 w-5/6 bg-slate-100 rounded"></div>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="group bg-brand-primary-light/50 hover:bg-brand-primary-light/80 p-8 rounded-2xl border border-brand-secondary/10 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 text-left">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-brand-primary mb-6 shadow-sm">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#0f1f35] mb-3">გამოცდილება არ მაქვს</h3>
              <p className="text-sm text-[#0f1f35]/80 leading-relaxed mb-6">
                ყოველდღიურად ხედავთ ვაკანსიებს, რომლებიც ითხოვენ „2 წლიან სამუშაო გამოცდილებას“ თქვენთვის სასურველი დამწყები როლისთვისაც კი.
              </p>
              {/* Minimal SVG Illustration */}
              <div className="relative h-14 w-full bg-white/40 rounded-lg overflow-hidden border border-slate-100 flex items-center justify-center px-4">
                <div className="flex md:flex-row flex-col items-center justify-between w-full">
                  <span className="text-[10px] font-bold text-brand-primary">სტაჟირება</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                    <span className="text-[9px] font-medium text-slate-500">მინიმუმ 2 წელი</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="group bg-brand-primary-light/50 hover:bg-brand-primary-light/80 p-8 rounded-2xl border border-brand-secondary/10 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 text-left">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-brand-primary mb-6 shadow-sm">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#0f1f35] mb-3">ვაკანსიების პოვნა რთულია</h3>
              <p className="text-sm text-[#0f1f35]/80 leading-relaxed mb-6">
                ქაოტურ ბაზარზე სტუდენტური ვაკანსიების მოძიება რთული, დროში გაწელილი და ხშირად არაეფექტური პროცესია.
              </p>
              {/* Minimal SVG Illustration */}
              <div className="relative h-14 w-full bg-white/40 rounded-lg overflow-hidden border border-slate-100 flex items-center justify-center px-4 space-x-3">
                <div className="w-10 h-6 bg-white rounded flex items-center justify-center text-[8px] font-bold text-brand-primary border border-slate-100 shadow-xs">Jobs</div>
                <div className="w-3 h-3 rounded-full border border-brand-secondary animate-ping"></div>
                <div className="h-1.5 flex-1 bg-slate-200 rounded"></div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-slate-50 border-y border-slate-100" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0f1f35]">როგორ მუშაობს FirstStep?</h2>
            <p className="text-base text-[#0f1f35]/75">
              მარტივი 3-საფეხურიანი ეკოსისტემა, რომელიც უზრუნველყოფს თქვენს გაშვებას რეალურ სამუშაო სივრცეში.
            </p>
          </div>

          <div className="relative">
            {/* Timeline connector line */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-brand-primary/10 via-brand-secondary/30 to-brand-primary/10 -translate-y-1/2 z-0" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
              
              {/* Step 1 */}
              <div className="bg-white p-8 rounded-2xl border border-slate-100/80 shadow-sm text-left relative">
                <div className="absolute top-4 right-4 text-xs font-mono font-bold text-brand-primary bg-brand-primary-light px-2.5 py-1 rounded-full">S1</div>
                <div className="w-10 h-10 rounded-xl bg-brand-primary text-white flex items-center justify-center font-bold mb-6">1</div>
                <h3 className="text-base font-extrabold text-[#0f1f35] mb-2">შეიყვანე ინფორმაცია</h3>
                <p className="text-sm text-[#0f1f35]/70 leading-relaxed">
                  ჩაწერეთ თქვენი უნივერსიტეტის პროექტები, საგნები, ჰაკათონები ან უბრალო აქტივობები თავისუფალ სტილში.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-white p-8 rounded-2xl border border-slate-100/80 shadow-sm text-left relative">
                <div className="absolute top-4 right-4 text-xs font-mono font-bold text-brand-primary bg-brand-primary-light px-2.5 py-1 rounded-full">S2</div>
                <div className="w-10 h-10 rounded-xl bg-brand-primary text-white flex items-center justify-center font-bold mb-6">2</div>
                <h3 className="text-base font-extrabold text-[#0f1f35] mb-2">AI გადაამუშავებს CV-ად</h3>
                <p className="text-sm text-[#0f1f35]/70 leading-relaxed">
                  FirstStep ხელოვნური ინტელექტი გარდაქმნის თქვენს მონახაზს ATS-ოპტიმიზებულ, პროფესიულ რეზიუმედ.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-white p-8 rounded-2xl border border-slate-100/80 shadow-sm text-left relative">
                <div className="absolute top-4 right-4 text-xs font-mono font-bold text-brand-primary bg-brand-primary-light px-2.5 py-1 rounded-full">S3</div>
                <div className="w-10 h-10 rounded-xl bg-brand-primary text-white flex items-center justify-center font-bold mb-6">3</div>
                <h3 className="text-base font-extrabold text-[#0f1f35] mb-2">მიიღე შესაბამისი ვაკანსიები</h3>
                <p className="text-sm text-[#0f1f35]/70 leading-relaxed">
                  ჩვენი ალგორითმი ავტომატურად გაჩვენებთ თქვენი CV-ის შესაბამისობას წამყვან ქართულ ვაკანსიებთან.
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-white" id="final-cta">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-brand-primary rounded-3xl p-12 md:p-16 text-center text-white relative overflow-hidden shadow-xl shadow-slate-200">
            {/* Ambient visual background highlights */}
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-brand-secondary opacity-10 blur-3xl rounded-full"></div>
            <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-brand-secondary opacity-15 blur-3xl rounded-full"></div>

            <div className="max-w-2xl mx-auto space-y-8 relative z-10">
              <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
                დაიწყე შენი პირველი კარიერული ნაბიჯი
              </h2>
              <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
                ნუ გადადებ მომავალზე ზრუნვას. ჩაწერე ის, რაც უკვე იცი და მიეცი საშუალება ხელოვნურ ინტელექტს, გაგიკაფოს გზა პირველი პროფესიონალური წარმატებისკენ.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => onNavigate("builder")}
                  className="inline-flex items-center justify-center px-10 py-4.5 text-xs sm:text-sm font-extrabold tracking-wider uppercase text-brand-primary bg-white rounded-xl hover:bg-slate-50 hover:-translate-y-0.5 transition-all duration-300 shadow-md cursor-pointer"
                  id="final-cta-btn"
                >
                  <span>სცადე ახლავე</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
