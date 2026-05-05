import { useState } from 'react';
import { X, Upload, AlertCircle, FileJson, FileText } from 'lucide-react';

interface BulkUploadModalProps {
  onUpload: (data: any[]) => Promise<void>;
  onClose: () => void;
}

export default function BulkUploadModal({ onUpload, onClose }: BulkUploadModalProps) {
  const [jsonText, setJsonText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImport = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = JSON.parse(jsonText);
      if (!Array.isArray(data)) throw new Error('Input must be an array of questions');
      
      // Basic validation
      data.forEach((q, i) => {
        if (!q.text || !q.options || !q.correctAnswer) {
          throw new Error(`Question at index ${i} is missing required fields`);
        }
      });

      await onUpload(data);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-background/80 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="bg-card border-2 border-border w-full max-w-4xl rounded-[4rem] p-12 shadow-2xl space-y-10">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-primary text-white rounded-[2rem] shadow-xl shadow-primary/20">
              <Upload className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-4xl font-black tracking-tight">Bulk Content Importer</h2>
              <p className="text-muted-foreground font-bold">Import multiple questions using JSON format.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-secondary rounded-2xl transition-all">
            <X className="w-8 h-8" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="flex gap-4 p-2 bg-secondary/20 rounded-2xl w-fit">
            <button className="flex items-center gap-2 px-6 py-3 bg-card rounded-xl font-black text-sm shadow-sm">
              <FileJson className="w-5 h-5 text-indigo-500" /> JSON
            </button>
            <button className="flex items-center gap-2 px-6 py-3 text-muted-foreground font-black text-sm opacity-50 cursor-not-allowed">
              <FileText className="w-5 h-5" /> Excel (Coming Soon)
            </button>
          </div>

          <textarea 
            value={jsonText} 
            onChange={e => setJsonText(e.target.value)} 
            className="w-full h-[400px] bg-secondary/30 border-2 border-border p-8 rounded-[3rem] outline-none focus:border-primary font-mono text-sm leading-relaxed transition-all"
            placeholder='[
  {
    "text": "What is the primary function of the heart?",
    "options": ["Pump blood", "Digest food", "Think", "Breathe"],
    "correctAnswer": "Pump blood",
    "category": "Physiology",
    "folder": "f1",
    "lectureNumber": 1
  }
]'
          />
        </div>

        {error && (
          <div className="p-6 bg-destructive/10 border-2 border-destructive/20 rounded-3xl flex items-center gap-4 text-destructive font-bold">
            <AlertCircle /> {error}
          </div>
        )}

        <div className="flex justify-end gap-6">
          <button onClick={onClose} className="px-10 py-5 bg-secondary text-foreground rounded-3xl font-black text-xl hover:bg-secondary/80 transition-all">إلغاء</button>
          <button 
            onClick={handleImport} 
            disabled={loading || !jsonText}
            className="px-12 py-5 bg-primary text-white rounded-3xl font-black text-xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all disabled:opacity-50"
          >
            {loading ? 'جاري الاستيراد...' : 'بدء عملية الاستيراد'}
          </button>
        </div>
      </div>
    </div>
  );
}
