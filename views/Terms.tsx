
import React from 'react';

const Terms: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-8 transition-colors">
        <div className="space-y-2 border-b border-slate-100 dark:border-slate-800 pb-8">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter italic">Terms of Service</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Effective Date: October 24, 2023</p>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
          <p className="text-lg leading-relaxed text-slate-600 dark:text-slate-300">
            Welcome to <strong>Sonny AI Studio</strong> (“we”, “our”, “us”). By accessing or using our app, you agree to these Terms of Service. If you do not agree, please do not use the app.
          </p>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight flex items-center">
              <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center text-xs mr-3">1</span>
              Eligibility
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              You must be 13 years or older to use this app. By using the app, you confirm that you meet this requirement.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight flex items-center">
              <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center text-xs mr-3">2</span>
              Accounts
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-400">
              <li>You may need to create an account to access certain features.</li>
              <li>You are responsible for keeping your account secure.</li>
              <li>You are responsible for all activity under your account.</li>
              <li>We may suspend or terminate accounts that violate these Terms.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight flex items-center">
              <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center text-xs mr-3">3</span>
              Use of the App
            </h2>
            <p className="text-slate-600 dark:text-slate-400">You agree not to:</p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-400">
              <li>Use the app for illegal purposes</li>
              <li>Attempt to hack, abuse, or overload the system</li>
              <li>Misuse AI-generated content</li>
              <li>Upload harmful, offensive, or malicious material</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight flex items-center">
              <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center text-xs mr-3">4</span>
              AI Features & Content
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-400">
              <li>The app uses artificial intelligence to generate content.</li>
              <li>AI-generated content is provided “as is” and may be inaccurate or incomplete.</li>
              <li>You are fully responsible for how you use generated content.</li>
              <li>We are not responsible for outcomes, decisions, or losses caused by AI outputs.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight flex items-center">
              <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center text-xs mr-3">5</span>
              Payments & Subscriptions
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-400">
              <li>Some features require payment or subscription.</li>
              <li>Payments are processed through third-party providers such as Paddle and/or PayPal.</li>
              <li>We do not store your payment details.</li>
              <li>Prices may change at any time.</li>
              <li>Subscriptions may renew automatically unless canceled.</li>
              <li>Payments are non-refundable unless required by law.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight flex items-center">
              <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center text-xs mr-3">6</span>
              Intellectual Property
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-400">
              <li>The app, branding, logo, and software belong to <strong>Sonny AI Studio</strong>.</li>
              <li>You may not copy, sell, or redistribute our content without permission.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight flex items-center">
              <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center text-xs mr-3">7</span>
              User Content
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-400">
              <li>You keep ownership of content you upload.</li>
              <li>You grant us permission to process your content to provide the service.</li>
              <li>We may remove content that violates these Terms.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight flex items-center">
              <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center text-xs mr-3">8</span>
              Service Availability
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-400">
              <li>We do not guarantee uninterrupted access.</li>
              <li>Features may change or be removed at any time.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight flex items-center">
              <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center text-xs mr-3">9</span>
              Limitation of Liability
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-400">
              <li>To the maximum extent allowed by law: We are not liable for indirect or consequential damages.</li>
              <li>Use of the app is at your own risk.</li>
            </ul>
          </section>

          <section className="space-y-4 pt-8 border-t border-slate-100 dark:border-slate-800">
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight flex items-center">
              <span className="w-8 h-8 bg-slate-100 dark:bg-slate-800 text-slate-600 rounded-full flex items-center justify-center text-xs mr-3">?</span>
              Contact Information
            </h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              If you have any questions regarding these Terms, please contact our support team through the dashboard.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms;
