"use client";

import { useEffect, useState } from "react";
import { ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled up to given distance
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  // Set the top cordinate to 0
  // make scrolling smooth
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <Button
        variant="default"
        size="icon"
        onClick={scrollToTop}
        className={cn(
          "h-12 w-12 rounded-full shadow-2xl transition-all duration-300 bg-primary hover:bg-black text-white border-none transform",
          isVisible
            ? "translate-y-0 opacity-100 pointer-events-auto scale-100"
            : "translate-y-10 opacity-0 pointer-events-none scale-75",
        )}
        aria-label="Scroll to top"
      >
        <ChevronUp className="h-6 w-6" strokeWidth={3} />
        <span className="sr-only">Scroll to top</span>
      </Button>
    </div>
  );
}
