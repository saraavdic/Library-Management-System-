import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import LibraryPortal from "./pages/LibraryPortal";
import Status from "./pages/Status";
import Membership from "./pages/Membership";
import Catalogue from "./pages/Catalogue"; 
import Rules from "./pages/Rules";
import Info from "./pages/Info";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import AdminLogin from "./components/LibraryWebsite/AdminLogin";
import ActivateAccount from "./pages/ActivateAccount";
import Error404 from "./pages/Error404";
import Error403 from "./pages/Error403";
import Error500 from "./pages/Error500";

import Header from "./components/LibraryWebsite/Header";
import Footer from "./components/LibraryWebsite/Footer";
import Hero from "./components/LibraryWebsite/Hero";
import Announcements from "./components/LibraryWebsite/Announcements";
import History from "./components/LibraryWebsite/History";
import Gallery from "./components/LibraryWebsite/Gallery";
import Contact from "./components/LibraryWebsite/Contact";
import Login from "./components/LibraryWebsite/Login";
import LoggedOut from "./components/LibraryWebsite/LoggedOut";
import ProtectedRoute from "./components/auth/ProtectedRoute";


import "./styles/style.css";

function AppContent() {
  const location = useLocation();
  const isLibraryPortal = location.pathname === '/LibraryPortal';
  const isStatus = location.pathname === '/status';
  const isMembership = location.pathname === '/membership';
  const isCatalogue = location.pathname ==='/catalogue';
  const isRules = location.pathname ==='/rules';
  const isInfo = location.pathname ==='/info';
  const isDashboard = location.pathname.toLowerCase().startsWith('/dashboard');


  // Global modal watcher: ensures body overflow/padding is correctly managed when overlays appear/disappear
  useEffect(() => {
    let savedOverflow = '';
    let savedPadding = '';

    const update = () => {
      const hasModal = !!document.querySelector('.modal-overlay');
      if (hasModal) {
        if (savedOverflow === '') savedOverflow = document.body.style.overflow;
        if (savedPadding === '') savedPadding = document.body.style.paddingRight;
        const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
        if (scrollBarWidth > 0) {
          document.body.style.paddingRight = `${scrollBarWidth}px`;
        }
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = savedOverflow || '';
        document.body.style.paddingRight = savedPadding || '';
        savedOverflow = '';
        savedPadding = '';

        // Fallback in case computed overflow remains hidden
        setTimeout(() => {
          if (!document.querySelector('.modal-overlay')) {
            const computedOverflow = window.getComputedStyle(document.body).overflow;
            if (computedOverflow === 'hidden') {
              document.body.style.overflow = 'auto';
              if (process.env.NODE_ENV === 'development') {
                // eslint-disable-next-line no-console
                console.warn('[App] Fallback: forced document.body.style.overflow = auto');
              }
            }
          }
        }, 0);
      }
    };

    const obs = new MutationObserver(update);
    obs.observe(document.documentElement || document.body, { childList: true, subtree: true });
    if (document.body) {
      obs.observe(document.body, { attributes: true, attributeFilter: ['style'] });
    }
    window.addEventListener('resize', update);

    // run initially
    update();

    return () => {
      obs.disconnect();
      window.removeEventListener('resize', update);
      update();
    };
  }, []);

  // Quick runtime log to help debug blank/white screen issues
  useEffect(() => {
    try {
      // eslint-disable-next-line no-console
      console.log('AppContent mounted. location=', window.location.pathname);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('AppContent logging failed', e);
    }
  }, []);

  return (
    <div className="app">
      {!isLibraryPortal && !isStatus && !isMembership && !isCatalogue && !isRules && !isInfo && !isDashboard &&  <Header />}

      <Routes>
        <Route
          path="/"
          element={
            <>
              <div className="background-video-container">
                <video className="background-video" loop autoPlay muted playsInline>
                  <source src="/Media/library.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <div className="video-gradient-overlay"></div>
              </div>

              <main>
                <Hero />
                <Announcements />
                <History />
                <Gallery />
              </main>
            </>
          }
        />

        <Route path="/LibraryPortal" element={<ProtectedRoute><LibraryPortal /></ProtectedRoute>} />
        <Route path="/status" element={<Status />} />
        <Route path="/membership" element={<Membership />} />
        <Route path="/catalogue" element={<Catalogue />} /> 
        <Route path="/rules" element={<Rules />} />
        <Route path="/login" element={<Login />} />
        <Route path="/logged-out" element={<LoggedOut />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/info" element={<Info />} />
        <Route path="/dashboard" element={<ProtectedRoute requireAdmin><Dashboard /></ProtectedRoute>} />
        <Route path="/admin-6f2b3d" element={<ProtectedRoute requireAdmin><Admin /></ProtectedRoute>} />
        {/* Hidden admin login page (do not link publicly) */}
        <Route path="/admin-login-6f2b3d" element={<AdminLogin />} />
        <Route path="/activate-account" element={<ActivateAccount />} />
        <Route path="/403" element={<Error403 />} />
        <Route path="/404" element={<Error404 />} />
        <Route path="/500" element={<Error500 />} />
        {/* Catch-all should render our friendly 404 page */}
        <Route path="*" element={<Error404 />} />
      </Routes>

      {!isLibraryPortal && !isStatus && !isMembership && !isCatalogue && !isRules && !isInfo && !isDashboard && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}