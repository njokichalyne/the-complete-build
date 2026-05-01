import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';

interface Props {
  show: boolean;
  message?: string;
  onDismiss: () => void;
}

/**
 * Soft, non-alarming inline notice that appears above sensitive forms when
 * recent signals look slightly off. No red, no exclamation marks.
 */
const UnusualPatternBanner = ({ show, message, onDismiss }: Props) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 flex items-start gap-3 mb-4"
        role="status"
      >
        <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
        <div className="flex-1">
          <p className="text-xs font-semibold text-foreground">Heads up — your pattern looks a little different today</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {message ?? 'We may ask for extra verification on sensitive actions. This is a precaution, not a problem.'}
          </p>
        </div>
        <button onClick={onDismiss} aria-label="Dismiss" className="text-muted-foreground hover:text-foreground">
          <X className="w-3.5 h-3.5" />
        </button>
      </motion.div>
    )}
  </AnimatePresence>
);

export default UnusualPatternBanner;
