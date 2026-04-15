export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-12 bg-white min-h-screen">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Privacy Policy</h1>
      <p className="text-sm text-gray-400 mb-10">Last updated: April 15, 2026</p>
      <div className="space-y-8 text-sm text-gray-600 leading-relaxed">
        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-2">1. Introduction</h2>
          <p>liveforownhappiness operates Product Reviews for Ecwid and other apps on Shopify, BigCommerce, Wix, Ecwid, and WooCommerce. This Privacy Policy explains how we collect, use, and protect information.</p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-2">2. Information We Collect</h2>
          <ul className="list-disc list-inside space-y-1 text-gray-500">
            <li>Store information (store ID, access token) during installation</li>
            <li>Order data (customer email, name, product names) to send review requests</li>
            <li>Review content (star rating, title, body) submitted by customers</li>
            <li>Technical data including browser type and device information</li>
          </ul>
        </section>
        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-2">3. How We Use Your Information</h2>
          <ul className="list-disc list-inside space-y-1 text-gray-500">
            <li>To send automated review request emails to customers after purchases</li>
            <li>To display approved reviews on your product pages via the widget</li>
            <li>To provide review management tools in the merchant dashboard</li>
            <li>To comply with legal obligations</li>
          </ul>
        </section>
        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-2">4. Data Sharing</h2>
          <p>We do not sell your data. We share data with Vercel (hosting), Neon (database), and Resend (email delivery) solely to operate the app.</p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-2">5. Data Retention</h2>
          <p>Data is retained while the app is installed. Upon uninstallation, data is deleted within 30 days unless required by law.</p>
        </section>
        <section>
          <h2 className="text-base font-semibold text-gray-900 mb-2">6. Contact</h2>
          <p>Questions? <a href="mailto:liveforownhappiness@gmail.com" className="text-blue-600 hover:underline">liveforownhappiness@gmail.com</a></p>
        </section>
      </div>
    </main>
  )
}
