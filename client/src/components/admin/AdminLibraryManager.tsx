import { useState, useEffect } from 'react';
import { Folder, FileText, ChevronRight, BookOpen, RefreshCw, Layers } from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

interface Article {
  title: string;
  fileName: string;
  path: string;
}

interface Chapter {
  name: string;
  articles: Article[];
}

export default function AdminLibraryManager() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [articleHtml, setArticleHtml] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [firebaseCoursesCount, setFirebaseCoursesCount] = useState(0);

  // Since we are running in frontend locally, let's hardcode or fetch the structural metadata.
  // The user migrated chapters into "F:\Med Prep\library_content".
  // Let's create a dynamic list of chapters we know exist and structure them.
  const localChaptersList = [
    {
      name: "Allergy & Immunology",
      articles: [
        { title: "Acute rheumatic fever", fileName: "Acute rheumatic fever.html", path: "Allergy & Immunology/Acute rheumatic fever.html" },
        { title: "Allergic/irritant contact dermatitis", fileName: "Allergicirritant contact dermatitis.html", path: "Allergy & Immunology/Allergicirritant contact dermatitis.html" },
        { title: "Anaphylaxis", fileName: "Anaphylaxis.html", path: "Allergy & Immunology/Anaphylaxis.html" },
        { title: "Angioedema and urticaria", fileName: "Angioedema and urticaria.html", path: "Allergy & Immunology/Angioedema and urticaria.html" },
        { title: "Antihistamines", fileName: "Antihistamines.html", path: "Allergy & Immunology/Antihistamines.html" },
        { title: "Ataxia-telangiectasia", fileName: "Ataxia-telangiectasia.html", path: "Allergy & Immunology/Ataxia-telangiectasia.html" },
        { title: "Chédiak-Higashi syndrome", fileName: "Chédiak-Higashi syndrome.html", path: "Allergy & Immunology/Chédiak-Higashi syndrome.html" },
        { title: "Chronic granulomatous disease", fileName: "Chronic granulomatous disease.html", path: "Allergy & Immunology/Chronic granulomatous disease.html" }
      ]
    },
    {
      name: "Cardiology",
      articles: []
    },
    {
      name: "Dermatology",
      articles: []
    },
    {
      name: "Ear, Nose & Throat (ENT)",
      articles: []
    },
    {
      name: "Embryology",
      articles: []
    },
    {
      name: "Endocrinology",
      articles: []
    },
    {
      name: "Gastroenterology",
      articles: []
    },
    {
      name: "Gynecology",
      articles: []
    },
    {
      name: "Hematology & Oncology",
      articles: []
    },
    {
      name: "Infectious Diseases",
      articles: []
    }
  ];

  useEffect(() => {
    setChapters(localChaptersList);
    // Fetch courses count from Firestore to show integration status
    const getFirebaseData = async () => {
      try {
        const snap = await getDocs(collection(db, 'courses'));
        setFirebaseCoursesCount(snap.size);
      } catch (e) {
        console.error(e);
      }
    };
    getFirebaseData();
  }, []);

  const selectArticle = async (article: Article) => {
    setSelectedArticle(article);
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:3500/api/preview?path=${encodeURIComponent(article.path)}`);
      if (res.status === 200) {
        let html = await res.text();
        
        // Extract body tag content to fit inside preview container nicely
        const bodyMatch = html.match(/<body>([\s\S]*)<\/body>/i);
        if (bodyMatch) {
          html = bodyMatch[1];
        }
        
        // Rewrite image tags to load from local preview server
        const currentChapterName = selectedChapter?.name || "";
        html = html.replace(/src=["']images\/(.*?)["']/g, `src="http://localhost:3500/api/images/${encodeURIComponent(currentChapterName)}/$1"`);
        
        setArticleHtml(html);
      } else {
        setArticleHtml('Could not read HTML content.');
      }
    } catch (e) {
      setArticleHtml('Error loading preview. Make sure the preview helper server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 space-y-8 animate-in fade-in duration-300">
      <div className="flex justify-between items-center bg-secondary/15 p-8 rounded-[3rem] border border-border">
        <div>
          <h2 className="text-4xl font-black tracking-tight">📚 Library Migration Manager (المكتبة)</h2>
          <p className="text-muted-foreground font-bold text-sm mt-1">
            Manage your migrated chapters, articles, and media files from F:\\Med Prep\\library_content.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="bg-primary/10 border border-primary/20 px-6 py-3 rounded-2xl text-center">
            <span className="block text-2xl font-black text-primary">{chapters.length}</span>
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Chapters</span>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 px-6 py-3 rounded-2xl text-center">
            <span className="block text-2xl font-black text-emerald-600">{firebaseCoursesCount}</span>
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">Linked Courses</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chapters List */}
        <div className="bg-card border-2 border-border p-6 rounded-[2.5rem] space-y-4">
          <h3 className="text-xl font-black border-b pb-3 flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" /> Chapters
          </h3>
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
            {chapters.map((chap, i) => (
              <button
                key={i}
                onClick={() => { setSelectedChapter(chap); setSelectedArticle(null); }}
                className={`w-full flex items-center justify-between p-4 rounded-2xl font-bold transition-all ${
                  selectedChapter?.name === chap.name
                    ? 'bg-primary text-white shadow-lg'
                    : 'hover:bg-secondary/40 text-foreground'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Folder className="w-5 h-5" />
                  <span className="text-left text-sm">{chap.name}</span>
                </div>
                <ChevronRight className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>

        {/* Articles List */}
        <div className="bg-card border-2 border-border p-6 rounded-[2.5rem] space-y-4">
          <h3 className="text-xl font-black border-b pb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" /> Articles
          </h3>
          {selectedChapter ? (
            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
              {selectedChapter.articles.length > 0 ? (
                selectedChapter.articles.map((art, i) => (
                  <button
                    key={i}
                    onClick={() => selectArticle(art)}
                    className={`w-full flex items-center gap-3 p-4 rounded-2xl font-bold text-left transition-all ${
                      selectedArticle?.title === art.title
                        ? 'bg-secondary text-primary border-l-4 border-primary'
                        : 'hover:bg-secondary/40 text-foreground'
                    }`}
                  >
                    <FileText className="w-5 h-5 opacity-60" />
                    <span className="text-xs">{art.title}</span>
                  </button>
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p className="font-bold">No articles loaded yet</p>
                  <p className="text-xs mt-1">Quota limit paused this chapter migration.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground font-bold">
              Select a chapter to see articles
            </div>
          )}
        </div>

        {/* Article Preview Pane */}
        <div className="bg-card border-2 border-border p-6 rounded-[2.5rem] space-y-4 lg:col-span-1">
          <h3 className="text-xl font-black border-b pb-3">📄 Live Preview</h3>
          {selectedArticle ? (
            <div className="border border-border rounded-2xl p-6 bg-secondary/5 min-h-[400px]">
              {loading ? (
                <div className="flex justify-center items-center h-[350px]">
                  <RefreshCw className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: articleHtml }} />
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground font-bold h-[400px] flex items-center justify-center">
              Select an article to preview content
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
