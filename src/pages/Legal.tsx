import { Link } from 'react-router-dom';
import { ArrowLeft, ScrollText, Cookie, ShieldCheck } from 'lucide-react';

interface LegalSection {
  heading: string;
  body: string;
}

interface LegalDoc {
  icon: typeof ScrollText;
  kicker: string;
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}

const docs: Record<string, LegalDoc> = {
  privacy: {
    icon: ShieldCheck,
    kicker: 'Privacy Policy',
    title: 'Privacy Policy',
    updated: '12 September 2026',
    intro:
      'LeadFlow Nigeria ("we", "us", "our") respects your privacy. This policy explains what information we collect, how we use it, and the choices you have. It applies to everyone who visits leadflownigeria.com or uses the LeadFlow Nigeria application.',
    sections: [
      {
        heading: '1. Information We Collect',
        body:
          'When you create an account we collect your name and email address. When you use the scanner we collect your search parameters (industry, location) as well as the lead data returned to you — business names, phone numbers, addresses, categories, ratings, and contact emails. Scan history and webhook configuration are stored in your browser using localStorage and, where applicable, in our secured database via Supabase.',
      },
      {
        heading: '2. How We Use Your Information',
        body:
          'We use your information to operate the platform: powering the directory scanner, populating your CRM pipeline, running email enrichment, syncing leads to integration services such as Privyr, and safeguarding your account. We never sell your personal data.',
      },
      {
        heading: '3. Third-Party Services',
        body:
          'The scanner is powered by Google Gemini AI, which grounds results in public web and directory searches. Auth and user records are managed through Supabase. Optional enrichment and CRM features rely on providers such as Privyr, Apollo, and Hunter. Each provider processes data under its own terms, and we only send them the data required for the feature you enable.',
      },
      {
        heading: '4. Cookies & Local Storage',
        body:
          'LeadFlow Nigeria stores small amounts of data in your browser using localStorage — keys prefixed with "lf_" — to persist your session, scan history, saved leads, and settings. We do not use third-party advertising cookies. See our Cookie Policy for details.',
      },
      {
        heading: '5. Data Retention & Security',
        body:
          'Account records remain until you request deletion. Data stored client-side is removed when you clear your browser storage or request account deletion. Authentication and role permissions are enforced server-side with Supabase Row Level Security to protect user data.',
      },
      {
        heading: '6. Your Rights',
        body:
          'You may access, correct, export, or delete your personal information at any time. Contact us using the details below and we will respond within a reasonable timeframe.',
      },
      {
        heading: '7. Contact Us',
        body:
          'For any privacy questions, requests to access or delete your data, or concerns, email us at netbiz0925@gmail.com.',
      },
    ],
  },
  terms: {
    icon: ScrollText,
    kicker: 'Terms of Service',
    title: 'Terms of Service',
    updated: '12 September 2026',
    intro:
      'These Terms of Service ("Terms") govern your access to and use of LeadFlow Nigeria, a lead generation platform for discovering Nigerian businesses. By creating an account or using the service, you agree to be bound by these Terms.',
    sections: [
      {
        heading: '1. The Service',
        body:
          'LeadFlow Nigeria provides an AI-powered directory scanner that discovers physical Nigerian businesses lacking a website, an in-app CRM pipeline, email enrichment, and optional integration with third-party CRMs such as Privyr. The service is provided "as is" and may evolve over time.',
      },
      {
        heading: '2. Eligibility & Accounts',
        body:
          'You must be at least 18 years old and capable of entering a binding agreement to use the service. You are responsible for safeguarding your credentials and for all activity under your account. Access may be revoked at any time for verified platform abuse.',
      },
      {
        heading: '3. Acceptable Use',
        body:
          'You agree to use the service lawfully. You are solely responsible for how you use the leads generated, including compliance with Nigerian privacy, anti-spam, and consumer protection laws when contacting businesses. You may not resell or redistribute lead data outside your own client-acquisition workflow without permission.',
      },
      {
        heading: '4. Data & Accuracy',
        body:
          'Lead data is generated from public sources and AI search grounding. We do not guarantee the accuracy, completeness, or timeliness of any directory listing or contact detail. You should independently verify leads before relying on them.',
      },
      {
        heading: '5. Intellectual Property',
        body:
          'The LeadFlow Nigeria platform, branding, and software are our property. You receive a limited, non-transferable license to use the service for your internal business purposes only.',
      },
      {
        heading: '6. Limitation of Liability',
        body:
          'To the maximum extent permitted by law, LeadFlow Nigeria shall not be liable for indirect, incidental, or consequential damages arising from your use of the service or reliance on lead data.',
      },
      {
        heading: '7. Termination',
        body:
          'We may suspend or terminate access for violations of these Terms, security concerns, or as required by law. You may stop using the service at any time and request deletion of your account.',
      },
      {
        heading: '8. Changes to Terms',
        body:
          'We may update these Terms from time to time. Material changes will be reflected by an updated date above. Continued use after changes constitutes acceptance.',
      },
      {
        heading: '9. Governing Law',
        body:
          'These Terms are governed by the laws of the Federal Republic of Nigeria. Disputes shall be resolved under the jurisdiction of the courts of Nigeria.',
      },
      {
        heading: '10. Contact Us',
        body: 'Questions about these Terms can be sent to netbiz0925@gmail.com.',
      },
    ],
  },
  cookies: {
    icon: Cookie,
    kicker: 'Cookie Policy',
    title: 'Cookie Policy',
    updated: '12 September 2026',
    intro:
      'This Cookie Policy explains how LeadFlow Nigeria uses cookies and browser local storage to make the platform work, remember your preferences, and improve your experience. It complements our Privacy Policy.',
    sections: [
      {
        heading: '1. What We Use Cookies & Storage For',
        body:
          'We use browser storage solely for purposes that are strictly necessary to the operation of the application: keeping you signed in, persisting scan history, saved leads, CRM pipeline data, and settings such as your webhook configuration. Keys are prefixed with "lf_".',
      },
      {
        heading: '2. Purpose-Based Storage',
        body:
          'No ad-tracking or behavioural-profiling cookies are used. Because all persisted data is stored locally in your browser, the platform continues to work without server-side tracking.',
      },
      {
        heading: '3. Third-Party Environments',
        body:
          'When you use optional integrations (Gemini enrichment, Privyr CRM, Apollo, Hunter), those services may set their own cookies or storage under their separate privacy and cookie policies. We recommend reviewing them before enabling integrations.',
      },
      {
        heading: '4. Managing Storage',
        body:
          'You may clear your browser storage at any time, which will remove locally saved leads, history, and preferences. Account authentication can be removed by signing out or requesting account deletion. Clearing storage may sign you out and reset local settings.',
      },
      {
        heading: '5. Contact Us',
        body: 'For any questions about this policy, email us at netbiz0925@gmail.com.',
      },
    ],
  },
};

