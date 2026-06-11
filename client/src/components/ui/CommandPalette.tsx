import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { 
  Search, 
  LayoutDashboard, 
  Settings, 
  LogOut, 
  Database,
  HelpCircle,
  Command as CommandIcon,
  Brain,
  BookOpen,
  Clock,
  Video,
  ClipboardList
} from "lucide-react"
import { useAuth } from "../../context/AuthContext"
import { useData } from "../../context/DataContext"

export function CommandPalette() {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const navigate = useNavigate()
  const { logout, userRole } = useAuth()
  const { courses } = useData()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    const handleToggle = () => {
      setOpen((open) => !open)
    }

    document.addEventListener("keydown", down)
    window.addEventListener("toggle-command-palette", handleToggle)
    return () => {
      document.removeEventListener("keydown", down)
      window.removeEventListener("toggle-command-palette", handleToggle)
    }
  }, [])

  const actions: any[] = [
    { icon: LayoutDashboard, label: "لوحة التحكم", path: "/dashboard", category: "Navigation" },
    { icon: Settings, label: "الإعدادات الشخصية", path: "/settings", category: "Navigation" },
    { icon: Brain, label: "المراجعة الذكية", path: "/review", category: "Smart tools" },
    { icon: BookOpen, label: "الفلاش كارد - Flash Space", path: "/flashcards", category: "Smart tools" },
    { icon: ClipboardList, label: "الاختبارات والتوصيل", path: "/exams", category: "Smart tools" },
    { icon: Database, label: "بنوك الأسئلة", path: "/question-banks", category: "Navigation" },
    { icon: Video, label: "المكتبة التعليمية المرئية (الفيديوهات)", path: "/dashboard", category: "Navigation" },
    { icon: Clock, label: "ساعة التركيز Pomodoro", path: "/pomodoro", category: "Smart tools" },
    { icon: HelpCircle, label: "الدعم الفني", action: () => {
      window.open("https://t.me/Clinoma_Admins", "_blank");
    }, category: "Support" },
    { icon: LogOut, label: "تسجيل الخروج", action: logout, category: "Account" },
  ]

  // Add admin options ONLY for admins
  if (userRole === "admin") {
    actions.push({ icon: Database, label: "إدارة المنصة", path: "/admin", category: "Admin" })
  }

  // Add courses dynamically
  if (courses && courses.length > 0) {
    courses.forEach((course: any) => {
      actions.push({
        icon: BookOpen,
        label: course.name,
        path: course.isFlashSpace 
          ? `/flashcards/space?module=${encodeURIComponent(course.flashSpaceModule || course.name)}`
          : `/course/${course.id}`,
        category: "Courses / الكورسات"
      });
    });
  }

  const filteredActions = actions.filter(a => 
    a.label.toLowerCase().includes(search.toLowerCase()) ||
    (a.category && a.category.toLowerCase().includes(search.toLowerCase()))
  )

  const handleAction = (item: any) => {
    if (item.path) navigate(item.path)
    if (item.action) item.action()
    setOpen(false)
    setSearch("")
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[99999] flex items-start justify-center pt-[20vh] px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-lg overflow-hidden rounded-xl border bg-card shadow-2xl"
          >
            <div className="flex items-center border-b px-4 py-3">
              <Search className="mr-3 h-5 w-5 text-muted-foreground" />
              <input
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                placeholder="Type a command or search..."
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="flex items-center gap-1 rounded border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                <span className="text-xs">ESC</span>
              </div>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {filteredActions.length > 0 ? (
                <div className="space-y-1">
                  {filteredActions.map((item, i) => (
                    <button
                      key={i}
                      onClick={() => handleAction(item)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-accent transition-colors group"
                    >
                      <item.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0" />
                      <span className="flex-1 text-right" dir="rtl">{item.label}</span>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{item.category}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  No results found.
                </div>
              )}
            </div>
            <div className="border-t bg-muted/50 px-4 py-2 text-[10px] text-muted-foreground flex justify-between items-center">
              <span>Press <kbd className="font-sans border px-1 rounded">Enter</kbd> to select</span>
              <div className="flex items-center gap-2">
                <CommandIcon className="h-3 w-3" />
                <span>Quick Actions</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
