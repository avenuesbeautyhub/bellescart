'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';

export default function PrivacyPolicyPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#faf9fb] text-gray-900">
      <Navbar />

      <main>
        {/* Header */}
        <section className="relative overflow-hidden border-b border-gray-200 bg-[#19151a] text-white">
          <div className="absolute -right-24 -top-32 h-72 w-72 rounded-full bg-pink-500/10 blur-3xl" />
          <div className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-purple-500/10 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="flex-1">
                <button
                  onClick={() => router.back()}
                  className="mb-4 flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-4 w-4"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      d="M19 12H5M12 19l-7-7 7-7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Back
                </button>
                <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-pink-300">
                  <span className="h-px w-6 bg-pink-400" />
                  Legal
                </div>

                <h1 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
                  Privacy Policy
                </h1>

                <p className="mt-3 max-w-xl text-sm leading-6 text-gray-400 sm:text-base">
                  Learn how Belles Avenue collects, uses and protects your information.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="prose prose-gray max-w-none">
            <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-[0_10px_40px_rgba(17,12,20,0.035)]">
              <div className="p-8 sm:p-12">
                <p className="text-sm text-gray-500 mb-8">
                  Last updated: September 15, 2026
                </p>

                <section className="mb-10">
                  <h2 className="text-xl font-semibold text-gray-950 mb-4">
                    1. Information We Collect
                  </h2>
                  <p className="text-gray-600 mb-4">
                    We collect information you provide directly to us when you create an account, make a purchase, or communicate with us. This includes:
                  </p>
                  <ul className="list-disc pl-6 text-gray-600 space-y-2">
                    <li>Account information (name, email, phone number)</li>
                    <li>Shipping and billing addresses</li>
                    <li>Payment information (processed securely through Razorpay)</li>
                    <li>Order history and preferences</li>
                    <li>Communication preferences</li>
                  </ul>
                </section>

                <section className="mb-10">
                  <h2 className="text-xl font-semibold text-gray-950 mb-4">
                    2. How We Use Information
                  </h2>
                  <p className="text-gray-600 mb-4">
                    We use the information we collect to process your orders, provide customer service, improve our services, and communicate with you about your orders and account.
                  </p>
                </section>

                <section className="mb-10">
                  <h2 className="text-xl font-semibold text-gray-950 mb-4">
                    3. Account Information
                  </h2>
                  <p className="text-gray-600 mb-4">
                    When you create an account, we collect your name, email address, and phone number. This information is used to authenticate your account and communicate with you about your orders.
                  </p>
                </section>

                <section className="mb-10">
                  <h2 className="text-xl font-semibold text-gray-950 mb-4">
                    4. Orders & Delivery
                  </h2>
                  <p className="text-gray-600 mb-4">
                    We collect shipping address information to deliver your orders. We also track order status and delivery information to provide you with updates and improve our delivery services.
                  </p>
                </section>

                <section className="mb-10">
                  <h2 className="text-xl font-semibold text-gray-950 mb-4">
                    5. Payments
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Payment processing is handled securely through Razorpay. We do not store your full payment card numbers. We only store payment status, transaction reference IDs, and amounts for order processing and record-keeping.
                  </p>
                </section>

                <section className="mb-10">
                  <h2 className="text-xl font-semibold text-gray-950 mb-4">
                    6. Cookies
                  </h2>
                  <p className="text-gray-600 mb-4">
                    We use essential cookies to keep BellesCart working, including authentication cookies for secure login and session management. These cookies are necessary for the website to function properly.
                  </p>
                </section>

                <section className="mb-10">
                  <h2 className="text-xl font-semibold text-gray-950 mb-4">
                    7. Marketing Communications
                  </h2>
                  <p className="text-gray-600 mb-4">
                    With your consent, we may send you marketing emails about promotions, new products, and special offers. You can manage your marketing email preferences in your Privacy Center settings.
                  </p>
                  <p className="text-gray-600">
                    Transactional emails (order confirmations, shipping updates, password resets) will always be sent as necessary for account and order management.
                  </p>
                </section>

                <section className="mb-10">
                  <h2 className="text-xl font-semibold text-gray-950 mb-4">
                    8. Third-Party Services
                  </h2>
                  <p className="text-gray-600 mb-4">
                    We use third-party services to operate our business, including:
                  </p>
                  <ul className="list-disc pl-6 text-gray-600 space-y-2">
                    <li>Razorpay for payment processing</li>
                    <li>Cloudinary for image storage</li>
                    <li>Email service providers for transactional emails</li>
                  </ul>
                  <p className="text-gray-600 mt-4">
                    These service providers have access to your information only to perform specific tasks on our behalf and are obligated not to disclose or use it for any other purpose.
                  </p>
                </section>

                <section className="mb-10">
                  <h2 className="text-xl font-semibold text-gray-950 mb-4">
                    9. Data Security
                  </h2>
                  <p className="text-gray-600 mb-4">
                    We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes:
                  </p>
                  <ul className="list-disc pl-6 text-gray-600 space-y-2">
                    <li>Secure authentication with JWT tokens</li>
                    <li>CSRF protection for state-changing operations</li>
                    <li>Request signing for sensitive operations</li>
                    <li>Rate limiting to prevent abuse</li>
                    <li>Encrypted password storage</li>
                  </ul>
                </section>

                <section className="mb-10">
                  <h2 className="text-xl font-semibold text-gray-950 mb-4">
                    10. Data Retention
                  </h2>
                  <p className="text-gray-600 mb-4">
                    We retain your personal information for as long as necessary to provide our services and fulfill the purposes outlined in this privacy policy. This includes:
                  </p>
                  <ul className="list-disc pl-6 text-gray-600 space-y-2">
                    <li>Account information: While your account is active</li>
                    <li>Order information: For business and legal requirements</li>
                    <li>Payment records: As required by financial regulations</li>
                  </ul>
                  <p className="text-gray-600 mt-4">
                    Specific retention periods are determined based on legal requirements and business needs.
                  </p>
                </section>

                <section className="mb-10">
                  <h2 className="text-xl font-semibold text-gray-950 mb-4">
                    11. Privacy Rights
                  </h2>
                  <p className="text-gray-600 mb-4">
                    You have the following rights regarding your personal information:
                  </p>
                  <ul className="list-disc pl-6 text-gray-600 space-y-2">
                    <li>Access your personal information through the Privacy Center</li>
                    <li>Request a copy of your data (Data Export)</li>
                    <li>Update your privacy preferences</li>
                    <li>Manage marketing communication preferences</li>
                  </ul>
                  <p className="text-gray-600 mt-4">
                    You can exercise these rights through your account's Privacy Center.
                  </p>
                </section>

                <section className="mb-10">
                  <h2 className="text-xl font-semibold text-gray-950 mb-4">
                    12. Data Access/Export
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Through the Privacy Center, you can request a copy of all personal information associated with your account. This includes your profile, addresses, orders, and privacy preferences. The export is provided in JSON format for your records.
                  </p>
                </section>

                <section className="mb-10">
                  <h2 className="text-xl font-semibold text-gray-950 mb-4">
                    13. Contact Information
                  </h2>
                  <p className="text-gray-600 mb-4">
                    If you have questions about this privacy policy or our data practices, please contact us at:
                  </p>
                  <div className="bg-gray-50 rounded-xl p-4 mt-4">
                    <p className="text-gray-600">
                      <strong>Email:</strong> <a href="mailto:avenuesbeautyhub@gmail.com" className="text-pink-600 hover:text-pink-700">avenuesbeautyhub@gmail.com</a><br />
                      <strong>Business Name:</strong> BELLES AVENUE FASHION HUB<br />
                      <strong>Address:</strong> Post Office Junction, Punalur – 691305, Kerala, India
                    </p>
                  </div>
                </section>

                <section className="border-t border-gray-200 pt-8">
                  <h2 className="text-xl font-semibold text-gray-950 mb-4">
                    Important Legal Disclaimer
                  </h2>
                  <p className="text-gray-600 mb-4">
                    This privacy policy and the technical privacy features implemented in BellesCart provide data privacy capabilities. However, full legal compliance with data protection laws (such as GDPR) depends on:
                  </p>
                  <ul className="list-disc pl-6 text-gray-600 space-y-2">
                    <li>Your business location and the locations of your customers</li>
                    <li>Applicable data protection laws in your jurisdiction</li>
                    <li>Legal basis for processing personal data</li>
                    <li>Contracts with data processors</li>
                    <li>Specific data retention policies</li>
                    <li>Organizational procedures and documentation</li>
                  </ul>
                  <p className="text-gray-600 mt-4">
                    This implementation provides the technical foundation for privacy management but does not constitute legal advice or guarantee full compliance with any specific data protection law. Consult with legal professionals to ensure your privacy practices meet all applicable legal requirements.
                  </p>
                </section>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
