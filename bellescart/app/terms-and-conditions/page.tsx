import React from 'react';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';

export default function TermsAndConditionsPage() {
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
              <div>
                <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-pink-300">
                  <span className="h-px w-6 bg-pink-400" />
                  Legal
                </div>

                <h1 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
                  Terms & Conditions
                </h1>

                <p className="mt-3 max-w-xl text-sm leading-6 text-gray-400 sm:text-base">
                  Please read these terms carefully before using BellesCart.
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
                    1. Acceptance of Terms
                  </h2>
                  <p className="text-gray-600 mb-4">
                    By accessing or using BellesCart, you agree to be bound by these Terms & Conditions and our Privacy Policy. If you do not agree to these terms, please do not use our website or services.
                  </p>
                </section>

                <section className="mb-10">
                  <h2 className="text-xl font-semibold text-gray-950 mb-4">
                    2. Account Registration
                  </h2>
                  <p className="text-gray-600 mb-4">
                    To use certain features of BellesCart, you must register for an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete.
                  </p>
                  <p className="text-gray-600 mb-4">
                    You are responsible for maintaining the confidentiality of your account and password and for restricting access to your account. You agree to accept responsibility for all activities that occur under your account or password.
                  </p>
                </section>

                <section className="mb-10">
                  <h2 className="text-xl font-semibold text-gray-950 mb-4">
                    3. Products and Services
                  </h2>
                  <p className="text-gray-600 mb-4">
                    We strive to display accurate product information, including descriptions, images, and prices. However, we do not warrant that product descriptions or other content are accurate, complete, reliable, current, or error-free.
                  </p>
                  <p className="text-gray-600 mb-4">
                    All products are subject to availability. We reserve the right to discontinue any product at any time without notice.
                  </p>
                </section>

                <section className="mb-10">
                  <h2 className="text-xl font-semibold text-gray-950 mb-4">
                    4. Pricing and Payment
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Prices for products are subject to change without notice. We reserve the right at any time to modify or discontinue the Service (or any part or content thereof) without notice at any time.
                  </p>
                  <p className="text-gray-600 mb-4">
                    Payment is processed through Razorpay. By providing payment information, you represent and warrant that you are authorized to use the payment method and that all information you provide is accurate and complete.
                  </p>
                </section>

                <section className="mb-10">
                  <h2 className="text-xl font-semibold text-gray-950 mb-4">
                    5. Orders and Shipping
                  </h2>
                  <p className="text-gray-600 mb-4">
                    All orders are subject to acceptance and availability. We reserve the right to refuse or cancel any order for any reason at any time.
                  </p>
                  <p className="text-gray-600 mb-4">
                    Shipping estimates are provided as guidelines only. We are not responsible for shipping delays caused by factors beyond our control.
                  </p>
                </section>

                <section className="mb-10">
                  <h2 className="text-xl font-semibold text-gray-950 mb-4">
                    6. Returns and Refunds
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Our return and refund policy is outlined separately. Please refer to our Returns Policy for detailed information about returns, exchanges, and refunds.
                  </p>
                </section>

                <section className="mb-10">
                  <h2 className="text-xl font-semibold text-gray-950 mb-4">
                    7. User Conduct
                  </h2>
                  <p className="text-gray-600 mb-4">
                    You agree not to use BellesCart for any unlawful purpose or in any way that could damage the website or impair its availability. You agree not to use the website to:
                  </p>
                  <ul className="list-disc pl-6 text-gray-600 space-y-2">
                    <li>Upload or distribute viruses or other malicious code</li>
                    <li>Attempt to gain unauthorized access to our systems</li>
                    <li>Interfere with other users' use of the website</li>
                    <li>Violate any applicable laws or regulations</li>
                  </ul>
                </section>

                <section className="mb-10">
                  <h2 className="text-xl font-semibold text-gray-950 mb-4">
                    8. Intellectual Property
                  </h2>
                  <p className="text-gray-600 mb-4">
                    All content on BellesCart, including text, graphics, logos, images, and software, is the property of BellesCart or its content suppliers and is protected by intellectual property laws.
                  </p>
                  <p className="text-gray-600">
                    You may not reproduce, distribute, or create derivative works from any content without our express written permission.
                  </p>
                </section>

                <section className="mb-10">
                  <h2 className="text-xl font-semibold text-gray-950 mb-4">
                    9. Privacy
                  </h2>
                  <p className="text-gray-600 mb-4">
                    Your use of BellesCart is also governed by our Privacy Policy. Please review our Privacy Policy, which also governs the website and informs users of our data collection practices.
                  </p>
                </section>

                <section className="mb-10">
                  <h2 className="text-xl font-semibold text-gray-950 mb-4">
                    10. Limitation of Liability
                  </h2>
                  <p className="text-gray-600 mb-4">
                    To the fullest extent permitted by law, BellesCart shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
                  </p>
                </section>

                <section className="mb-10">
                  <h2 className="text-xl font-semibold text-gray-950 mb-4">
                    11. Indemnification
                  </h2>
                  <p className="text-gray-600 mb-4">
                    You agree to indemnify and hold BellesCart and its affiliates, officers, directors, employees, and agents harmless from any claims, liabilities, damages, losses, and expenses arising from your use of the website or violation of these terms.
                  </p>
                </section>

                <section className="mb-10">
                  <h2 className="text-xl font-semibold text-gray-950 mb-4">
                    12. Governing Law
                  </h2>
                  <p className="text-gray-600 mb-4">
                    These terms shall be governed by and construed in accordance with the laws of India, without regard to its conflict of law provisions.
                  </p>
                </section>

                <section className="mb-10">
                  <h2 className="text-xl font-semibold text-gray-950 mb-4">
                    13. Changes to Terms
                  </h2>
                  <p className="text-gray-600 mb-4">
                    We reserve the right to modify these terms at any time. We will notify users of any material changes by posting the new terms on this page. Your continued use of the website after such modifications constitutes your acceptance of the new terms.
                  </p>
                </section>

                <section className="mb-10">
                  <h2 className="text-xl font-semibold text-gray-950 mb-4">
                    14. Contact Information
                  </h2>
                  <p className="text-gray-600 mb-4">
                    If you have any questions about these Terms & Conditions, please contact us through our customer service channels or email us at support@bellescart.com.
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
