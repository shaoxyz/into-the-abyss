import React, { useRef, useEffect } from "react";

interface StarTunnelProps {
  speed: number; // 0 to 1, higher is faster
  colorStage: "start" | "mid" | "end"; // influences color palette
  isCollapsed?: boolean;
}

const StarTunnel: React.FC<StarTunnelProps> = ({
  speed,
  colorStage,
  isCollapsed,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);

  // Store mutable values in refs to access them in the animation loop without re-triggering the effect
  const starsRef = useRef<{ x: number; y: number; z: number; o: number }[]>([]);
  const speedRef = useRef(speed);
  const colorStageRef = useRef(colorStage);
  const isCollapsedRef = useRef(isCollapsed);

  // Update refs when props change
  useEffect(() => {
    speedRef.current = speed;
    colorStageRef.current = colorStage;
    isCollapsedRef.current = isCollapsed;
  }, [speed, colorStage, isCollapsed]);

  // Logic to map props to visual parameters
  const getColors = (stage: string) => {
    switch (stage) {
      case "start":
        return ["#22d3ee", "#e0f2fe", "#0ea5e9"]; // Cyan
      case "mid":
        return ["#f87171", "#fee2e2", "#dc2626"]; // Red
      case "end":
        return ["#c084fc", "#f3e8ff", "#9333ea"]; // Purple
      default:
        return ["#ffffff", "#aaaaaa"];
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Initial setup
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Initialize stars only if empty (first run)
    if (starsRef.current.length === 0) {
      const numStars = 800;
      let centerX = width / 2;
      let centerY = height / 2;

      for (let i = 0; i < numStars; i++) {
        starsRef.current.push({
          x: Math.random() * width - centerX,
          y: Math.random() * height - centerY,
          z: Math.random() * width,
          o: Math.random(),
        });
      }
    }

    const animate = () => {
      // Access current values from refs
      const currentSpeed = speedRef.current;
      const currentStage = colorStageRef.current;
      const currentCollapsed = isCollapsedRef.current;

      // Clear with trail effect
      ctx.fillStyle = currentCollapsed
        ? "rgba(0,0,0, 0.05)"
        : "rgba(2, 6, 23, 0.4)";
      ctx.fillRect(0, 0, width, height);

      const colors = getColors(currentStage);
      const speedFactor = currentCollapsed ? 0.1 : currentSpeed * 15 + 0.5;

      const centerX = width / 2;
      const centerY = height / 2;
      const focalLength = width; // Use current width as focal length

      starsRef.current.forEach((star) => {
        // Move star towards viewer
        star.z -= speedFactor;

        // Reset if passed viewer
        if (star.z <= 0) {
          star.z = width;
          star.x = Math.random() * width - centerX;
          star.y = Math.random() * height - centerY;
        }

        // Project 3D to 2D
        const k = focalLength / star.z;
        const x = star.x * k + centerX;
        const y = star.y * k + centerY;
        const size = (1 - star.z / width) * 4;

        if (x >= 0 && x <= width && y >= 0 && y <= height) {
          const shade = colors[Math.floor(star.o * colors.length)];
          ctx.beginPath();
          ctx.fillStyle = shade;
          ctx.globalAlpha = currentCollapsed
            ? 0.2
            : Math.min(1, 1 - star.z / width + 0.2);
          ctx.arc(x, y, size / 2, 0, Math.PI * 2);
          ctx.fill();

          // Add "streak" effect if moving fast
          if (currentSpeed > 0.5 && !currentCollapsed) {
            ctx.beginPath();
            ctx.strokeStyle = shade;
            ctx.lineWidth = size / 2;
            ctx.moveTo(x, y);
            // Simple trail calculation based on perspective
            const trailK = focalLength / (star.z + speedFactor * 5);
            const trailX = star.x * trailK + centerX;
            const trailY = star.y * trailK + centerY;
            ctx.lineTo(trailX, trailY);
            ctx.stroke();
          }
        }
      });
      ctx.globalAlpha = 1;

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(requestRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, []); // Run only once on mount, ignoring prop changes (handled via refs)

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none"
    />
  );
};

export default StarTunnel;
