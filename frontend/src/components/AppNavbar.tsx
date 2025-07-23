import { MdDashboard, MdLogout } from 'react-icons/md';
import { Link, useLocation } from 'react-router-dom';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from './ui/sheet';
import {
  FaAngleDoubleUp,
  FaAngleLeft,
  FaGithub,
  FaLinkedin,
} from 'react-icons/fa';
import { IoIosMail, IoMdMenu } from 'react-icons/io';
import { BsDatabaseFillAdd } from 'react-icons/bs';
import { useState } from 'react';

export default function AppNavbar() {
  const location = useLocation();
  const pathname = location.pathname;
  const [openNavbar, setOpenNavbar] = useState(true);

  const navItems = [
    { title: 'Crawl', href: '/crawl', icon: <BsDatabaseFillAdd /> },
    { title: 'Dashboard', href: '/dashboard', icon: <MdDashboard /> },
  ];

  return (
    <div
      className={`fixed w-full flex flex-row-reverse justify-between items-center md:absolute left-0 md:left-3  md:w-16 p-2 backdrop-blur md:rounded-lg bg-neutral-100/30 shadow-md border z-50 transition-all duration-500 ${
        openNavbar
          ? 'md:top-1/2 md:-translate-y-1/2 border-neutral-200'
          : 'md:bottom-5 h-16 -translate-y-0 border-primary/30'
      }`}
    >
      <div
        className={`flex flex-col items-center justify-between gap-10 relative ${
          openNavbar ? '' : 'h-10'
        }`}
      >
        <div
          onClick={() => setOpenNavbar((prev) => !prev)}
          className={`absolute flex justify-center items-center top-0 p-2 cursor-pointer left-1/2 -translate-x-1/2 
            ${openNavbar ? '-translate-y-10 ' : '-translate-y-11 '}`}
        >
          <FaAngleDoubleUp
            className={`animate-bounce transition-all duration-300 ${
              openNavbar ? 'rotate-180' : 'rotate-0'
            }`}
          />
        </div>
        {/* open home page image */}
        <Link
          to="/"
          className="md:hidden flex items-center gap-2 font-bold uppercase tracking-wide text-neutral-800 hover:text-primary transition-colors duration-300"
        >
          <div className="w-full flex justify-center items-center p-2">
            <img
              src="/logo.png"
              alt="Web Crawler Logo"
              className="size-7 object-contain"
            />
          </div>
          <span className="w-full whitespace-nowrap text-sm md:hidden ">
            Crawler
          </span>
        </Link>

        {/* open navbar image */}
        <div
          onClick={() => setOpenNavbar((prev) => !prev)}
          className="hidden md:flex items-center gap-2 font-bold uppercase tracking-wide text-neutral-800 hover:text-primary transition-colors duration-300 cursor-pointer"
        >
          <div className="w-full flex justify-center items-center p-2">
            <img
              src="/logo.png"
              alt="Web Crawler Logo"
              className="size-7 object-contain"
            />
          </div>
          <span className="w-full whitespace-nowrap text-sm md:hidden ">
            Crawler
          </span>
        </div>

        <div
          className={`hidden  w-full h-full  flex-col gap-2 ${
            openNavbar ? 'md:flex' : 'hidden'
          }`}
        >
          {/* Desktop nav links */}
          {navItems.map((navItem) => (
            <Link
              key={navItem.href}
              to={navItem.href}
              className={`justify-center items-center h-auto w-full p-4 gap-2 font-semibold rounded-lg transition duration-300  ${
                navItem.href === pathname
                  ? 'bg-primary/10 text-primary'
                  : 'text-neutral-600 hover:text-neutral-900 hover:scale-110'
              } `}
            >
              <span>{navItem.icon}</span>
              <span className="md:hidden"> {navItem.title}</span>
            </Link>
          ))}
        </div>

        <Link
          to={'/'}
          className={`hidden  justify-start items-center p-4 gap-2 font-semibold rounded-lg transition duration-300 ${
            openNavbar ? 'md:flex' : 'hidden'
          }`}
        >
          <span>
            <MdLogout className="rotate-180" />
          </span>
          <span className="md:hidden"> Logout</span>
        </Link>
      </div>

      {/* Mobile menu */}
      <div className="flex md:hidden items-center">
        <Sheet>
          <SheetTrigger className="flex items-center justify-center">
            <IoMdMenu className="size-7 text-neutral-700" />
          </SheetTrigger>

          <SheetContent
            side="left"
            className="flex flex-col justify-between p-6 space-y-6"
          >
            {/* Header */}
            <div className="space-y-1">
              <SheetHeader className="flex flex-col justify-center items-center w-full text-center">
                <SheetTitle>
                  <Link
                    to="/"
                    className="flex flex-col items-center gap-2 font-bold text-xl tracking-wide text-neutral-800 hover:text-primary transition"
                  >
                    <img
                      src="/logo.png"
                      alt="Web Crawler Logo"
                      className="w-7 h-7 object-contain"
                    />
                    <span>Web Crawler</span>
                  </Link>
                </SheetTitle>
                <SheetDescription className="text-sm text-neutral-500">
                  Analyze websites. Instantly.
                </SheetDescription>
              </SheetHeader>
            </div>

            {/* Navigation Items */}
            <nav className="flex flex-col h-full gap-3 mt-4">
              {navItems.map((navItem) => (
                <SheetClose key={navItem.href} asChild>
                  <Link
                    to={navItem.href}
                    className={`flex items-center justify-between px-4 py-2 rounded-lg text-base font-medium transition-all ${
                      navItem.href === pathname
                        ? 'bg-blue-50 text-primary font-semibold'
                        : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'
                    }`}
                  >
                    <span className="flex justify-center items-center gap-2">
                      {navItem.icon} {navItem.title}
                    </span>
                    {navItem.href === pathname && (
                      <FaAngleLeft className="text-primary" />
                    )}
                  </Link>
                </SheetClose>
              ))}
            </nav>
            <Link
              to={'/'}
              className={`flex justify-start items-center p-4 gap-2 font-semibold rounded-lg transition duration-300`}
            >
              <span>
                <MdLogout className="rotate-180" />
              </span>
              <span className="md:hidden"> Logout</span>
            </Link>
            {/* Footer / Social Links */}
            <SheetFooter className="border-t border-neutral-200 pt-4">
              <div className="flex flex-col gap-2 text-sm text-neutral-600 w-full">
                <p className="font-medium">Contact information</p>
                <div className="flex items-center gap-4">
                  <a href="https://linkedin.com/in/anelsahovic" target="_blank">
                    <FaLinkedin className="w-5 h-5 hover:text-blue-600 transition" />
                  </a>
                  <a href="https://github.com/anelsahovic" target="_blank">
                    <FaGithub className="w-5 h-5 hover:text-neutral-800 transition" />
                  </a>
                  <a href="mailto:anel.sahovic.bsc@gmail.com">
                    <IoIosMail className="w-5 h-5 hover:text-red-500 transition" />
                  </a>
                </div>
                <p className="text-xs text-neutral-400 mt-2">
                  &copy; {new Date().getFullYear()} Anel Šahović
                </p>
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
