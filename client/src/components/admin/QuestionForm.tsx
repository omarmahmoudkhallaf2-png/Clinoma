import { useState, useEffect } from 'react';
import type { Question } from '../../types/quiz';
import { Save, X } from 'lucide-react';

interface QuestionFormProps {
  initialData?: Question | null;
  onSave: (data: Omit<Question, 'id'>) => Promise<void>;
  onCancel: () => void;
}

export default function QuestionForm({ initialData, onSave, onCancel }: QuestionFormProps) {
  const [formData, setFormData] = useState({
    text: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    explanation: '',
    category: '',
    isPremium: false,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        text: initialData.text,
        options: [...initialData.options],
        correctAnswer: initialData.correctAnswer,
        explanation: initialData.explanation,
        category: initialData.category,
        isPremium: initialData.isPremium,
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'isPremium' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData((prev) => ({ ...prev, options: newOptions }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl shadow-sm p-6 space-y-6">
      <div className="flex justify-between items-center border-b border-border pb-4">
        <h2 className="text-xl font-bold">
          {initialData ? 'Edit Question' : 'Add New Question'}
        </h2>
        <button type="button" onClick={onCancel} className="p-2 text-muted-foreground hover:bg-muted rounded-full">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Question Text</label>
          <textarea 
            name="text"
            required
            value={formData.text}
            onChange={handleChange}
            className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <input 
              type="text"
              name="category"
              required
              value={formData.category}
              onChange={handleChange}
              className="w-full p-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary"
              placeholder="e.g. Cardiology"
            />
          </div>
          <div className="flex items-center mt-6 space-x-2">
            <input 
              type="checkbox"
              id="isPremium"
              name="isPremium"
              checked={formData.isPremium}
              onChange={handleChange}
              className="w-4 h-4 text-primary rounded border-border focus:ring-primary"
            />
            <label htmlFor="isPremium" className="text-sm font-medium cursor-pointer">
              Premium Question
            </label>
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium">Options</label>
          {formData.options.map((option, idx) => (
            <input
              key={idx}
              type="text"
              required
              value={option}
              onChange={(e) => handleOptionChange(idx, e.target.value)}
              className="w-full p-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary"
              placeholder={`Option ${idx + 1}`}
            />
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Correct Answer</label>
          <select
            name="correctAnswer"
            required
            value={formData.correctAnswer}
            onChange={handleChange}
            className="w-full p-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary"
          >
            <option value="">Select correct option</option>
            {formData.options.map((opt, idx) => (
              <option key={idx} value={opt} disabled={!opt}>
                {opt || `Option ${idx + 1}`}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Explanation</label>
          <textarea 
            name="explanation"
            required
            value={formData.explanation}
            onChange={handleChange}
            className="w-full p-3 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary"
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-foreground bg-secondary hover:bg-secondary/80 rounded-lg"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground font-medium rounded-lg hover:opacity-90 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {loading ? 'Saving...' : 'Save Question'}
        </button>
      </div>
    </form>
  );
}
