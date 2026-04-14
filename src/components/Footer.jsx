import React from 'react';
import logo from '../assets/Iaeste Logo Standard 2.png';

const Footer = () => {
    return (
        <footer className="bg-[#001529] text-white py-12 border-t border-white/10">
            <div className="max-w-screen-xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Brand Section */}
                <div className="col-span-1 md:col-span-1">
                    <div className="flex items-center space-x-3 mb-4">
                        <img src={logo} alt="IAESTE Logo" className="h-12 invert brightness-0 grayscale-0" /> {/* Assuming logo needs inversion or is already white suitable */}
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed mb-4">
                        Work. Experience. Discover.
                    </p>
                    <p className="text-gray-500 text-xs">
                        Empowering students through international exchange programs and professional development opportunities.
                    </p>
                </div>

                {/* Quick Links */}
                <div>
                    <h3 className="text-lg font-semibold mb-4 text-blue-400">Quick Links</h3>
                    <ul className="space-y-2 text-sm text-gray-300">
                        {['About Us', 'Benefits', 'Membership', 'Testimonial'].map((link) => (
                            <li key={link}>
                                <a href="#" className="hover:text-white hover:translate-x-1 inline-block transition-transform duration-200">{link}</a>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Students */}
                <div>
                    <h3 className="text-lg font-semibold mb-4 text-blue-400">Students</h3>
                    <ul className="space-y-2 text-sm text-gray-300">
                        {['FAQ', 'Contact Us', 'Our Team'].map((link) => (
                            <li key={link}>
                                <a href="#" className="hover:text-white hover:translate-x-1 inline-block transition-transform duration-200">{link}</a>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Get In Touch */}
                <div>
                    <h3 className="text-lg font-semibold mb-4 text-blue-400">Get In Touch</h3>
                    <ul className="space-y-3 text-sm text-gray-300">
                        <li className="flex items-start">
                            <svg className="w-5 h-5 mr-2 text-blue-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            <span>JECRC University,<br />Jaipur, Rajasthan, India</span>
                        </li>
                        <li className="flex items-center">
                            <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                            <a href="mailto:support@iaestelcjecrc.com" className="hover:text-white transition-colors">head.hra@iaestelcjecrc.com</a>
                        </li>
                        <li className="flex items-center">
                            <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                            <span>+91 6367044011</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-500 text-xs">
                © {new Date().getFullYear()} IAESTE LC JECRC. All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;
