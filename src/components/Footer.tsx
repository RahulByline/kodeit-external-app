import { Facebook, Linkedin, Instagram, Youtube, Phone, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border/20 relative overflow-hidden">
      {/* Node-style background graphics */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 1200 400">
          <defs>
            <linearGradient id="nodeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="hsl(200 100% 50%)" />
              <stop offset="100%" stopColor="hsl(280 100% 70%)" />
            </linearGradient>
          </defs>
          
          {/* Connecting lines */}
          <line x1="100" y1="100" x2="300" y2="150" stroke="url(#nodeGradient)" strokeWidth="2" />
          <line x1="300" y1="150" x2="500" y2="120" stroke="url(#nodeGradient)" strokeWidth="2" />
          <line x1="500" y1="120" x2="700" y2="180" stroke="url(#nodeGradient)" strokeWidth="2" />
          <line x1="700" y1="180" x2="900" y2="140" stroke="url(#nodeGradient)" strokeWidth="2" />
          <line x1="200" y1="250" x2="400" y2="280" stroke="url(#nodeGradient)" strokeWidth="2" />
          <line x1="400" y1="280" x2="600" y2="250" stroke="url(#nodeGradient)" strokeWidth="2" />
          <line x1="600" y1="250" x2="800" y2="300" stroke="url(#nodeGradient)" strokeWidth="2" />
          
          {/* Nodes */}
          <circle cx="100" cy="100" r="8" fill="url(#nodeGradient)" className="animate-pulse-glow" />
          <circle cx="300" cy="150" r="6" fill="url(#nodeGradient)" className="animate-pulse-glow" />
          <circle cx="500" cy="120" r="7" fill="url(#nodeGradient)" className="animate-pulse-glow" />
          <circle cx="700" cy="180" r="5" fill="url(#nodeGradient)" className="animate-pulse-glow" />
          <circle cx="900" cy="140" r="8" fill="url(#nodeGradient)" className="animate-pulse-glow" />
          <circle cx="200" cy="250" r="6" fill="url(#nodeGradient)" className="animate-pulse-glow" />
          <circle cx="400" cy="280" r="7" fill="url(#nodeGradient)" className="animate-pulse-glow" />
          <circle cx="600" cy="250" r="5" fill="url(#nodeGradient)" className="animate-pulse-glow" />
          <circle cx="800" cy="300" r="6" fill="url(#nodeGradient)" className="animate-pulse-glow" />
        </svg>
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="mb-6">
              <img 
                src="/logo.png" 
                alt="Kodeit Logo" 
                className="h-8 w-auto"
              />
            </div>
            <ul className="space-y-3 text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Our Story / About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Company Information
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Press Relations
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Partner With Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Contact Details</h4>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-muted-foreground">
                <Phone size={18} className="text-primary" />
                <span>+9716 574 7179</span>
              </div>
              <div className="flex items-center space-x-3 text-muted-foreground">
                <Mail size={18} className="text-primary" />
                <span>info@kodeit.com</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Our Services</h4>
            <ul className="space-y-3 text-muted-foreground">
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Educational Technology
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Moodle Integration
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Data Analytics
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Teacher Training
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary transition-colors">
                  Custom Solutions
                </a>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Follow Us</h4>
            <div className="flex space-x-4">
              <a
                href="#"
                className="p-3 rounded-full bg-card-gradient border border-border/20 hover:border-primary/50 transition-all hover:scale-110 hover:shadow-glow-primary"
              >
                <Facebook size={20} className="text-muted-foreground hover:text-primary transition-colors" />
              </a>
              <a
                href="#"
                className="p-3 rounded-full bg-card-gradient border border-border/20 hover:border-primary/50 transition-all hover:scale-110 hover:shadow-glow-primary"
              >
                <Linkedin size={20} className="text-muted-foreground hover:text-primary transition-colors" />
              </a>
              <a
                href="#"
                className="p-3 rounded-full bg-card-gradient border border-border/20 hover:border-primary/50 transition-all hover:scale-110 hover:shadow-glow-primary"
              >
                <Instagram size={20} className="text-muted-foreground hover:text-primary transition-colors" />
              </a>
              <a
                href="#"
                className="p-3 rounded-full bg-card-gradient border border-border/20 hover:border-primary/50 transition-all hover:scale-110 hover:shadow-glow-primary"
              >
                <Youtube size={20} className="text-muted-foreground hover:text-primary transition-colors" />
              </a>
            </div>

            {/* Instagram Feed Preview */}
            <div className="mt-6">
              <h5 className="text-sm font-medium mb-3 text-muted-foreground">Recent Posts</h5>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="aspect-square bg-card-gradient rounded border border-border/20 hover:border-primary/50 transition-all cursor-pointer group"
                  >
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                      <Instagram size={16} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border/20 text-center text-muted-foreground">
          <p>&copy; 2024 kodeit.com. All rights reserved. Transforming education through technology.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;