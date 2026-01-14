import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Added Link import
import waitlistService from "../api/WaitlistService";
import { 
  Star, 
  CheckCircle, 
  TrendingUp, 
  ShieldAlert, 
  MessageSquare, 
  Zap, 
  BarChart3, 
  ArrowRight,
  Menu,
  X,
  Smartphone,
  Mail
} from "lucide-react";

const LandingPage = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  // CHANGED: Starting with a realistic "early traction" number
  const [waitlistCount, setWaitlistCount] = useState(342);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Constants for the "Scarcity" logic
  const TOTAL_BETA_SPOTS = 500;
  const spotsLeft = Math.max(12, TOTAL_BETA_SPOTS - waitlistCount);

  // --- LOGIC: Waitlist Management ---
  useEffect(() => {
    const fetchWaitlistCount = async () => {
      try {
        const { count } = await waitlistService.getWaitlistCount();
        if (count > 0) setWaitlistCount(count);
      } catch (error) {
        console.error('Error fetching waitlist count:', error);
      }
    };
    fetchWaitlistCount();
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      if (!isSubmitted && Math.random() < 0.3) {
        setWaitlistCount((prev) => prev + 1);
      }
    }, 45000); 
    return () => clearInterval(interval);
  }, [isSubmitted]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !email.includes('@')) {
      setError("Please enter a valid email address");
      return;
    }
    setIsLoading(true);

    try {
      const result = await waitlistService.addToWaitlist(email);
      if (result.success) {
        setIsSubmitted(true);
        setEmail("");
        if (result.waitlistCount) setWaitlistCount(result.waitlistCount);
      } else {
        setError(result.message || "Something went wrong.");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToWaitlist = () => {
    document.getElementById("waitlist")?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-[#7d2ae8] selection:text-white">
      
      {/* --- NAV --- */}
      <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#7d2ae8] rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-purple-200">
                R
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">Reputul</span>
              <span className="hidden sm:inline-block bg-purple-100 text-[#7d2ae8] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Private Beta
              </span>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-6">
              <button onClick={scrollToWaitlist} className="text-sm font-medium text-slate-600 hover:text-[#7d2ae8] transition-colors">
                How it Works
              </button>
              <button onClick={scrollToWaitlist} className="text-sm font-medium text-slate-600 hover:text-[#7d2ae8] transition-colors">
                Founder's Offer
              </button>
              <button 
                onClick={scrollToWaitlist}
                className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-lg shadow-slate-900/20 hover:shadow-slate-900/30 hover:-translate-y-0.5"
              >
                Get Early Access
              </button>
            </div>

            {/* Mobile Toggle */}
            <div className="md:hidden">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-600">
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 p-4 space-y-4 shadow-xl">
            <button onClick={scrollToWaitlist} className="block w-full text-left py-2 font-medium text-slate-600">How it Works</button>
            <button onClick={scrollToWaitlist} className="block w-full text-left py-2 font-medium text-slate-600">Features</button>
            <button onClick={scrollToWaitlist} className="block w-full bg-[#7d2ae8] text-white py-3 rounded-lg font-bold">Join Waitlist</button>
          </div>
        )}
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
            
            {/* Copy */}
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-100 text-[#7d2ae8] text-sm font-medium mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#7d2ae8] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#7d2ae8]"></span>
                </span>
                Only {spotsLeft} beta spots remaining
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-slate-900 mb-6 leading-[1.1]">
                Turn Happy Customers Into Your Best <span className="text-[#7d2ae8]">Salespeople.</span>
              </h1>
              
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                The automated reputation engine that captures 5-star reviews, intercepts negative feedback privately, and ranks you #1 on Google Maps—while you sleep.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <button 
                  onClick={scrollToWaitlist}
                  className="bg-[#7d2ae8] hover:bg-[#6020b0] text-white px-8 py-4 rounded-xl text-lg font-bold transition-all shadow-xl shadow-purple-500/20 hover:shadow-purple-500/40 hover:-translate-y-1 flex items-center justify-center gap-2"
                >
                  Secure My Spot
                  <ArrowRight size={20} />
                </button>
                <div className="flex items-center gap-4 px-6 py-4 rounded-xl bg-white border border-slate-200 shadow-sm">
                  <div className="flex -space-x-3">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-500">
                        {String.fromCharCode(64+i)}
                      </div>
                    ))}
                  </div>
                  <div className="text-sm font-medium text-slate-600">
                    <span className="text-slate-900 font-bold">4.9/5</span> from early users
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm text-slate-500 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-[#7d2ae8]" />
                  No Credit Card
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-[#7d2ae8]" />
                  Free Beta Access
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle size={16} className="text-[#7d2ae8]" />
                  5-Min Setup
                </div>
              </div>
            </div>

            {/* Visual: The Phone Mockup */}
            <div className="relative mx-auto lg:ml-auto w-full max-w-[400px]">
              <div className="absolute top-0 -right-20 w-72 h-72 bg-[#7d2ae8] rounded-full mix-blend-multiply filter blur-[64px] opacity-20 animate-pulse"></div>
              <div className="absolute bottom-0 -left-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-[64px] opacity-30 animate-pulse delay-1000"></div>

              <div className="relative bg-slate-900 rounded-[2.5rem] p-4 shadow-2xl border-4 border-slate-800 rotate-[-3deg] hover:rotate-0 transition-transform duration-500">
                <div className="bg-white rounded-[2rem] overflow-hidden h-[500px] relative">
                  <div className="bg-slate-100 px-6 py-3 flex justify-between items-center text-xs font-medium text-slate-500">
                    <span>9:41</span>
                    <div className="flex gap-1">
                      <div className="w-4 h-4 bg-slate-300 rounded-sm"></div>
                      <div className="w-4 h-4 bg-slate-300 rounded-full"></div>
                    </div>
                  </div>
                  
                  <div className="p-4 space-y-4">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-bold">AB</div>
                      <div className="text-sm font-semibold text-slate-900">Apex Builders</div>
                    </div>

                    <div className="bg-gray-100 rounded-2xl rounded-tl-none p-4 max-w-[85%]">
                      <p className="text-sm text-slate-700 leading-relaxed">
                        Hi Sarah! Thanks for choosing Apex Builders. Would you mind taking 30 seconds to share your experience?
                      </p>
                      <div className="mt-3 bg-white rounded-xl p-3 border border-gray-200 shadow-sm cursor-pointer hover:border-[#7d2ae8]/50 transition-colors">
                        <div className="flex gap-1 justify-center mb-2">
                          {[1,2,3,4,5].map(s => <Star key={s} size={16} className="text-yellow-400 fill-yellow-400" />)}
                        </div>
                        <div className="text-center text-xs font-bold text-[#7d2ae8]">Tap to Review</div>
                      </div>
                    </div>

                    <div className="bg-[#7d2ae8] text-white rounded-2xl rounded-tr-none p-4 max-w-[85%] ml-auto">
                      <p className="text-sm leading-relaxed">
                        Just did! You guys were great. Thanks for the quick fix! 👍
                      </p>
                    </div>
                    
                    <div className="absolute bottom-8 left-4 right-4 bg-slate-800/90 backdrop-blur text-white p-4 rounded-xl shadow-xl flex items-center gap-3 animate-bounce">
                      <div className="p-2 bg-green-500 rounded-full">
                        <TrendingUp size={16} className="text-white" />
                      </div>
                      <div>
                        <div className="text-xs font-medium text-slate-300">Reputul Alert</div>
                        <div className="text-sm font-bold">+1 New Google Review!</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- LOGO STRIP (Social Proof) --- */}
      <section className="py-10 border-y border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-8">
            Empowering Pros in Every Industry
          </p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
             <span className="text-xl font-bold text-slate-800">PLUMBING<span className="text-[#7d2ae8]">PRO</span></span>
             <span className="text-xl font-bold text-slate-800">Roof<span className="text-[#7d2ae8]">Right</span></span>
             <span className="text-xl font-bold text-slate-800">Elite<span className="text-[#7d2ae8]">HVAC</span></span>
             <span className="text-xl font-bold text-slate-800">Green<span className="text-[#7d2ae8]">Scapes</span></span>
             <span className="text-xl font-bold text-slate-800">Auto<span className="text-[#7d2ae8]">Fix</span></span>
          </div>
        </div>
      </section>

      {/* --- PROBLEM / AGITATION --- */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">
            The "Silent Killer" of Local Business
          </h2>
          <p className="text-lg text-slate-600">
            You do great work. But your online presence tells a different story.
          </p>
        </div>

        <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-6 text-red-600">
              <BarChart3 size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Lost Revenue</h3>
            <p className="text-slate-600">
              87% of customers won't consider a business with less than 4 stars. You're losing thousands to competitors with worse skills but better reviews.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-6 text-orange-600">
              <ShieldAlert size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Unfair One-Stars</h3>
            <p className="text-slate-600">
              One angry customer shouts louder than 100 happy ones. Without a buffer system, a single bad day can tank your reputation score.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-6 text-slate-600">
              <Zap size={24} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Manual Burnout</h3>
            <p className="text-slate-600">
              Chasing clients for reviews is awkward and time-consuming. You forget to ask, and they forget to post. The cycle continues.
            </p>
          </div>
        </div>
      </section>

      {/* --- SOLUTION (BENTO GRID) --- */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">
              Complete Domination on Autopilot
            </h2>
            <p className="text-lg text-slate-600">
              Reputul isn't just a tool; it's a complete system that handles your reputation so you can focus on the work.
            </p>
          </div>

          <div className="grid md:grid-cols-4 md:grid-rows-2 gap-6 h-auto md:h-[600px]">
            {/* Feature 1: Large Left - Using Slate-900 for contrast with purple accents */}
            <div className="md:col-span-2 md:row-span-2 bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden group">
              <div className="relative z-10">
                <div className="w-12 h-12 bg-[#7d2ae8] rounded-xl flex items-center justify-center mb-6">
                  <Smartphone size={24} />
                </div>
                <h3 className="text-2xl font-bold mb-4">Smart SMS Automation</h3>
                <p className="text-slate-300 mb-8">
                  Our system detects when a job is done and sends a perfectly timed, personalized request via SMS & Email. 
                  <br/><br/>
                  <span className="text-[#7d2ae8] font-bold">Result: 300% Higher Conversion.</span>
                </p>
              </div>
              <div className="absolute right-0 bottom-0 w-3/4 h-1/2 bg-slate-800 rounded-tl-3xl p-4 transition-transform group-hover:translate-y-2">
                <div className="w-full h-4 bg-slate-700 rounded-full mb-3"></div>
                <div className="w-2/3 h-4 bg-slate-700 rounded-full"></div>
              </div>
            </div>

            {/* Feature 2: Top Right */}
            <div className="md:col-span-2 bg-purple-50 rounded-3xl p-8 border border-purple-100 flex flex-col justify-center">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold text-slate-900">The "Complaint Shield"</h3>
                <ShieldAlert className="text-[#7d2ae8]" />
              </div>
              <p className="text-slate-600 text-sm">
                We route anything under 4 stars to a private feedback form. You get a chance to fix the issue *before* it goes public on Google.
              </p>
            </div>

            {/* Feature 3: Bottom Left */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:border-[#7d2ae8] transition-colors">
              <TrendingUp className="text-green-500 mb-4" size={32} />
              <h3 className="text-lg font-bold text-slate-900 mb-2">SEO Boost</h3>
              <p className="text-slate-500 text-xs">
                More reviews = higher Google Map rankings = more organic calls.
              </p>
            </div>

            {/* Feature 4: Bottom Right */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:border-[#7d2ae8] transition-colors">
              <MessageSquare className="text-blue-500 mb-4" size={32} />
              <h3 className="text-lg font-bold text-slate-900 mb-2">Unified Inbox</h3>
              <p className="text-slate-500 text-xs">
                Manage Google, FB, and Yelp reviews from one single dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOUNDER'S OFFER --- */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#7d2ae8] rounded-full mix-blend-multiply filter blur-[120px] opacity-20"></div>
        
        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
          <div className="inline-block bg-[#7d2ae8]/20 text-[#cbb0f5] font-bold px-4 py-1.5 rounded-full text-sm mb-6 border border-[#7d2ae8]/30">
            Limited Beta Access
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-8">
            Become a "Founding Member"
          </h2>
          
          <p className="text-xl text-slate-300 mb-12 max-w-2xl mx-auto">
            We are opening Reputul to a small group of contractors before our public launch. Help us shape the product, and we'll lock you in for life.
          </p>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 md:p-12 mb-12 text-left">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-bold mb-6 text-white">Why Join the Waitlist?</h3>
                <ul className="space-y-4">
                  {[
                    "Lock in 'Grandfathered' pricing for life (50% off)",
                    "Direct access to the founder (me) for feature requests",
                    "White-glove onboarding (we set it up for you)",
                    "Early access to new features before anyone else"
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-300">
                      <CheckCircle className="text-[#7d2ae8] shrink-0 mt-1" size={18} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col justify-center items-center bg-white/5 rounded-xl p-6 border border-white/10 text-center">
                <div className="text-sm text-slate-400 uppercase tracking-widest mb-2">Beta Spots Remaining</div>
                <div className="text-5xl font-bold text-white mb-2">
                  {spotsLeft}
                </div>
                <div className="text-xs text-[#cbb0f5]">out of {TOTAL_BETA_SPOTS} Total Slots</div>
              </div>
            </div>
          </div>

          <button 
            onClick={scrollToWaitlist}
            className="text-white border-b border-[#7d2ae8] pb-0.5 hover:text-[#7d2ae8] transition-colors font-medium"
          >
            I want to see the roadmap first &rarr;
          </button>
        </div>
      </section>

      {/* --- FINAL CTA / WAITLIST FORM --- */}
      <section id="waitlist" className="py-24 bg-white relative">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-8 text-[#7d2ae8]">
            <Mail size={32} />
          </div>
          
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Get Your Competitive Edge
          </h2>
          <p className="text-slate-600 mb-8">
            Join {waitlistCount.toLocaleString()} other contractors waiting for the launch.
            <br />
            <span className="text-sm text-slate-500 mt-2 block">No spam. Unsubscribe anytime.</span>
          </p>

          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex flex-col gap-4">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address..."
                  className="w-full px-6 py-4 rounded-xl border-2 border-slate-200 text-slate-900 placeholder-slate-400 text-lg focus:ring-4 focus:ring-purple-100 focus:border-[#7d2ae8] focus:outline-none transition-all"
                  required
                  disabled={isLoading}
                />
                
                {error && (
                  <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center gap-2">
                     <ShieldAlert size={16} /> {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#7d2ae8] hover:bg-[#6020b0] text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-purple-200 hover:-translate-y-1 disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  {isLoading ? "Securing Spot..." : "Join Private Beta"}
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-green-50 border border-green-100 rounded-2xl p-8 animate-fade-in">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                <CheckCircle size={24} />
              </div>
              <h3 className="text-xl font-bold text-green-800 mb-2">You're on the list!</h3>
              <p className="text-green-700">
                Keep an eye on your inbox. We'll be sending your exclusive invite code soon.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* --- FOOTER (Updated for Twilio Compliance) --- */}
      <footer className="py-12 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
          {/* Logo Section */}
          <div className="flex items-center gap-2 mb-6">
            <img 
              src="/assets/reputul-logo.png" 
              alt="Reputul" 
              className="h-8 w-auto grayscale opacity-70 hover:grayscale-0 hover:opacity-100 transition-all duration-300" 
            />
            <span className="text-xl font-bold text-slate-700">Reputul</span>
          </div>

          {/* Legal Links */}
          <div className="flex gap-8 mb-8 text-sm font-medium text-slate-500">
            <Link to="/privacy" className="hover:text-[#7d2ae8] transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-[#7d2ae8] transition-colors">
              Terms of Service
            </Link>
          </div>

          {/* Copyright & Address for Twilio */}
          <div className="text-center text-slate-400 text-xs space-y-2">
            <p>&copy; 2026 Reputul LLC. All rights reserved.</p>
            <p className="text-xs">123 Main St, Castle Rock, CO 80104</p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;