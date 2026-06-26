import React from "react"
import { Lexend_Deca } from "next/font/google"

const lexend = Lexend_Deca({ subsets: ["latin"] });

interface LogoProps {
  theme?: "light" | "dark";
  text?: string;
}

const Logo = ({ theme = "light", text = "SK" }: LogoProps) => {
  const logoSuffix = theme === "dark" ? "dark.svg" : "light.svg";
  const logoSrc = `${process.env.NEXT_PUBLIC_LOGO_BASE_URL}${logoSuffix}`;

  return (
    <div className="flex items-center gap-3">
      <img
        src={logoSrc}
        alt="SK Logo"
        style={{ height: 28, width: 'auto' }}
      />
      <span className={`${lexend.className} text-[17px] font-bold tracking-wider ${theme === 'dark' ? 'text-white' : 'text-black'}`}>
        {text}
      </span>
    </div>
  );
};

export default Logo;
