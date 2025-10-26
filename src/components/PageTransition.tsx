import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface PageTransitionProps {
  onComplete: () => void;
}

export function PageTransition({ onComplete }: PageTransitionProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Step progression
    const timers = [
      setTimeout(() => setStep(1), 500),
      setTimeout(() => setStep(2), 1500),
      setTimeout(() => setStep(3), 2500),
      setTimeout(() => onComplete(), 3500),
    ];

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  // Generate particles
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    x: Math.random() * 100 - 50,
    y: Math.random() * 100 - 50,
    size: Math.random() * 8 + 4,
    delay: Math.random() * 0.3,
  }));

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Background with color burst */}
      <motion.div
        className="absolute inset-0"
        initial={{ background: 'radial-gradient(circle at center, rgba(59, 130, 246, 0) 0%, rgba(29, 78, 216, 0) 100%)' }}
        animate={{
          background: step >= 1 
            ? 'radial-gradient(circle at center, rgba(59, 130, 246, 1) 0%, rgba(29, 78, 216, 1) 100%)'
            : 'radial-gradient(circle at center, rgba(59, 130, 246, 0) 0%, rgba(29, 78, 216, 0) 100%)',
        }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />

      {/* Expanding circles */}
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border-4 border-white/30"
          initial={{ width: 0, height: 0, opacity: 0 }}
          animate={
            step >= 1
              ? {
                  width: [0, 300 + i * 200, 600 + i * 400],
                  height: [0, 300 + i * 200, 600 + i * 400],
                  opacity: [0, 0.6, 0],
                }
              : {}
          }
          transition={{
            duration: 1.5,
            delay: i * 0.15,
            ease: 'easeOut',
          }}
          style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
        />
      ))}

      {/* Flying particles that converge */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-white"
          initial={{
            x: `${particle.x}vw`,
            y: `${particle.y}vh`,
            scale: 0,
            opacity: 0,
          }}
          animate={
            step >= 0
              ? {
                  x: 0,
                  y: 0,
                  scale: [0, 1.5, 0],
                  opacity: [0, 1, 0],
                }
              : {}
          }
          transition={{
            duration: 1.2,
            delay: particle.delay,
            ease: 'easeInOut',
          }}
          style={{
            width: particle.size,
            height: particle.size,
            left: '50%',
            top: '50%',
          }}
        />
      ))}

      {/* Central logo animation */}
      <div className="relative z-10">
        <motion.div
          initial={{ scale: 0, rotate: -180, opacity: 0 }}
          animate={
            step >= 1
              ? {
                  scale: [0, 1.2, 1],
                  rotate: [180, 0, 0],
                  opacity: [0, 1, 1],
                }
              : {}
          }
          transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
        >
          <h1 className="text-6xl md:text-8xl app-logo text-white" style={{ 
            WebkitTextFillColor: 'white',
            textShadow: '0 0 40px rgba(255, 255, 255, 0.8), 0 0 80px rgba(191, 219, 254, 0.6)'
          }}>
            Aarambh
          </h1>
        </motion.div>

        {/* Glow effect around logo */}
        <motion.div
          className="absolute inset-0 rounded-full blur-3xl"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={
            step >= 1
              ? {
                  opacity: [0, 0.8, 0.4],
                  scale: [0.5, 2, 1.5],
                }
              : {}
          }
          transition={{ duration: 1, delay: 0.6 }}
          style={{
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, rgba(191, 219, 254, 0) 70%)',
            filter: 'blur(60px)',
          }}
        />
      </div>

      {/* Loading text - positioned below logo */}
      <motion.div
        className="absolute top-1/2 left-1/2 mt-60"
        initial={{ opacity: 0, y: 70 }}
        animate={
          step >= 1
            ? { opacity: [0, 1, 1], y: [70, 50, 50] }
            : {}
        }
        transition={{ duration: 0.6, delay: 1 }}
        style={{ transform: 'translateX(-50%)' }}
      >
        <p className="text-white text-xl text-center">Preparing your dashboard...</p>
      </motion.div>

      {/* Rotating rings */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        initial={{ rotate: 0 }}
        animate={step >= 1 ? { rotate: 360 } : {}}
        transition={{ duration: 2, ease: 'linear', repeat: Infinity }}
      >
        <div className="w-64 h-64 border-4 border-t-white/60 border-r-white/40 border-b-white/20 border-l-white/10 rounded-full" />
      </motion.div>

      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        initial={{ rotate: 0 }}
        animate={step >= 1 ? { rotate: -360 } : {}}
        transition={{ duration: 3, ease: 'linear', repeat: Infinity }}
      >
        <div className="w-96 h-96 border-4 border-t-white/40 border-r-white/20 border-b-white/10 border-l-white/5 rounded-full" />
      </motion.div>

      {/* Final wipe effect */}
      <motion.div
        className="absolute inset-0 bg-white"
        initial={{ scaleX: 0 }}
        animate={step >= 3 ? { scaleX: 1 } : {}}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        style={{ transformOrigin: 'left' }}
      />
    </motion.div>
  );
}
