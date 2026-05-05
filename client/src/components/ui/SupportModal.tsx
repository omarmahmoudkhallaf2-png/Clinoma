import { Send, Phone, X, MessageCircle } from 'lucide-react';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  telegramUser: string;
  whatsappNumber: string;
}

export default function SupportModal({ isOpen, onClose, telegramUser, whatsappNumber }: SupportModalProps) {
  if (!isOpen) return null;

  const handleWhatsApp = () => {
    if (whatsappNumber) {
      window.open(`https://wa.me/${whatsappNumber.replace('+','')}`, '_blank');
      onClose();
    }
  };

  const handleTelegram = () => {
    if (telegramUser) {
      window.open(`https://t.me/${telegramUser}`, '_blank');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-card border border-border w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
        <div className="bg-gradient-to-br from-primary to-blue-900 p-8 text-white relative text-center">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-white/20 rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
          <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mb-4 mx-auto backdrop-blur-md">
            <MessageCircle className="w-10 h-10 fill-current" />
          </div>
          <h2 className="text-3xl font-black mb-2">تواصل مع الدعم</h2>
          <p className="opacity-90 font-bold">اختر الطريقة المناسبة لك للاشتراك أو الاستفسار</p>
        </div>
        
        <div className="p-8 space-y-4">
          <button
            onClick={handleWhatsApp}
            disabled={!whatsappNumber}
            className="w-full flex items-center justify-between p-5 bg-emerald-500/10 border-2 border-emerald-500/20 rounded-2xl group hover:bg-emerald-500 hover:border-emerald-500 transition-all duration-300 disabled:opacity-50"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/20 group-hover:bg-white group-hover:text-emerald-500 transition-colors">
                <Phone className="w-6 h-6" />
              </div>
              <div className="text-right">
                <p className="font-black text-emerald-600 group-hover:text-white transition-colors">تواصل عبر واتساب</p>
                <p className="text-xs font-bold text-emerald-600/60 group-hover:text-white/70 transition-colors">WhatsApp Support</p>
              </div>
            </div>
            <X className="w-5 h-5 rotate-45 text-emerald-500 group-hover:text-white" />
          </button>

          <button
            onClick={handleTelegram}
            disabled={!telegramUser}
            className="w-full flex items-center justify-between p-5 bg-sky-500/10 border-2 border-sky-500/20 rounded-2xl group hover:bg-sky-500 hover:border-sky-500 transition-all duration-300 disabled:opacity-50"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-sky-500 text-white rounded-xl shadow-lg shadow-sky-500/20 group-hover:bg-white group-hover:text-sky-500 transition-colors">
                <Send className="w-6 h-6" />
              </div>
              <div className="text-right">
                <p className="font-black text-sky-600 group-hover:text-white transition-colors">تواصل عبر تلجرام</p>
                <p className="text-xs font-bold text-sky-600/60 group-hover:text-white/70 transition-colors">Telegram Support</p>
              </div>
            </div>
            <X className="w-5 h-5 rotate-45 text-sky-500 group-hover:text-white" />
          </button>

          <button
            onClick={onClose}
            className="w-full py-4 text-muted-foreground font-bold hover:text-foreground transition-colors"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}
