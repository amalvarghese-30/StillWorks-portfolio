import logoDark from "@/assets/logo-dark.svg";
import logoLight from "@/assets/logo-light.svg";
import { useTheme } from "@/hooks/useTheme";

const Footer = () => {
  const { isDark } = useTheme();

  return (
    <footer className="py-8 border-t border-border">
      <div className="container mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center md:items-end gap-6">

        {/* LEFT: Logo + tagline */}
        <div className="flex flex-col items-center md:items-start gap-2">
          <img
            src={isDark ? logoDark : logoLight}
            alt="Stillworks logo"
            className="h-12 w-auto"
          />

          <p className="text-sm text-muted-foreground font-body">
            Digital Automation & Web Experience Agency
          </p>
        </div>

        {/* RIGHT: copyright */}
        <p className="text-sm text-muted-foreground font-body text-center md:text-right">
          © {new Date().getFullYear()} Stillworks. All rights reserved.
        </p>

      </div>
    </footer>
  );
};

export default Footer;