// File: Footer.tsx
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

  update(
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    mouse: { x: number | null; y: number | null; radius: number }
  ) {
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

  // ------------------ Canvas background animation ------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    const footer = footerRef.current;
    if (!canvas || !footer) return;

    const ctx = canvas.getContext("2d");
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

    footer.addEventListener("mousemove", handleMouseMove);
    footer.addEventListener("mouseleave", handleMouseLeave);

    const init = () => {
      canvas.width = footer.offsetWidth;
      canvas.height = footer.offsetHeight;
      particlesArray = [];
      const numberOfParticles = (canvas.width * canvas.height) / 9000;
      for (let i = 0; i < numberOfParticles; i++) {
        const size = Math.random() * 2 + 1;
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const directionX = Math.random() * 0.4 - 0.2;
        const directionY = Math.random() * 0.4 - 0.2;
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

    const connect = (mouse: { x: number | null; y: number | null; radius: number }) => {
      for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
          const distance = Math.sqrt(
            (particlesArray[a].x - particlesArray[b].x) ** 2 + (particlesArray[a].y - particlesArray[b].y) ** 2
          );

          if (distance < 100) {
            const opacityValue = 1 - distance / 100;
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
            const opacityValue = 1 - distance / mouse.radius;
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
    };

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
      footer.removeEventListener("mousemove", handleMouseMove);
      footer.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  // ------------------ Instagram thumbnails data (UPDATE HERE) ------------------
  const instagramItems: { src: string; href: string; alt: string }[] = [
    { src: "/insta/image1.jpg", href: "https://www.instagram.com/p/C-AcB7RIHKN/", alt: "Instagram post 1" },
    { src: "/insta/image2.jpg", href: "https://www.instagram.com/p/C94bozAI0Pb/", alt: "Instagram post 2" },
    { src: "/insta/image3.jpg", href: "https://www.instagram.com/p/C9R4EgLvWJh/", alt: "Instagram post 3" },
    { src: "/insta/image4.jpg", href: "https://www.instagram.com/p/C8Pq-2RP4-i/", alt: "Instagram post 4" },
    { src: "/insta/image5.jpg", href: "https://www.instagram.com/p/C73t9qFI5bC/", alt: "Instagram post 5" },
    { src: "/insta/image6.jpg", href: "https://www.instagram.com/p/C7yMDiaPsWF/", alt: "Instagram post 6" },
  ];

  return (
    <footer id="footer" ref={footerRef} className="bg-gray-950 border-t border-gray-700 relative overflow-hidden">
      {/* Local CSS for hover gloss (no background/card behind images) */}
      <style>{`
        @keyframes shine {
          0% { transform: translateX(-150%) }
          100% { transform: translateX(150%) }
        }
        .ig-gloss:before {
          content: "";
          position: absolute;
          top: 0; left: 0; height: 100%; width: 30%;
          background: linear-gradient(to right, rgba(255,255,255,0.0), rgba(255,255,255,0.15), rgba(255,255,255,0.0));
          transform: translateX(-150%);
          animation: shine 3s ease-in-out infinite;
          pointer-events: none;
        }
      `}</style>

      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 1,
          opacity: 0.6,
        }}
      />

      {/* --- Watermark (unchanged) --- */}
      <div
        style={{
          position: "absolute",
          top: "0rem",
          right: "1rem",
          fontFamily: "'Inter', sans-serif, system-ui",
          fontSize: "clamp(3rem, 12vw, 10rem)",
          fontWeight: 900,
          color: "rgba(255, 255, 255, 0.08)",
          textShadow: "0 4px 30px rgba(0, 0, 0, 0.2)",
          zIndex: 2,
          pointerEvents: "none",
          lineHeight: "1",
        }}
      >
        <h1>KODEIT</h1>
      </div>

      {/* --- Main footer content --- */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="mb-6">
              <img src="/logo.png" alt="Kodeit Logo" className="h-20 w-auto" />
            </div>
            <ul className="space-y-3 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Our Story</a></li>
              <li>
                <a
                  href="https://www.kodeit.com/about.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Company Information
                </a>
              </li>
              <li>
                <a
                  href="https://www.kodeit.com/global_partnership.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Partner With Us
                </a>
              </li>
              <li>
                <a
                  href="https://www.kodeit.com/privacy-policy.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
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
                <a
                  href="mailto:info@kodeit.com"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  info@kodeit.com
                </a>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">Our Services</h4>
            <ul className="space-y-3 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Educational Technology</a></li>
              <li><a href="#" className="hover:text-white transition-colors">For Teacher</a></li>
              <li><a href="#" className="hover:text-white transition-colors">For Schools</a></li>
              <li><a href="#" className="hover:text-white transition-colors">For Students</a></li>
            </ul>
          </div>

          {/* Social Media + Instagram Grid (NO CONTAINER BEHIND) */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">Follow Us</h4>

            {/* Social Icons Row */}
            <div className="flex space-x-4 mb-6">
              {[
                { Icon: Facebook, href: "https://www.facebook.com/kodeitglobal" },
                {
                  Icon: Linkedin,
                  href:
                    "https://www.linkedin.com/authwall?trk=gf&trkInfo=AQE9PFOHVfNA5wAAAZiEbhKYzFJBaf15TUFRY726GEDKU-Yz4dcAxJSyDdX-pqVefLXFKovzZW144WTrkPgZX353X_VVJBLa_ADkl9OwD-MQ4ZqFOv1suS9f_z_NSiLOqiFQNC0=&original_referer=https://www.kodeit.com/&sessionRedirect=https%3A%2F%2Fwww.linkedin.com%2Fin%2Fkodeit-global-2831052a1%2F",
                },
                { Icon: Instagram, href: "https://www.instagram.com/kodeitglobal/" },
                { Icon: Youtube, href: "https://www.youtube.com/@KODEITglobal" },
              ].map(({ Icon, href }, index) => (
                <a
                  key={index}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-full bg-gray-800/50 border border-gray-700 hover:border-white transition-all hover:scale-110 hover:bg-gray-800"
                >
                  <Icon size={20} className="text-gray-400 hover:text-white transition-colors" />
                </a>
              ))}
            </div>

            {/* Instagram 3x2 image grid */}
            <div className="grid grid-cols-3 gap-2">
              {instagramItems.map((item, idx) => (
                <a
                  key={idx}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative group rounded-md overflow-hidden border border-gray-700 ig-gloss"
                  style={{ width: "100%", aspectRatio: "1 / 1" }}
                  aria-label={item.alt}
                >
                  <img
                    src={item.src}
                    alt={item.alt}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* Hover gradient + small IG icon */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,0,0,0.45) 100%)",
                    }}
                  />
                  <div className="absolute bottom-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Instagram size={16} className="text-white" />
                  </div>
                </a>
              ))}
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
