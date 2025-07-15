import { buttonVariants } from '@/components/ui/button';
import { FaChartBar, FaCodeBranch, FaRegClock } from 'react-icons/fa';
import { FaLinkSlash } from 'react-icons/fa6';

import { Link } from 'react-router-dom';
import { twMerge } from 'tailwind-merge';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-36 relative">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900">
          Analyze.{' '}
          <span className="bg-gradient-to-r from-indigo-500 via-sky-500 to-teal-400 text-transparent bg-clip-text">
            Crawl.
          </span>{' '}
          Understand.
        </h1>

        <p className="mt-4 max-w-xl text-lg text-gray-600">
          Discover the structure, links, and SEO issues of any webpage with our
          blazing fast web crawler.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <Link
            to="/home"
            className={twMerge(
              buttonVariants({ variant: 'default', size: 'lg' }),
              'md:text-lg'
            )}
          >
            Get Started
          </Link>
          <Link
            to="/about"
            className={twMerge(
              buttonVariants({ variant: 'outline', size: 'lg' }),
              'md:text-lg'
            )}
          >
            Learn More
          </Link>
        </div>

        {/* spheres */}
        <div className="absolute top-1 right-0 size-60 bg-gradient-to-br from-primary to-white rounded-full blur-3xl opacity-70 pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-0 size-60 bg-gradient-to-br from-primary to-white rounded-full blur-3xl opacity-70 pointer-events-none -z-10" />
      </section>

      {/* Feature Section */}
      <section
        id="features"
        className="px-6 py-20 max-w-5xl mx-auto text-center space-y-12"
      >
        <h2 className="text-3xl font-bold text-gray-900">Features</h2>
        <div className="grid gap-8 md:grid-cols-3 text-left">
          <div className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition">
            <h3 className="text-xl font-semibold text-primary mb-2">
              HTML Analysis
            </h3>
            <p className="text-gray-600">
              Detect HTML version, headings, and title tags effortlessly.
            </p>
          </div>
          <div className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition">
            <h3 className="text-xl font-semibold text-primary mb-2">
              Link Breakdown
            </h3>
            <p className="text-gray-600">
              Get counts for internal, external, and broken links in a snap.
            </p>
          </div>
          <div className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition">
            <h3 className="text-xl font-semibold text-primary mb-2">
              Login Form Detection
            </h3>
            <p className="text-gray-600">
              Identify pages that include login forms or protected areas.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Use Web Crawler?
          </h2>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Point 1 */}
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 text-blue-600 rounded-full p-3">
                <FaChartBar className="size-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Instant Insights</h3>
                <p className="text-gray-600">
                  Get structured data about a website’s structure, links, and
                  metadata within seconds.
                </p>
              </div>
            </div>

            {/* Point 2 */}
            <div className="flex items-start gap-4">
              <div className="bg-green-100 text-green-600 rounded-full p-3">
                <FaCodeBranch className="size-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Developer Friendly</h3>
                <p className="text-gray-600">
                  Designed with modern dev tools, easy to integrate with your
                  own data pipelines or apps.
                </p>
              </div>
            </div>

            {/* Point 3 */}
            <div className="flex items-start gap-4">
              <div className="bg-purple-100 text-purple-600 rounded-full p-3">
                <FaRegClock className="size-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Monitor Changes</h3>
                <p className="text-gray-600">
                  Track structural or accessibility changes on websites you care
                  about.
                </p>
              </div>
            </div>

            {/* Point 4 */}
            <div className="flex items-start gap-4">
              <div className="bg-red-100 text-red-600 rounded-full p-3">
                <FaLinkSlash className="size-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Catch Broken Links</h3>
                <p className="text-gray-600">
                  Detect and list inaccessible or broken links to improve SEO
                  and UX.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>

          <div className="grid md:grid-cols-3 gap-10">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary/20 text-primary rounded-md size-20 flex justify-center items-center mb-4">
                <span className="text-3xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Enter a URL</h3>
              <p className="text-gray-600">
                Type or paste the website address you want to analyze.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary/20 text-primary rounded-md size-20 flex justify-center items-center mb-4">
                <span className="text-3xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Start Crawling</h3>
              <p className="text-gray-600">
                Choose to crawl immediately or add it to the queue for later.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center">
              <div className="bg-primary/20 text-primary rounded-md mb-4 size-20 flex justify-center items-center">
                <span className="text-3xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">View Insights</h3>
              <p className="text-gray-600">
                See the results: headings, broken links, login form, and more.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">
          Ready to crawl your first website?
        </h2>
        <Link
          to="/home"
          className={twMerge(
            buttonVariants({ variant: 'default', size: 'lg' }),
            'text-lg'
          )}
        >
          Start Crawling Now
        </Link>
      </section>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} Web Crawler by Anel Šahović
      </footer>
    </div>
  );
}
