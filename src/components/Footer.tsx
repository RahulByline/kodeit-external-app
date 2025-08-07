import React, { useEffect, useRef } from "react";
import { Facebook, Linkedin, Instagram, Youtube, Phone, Mail } from "lucide-react";

// --- Helper class for the Canvas Animation (TypeScript Compliant) ---
class Particle {
  x: number;
  y: number;
  directionX: number;
  directionY: number;
  size: number;
  color: string;

  constructor(x: number, y: number, directionX: number, directionY: number, size: number, color: string) {
    this.x = x;
    this.y = y;
    this.directionX = directionX;
    this.directionY = directionY;
    this.size = size;
    this.color = color;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  update(ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, mouse: { x: number | null, y: number | null, radius: number }) {
    if (this.x > canvas.width || this.x < 0) this.directionX = -this.directionX;
    if (this.y > canvas.height || this.y < 0) this.directionY = -this.directionY;
    
    if (mouse.x !== null && mouse.y !== null) {
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < mouse.radius) {
        this.x += dx / 50; 
        this.y += dy / 50;
      }
    }
    
    this.x += this.directionX;
    this.y += this.directionY;
    this.draw(ctx);
  }
}

const Footer = (): JSX.Element => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const footerRef = useRef<HTMLElement>(null);
  const mouseRef = useRef({
    x: null as number | null,
    y: null as number | null,
    radius: 120, 
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const footer = footerRef.current;
    if (!canvas || !footer) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particlesArray: Particle[] = [];

    const handleMouseMove = (event: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        mouseRef.current.x = event.clientX - rect.left;
        mouseRef.current.y = event.clientY - rect.top;
    };
    
    const handleMouseLeave = () => {
        mouseRef.current.x = null;
        mouseRef.current.y = null;
    };
    
    footer.addEventListener('mousemove', handleMouseMove);
    footer.addEventListener('mouseleave', handleMouseLeave);

    const init = () => {
        canvas.width = footer.offsetWidth;
        canvas.height = footer.offsetHeight;
        particlesArray = [];
        const numberOfParticles = (canvas.width * canvas.height) / 9000;
        for (let i = 0; i < numberOfParticles; i++) {
            const size = Math.random() * 2 + 1;
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const directionX = (Math.random() * 0.4) - 0.2;
            const directionY = (Math.random() * 0.4) - 0.2;
            const colorValue = Math.floor(Math.random() * 55 + 200); 
            const color = `rgb(${colorValue},${colorValue},${colorValue})`;
            particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
        }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mouse = mouseRef.current;

      for (const particle of particlesArray) {
        particle.update(ctx, canvas, mouse);
      }
      
      connect(mouse);
      animationFrameId = requestAnimationFrame(animate);
    };

    const connect = (mouse: { x: number | null, y: number | null, radius: number }) => {
        for (let a = 0; a < particlesArray.length; a++) {
            for (let b = a; b < particlesArray.length; b++) {
                const distance = Math.sqrt(
                  (particlesArray[a].x - particlesArray[b].x) ** 2 +
                  (particlesArray[a].y - particlesArray[b].y) ** 2
                );

                if (distance < 100) {
                    const opacityValue = 1 - (distance / 100);
                    ctx.strokeStyle = `rgba(255, 255, 255, ${opacityValue})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                    ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                    ctx.stroke();
                }
            }
        }

        if (mouse.x !== null && mouse.y !== null) {
          let linesDrawnToMouse = 0;
          const maxMouseLines = 7;

          for (const particle of particlesArray) {
            if (linesDrawnToMouse >= maxMouseLines) break;
            
            const distance = Math.sqrt((particle.x - mouse.x) ** 2 + (particle.y - mouse.y) ** 2);
            if (distance < mouse.radius) {
              const opacityValue = 1 - (distance / mouse.radius);
              ctx.strokeStyle = `rgba(255, 255, 255, ${opacityValue * 0.5})`;
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(particle.x, particle.y);
              ctx.lineTo(mouse.x, mouse.y);
              ctx.stroke();
              linesDrawnToMouse++;
            }
          }
        }
    }
    
    init();
    animate();
    
    const resizeObserver = new ResizeObserver(() => {
        cancelAnimationFrame(animationFrameId);
        init();
        animate();
    });
    resizeObserver.observe(footer);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      footer.removeEventListener('mousemove', handleMouseMove);
      footer.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <footer ref={footerRef} className="bg-gray-950 border-t border-gray-700 relative overflow-hidden">
      
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 1,
          opacity: 0.6,
        }}
      />
      
      {/* --- THIS IS THE MODIFIED DIV FOR THE WATERMARK --- */}
      <div style={{
          position: 'absolute',
          top: '0rem', // Positioned at the top edge
          right: '1rem', // Spacing from the right edge
          fontFamily: "'Inter', sans-serif, system-ui",
          // Responsive font size: min 3rem, preferred 12vw, max 10rem
          fontSize: 'clamp(3rem, 12vw, 10rem)', 
          fontWeight: 900, // Make it extra bold
          color: 'rgba(255, 255, 255, 0.08)', // Watermark color
          textShadow: '0 4px 30px rgba(0, 0, 0, 0.2)', // Diffuse shadow
          zIndex: 2,
          pointerEvents: 'none', // Make it non-interactive
          lineHeight: '1', // Ensure tight line height for better positioning
        }}
      >
       <h1>KODEIT</h1>
      </div>

      {/* The rest of your footer content remains unchanged */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="mb-6">
              <img 
                src="/logo.png"
                alt="Kodeit Logo" 
                className="h-20 w-auto"
              />
            </div>
            <ul className="space-y-3 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Our Story</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Company Information</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Press Relations</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Partner With Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
          {/* Contact Details */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">Contact Details</h4>
            <div className="space-y-4 text-gray-400">
              <div className="flex items-center space-x-3">
                <Phone size={18} className="text-gray-300" />
                <span>+9716 574 7179</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail size={18} className="text-gray-300" />
                <span>info@kodeit.com</span>
              </div>
            </div>
          </div>
          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">Our Services</h4>
            <ul className="space-y-3 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Educational Technology</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Moodle Integration</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Data Analytics</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Teacher Training</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Custom Solutions</a></li>
            </ul>
          </div>
          {/* Social Media */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">Follow Us</h4>
            <div className="flex space-x-4">
              {[Facebook, Linkedin, Instagram, Youtube].map((Icon, index) => (
                <a
                  key={index}
                  href="#"
                  className="p-3 rounded-full bg-gray-800/50 border border-gray-700 hover:border-white transition-all hover:scale-110 hover:bg-gray-800"
                >
                  <Icon size={20} className="text-gray-400 hover:text-white transition-colors" />
                </a>
              ))}
            </div>
            <div className="mt-6">
              <h5 className="text-sm font-medium mb-3 text-gray-400">Recent Posts</h5>
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="aspect-square bg-gray-800/50 rounded border border-gray-700 hover:border-white transition-all cursor-pointer group"
                  >
                    <div className="w-full h-full flex items-center justify-center text-gray-500 group-hover:text-white transition-colors">
                      <Instagram size={16} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-700 text-center text-gray-500">
          <p>&copy; {new Date().getFullYear()} kodeit.com. All rights reserved. Transforming education through technology.</p>
        </div>
      </div>
    </footer>
  );
};
export default Footer;