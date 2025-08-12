import { useState, memo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

const Header = memo(() => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const scrollToSection = useCallback((sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleNavClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    scrollToSection(sectionId);
    setIsMenuOpen(false);
  }, [scrollToSection]);

  const handleDashboardClick = useCallback(() => {
    scrollToSection('dashboard-section');
  }, [scrollToSection]);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex items-center ml-[-150px]">
            <img
              src="/logo.png"
              alt="Kodeit Logo"
              className="h-16 w-auto"
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
               onClick={(e) => handleNavClick(e, 'features')}>
              Features
            </a>
            <a href="#about" className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
               onClick={(e) => handleNavClick(e, 'about')}>
              About
            </a>
            <a href="#footer" className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
               onClick={(e) => handleNavClick(e, 'footer')}>
              Contact
            </a>
          </nav>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4 mr-[-100px]">
            <ThemeToggle />
            <Button
              variant="hero"
              size="lg"
              className="h-12 px-6"
              onClick={handleDashboardClick}
            >
              Access Dashboard
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-2 md:hidden">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 dark:text-gray-300"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-100 dark:border-gray-800 py-4">
            <nav className="flex flex-col space-y-4">
              <a href="#features" className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
                 onClick={(e) => handleNavClick(e, 'features')}>
                Features
              </a>
              <a href="#about" className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
                 onClick={(e) => handleNavClick(e, 'about')}>
                About
              </a>
              <a href="#footer" className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors"
                 onClick={(e) => handleNavClick(e, 'footer')}>
                Contact
              </a>
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                <Button variant="ghost" size="sm" className="text-gray-700 dark:text-gray-300 w-full justify-start">
                  Login
                </Button>
                <Button variant="hero" size="sm" className="w-full mt-2">
                  Get Started
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
});

Header.displayName = 'Header';

export default Header;