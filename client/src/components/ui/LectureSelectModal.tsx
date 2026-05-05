import { useState } from 'react';
import { X, ChevronRight, History, BookOpen, GraduationCap, ArrowLeft } from 'lucide-react';

interface LectureSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (lectureNumber: number, questionType?: string) => void;
  subject: string;
  folder: string;
  type?: 'questions' | 'notes';
}

export default function LectureSelectModal({ isOpen, onClose, onSelect, subject, folder, type = 'questions' }: LectureSelectModalProps) {
  const [selectedLecture, setSelectedLecture] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleLectureClick = (num: number) => {
    if (type === 'notes') {
      onSelect(num);
    } else {
      setSelectedLecture(num);
    }
  };

  const handleTypeClick = (qType: string) => {
    if (selectedLecture) {
      onSelect(selectedLecture, qType);
      setSelectedLecture(null); // Reset for next time
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-card border border-border w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
        <div className="p-8 lg:p-10 space-y-8">
          <div className="flex justify-between items-center">
            <div>
              <div className="inline-block px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-lg uppercase tracking-wider mb-2">
                {folder.replace('_', ' ')} • {subject}
              </div>
              <h2 className="text-3xl font-black tracking-tight">
                {selectedLecture ? 'Select Question Source' : 'Select Lecture'}
              </h2>
            </div>
            <button 
              onClick={() => {
                setSelectedLecture(null);
                onClose();
              }} 
              className="p-3 hover:bg-secondary rounded-2xl transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {!selectedLecture ? (
            /* Step 1: Lecture Selection */
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-in slide-in-from-bottom-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                <button
                  key={num}
                  onClick={() => handleLectureClick(num)}
                  className="group relative flex flex-col items-center justify-center aspect-square bg-secondary/30 hover:bg-primary border border-border hover:border-primary rounded-3xl transition-all duration-300"
                >
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary font-black text-xl mb-2 group-hover:scale-110 transition-transform">
                    {num}
                  </div>
                  <span className="font-bold text-sm group-hover:text-white transition-colors">Lecture {num}</span>
                  <ChevronRight className="w-4 h-4 mt-2 opacity-0 group-hover:opacity-100 group-hover:text-white transition-all" />
                </button>
              ))}
            </div>
          ) : (
            /* Step 2: Question Type Selection (Only for questions) */
            <div className="space-y-6 animate-in slide-in-from-right-4">
              <button 
                onClick={() => setSelectedLecture(null)}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary font-bold text-sm transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Lectures
              </button>
              
              <div className="grid grid-cols-1 gap-4">
                {[
                  { id: 'past_papers', name: 'Past Papers', arName: 'اسئلة السنين السابقة', icon: History, color: 'bg-blue-500' },
                  { id: 'lecture_book', name: 'Lecture & Book', arName: 'اسئلة المحاضرات والكتاب', icon: BookOpen, color: 'bg-emerald-500' },
                  { id: 'practice', name: 'Practice Questions', arName: 'اسئلة تدريبية', icon: GraduationCap, color: 'bg-purple-500' },
                ].map((qType) => (
                  <button
                    key={qType.id}
                    onClick={() => handleTypeClick(qType.id)}
                    className="flex items-center justify-between p-6 bg-secondary/30 hover:bg-card border border-border hover:border-primary rounded-[1.5rem] transition-all group"
                  >
                    <div className="flex items-center gap-6">
                      <div className={`p-4 ${qType.color} text-white rounded-2xl group-hover:scale-110 transition-transform`}>
                        <qType.icon className="w-7 h-7" />
                      </div>
                      <div className="text-left">
                        <div className="font-black text-xl">{qType.name}</div>
                        <div className="text-sm text-muted-foreground font-medium">{qType.arName}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-6 h-6 text-muted-foreground group-hover:translate-x-1 group-hover:text-primary transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
