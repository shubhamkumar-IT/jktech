import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen">
      <Header/>
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 bg-gray-50">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Simplify Your Document Management
        </h1>
        <p className="text-gray-600 text-lg md:text-xl mb-8">
          Securely store, manage, and access your documents anywhere, anytime.
        </p>
        <button className="px-6 py-3 bg-blue-600 text-white rounded-full text-lg hover:bg-blue-700 transition">
          Get Started
        </button>
      </section>
      <Footer />
    </main>
  );
}
