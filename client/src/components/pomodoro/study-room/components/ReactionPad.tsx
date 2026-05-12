import { memo } from 'react';
import { motion } from 'framer-motion';
import type { RoomReaction } from '../../../../types/studyRoom';

interface ReactionPadProps {
  onSend: (type: RoomReaction['type']) => void;
}

const REACTIONS: RoomReaction['type'][] = ['👍', '🔥', '☕', '💪', 'Break?', 'Ready'];

const ReactionPad = memo(({ onSend }: ReactionPadProps) => {
  return (
    <div className="p-6 rounded-[2rem] bg-card/50 backdrop-blur-xl border border-border/50 shadow-xl">
      <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-6 text-center">
        Silent Reactions
      </h4>
      <div className="grid grid-cols-3 gap-3">
        {REACTIONS.map((type) => (
          <motion.button
            key={type}
            whileHover={{ scale: 1.1, y: -2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onSend(type)}
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-secondary/50 hover:bg-primary/10 hover:border-primary/50 border border-transparent transition-all space-y-2 group"
          >
            <span className="text-2xl group-hover:drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]">
              {type.length > 2 ? null : type}
            </span>
            <span className="text-[10px] font-black uppercase tracking-tighter opacity-60 group-hover:opacity-100">
              {type.length > 2 ? type : ''}
            </span>
            {type === 'Break?' && <span className="text-[10px] font-black uppercase">Break?</span>}
            {type === 'Ready' && <span className="text-[10px] font-black uppercase">Ready</span>}
          </motion.button>
        ))}
      </div>
    </div>
  );
});

export default ReactionPad;
