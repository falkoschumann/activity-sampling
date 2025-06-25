// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { useEffect, useRef } from "react";

export default function ScrollToTopButton() {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const handleScroll = () => {
      if (ref.current == null) {
        return;
      }

      if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
        ref.current.className = "btn btn-secondary position-fixed bottom-0 end-0 me-3 fade show";
      } else {
        ref.current.className = "btn btn-secondary position-fixed bottom-0 end-0 me-3 fade";
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  function scrollToTop() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
  }

  return (
    <button
      ref={ref}
      className="btn btn-secondary position-fixed bottom-0 end-0 me-3 fade"
      style={{ marginBottom: "5rem", zIndex: 2000 }}
      title="Scroll to top"
      onClick={scrollToTop}
    >
      <i className="bi bi-arrow-up"></i>
    </button>
  );
}