export function LegalPage({ slug }: { slug: keyof typeof docs }) {
  const doc = docs[slug];
  const Icon = doc.icon;
  return (
    <div className="min-h-screen bg-[#0A0F1E] text-slate-100 font-sans">
      <div className="absolute top-1/4 -left-32 h-[400px] w-[400px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />
      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-slate-400 hover:text-emerald-400 transition-colors mb-8"
        >
          <ArrowLeft size={14} />
          Back to Home
        </Link>

        <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5">
          <Icon size={24} />
        </div>

        <p className="text-xs font-mono font-bold tracking-widest text-emerald-400 uppercase mb-2">
          {doc.kicker}
        </p>
        <h1 className="font-sora font-extrabold text-3xl sm:text-4xl text-white tracking-tight mb-1">
          {doc.title}
        </h1>
        <p className="text-xs text-slate-500 font-mono mb-6">Last updated: {doc.updated}</p>

        <p className="text-sm text-slate-400 leading-relaxed mb-8">{doc.intro}</p>

        <div className="space-y-8">
          {doc.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="font-sora font-bold text-white text-lg mb-2">{section.heading}</h2>
              <p className="text-sm text-slate-400 leading-relaxed">{section.body}</p>
            </section>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-600 font-mono">
            LeadFlow Nigeria &copy; {new Date().getFullYear()}
          </p>
          <div className="flex items-center gap-4">
            <Link to="/legal/privacy" className="text-xs text-slate-500 font-mono hover:text-emerald-400 transition-colors">
              Privacy Policy
            </Link>
            <span className="w-1 h-1 rounded-full bg-slate-700" />
            <Link to="/legal/terms" className="text-xs text-slate-500 font-mono hover:text-emerald-400 transition-colors">
              Terms of Service
            </Link>
            <span className="w-1 h-1 rounded-full bg-slate-700" />
            <Link to="/legal/cookies" className="text-xs text-slate-500 font-mono hover:text-emerald-400 transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PrivacyPage() {
  return <LegalPage slug="privacy" />;
}

export function TermsPage() {
  return <LegalPage slug="terms" />;
}

export function CookiePage() {
  return <LegalPage slug="cookies" />;
}