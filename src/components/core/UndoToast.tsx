import { useState, useEffect, useCallback } from "react";
import { X, Undo2 } from "lucide-react";

interface UndoToastProps {
  message: string;
  duration?: number;
  onUndo: () => void;
  onDismiss: () => void;
}

const UndoToast = ({ message, duration = 30000, onUndo, onDismiss }: UndoToastProps) => {
  const [remaining, setRemaining] = useState(duration);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 100) {
          clearInterval(interval);
          onDismiss();
          return 0;
        }
        return prev - 100;
      });
    }, 100);
    return () => clearInterval(interval);
  }, [duration, onDismiss]);

  const handleUndo = useCallback(() => {
    setVisible(false);
    onUndo();
  }, [onUndo]);

  if (!visible) return null;

  const progress = (remaining / duration) * 100;
  const seconds = Math.ceil(remaining / 1000);

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
      <div className="relative bg-card border border-border rounded-xl shadow-lg px-4 py-3 flex items-center gap-3 min-w-[300px] overflow-hidden">
        {/* Progress bar */}
        <div
          className="absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
        <p className="text-sm text-foreground flex-1">{message}</p>
        <span className="text-xs text-muted-foreground tabular-nums">{seconds}s</span>
        <button
          onClick={handleUndo}
          className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors"
        >
          <Undo2 className="h-3.5 w-3.5" /> Undo
        </button>
        <button onClick={onDismiss} className="p-1 rounded hover:bg-accent transition-colors">
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
};

export default UndoToast;
