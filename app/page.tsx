export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-white">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-2xl font-semibold text-gray-900">Product Reviews for Ecwid</h1>
        <p className="text-gray-500 text-sm leading-relaxed">
          Automatically collect customer reviews after every order and display
          star ratings on your product pages — no coding required.
        </p>
        <a
          href="https://www.ecwid.com/apps"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-5 py-2.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
        >
          Get it on Ecwid App Market
        </a>
      </div>
    </main>
  )
}
