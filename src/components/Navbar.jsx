import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/Iaeste Logo Standard 2.png';
import jecrcLogo from '../assets/logo-removebg-preview 1.png';

const Navbar = ({ textDark = false }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Dynamic classes based on textDark prop
  const textColorClass = textDark ? 'text-[#0B3D59]' : 'text-white';
  const subTextColorClass = textDark ? 'text-gray-600' : 'text-blue-200';
  const navBackgroundClass = textDark ? 'bg-white/80 border-gray-200 shadow-sm' : 'bg-white/10 border-gray-200/20';
  const hoverBgClass = textDark ? 'hover:bg-gray-100 md:hover:bg-transparent' : 'hover:bg-white/10 md:hover:bg-transparent';
  const mobileMenuBgClass = textDark ? 'bg-white border-gray-200' : 'bg-white/5 border-gray-100/20';
  const linkHoverTextClass = textDark ? 'md:hover:text-blue-600' : 'md:hover:text-blue-300';
  const linkUnderlineClass = textDark ? 'after:bg-blue-600' : 'after:bg-blue-300';
  const mobileToggleColor = textDark ? 'text-gray-600 hover:bg-gray-100' : 'text-gray-100 hover:bg-white/10';
  const logoFilter = textDark ? 'invert-0' : 'brightness-0 invert'; // If logo is dark by default, invert for dark mode. If white, remove invert. 
  // Assuming logo is "Iaeste Logo Standard 2.png" which looks like blue.
  // Wait, if logo is standard blue, it works on white. On dark, it might need to be white (invert).

  return (
    <nav className={`fixed w-full z-50 top-0 start-0 border-b backdrop-blur-md transition-colors duration-300 ${navBackgroundClass}`}>
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <Link to="/" className="flex items-center space-x-3 rtl:space-x-reverse group">
            {/* Logo handling: standard logo is likely dark/colored. On dark bg, we invert it to make it white. On light bg, we keep it normal. */}
            <img
              src={logo}
              className={`h-10 md:h-12 transition-transform duration-300 group-hover:scale-105 ${!textDark ? 'brightness-0 invert' : ''}`}
              alt="IAESTE Logo"
            />
            <div className="flex flex-col">
              <span className={`self-center text-xl font-bold whitespace-nowrap ${textColorClass}`}>IAESTE</span>
              <span className={`text-[10px] tracking-widest uppercase ${subTextColorClass}`}>LC JECRC</span>
            </div>
          </Link>

          <span className={`hidden sm:block h-10 w-px ${textDark ? 'bg-gray-200' : 'bg-white/20'}`} />

          <a
            href="https://jecrcuniversity.edu.in/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center group"
            aria-label="JECRC University (opens in new tab)"
            title="JECRC University"
          >
            <img
              src={jecrcLogo}
              className="h-9 md:h-11 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              alt="JECRC Logo"
            />
          </a>
        </div>
        <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
          <Link to="/membership" className="text-white bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-full text-sm px-6 py-2.5 text-center transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer">
            Avail Membership
          </Link>
          <button
            onClick={() => setIsOpen(!isOpen)}
            type="button"
            className={`inline-flex items-center p-2 w-10 h-10 justify-center text-sm rounded-lg md:hidden focus:outline-none focus:ring-2 focus:ring-gray-200 ${mobileToggleColor}`}
            aria-controls="navbar-sticky"
            aria-expanded={isOpen}
          >
            <span className="sr-only">Open main menu</span>
            <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15" />
            </svg>
          </button>
        </div>
        <div className={`items-center justify-between w-full md:flex md:w-auto md:order-1 ${isOpen ? 'block' : 'hidden'}`} id="navbar-sticky">
          <ul className={`flex flex-col p-4 md:p-0 mt-4 font-medium border rounded-lg md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-transparent ${mobileMenuBgClass}`}>
            {[
              { name: 'About', link: '#' },
              { name: 'Gallery', link: '#' },
              { name: 'Membership', link: '/membership' },
              { name: 'Department', link: '#' },
              { name: 'Testimonials', link: '#' }
            ].map((item) => (
              <li key={item.name}>
                <Link to={item.link} className={`block py-2 px-3 rounded-sm md:p-0 transition-colors duration-300 relative after:content-[''] after:absolute after:w-0 after:h-0.5 after:left-0 after:-bottom-1 after:transition-all after:duration-300 hover:after:w-full ${textColorClass} ${hoverBgClass} ${linkHoverTextClass} ${linkUnderlineClass}`}>
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
