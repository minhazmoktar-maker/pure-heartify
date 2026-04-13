import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 py-10 md:px-6">
        <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <h1 className="font-heading text-3xl font-bold text-foreground">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: April 13, 2026</p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-foreground/90">
          <section>
            <h2 className="font-heading text-lg font-bold text-foreground">1. Data Collection</h2>
            <p className="mt-2">HalalTube collects the following data to provide and improve our service:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
              <li><strong className="text-foreground">Account information:</strong> Email address, display name, and avatar (when provided)</li>
              <li><strong className="text-foreground">Usage data:</strong> Watch history, favorites, search queries, and interaction patterns</li>
              <li><strong className="text-foreground">Device information:</strong> Browser type, device type, and general location (country-level)</li>
              <li><strong className="text-foreground">Authentication data:</strong> Securely hashed passwords, session tokens, and OAuth provider IDs</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-foreground">2. Data Usage</h2>
            <p className="mt-2">Your data is used to:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
              <li>Authenticate and secure your account</li>
              <li>Personalize your content recommendations and curated sections</li>
              <li>Improve our halal content filtering and scoring algorithms</li>
              <li>Maintain and improve platform performance and reliability</li>
              <li>Communicate service updates and important account notifications</li>
            </ul>
          </section>

          <section className="rounded-lg border border-[hsl(var(--gold)/0.3)] bg-[hsl(var(--gold)/0.05)] p-5">
            <h2 className="font-heading text-lg font-bold text-foreground">3. ⚠️ AI Disclaimer — Important</h2>
            <div className="mt-3 space-y-3 text-muted-foreground">
              <p>
                <strong className="text-foreground">This platform is powered by AI reasoning and decision-making systems.</strong> Our content filtering, halal scoring, and categorization algorithms use automated analysis of video metadata (titles, descriptions, channel information) to determine compliance with halal guidelines.
              </p>
              <p>
                <strong className="text-foreground">We aim for an estimated 80–90% halal compliance score</strong> based on our internal AI evaluation system. This score reflects the confidence of our automated filtering — not a religious certification.
              </p>
              <p>
                <strong className="text-foreground">However, the system may make mistakes.</strong> AI-based filtering cannot replace human scholarly judgment. Users should independently verify critical decisions regarding halal compliance. HalalTube does not provide religious rulings (fatwa) and should not be treated as a religious authority.
              </p>
              <p>
                We continuously work to improve our filtering accuracy and welcome community feedback to help identify content that may have been incorrectly classified.
              </p>
            </div>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-foreground">4. Data Security</h2>
            <p className="mt-2">We implement industry-standard security measures including:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
              <li>All passwords are securely hashed — never stored in plaintext</li>
              <li>All data transmission is encrypted via HTTPS/TLS</li>
              <li>Session management uses secure, httpOnly cookies with automatic expiration</li>
              <li>API keys and secrets are stored in secure vaults — never exposed to frontend code</li>
              <li>Row-level security (RLS) ensures users can only access their own personal data</li>
              <li>Rate limiting and brute-force protection on authentication endpoints</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-foreground">5. User Control & Rights</h2>
            <p className="mt-2">You have the right to:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
              <li><strong className="text-foreground">Access:</strong> View all data we hold about you via your profile settings</li>
              <li><strong className="text-foreground">Modify:</strong> Update your profile information at any time</li>
              <li><strong className="text-foreground">Delete:</strong> Request complete account and data deletion by contacting us</li>
              <li><strong className="text-foreground">Export:</strong> Request a copy of your data in a standard format</li>
              <li><strong className="text-foreground">Withdraw consent:</strong> You may stop using the service at any time</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-foreground">6. Transparency & Data Sharing</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
              <li>We do <strong className="text-foreground">not sell</strong> your personal data to any third party</li>
              <li>We do <strong className="text-foreground">not share</strong> your data with advertisers</li>
              <li>We use YouTube's public API to fetch video metadata — your search queries are sent to YouTube's API but not linked to your HalalTube identity</li>
              <li>Authentication may involve third-party OAuth providers (Google, Apple) whose own privacy policies apply</li>
            </ul>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-foreground">7. Cookies & Local Storage</h2>
            <p className="mt-2">
              We use essential cookies and local storage for authentication session management only. We do not use tracking cookies or third-party advertising cookies. No analytics data is shared with external marketing platforms.
            </p>
          </section>

          <section>
            <h2 className="font-heading text-lg font-bold text-foreground">8. Changes to This Policy</h2>
            <p className="mt-2">
              We may update this Privacy Policy from time to time. Any significant changes will be communicated via the platform. Continued use of HalalTube after changes constitutes acceptance.
            </p>
          </section>

          <section className="border-t border-border pt-6">
            <p className="text-muted-foreground">
              For questions, concerns, or data requests, please contact us at <strong className="text-foreground">privacy@halaltube.app</strong>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
