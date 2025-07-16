import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { IoIosMail } from 'react-icons/io';

export default function About() {
  return (
    <section className="max-w-5xl mx-auto px-6 py-20 text-gray-800">
      <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
        About <span className="text-sky-600">Web Crawler</span>
      </h1>

      <p className="text-lg mb-8 leading-relaxed">
        <strong>Web Crawler</strong> is a modern web-based application designed
        to help developers, SEO analysts, and curious users extract and analyze
        structured information from any website URL. Whether you're debugging
        your site or exploring how others structure theirs, Web Crawler makes it
        simple and insightful.
      </p>

      <div className="grid md:grid-cols-2 gap-12 mb-16">
        <div>
          <h2 className="text-2xl font-bold mb-4">🔍 Features</h2>
          <ul className="list-disc pl-6 space-y-3 text-base">
            <li>Detects HTML version and page title</li>
            <li>Counts heading tags (H1–H6) and displays them</li>
            <li>Analyzes internal vs. external links</li>
            <li>Identifies broken (inaccessible) links</li>
            <li>Detects presence of login forms</li>
            <li>Queued crawling and real-time progress tracking</li>
            <li>Sortable, searchable, and paginated dashboard</li>
            <li>Re-analyze or delete URLs in bulk</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">🛠 Tech Stack</h2>
          <ul className="list-disc pl-6 space-y-3 text-base">
            <li>
              <strong>Frontend:</strong> React + TypeScript, Vite, Tailwind CSS,
              React Router
            </li>
            <li>
              <strong>Backend:</strong> Node.js + Express, Prisma ORM, MySQL
            </li>
            <li>
              <strong>Other:</strong> Zod for validation, Axios, JWT-based
              Authorization
            </li>
            <li>
              <strong>Database:</strong> MySQL with Prisma Migrations & Seeding
            </li>
            <li>
              <strong>Testing:</strong> Simple automated test cases
              (planned/optional)
            </li>
            <li>
              <strong>Deploy-ready:</strong> Docker support planned
            </li>
          </ul>
        </div>

        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-4">🎯 Project Purpose</h2>
          <p className="text-base leading-relaxed">
            This project was built as part of a full-stack developer evaluation
            challenge with a front-end focus. The goal was to demonstrate
            production-ready code, clean architecture, responsive UI, and
            backend integration — simulating a realistic workflow at a modern
            tech company.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">📦 How to Use</h2>
          <ol className="list-decimal pl-6 space-y-2 text-base">
            <li>Enter a URL on the Crawl or Dashboard page</li>
            <li>Choose to either crawl it immediately or queue it</li>
            <li>Track real-time crawl status in the dashboard</li>
            <li>View a detailed breakdown of the page's structure</li>
            <li>Reanalyze or delete URLs with a single click</li>
          </ol>
        </div>
      </div>

      <div className="mt-12 border-t pt-8">
        <h2 className="text-2xl font-bold mb-4">👤 Author</h2>
        <p className="text-base mb-4">
          This app was built by <strong>Anel Šahović</strong>, a web developer
          passionate about clean code, modern UI/UX, and full-stack development.
        </p>

        <div className="flex items-center gap-4 text-neutral-600 text-lg">
          <a
            href="https://github.com/anelsahovic"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-900 transition"
            aria-label="GitHub"
          >
            <FaGithub />
          </a>
          <a
            href="https://linkedin.com/in/anelsahovic"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-700 transition"
            aria-label="LinkedIn"
          >
            <FaLinkedin />
          </a>
          <a
            href="mailto:anel.sahovic.bsc@gmail.com"
            className="hover:text-red-600 transition"
            aria-label="Email"
          >
            <IoIosMail />
          </a>
        </div>

        <p className="text-sm text-neutral-500 mt-4">
          &copy; {new Date().getFullYear()} Anel Šahović — All rights reserved.
        </p>
      </div>
    </section>
  );
}
