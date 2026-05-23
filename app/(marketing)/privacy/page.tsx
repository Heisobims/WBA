import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy" };

const LAST_UPDATED = "January 1, 2025";

export default function PrivacyPage() {
  return (
    <main className="pt-24 pb-32">
      <div className="container max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-12">Last updated: {LAST_UPDATED}</p>

        <div className="prose prose-stone max-w-none space-y-8 text-muted-foreground leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">1. Information we collect</h2>
            <p>
              We collect information you provide directly, including your name, email address, and password
              when you register. We also collect usage data such as practice task completions, exam scores,
              XP points, and platform interactions to power your training dashboard.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">2. How we use your information</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>To provide and improve the WBAcademy platform</li>
              <li>To personalise your training recommendations and difficulty level</li>
              <li>To send important account and service notifications</li>
              <li>To calculate leaderboard rankings and award achievements</li>
              <li>To respond to support requests</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">3. Data sharing</h2>
            <p>
              We do not sell your personal data. We share data only with trusted service providers
              (hosting, payments, email) under strict data processing agreements, and only as required
              by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">4. Cookies</h2>
            <p>
              We use essential cookies to maintain your session and remember your preferences. We do not
              use advertising cookies or sell cookie data to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">5. Data retention</h2>
            <p>
              We retain your account data for as long as your account is active. You may request deletion
              of your account and associated data at any time via Settings → Danger Zone, or by emailing
              us at privacy@wbacademy.com.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">6. Your rights</h2>
            <p>
              Depending on your location, you may have rights to access, correct, delete, or export your
              personal data. To exercise these rights, contact us at{" "}
              <a href="mailto:privacy@wbacademy.com" className="text-brand-600 hover:underline">
                privacy@wbacademy.com
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">7. Security</h2>
            <p>
              We use industry-standard encryption (TLS in transit, bcrypt for passwords) and access
              controls to protect your data. No system is perfectly secure; we encourage you to use a
              strong, unique password.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">8. Changes to this policy</h2>
            <p>
              We may update this policy from time to time. We will notify you of material changes via
              email or an in-app notice. Continued use of WBAcademy after changes take effect constitutes
              acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-foreground mb-3">9. Contact</h2>
            <p>
              Questions about this policy? Email us at{" "}
              <a href="mailto:privacy@wbacademy.com" className="text-brand-600 hover:underline">
                privacy@wbacademy.com
              </a>.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
