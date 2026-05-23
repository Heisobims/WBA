import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of Service" };

const LAST_UPDATED = "January 1, 2025";

export default function TermsPage() {
  return (
    <main className="pt-24 pb-32">
      <div className="container max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Terms of Service</h1>
        <p className="text-muted-foreground mb-12">Last updated: {LAST_UPDATED}</p>

        <div className="prose prose-stone max-w-none space-y-8 text-muted-foreground leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">1. Acceptance</h2>
            <p>
              By creating an account or using WBAcademy, you agree to these Terms of Service. If you do
              not agree, do not use the platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">2. Description of service</h2>
            <p>
              WBAcademy provides practice tasks, mock qualification exams, and training tools to help
              users prepare for AI trainer roles at companies such as Outlier AI, Scale AI, and Alignerr.
              WBAcademy is not affiliated with any of those companies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">3. Accounts</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>You must be at least 18 years old to create an account.</li>
              <li>You are responsible for maintaining the security of your account credentials.</li>
              <li>You must provide accurate information during registration.</li>
              <li>One account per person. Sharing accounts is prohibited.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">4. Acceptable use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Use automated tools to scrape, copy, or exploit platform content</li>
              <li>Share exam questions or task content externally</li>
              <li>Impersonate others or create fake accounts</li>
              <li>Attempt to circumvent access controls or security measures</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">5. Intellectual property</h2>
            <p>
              All platform content — including tasks, exams, scoring algorithms, and UI — is owned by
              WBAcademy and protected by copyright. You may not reproduce or distribute it without
              written permission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">6. Payments and refunds</h2>
            <p>
              Paid plans are billed in advance. You may cancel at any time; cancellation takes effect
              at the end of the current billing period. We do not offer pro-rated refunds except where
              required by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">7. Disclaimers</h2>
            <p>
              WBAcademy does not guarantee that using the platform will result in passing any
              qualification exam or obtaining employment. Results depend on individual effort and
              third-party hiring decisions outside our control.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">8. Limitation of liability</h2>
            <p>
              To the maximum extent permitted by law, WBAcademy is not liable for indirect, incidental,
              or consequential damages arising from your use of the platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">9. Termination</h2>
            <p>
              We may suspend or terminate your account for violations of these terms. You may delete
              your account at any time via Settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">10. Changes</h2>
            <p>
              We may update these terms. We will notify you of material changes via email. Continued
              use after the effective date constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">11. Contact</h2>
            <p>
              Questions?{" "}
              <a href="mailto:hello@wbacademy.com" className="text-brand-600 hover:underline">
                hello@wbacademy.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
