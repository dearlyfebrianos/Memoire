import { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
  const cursorDotRef = useRef(null);
  const cursorRingRef = useRef(null);
  const cursorTrailRef = useRef([]);
  const posRef = useRef({ x: -100, y: -100 });
  const ringPosRef = useRef({ x: -100, y: -100 });
  const rafRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const trailCountRef = useRef(8);

  useEffect(() => {
    document.body.style.cursor = "none";

    const trails = [];
    for (let i = 0; i < trailCountRef.current; i++) {
      const el = document.createElement("div");
      el.style.cssText = `
        position: fixed;
        pointer-events: none;
        z-index: 9998;
        border-radius: 50%;
        transform: translate(-50%, -50%);
        transition: opacity 0.3s ease;
      `;
      document.body.appendChild(el);
      trails.push({ el, x: -100, y: -100 });
    }
    cursorTrailRef.current = trails;

    const onMouseMove = (e) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);
    };

    const onMouseEnter = () => setIsVisible(true);
    const onMouseLeave = () => setIsVisible(false);
    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);

    const onPointerOver = (e) => {
      if (
        e.target.closest(
          "a, button, [role='button'], input, textarea, select, label",
        )
      ) {
        setIsHovering(true);
      }
    };
    const onPointerOut = (e) => {
      if (
        e.target.closest(
          "a, button, [role='button'], input, textarea, select, label",
        )
      ) {
        setIsHovering(false);
      }
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseenter", onMouseEnter);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("pointerover", onPointerOver);
    document.addEventListener("pointerout", onPointerOut);

    let trailPositions = Array(trailCountRef.current).fill({
      x: -100,
      y: -100,
    });

    const animate = () => {
      const dot = cursorDotRef.current;
      const ring = cursorRingRef.current;
      if (!dot || !ring) return;

      dot.style.left = `${posRef.current.x}px`;
      dot.style.top = `${posRef.current.y}px`;

      const lerpFactor = 0.12;
      ringPosRef.current.x +=
        (posRef.current.x - ringPosRef.current.x) * lerpFactor;
      ringPosRef.current.y +=
        (posRef.current.y - ringPosRef.current.y) * lerpFactor;
      ring.style.left = `${ringPosRef.current.x}px`;
      ring.style.top = `${ringPosRef.current.y}px`;

      trailPositions = [
        { x: posRef.current.x, y: posRef.current.y },
        ...trailPositions.slice(0, trailCountRef.current - 1),
      ];

      cursorTrailRef.current.forEach((trail, i) => {
        const lerp = 0.15 + i * 0.015;
        trail.x += (trailPositions[i].x - trail.x) * lerp;
        trail.y += (trailPositions[i].y - trail.y) * lerp;
        const size = Math.max(2, 10 - i * 1.1);
        const opacity = Math.max(0, 0.35 - i * 0.04);
        trail.el.style.left = `${trail.x}px`;
        trail.el.style.top = `${trail.y}px`;
        trail.el.style.width = `${size}px`;
        trail.el.style.height = `${size}px`;
        trail.el.style.background = `rgba(232, 196, 160, ${opacity})`;
        trail.el.style.boxShadow = `0 0 ${size * 2}px rgba(232,196,160,${opacity * 0.6})`;
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      document.body.style.cursor = "";
      cancelAnimationFrame(rafRef.current);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseenter", onMouseEnter);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("pointerover", onPointerOver);
      document.removeEventListener("pointerout", onPointerOut);
      cursorTrailRef.current.forEach((t) => t.el.remove());
    };
  }, []);

  const ringSize = isHovering ? 48 : isClicking ? 20 : 36;
  const ringOpacity = isVisible ? 1 : 0;
  const dotOpacity = isVisible ? 1 : 0;

  return (
    <>
      <div
        ref={cursorDotRef}
        style={{
          position: "fixed",
          pointerEvents: "none",
          zIndex: 9999,
          width: isClicking ? "6px" : "8px",
          height: isClicking ? "6px" : "8px",
          background: isHovering
            ? "rgba(232,196,160,0.9)"
            : "rgba(255,255,255,0.95)",
          borderRadius: "50%",
          transform: "translate(-50%, -50%)",
          boxShadow: isHovering
            ? "0 0 12px rgba(232,196,160,0.8), 0 0 24px rgba(232,196,160,0.4)"
            : "0 0 8px rgba(255,255,255,0.5)",
          opacity: dotOpacity,
          transition:
            "width 0.2s, height 0.2s, background 0.3s, box-shadow 0.3s, opacity 0.3s",
          left: 0,
          top: 0,
        }}
      />

      <div
        ref={cursorRingRef}
        style={{
          position: "fixed",
          pointerEvents: "none",
          zIndex: 9998,
          width: `${ringSize}px`,
          height: `${ringSize}px`,
          border: isHovering
            ? "1.5px solid rgba(232,196,160,0.7)"
            : "1px solid rgba(255,255,255,0.4)",
          borderRadius: "50%",
          transform: "translate(-50%, -50%)",
          opacity: ringOpacity,
          backdropFilter: isHovering ? "blur(2px)" : "none",
          boxShadow: isHovering ? "0 0 20px rgba(232,196,160,0.2)" : "none",
          background: isHovering ? "rgba(232,196,160,0.05)" : "transparent",
          transition:
            "width 0.35s cubic-bezier(0.22,1,0.36,1), height 0.35s cubic-bezier(0.22,1,0.36,1), border 0.3s, opacity 0.3s, box-shadow 0.3s",
          left: 0,
          top: 0,
        }}
      />
    </>
  );
}