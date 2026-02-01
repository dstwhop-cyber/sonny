
import React from 'react';

const Privacy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-8 transition-colors">
        <div className="space-y-2 border-b border-slate-100 dark:border-slate-800 pb-8">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Privacy Policy</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Last Updated: October 24, 2023</p>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300">
            At <strong>Sonny AI Studio</strong>, we are committed to protecting your personal information and your right to privacy. This Privacy Policy describes how your information is collected, used, and shared when you use our application.
          </p>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">1. Information We Collect</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              We collect information that you provide directly to us, such as when you create an account, generate content, or communicate with us. This includes:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-400">
              <li>Email address and basic account profile details.</li>
              <li>Content prompts and media uploaded for processing.</li>
              <li>Usage data and interaction statistics within the application.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">2. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-400">
              <li>To provide and maintain our Service, including generating AI content.</li>
              <li>To manage your account and subscription status.</li>
              <li>To process payments through third-party billing providers.</li>
              <li>To improve our AI models and user experience based on aggregated usage.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">3. Data Sharing and Security</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              We do not sell your personal data. We share your information only with service providers required to operate the app (e.g., Supabase for database, Paddle for billing). We implement industry-standard security measures to protect your data.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">4. AI Processing</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Input data (text and images) is sent to Google Gemini API for processing. Your data is handled according to Google's Enterprise privacy standards and is typically not used to train global models unless explicitly permitted.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">5. Your Rights</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              You have the right to access, update, or delete your personal information at any time through your profile settings or by contacting our support team.
            </p>
          </section>

          <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Questions about your data?</p>
            <p className="text-sm text-slate-400 mt-1">Contact privacy@sonnyai.studio</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
