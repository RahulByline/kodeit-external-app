import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <img 
              src="/logo.png" 
              alt="Kodeit Logo" 
              className="h-8 w-auto"
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary transition-colors">
              Features
            </a>
            <a href="#about" className="text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary transition-colors">
              About
            </a>
            <a href="#contact" className="text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary transition-colors">
              Contact
            </a>
          </nav>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            <Button variant="ghost" size="sm" className="text-gray-700 dark:text-gray-200">
              Login
            </Button>
            <Button variant="hero" size="sm">
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-2 md:hidden">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 dark:text-gray-200"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
            <nav className="flex flex-col space-y-4 py-4">
              <a href="#features" className="text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary transition-colors px-4">
                Features
              </a>
              <a href="#about" className="text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary transition-colors px-4">
                About
              </a>
              <a href="#contact" className="text-gray-700 dark:text-gray-200 hover:text-primary dark:hover:text-primary transition-colors px-4">
                Contact
              </a>
              <div className="flex items-center justify-between px-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <span className="text-sm text-gray-500 dark:text-gray-400">Theme</span>
                <ThemeToggle />
              </div>
              <div className="flex flex-col space-y-2 pt-2">
                <Button variant="ghost" size="sm" className="justify-start">
                  Login
                </Button>
                <Button variant="hero" size="sm">
                  Request Demo
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;