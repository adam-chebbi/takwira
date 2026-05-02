import * as React from 'react';
import { useInView, animate } from 'motion/react';

interface CounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export const Counter = ({ value, duration = 2, prefix = '', suffix = '', decimals = 0, className }: CounterProps) => {
  const nodeRef = React.useRef<HTMLSpanElement>(null);
  const isInView = useInView(nodeRef, { once: true });

  React.useEffect(() => {
    const node = nodeRef.current;
    if (isInView && node) {
      const controls = animate(0, value, {
        duration,
        onUpdate(value) {
          node.textContent = prefix + value.toFixed(decimals) + suffix;
        },
        ease: 'easeOut'
      });

      return () => controls.stop();
    }
  }, [isInView, value, duration, prefix, suffix, decimals]);

  return <span ref={nodeRef} className={className}>{prefix}0{suffix}</span>;
};
