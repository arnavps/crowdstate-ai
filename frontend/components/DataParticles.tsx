"use client";

import React, { useEffect, useRef } from "react";

interface DataParticlesProps {
    color?: string;
    quantity?: number;
    speed?: number;
}

export default function DataParticles({
    color = "#0891B2",
    quantity = 100,
    speed = 0.5
}: DataParticlesProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let particles: Particle[] = [];
        let animationFrameId: number;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = {
                x: e.clientX,
                y: e.clientY
            };
        };

        window.addEventListener("resize", resize);
        window.addEventListener("mousemove", handleMouseMove);
        resize();

        class Particle {
            x: number;
            y: number;
            size: number;
            baseX: number;
            baseY: number;
            speedX: number;
            speedY: number;
            opacity: number;

            constructor() {
                this.x = Math.random() * canvas!.width;
                this.y = Math.random() * canvas!.height;
                this.baseX = this.x;
                this.baseY = this.y;
                this.size = Math.random() * 2 + 0.5;
                this.speedX = (Math.random() * 2 - 1) * speed;
                this.speedY = (Math.random() * 2 - 1) * speed;
                this.opacity = Math.random() * 0.5;
            }

            update() {
                // Base movement
                this.baseX += this.speedX;
                this.baseY += this.speedY;

                // Wrap around
                if (this.baseX > canvas!.width) this.baseX = 0;
                else if (this.baseX < 0) this.baseX = canvas!.width;
                if (this.baseY > canvas!.height) this.baseY = 0;
                else if (this.baseY < 0) this.baseY = canvas!.height;

                // Mouse Parallax Interaction
                const dx = mouseRef.current.x - this.baseX;
                const dy = mouseRef.current.y - this.baseY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const force = Math.max(0, (200 - distance) / 200);

                this.x = this.baseX - dx * force * 0.05;
                this.y = this.baseY - dy * force * 0.05;
            }

            draw() {
                if (!ctx) return;
                ctx.fillStyle = color;
                ctx.globalAlpha = this.opacity;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const init = () => {
            particles = [];
            for (let i = 0; i < quantity; i++) {
                particles.push(new Particle());
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
            }
            animationFrameId = requestAnimationFrame(animate);
        };

        init();
        animate();

        return () => {
            window.removeEventListener("resize", resize);
            window.removeEventListener("mousemove", handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, [color, quantity, speed]);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0"
        />
    );
}
