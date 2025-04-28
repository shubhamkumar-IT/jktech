export default function Footer() {
  return (
    <footer className="bg-gray-100 py-6 ">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between text-center text-gray-600 text-sm">
        <p>© {new Date().getFullYear()} DocuManage. All rights reserved.</p>
        <div className="flex space-x-4 mt-2 md:mt-0">
          <a href="#privacy" className="hover:text-blue-600 transition">
            Privacy
          </a>
          <a href="#terms" className="hover:text-blue-600 transition">
            Terms
          </a>
        </div>
      </div>
    </footer>
  );
}
