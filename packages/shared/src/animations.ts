import { Variants } from 'framer-motion';

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } }
};

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, y: 20, transition: { duration: 0.3 } }
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, x: 20, transition: { duration: 0.3 } }
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: 'easeOut' } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.3 } }
};

export const slideUp: Variants = {
  hidden: { y: '100%' },
  visible: { y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
  exit: { y: '100%', transition: { duration: 0.3 } }
};

export const slideDown: Variants = {
  hidden: { y: '-100%' },
  visible: { y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
  exit: { y: '-100%', transition: { duration: 0.3 } }
};

export const slideLeft: Variants = {
  hidden: { x: '100%' },
  visible: { x: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
  exit: { x: '100%', transition: { duration: 0.3 } }
};

export const slideRight: Variants = {
  hidden: { x: '-100%' },
  visible: { x: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
  exit: { x: '-100%', transition: { duration: 0.3 } }
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: 'backOut' } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
};

export const scaleOut: Variants = {
  hidden: { opacity: 0, scale: 1.1 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: 'backOut' } },
  exit: { opacity: 0, scale: 1.05, transition: { duration: 0.2 } }
};

export const staggerContainer = (staggerChildren = 0.1, delayChildren = 0): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren,
      delayChildren
    }
  }
});

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } }
};

export const springConfig = {
  bouncy: { type: 'spring', stiffness: 400, damping: 10 },
  smooth: { type: 'spring', stiffness: 300, damping: 20 },
  stiff: { type: 'spring', stiffness: 500, damping: 30 }
};

export const cardSwipeVariants: Variants = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0, transition: springConfig.smooth },
  exit: (direction: number) => ({
    x: direction > 0 ? 300 : direction < 0 ? -300 : 0,
    y: direction === 0 ? -300 : 50,
    opacity: 0,
    rotate: direction > 0 ? 15 : direction < 0 ? -15 : 0,
    transition: { duration: 0.3 }
  })
};

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
};

export const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.95, y: 20, transition: { duration: 0.2, ease: 'easeIn' } }
};

export const tooltipVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: 5 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' } },
  exit: { opacity: 0, scale: 0.9, y: 5, transition: { duration: 0.15, ease: 'easeIn' } }
};

export const skeletonPulse: Variants = {
  initial: { opacity: 0.5 },
  animate: {
    opacity: [0.5, 0.8, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};
