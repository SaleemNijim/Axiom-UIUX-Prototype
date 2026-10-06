import { useMemo, useState } from "react";
import {
  Activity,
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpLeft,
  Bell,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  CloudUpload,
  FileCheck2,
  FileText,
  Filter,
  FlaskConical,
  Gauge,
  GraduationCap,
  History,
  LayoutDashboard,
  ListChecks,
  MoreHorizontal,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Upload,
  X,
} from "lucide-react";

type Screen =
  | "dashboard"
  | "courses"
  | "course"
  | "materials"
  | "style"
  | "generate"
  | "progress"
  | "review"
  | "editor"
  | "history"
  | "export"
  | "bank"
  | "usage"
  | "settings"
  | "states"
  | "exams";

type Question = {
  id: number;
  type: string;
  difficulty: string;
  confidence: number;
  text: string;
  options: string[];
  answer: number;
};

const initialQuestions: Question[] = [
  {
    id: 1,
    type: "اختيار من متعدد",
    difficulty: "متوسط",
    confidence: 94,
    text: "أي من الآليات التالية تفسر ارتفاع ضغط الدم عند زيادة المقاومة المحيطية في الشُرينات؟",
    options: [
      "انخفاض النتاج القلبي مع توسع الأوعية",
      "زيادة المقاومة الوعائية مع ثبات النتاج القلبي",
      "انخفاض حجم الدم داخل الأوعية",
      "تثبيط إفراز الرينين من الكلى",
    ],
    answer: 1,
  },
  {
    id: 2,
    type: "إجابة قصيرة",
    difficulty: "سهل",
    confidence: 91,
    text: "ما دور مستقبلات الضغط الموجودة في قوس الأبهر في تنظيم ضغط الدم؟",
    options: ["تستشعر تغير الضغط وترسل إشارات إلى مركز القلب والأوعية."],
    answer: 0,
  },
  {
    id: 3,
    type: "مقالي",
    difficulty: "متقدم",
    confidence: 88,
    text: "اشرح كيف تؤثر منظومة الرينين–أنجيوتنسين–ألدوستيرون في ضغط الدم على المدى الطويل.",
    options: ["ناقش دور الأنجيوتنسين II وإعادة امتصاص الصوديوم والماء."],
    answer: 0,
  },
  {
    id: 4,
    type: "اختيار من متعدد",
    difficulty: "متوسط",
    confidence: 96,
    text: "أي تغير يؤدي مباشرة إلى انخفاض ضغط الدم الشرياني وفق معادلة الضغط؟",
    options: [
      "زيادة المقاومة الوعائية المحيطية",
      "زيادة حجم الضربة",
      "انخفاض النتاج القلبي",
      "زيادة معدل ضربات القلب",
    ],
    answer: 2,
  },
  {
    id: 5,
    type: "اختيار من متعدد",
    difficulty: "متوسط",
    confidence: 89,
    text: "ما الاستجابة المتوقعة عند انخفاض ضغط الدم المفاجئ لدى شخص سليم؟",
    options: [
      "زيادة النشاط نظير الودي",
      "زيادة النشاط الودي ومعدل القلب",
      "انخفاض إفراز الكاتيكولامينات",
      "توسع الشُرينات الطرفية",
    ],
    answer: 1,
  },
  {
    id: 6,
    type: "إجابة قصيرة",
    difficulty: "سهل",
    confidence: 93,
    text: "اذكر متغيرين يؤثران في ضغط الدم الشرياني المتوسط.",
    options: ["النتاج القلبي والمقاومة الوعائية المحيطية."],
    answer: 0,
  },
  {
    id: 7,
    type: "مقالي",
    difficulty: "متقدم",
    confidence: 86,
    text: "قارن بين التنظيم العصبي والكلوي لضغط الدم من حيث سرعة الاستجابة واستمراريتها.",
    options: ["تُبنى الإجابة على الفروق الزمنية وآليات كل منظومة."],
    answer: 0,
  },
  {
    id: 8,
    type: "اختيار من متعدد",
    difficulty: "متوسط",
    confidence: 95,
    text: "أي عامل يزيد العود الوريدي ويُسهم في رفع حجم الضربة؟",
    options: [
      "انخفاض حجم الدم",
      "زيادة النشاط العضلي الوريدي",
      "انخفاض الضغط داخل الصدر",
      "زيادة المقاومة الشريانية",
    ],
    answer: 1,
  },
];

const availableChapters = [
  { id: "chapter-01", short: "Chapter 01", label: "Foundations of Anatomy", meta: "٤ مواد · ١٨ مقطعاً مرتبطاً" },
  { id: "chapter-02", short: "Chapter 02", label: "Tissues and Organization", meta: "٥ مواد · ١٢ مقطعاً مرتبطاً" },
  { id: "chapter-03", short: "Chapter 03", label: "Cardiovascular System", meta: "٣ مواد · ٢٤ صفحة" },
  { id: "chapter-04", short: "Chapter 04", label: "Respiratory System", meta: "٤ مواد · ١٥ مقطعاً مرتبطاً" },
];

const navGroups = [
  {
    label: "مساحة العمل",
    items: [
      { id: "dashboard" as Screen, label: "الرئيسية", icon: LayoutDashboard },
      { id: "courses" as Screen, label: "المساقات", icon: BookOpen },
      { id: "exams" as Screen, label: "الامتحانات", icon: FileCheck2 },
      { id: "bank" as Screen, label: "بنك الأسئلة", icon: ListChecks },
    ],
  },
  {
    label: "الذكاء والإعداد",
    items: [
      { id: "style" as Screen, label: "بصمة الأسلوب", icon: Sparkles },
      { id: "usage" as Screen, label: "الاستخدام", icon: Gauge },
      { id: "settings" as Screen, label: "الإعدادات", icon: Settings2 },
    ],
  },
];

export function AxiomPrototype() {
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [courseTab, setCourseTab] = useState("نظرة عامة");
  const [selectedQuestion, setSelectedQuestion] = useState(0);
  const [approved, setApproved] = useState<number[]>([]);
  const [rejected, setRejected] = useState<number[]>([]);
  const [questions, setQuestions] = useState(initialQuestions);
  const [toast, setToast] = useState("");
  const [searchText, setSearchText] = useState("");
  const [mobileNav, setMobileNav] = useState(false);
  const [editText, setEditText] = useState(initialQuestions[0].text);
  const [version, setVersion] = useState(3);
  const [difficulty, setDifficulty] = useState("متوسط");
  const [toggles, setToggles] = useState([true, true, true, false]);
  const [selectedChapters, setSelectedChapters] = useState(["chapter-03"]);
  const [chapterPickerOpen, setChapterPickerOpen] = useState(false);
  const selectedChapterOptions = availableChapters.filter((chapter) =>
    selectedChapters.includes(chapter.id),
  );
  const activeQuestion = questions[selectedQuestion];
  const approvalCount = approved.length;
  const pageTitle: Record<Screen, string> = {
    dashboard: "الرئيسية",
    courses: "المساقات",
    course: "مساحة المساق",
    materials: "مواد المساق",
    style: "بصمة أسلوب الأستاذ",
    generate: "إعداد الامتحان",
    progress: "إنشاء الامتحان",
    review: "مراجعة الأسئلة",
    editor: "تحرير السؤال",
    history: "سجل الإصدارات",
    export: "تصدير الامتحان",
    bank: "بنك الأسئلة",
    usage: "الاستخدام",
    settings: "الإعدادات",
    states: "حالات النموذج",
    exams: "الامتحانات",
  };

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  };

  const goTo = (next: Screen) => {
    setScreen(next);
    setMobileNav(false);
  };

  const openCourseTab = (tab: string) => {
    setCourseTab(tab);
    if (tab === "المواد") goTo("materials");
    else if (tab === "بصمة الأسلوب") goTo("style");
    else if (tab === "بنك الأسئلة") goTo("bank");
    else if (tab === "الامتحانات") goTo("exams");
    else goTo("course");
  };

  const addChapter = (chapterId: string) => {
    const chapter = availableChapters.find((item) => item.id === chapterId);
    if (!chapter || selectedChapters.includes(chapterId)) return;
    setSelectedChapters((current) => [...current, chapterId]);
    setChapterPickerOpen(false);
    notify(`أُضيف ${chapter.short} إلى نطاق التغطية.`);
  };

  const removeChapter = (chapterId: string) => {
    if (selectedChapters.length < 2) {
      notify("يجب إبقاء فصل واحد على الأقل ضمن نطاق الامتحان.");
      return;
    }
    setSelectedChapters((current) => current.filter((id) => id !== chapterId));
  };

  const approveCurrent = () => {
    if (!approved.includes(activeQuestion.id)) {
      setApproved((current) => [...current, activeQuestion.id]);
      setRejected((current) => current.filter((id) => id !== activeQuestion.id));
      notify("تم اعتماد السؤال بعد مراجعتك.");
    } else {
      notify("هذا السؤال معتمد بالفعل.");
    }
  };

  const saveEdit = () => {
    setQuestions((current) =>
      current.map((question, index) =>
        index === selectedQuestion ? { ...question, text: editText } : question,
      ),
    );
    setVersion((current) => current + 1);
    setApproved((current) => current.filter((id) => id !== activeQuestion.id));
    goTo("review");
    notify("حُفظ التعديل كإصدار جديد؛ يلزم اعتمادك مجدداً.");
  };

  const filteredQuestions = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    return questions.filter((question) => !query || question.text.toLowerCase().includes(query));
  }, [questions, searchText]);

  const renderHeader = () => (
    <header className="ax-topbar">
      <div className="ax-breadcrumb">
        <button className="ax-mobile-menu" onClick={() => setMobileNav((open) => !open)} aria-label="فتح القائمة">
          {mobileNav ? <X size={19} /> : <MoreHorizontal size={19} />}
        </button>
        <span className="ax-crumb-muted">Axiom</span>
        <ChevronLeft size={15} className="ax-crumb-chevron" />
        <span>{pageTitle[screen]}</span>
        {["materials", "style", "generate", "review", "editor", "history", "export"].includes(screen) && (
          <>
            <ChevronLeft size={15} className="ax-crumb-chevron ax-crumb-extra" />
            <button className="ax-crumb-link" onClick={() => goTo("course")}>Anatomy I</button>
          </>
        )}
      </div>
      <div className="ax-top-actions">
        <span className="ax-prototype-badge"><span /> نموذج تفاعلي</span>
        <button className="ax-icon-button" onClick={() => notify("لا توجد إشعارات جديدة.")} aria-label="الإشعارات">
          <Bell size={18} /><i />
        </button>
        <button className="ax-profile-chip" onClick={() => goTo("settings")}>
          <span className="ax-avatar">س</span>
          <span className="ax-profile-name">د. سلمى أحمد</span>
          <ChevronDown size={14} />
        </button>
      </div>
    </header>
  );

  const renderSidebar = () => (
    <aside className={`ax-sidebar ${mobileNav ? "ax-sidebar-open" : ""}`}>
      <div className="ax-brand">
        <div className="ax-brand-mark"><span className="ax-mark-a">A</span><i /></div>
        <div><b>Axiom</b><small>مساحة الأستاذ</small></div>
      </div>
      <button className="ax-course-switch" onClick={() => goTo("course")}>
        <span className="ax-course-avatar"><Activity size={18} /></span>
        <span className="ax-course-switch-copy"><b>Anatomy I</b><small>كلية الطب · 2024/25</small></span>
        <ChevronDown size={15} />
      </button>
      <div className="ax-nav-scroll">
        {navGroups.map((group) => (
          <div className="ax-nav-group" key={group.label}>
            <div className="ax-nav-label">{group.label}</div>
            {group.items.map(({ id, label, icon: Icon }) => (
              <button className={`ax-nav-item ${screen === id || (id === "courses" && ["course", "materials"].includes(screen)) || (id === "exams" && ["generate", "progress", "review", "editor", "history", "export"].includes(screen)) ? "active" : ""}`} key={id} onClick={() => goTo(id)}>
                <Icon size={17} strokeWidth={1.8} /><span>{label}</span>
                {id === "exams" && <span className="ax-nav-count">2</span>}
              </button>
            ))}
          </div>
        ))}
      </div>
      <div className="ax-sidebar-foot">
        <div className="ax-usage-mini">
          <div className="ax-usage-mini-head"><span>الاستخدام الشهري</span><b>42 / 100</b></div>
          <div className="ax-meter"><i style={{ width: "42%" }} /></div>
          <small>يتجدد في ١ مايو ٢٠٢٥</small>
        </div>
        <button className="ax-instructor" onClick={() => goTo("settings")}>
          <span className="ax-avatar ax-avatar-large">س</span>
          <span><b>د. سلمى أحمد</b><small>الخطة الشخصية</small></span>
          <MoreHorizontal size={17} />
        </button>
      </div>
    </aside>
  );

  const pageHeading = (title: string, subtitle: string, action?: React.ReactNode) => (
    <div className="ax-page-heading">
      <div><h1>{title}</h1><p>{subtitle}</p></div>
      {action && <div className="ax-heading-action">{action}</div>}
    </div>
  );

  const button = (text: string, onClick: () => void, variant: "primary" | "secondary" | "quiet" | "danger" = "secondary", icon?: React.ReactNode, disabled = false) => (
    <button className={`ax-button ax-button-${variant}`} onClick={onClick} disabled={disabled}>
      {icon}{text}
    </button>
  );

  const metric = (label: string, value: string, note: string, icon: React.ReactNode, accent?: string) => (
    <div className="ax-metric">
      <div className={`ax-metric-icon ${accent || ""}`}>{icon}</div>
      <div className="ax-metric-label">{label}</div>
      <div className="ax-metric-value" dir="ltr">{value}</div>
      <div className="ax-metric-note">{note}</div>
    </div>
  );

  const renderDashboard = () => (
    <>
      {pageHeading("مرحباً، د. سلمى", "إليك نظرة سريعة على مساقاتك ونشاطك الأخير.", button("إنشاء امتحان", () => goTo("generate"), "primary", <Plus size={17} />))}
      <section className="ax-metrics">
        {metric("المساقات النشطة", "12", "مساقاً هذا الفصل", <BookOpen size={18} />)}
        {metric("الأسئلة المولدة", "143", "عبر جميع مساقاتك", <Sparkles size={18} />, "blue")}
        {metric("الأسئلة المعتمدة", "97", "بقرار الأستاذ", <CheckCircle2 size={18} />, "green")}
        {metric("الاستخدام هذا الشهر", "42 / 100", "58 توليداً متاحاً", <Gauge size={18} />, "amber")}
      </section>
      <section className="ax-dashboard-grid">
        <div className="ax-main-stack">
          <div className="ax-create-card">
            <div className="ax-create-left">
              <div className="ax-eyebrow"><span className="ax-eyebrow-line" /> مساحة إعداد الامتحان</div>
              <h2>ابدأ امتحانك القادم</h2>
              <p>من محتوى المساق إلى مسودة أسئلة قابلة للمراجعة — أنت صاحب القرار في كل خطوة.</p>
              <button className="ax-button ax-button-primary" onClick={() => goTo("generate")}>إنشاء امتحان <ArrowLeft size={16} /></button>
            </div>
            <div className="ax-flow">
              <div className="ax-flow-step"><span>١</span><div><b>اختر المساق</b><small>المادة والفصل</small></div></div>
              <div className="ax-flow-line" />
              <div className="ax-flow-step"><span>٢</span><div><b>حدد المطلوب</b><small>النوع والصعوبة</small></div></div>
              <div className="ax-flow-line" />
              <div className="ax-flow-step"><span>٣</span><div><b>راجع الأسئلة</b><small>اعتمادك أولاً</small></div></div>
            </div>
            <div className="ax-card-watermark">A</div>
          </div>
          <div className="ax-section-title"><div><h2>المساقات الأخيرة</h2><span>مساحاتك الأكاديمية</span></div><button className="ax-text-action" onClick={() => goTo("courses")}>عرض كل المساقات <ArrowLeft size={14} /></button></div>
          <div className="ax-course-grid">
            {[
              { name: "Anatomy I", dept: "كلية الطب", count: "12 مادة", color: "course-navy", icon: <Activity size={20} />, progress: 74 },
              { name: "Pharmacology", dept: "كلية الطب", count: "8 مواد", color: "course-sage", icon: <FlaskConical size={20} />, progress: 58 },
              { name: "Medical Ethics", dept: "كلية الطب", count: "6 مواد", color: "course-sand", icon: <BookOpen size={20} />, progress: 82 },
              { name: "Software Engineering", dept: "كلية الهندسة", count: "9 مواد", color: "course-ink", icon: <GraduationCap size={20} />, progress: 66 },
            ].map((course) => (
              <button className="ax-course-card" key={course.name} onClick={() => goTo("course")}>
                <span className={`ax-course-card-icon ${course.color}`}>{course.icon}</span>
                <span className="ax-course-card-title">{course.name}</span>
                <span className="ax-course-card-meta">{course.dept} <i /> {course.count}</span>
                <span className="ax-course-card-bottom"><span>جاهزية المواد</span><b>{course.progress}%</b></span>
                <span className="ax-course-progress"><i style={{ width: `${course.progress}%` }} /></span>
                <ChevronLeft className="ax-course-arrow" size={16} />
              </button>
            ))}
          </div>
        </div>
        <aside className="ax-side-stack">
          <div className="ax-insight">
            <div className="ax-insight-top"><span className="ax-insight-icon"><Sparkles size={17} /></span><span className="ax-insight-label">ملاحظة من Axiom</span><span className="ax-insight-dot" /></div>
            <h3>تغطية الفصل الثالث أقل من المتوسط</h3>
            <p>لاحظنا أن الأسئلة الموجودة حالياً تغطي موضوعات الفصل بشكل أقل من بقية فصول المساق.</p>
            <div className="ax-insight-foot"><span>Chapter 03 · Cardiovascular</span><button onClick={() => goTo("generate")}>راجع الفصل <ArrowLeft size={13} /></button></div>
          </div>
          <div className="ax-panel ax-activity-panel">
            <div className="ax-panel-heading"><h3>النشاط الأخير</h3><button className="ax-kebab" onClick={() => notify("يعرض هذا السجل نشاط مساحة الأستاذ.")}><MoreHorizontal size={17} /></button></div>
            <div className="ax-activity-list">
              <div className="ax-activity-row"><span className="ax-activity-icon material"><FileText size={15} /></span><span><b>تم رفع Anatomy Lecture 04</b><small>Anatomy I · منذ ساعتين</small></span><span className="ax-activity-time">٢س</span></div>
              <div className="ax-activity-row"><span className="ax-activity-icon style"><Sparkles size={15} /></span><span><b>تم إنشاء بصمة أسلوب جديدة</b><small>Pharmacology · أمس</small></span><span className="ax-activity-time">أمس</span></div>
              <div className="ax-activity-row"><span className="ax-activity-icon approved"><Check size={15} /></span><span><b>تم اعتماد 8 أسئلة</b><small>Anatomy I · ٢٢ أبريل</small></span><span className="ax-activity-time">٢٢ أبر</span></div>
              <div className="ax-activity-row"><span className="ax-activity-icon export"><ArrowDownLeft size={15} /></span><span><b>تم تصدير Midterm Exam</b><small>Medical Ethics · ٢٠ أبريل</small></span><span className="ax-activity-time">٢٠ أبر</span></div>
            </div>
            <button className="ax-panel-footer-action" onClick={() => goTo("exams")}>عرض سجل الامتحانات <ArrowLeft size={14} /></button>
          </div>
          <div className="ax-review-reminder">
            <span className="ax-reminder-icon"><ShieldCheck size={18} /></span>
            <div><b>الأستاذ يراجع كل سؤال</b><small>لا يعتمد Axiom أي سؤال تلقائياً.</small></div>
          </div>
        </aside>
      </section>
    </>
  );

  const renderCourses = () => (
    <>
      {pageHeading("المساقات", "إدارة المواد والمحتوى العلمي لكل مساق.", button("إنشاء مساق", () => notify("إنشاء المساق غير مفعّل في هذا النموذج."), "primary", <Plus size={17} />))}
      <div className="ax-toolbar">
        <label className="ax-search"><Search size={17} /><input value={searchText} onChange={(event) => setSearchText(event.target.value)} placeholder="ابحث عن مساق..." /></label>
        <button className="ax-button ax-button-secondary" onClick={() => notify("تُعرض المساقات النشطة فقط في هذه المعاينة.")}><Filter size={16} /> نشطة <ChevronDown size={14} /></button>
        <span className="ax-results-count">١٢ مساقاً</span>
      </div>
      <div className="ax-course-list">
        {["Anatomy I", "Pharmacology", "Medical Ethics", "Software Engineering", "Histology", "Physiology"].filter((name) => name.toLowerCase().includes(searchText.toLowerCase())).map((name, index) => (
          <button className="ax-course-list-card" key={name} onClick={() => goTo("course")}>
            <span className={`ax-list-course-icon list-${index % 4}`}>{index % 2 ? <FlaskConical size={20} /> : <BookOpen size={20} />}</span>
            <span className="ax-list-course-info"><b>{name}</b><small>{index === 3 ? "كلية الهندسة" : "كلية الطب"} · السنة الثالثة</small></span>
            <span className="ax-list-stat"><b>{index === 0 ? "12" : 6 + index} مواد</b><small>المواد</small></span>
            <span className="ax-list-stat"><b>{index === 0 ? "4" : index + 1} امتحانات</b><small>الامتحانات</small></span>
            <span className="ax-status-pill status-ready"><span /> بصمة جاهزة</span>
            <span className="ax-course-updated">آخر تحديث<br />قبل {index + 1} يوم</span>
            <ChevronLeft size={16} className="ax-row-chevron" />
          </button>
        ))}
        {filteredQuestions.length === 0 && <div className="ax-empty-inline">لا توجد نتائج مطابقة. جرّبي كلمة بحث أخرى.</div>}
      </div>
      <div className="ax-empty-state-mini">
        <span className="ax-empty-illustration"><BookOpen size={22} /></span>
        <div><b>مساق جديد؟</b><p>يمكنك فتح مساحة تجريبية من Anatomy I، أما إنشاء مساقات جديدة فغير متصل في هذا النموذج.</p></div>
        <button className="ax-button ax-button-secondary" onClick={() => goTo("course")}>فتح Anatomy I <ArrowLeft size={15} /></button>
      </div>
    </>
  );

  const renderCourse = () => (
    <>
      <div className="ax-course-hero">
        <div className="ax-course-hero-icon"><Activity size={24} /></div>
        <div className="ax-course-hero-copy">
          <div className="ax-eyebrow">مساق · كلية الطب</div>
          <h1>Anatomy I</h1>
          <div className="ax-course-meta-line"><span>السنة الثالثة</span><i /><span>١٢ مادة</span><i /><span>٤ امتحانات</span><i /><span className="ax-ready-text"><CheckCircle2 size={14} /> Style Profile جاهزة</span></div>
        </div>
        {button("إنشاء امتحان", () => goTo("generate"), "primary", <Plus size={17} />)}
      </div>
      <div className="ax-tabs">
        {["نظرة عامة", "المواد", "الامتحانات", "بصمة الأسلوب", "بنك الأسئلة"].map((tab) => <button className={courseTab === tab ? "active" : ""} key={tab} onClick={() => openCourseTab(tab)}>{tab}{tab === "المواد" && <span>١٢</span>}</button>)}
      </div>
      <div className="ax-course-workspace">
        <div className="ax-main-stack">
          <div className="ax-section-title"><div><h2>نظرة عامة</h2><span>آخر نشاط في مساحة Anatomy I</span></div><button className="ax-text-action" onClick={() => goTo("materials")}>إدارة المواد <ArrowLeft size={14} /></button></div>
          <div className="ax-course-overview-grid">
            <div className="ax-panel ax-chapter-panel">
              <div className="ax-panel-heading"><div><h3>الفصول الدراسية</h3><small>تقدم المواد العلمية</small></div><button className="ax-kebab" onClick={() => notify("عرض الفصول النشطة للمساق.")}><MoreHorizontal size={17} /></button></div>
              {[
                ["Chapter 01", "مقدمة في التشريح", "مكتمل", 100],
                ["Chapter 02", "الأنسجة والأجهزة", "مكتمل", 100],
                ["Chapter 03", "الجهاز القلبي الوعائي", "قيد المراجعة", 68],
                ["Chapter 04", "الجهاز التنفسي", "مادة جاهزة", 82],
              ].map(([chapter, title, state, percent]) => <button className="ax-chapter-row" key={chapter} onClick={() => { setCourseTab("المواد"); goTo("materials"); }}><span className="ax-chapter-dot" /><span><b>{chapter}</b><small>{title}</small></span><span className="ax-chapter-status">{state}</span><span className="ax-chapter-bar"><i style={{ width: `${percent}%` }} /></span><ChevronLeft size={15} /></button>)}
            </div>
            <div className="ax-panel ax-profile-summary">
              <div className="ax-panel-heading"><div><h3>بصمة الأسلوب</h3><small>مبنية من ٦ امتحانات سابقة</small></div><span className="ax-version-tag">v1.3</span></div>
              <div className="ax-profile-quote"><span>“</span><p>أسئلة مباشرة بصياغة رسمية، متوسطة التفاصيل، وتوازن بين الاستدعاء والتطبيق.</p></div>
              <div className="ax-profile-summary-bottom"><span className="ax-status-pill status-ready"><span /> جاهزة</span><button className="ax-text-action" onClick={() => goTo("style")}>عرض البصمة <ArrowLeft size={14} /></button></div>
            </div>
          </div>
          <div className="ax-section-title"><div><h2>مواد حديثة</h2><span>آخر ما أضيف إلى المساق</span></div><button className="ax-text-action" onClick={() => goTo("materials")}>كل المواد <ArrowLeft size={14} /></button></div>
          <div className="ax-material-strip">
            <div className="ax-material-mini"><span className="ax-file-mark pdf">PDF</span><div><b>Anatomy Lecture 03</b><small>٢٤ صفحة · Chapter 03</small></div><span className="ax-status-pill status-ready"><span /> جاهز</span></div>
            <div className="ax-material-mini"><span className="ax-file-mark ppt">PPT</span><div><b>Cardiovascular System</b><small>٣٦ شريحة · Chapter 03</small></div><span className="ax-status-pill status-processing"><span /> معالجة</span></div>
          </div>
        </div>
        <aside className="ax-side-stack">
          <div className="ax-insight ax-insight-compact"><div className="ax-insight-top"><span className="ax-insight-icon"><Sparkles size={17} /></span><span className="ax-insight-label">ملاحظة من Axiom</span></div><h3>تغطية الفصل الثالث أقل من المتوسط</h3><p>يمكنك البدء بمراجعة مجموعة أسئلة تغطي موضوعات الجهاز القلبي الوعائي.</p><button className="ax-insight-cta" onClick={() => goTo("generate")}>إنشاء أسئلة للفصل <ArrowLeft size={14} /></button></div>
          <div className="ax-panel ax-course-quick"><h3>اختصارات المساق</h3><button onClick={() => goTo("materials")}><CloudUpload size={16} /> إضافة مادة <ChevronLeft size={14} /></button><button onClick={() => goTo("style")}><Sparkles size={16} /> بصمة الأسلوب <ChevronLeft size={14} /></button><button onClick={() => goTo("bank")}><ListChecks size={16} /> بنك الأسئلة <ChevronLeft size={14} /></button></div>
        </aside>
      </div>
    </>
  );

  const renderMaterials = () => (
    <>
      {pageHeading("مواد المساق", "مصادرك الأكاديمية محفوظة ضمن مساحة Anatomy I.", button("رفع مادة", () => notify("هذه معاينة فقط؛ رفع الملفات الفعلي غير متاح."), "primary", <Upload size={16} />))}
      <div className="ax-upload-zone">
        <div className="ax-upload-art"><div className="ax-upload-ring"><CloudUpload size={27} /></div><span className="ax-upload-spark one" /><span className="ax-upload-spark two" /><span className="ax-upload-doc doc-one" /><span className="ax-upload-doc doc-two" /></div>
        <div className="ax-upload-copy"><h2>اسحب الملفات إلى هنا</h2><p>أو <button onClick={() => notify("لن يتم رفع أي ملف؛ هذا تفاعل توضيحي فقط.")}>اختر ملفاً</button> لإضافته إلى مواد المساق</p><div className="ax-file-formats"><span>PDF</span><span>PPTX</span><span>DOCX</span><span>TXT</span><small>حتى ٥٠ MB لكل ملف · نموذج توضيحي</small></div></div>
        <span className="ax-upload-corner"><ArrowUpLeft size={16} /></span>
      </div>
      <div className="ax-processing-banner"><div className="ax-processing-orb"><Activity size={17} /></div><div><b>حالة معالجة نموذجية</b><p>Cardiovascular System.pptx · مثال بصري، لا تتم معالجة ملف فعلي</p></div><div className="ax-processing-progress"><span>٣ من ٦ مراحل</span><b>٥٨٪</b><div className="ax-meter"><i style={{ width: "58%" }} /></div></div><button onClick={() => notify("هذه حالة معالجة ثابتة ضمن النموذج.")}>عرض التفاصيل <ChevronLeft size={14} /></button></div>
      <div className="ax-material-head"><div><h2>كل المواد</h2><span>١٢ مادة في Anatomy I</span></div><div className="ax-material-filters"><button onClick={() => notify("تُعرض المواد من جميع الفصول.")}><Filter size={15} /> كل الحالات <ChevronDown size={13} /></button><button onClick={() => notify("تُرتب المواد حسب تاريخ الإضافة.")}>الأحدث أولاً <ChevronDown size={13} /></button></div></div>
      <div className="ax-material-grid">
        {[
          ["Anatomy Lecture 03.pdf", "٢٤ صفحة · Chapter 03 · أضيف ٢٢ أبريل", "PDF", "ready", "جاهز"],
          ["Cardiovascular System.pptx", "٣٦ شريحة · Chapter 03 · أضيف ٢٣ أبريل", "PPT", "processing", "جاري المعالجة"],
          ["Heart and Great Vessels.docx", "١٨ صفحة · Chapter 03 · أضيف ١٩ أبريل", "DOC", "ready", "جاهز"],
          ["Anatomical Terminology.txt", "ملف نصي · Chapter 01 · أضيف ١٥ أبريل", "TXT", "ready", "جاهز"],
        ].map(([name, meta, type, status, state]) => <div className="ax-material-card" key={name}><div className={`ax-file-mark ${type.toLowerCase()}`}>{type}</div><div className="ax-material-card-copy"><b>{name}</b><small>{meta}</small></div><button className="ax-kebab" onClick={() => notify("خيارات الملف معروضة للتوضيح فقط.")}><MoreHorizontal size={17} /></button><div className={`ax-status-pill ${status === "ready" ? "status-ready" : "status-processing"}`}><span />{state}</div>{status === "processing" && <div className="ax-material-card-progress"><i /></div>}</div>)}
      </div>
      <div className="ax-state-note"><ShieldCheck size={16} /><span>قد تظهر أسماء الملفات وحالات المعالجة في النموذج فقط. لم يتم رفع أو تحليل مستندات.</span></div>
    </>
  );

  const renderStyle = () => (
    <>
      {pageHeading("بصمة أسلوب الأستاذ", "ملامح أسلوبك الأكاديمي كما تظهر في المساقات السابقة.", button("إنشاء نسخة تجريبية", () => notify("لا يتم إنشاء بصمة جديدة في هذا النموذج."), "secondary", <History size={16} />))}
      <div className="ax-style-banner">
        <div className="ax-style-banner-icon"><Sparkles size={21} /></div>
        <div className="ax-style-banner-copy"><div className="ax-eyebrow">محرك ذكاء الأستاذ · Anatomy I</div><h2>أسلوبك، محفوظ كسياق أكاديمي</h2><p>تساعد هذه البصمة في اقتراح أسئلة أقرب لطريقتك — وتبقى كل مسودة بانتظار مراجعتك.</p></div>
        <div className="ax-profile-status"><span className="ax-status-pill status-ready"><span /> جاهزة</span><b>v1.3</b><small>آخر تحديث ١٨ أبريل ٢٠٢٥</small></div>
      </div>
      <div className="ax-style-stats">
        <div className="ax-style-stat"><small>الحالة</small><b className="ax-green">جاهزة</b><span>متاحة للتوليد</span></div>
        <div className="ax-style-stat"><small>الإصدار</small><b dir="ltr">v1.3</b><span>الإصدار الحالي</span></div>
        <div className="ax-style-stat"><small>العينات</small><b>٦ امتحانات</b><span>امتحانات سابقة</span></div>
        <div className="ax-style-stat"><small>آخر تحديث</small><b>١٨ أبريل</b><span>٢٠٢٥</span></div>
      </div>
      <div className="ax-style-content-grid">
        <div className="ax-main-stack">
          <div className="ax-section-title"><div><h2>ملامح أسلوبك</h2><span>قراءة بصرية لخصائص الأسئلة السابقة</span></div><span className="ax-static-label">بيانات توضيحية</span></div>
          <div className="ax-style-cards">
            <div className="ax-style-card ax-writing-card"><div className="ax-style-card-icon"><FileText size={17} /></div><small>أسلوب الصياغة</small><h3>رسمي ومباشر</h3><p>متوسط التفاصيل</p><div className="ax-writing-sample"><span>صياغة أكاديمية</span><span>مباشرة</span><span>دقيقة</span></div></div>
            <div className="ax-style-card"><div className="ax-style-card-icon"><Gauge size={17} /></div><small>مستوى التعقيد</small><h3>متوسط</h3><p>توازن بين الفهم والتطبيق</p><div className="ax-complexity-track"><i /><i /><i className="selected" /><i /><i /></div><div className="ax-scale-labels"><span>أساسي</span><span>متقدم</span></div></div>
            <div className="ax-style-card"><div className="ax-style-card-icon"><ListChecks size={17} /></div><small>أنواع الأسئلة</small><h3>تنوع محسوب</h3><p>توزيع شائع في امتحاناتك</p><div className="ax-question-mix"><div><span>اختيار من متعدد</span><b>٥٨٪</b><i><em style={{ width: "58%" }} /></i></div><div><span>إجابة قصيرة</span><b>٢٦٪</b><i><em style={{ width: "26%" }} /></i></div><div><span>مقالي</span><b>١٦٪</b><i><em style={{ width: "16%" }} /></i></div></div></div>
            <div className="ax-style-card ax-length-card"><div className="ax-style-card-icon"><Clock3 size={17} /></div><small>متوسط طول السؤال</small><div className="ax-length-number">٤٢ <span>كلمة</span></div><p>مقارنة بعينات الامتحانات الست</p><div className="ax-length-visual"><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /></div><div className="ax-length-caption"><span>أقصر</span><b>متوسط</b><span>أطول</span></div></div>
          </div>
          <div className="ax-panel ax-style-structure"><div className="ax-panel-heading"><div><h3>بنية الأسئلة</h3><small>ملخص الملامح المتكررة</small></div><span className="ax-static-label">من ٦ عينات</span></div><div className="ax-structure-row"><span>وضوح صياغة السؤال</span><div className="ax-structure-scale"><i /><i /><i /><i /><i className="on" /></div><b>مرتفع</b></div><div className="ax-structure-row"><span>وجود سياق تطبيقي</span><div className="ax-structure-scale"><i /><i /><i className="on" /><i /><i /></div><b>متوسط</b></div><div className="ax-structure-row"><span>توزيع البدائل</span><div className="ax-structure-scale"><i /><i /><i /><i className="on" /><i /></div><b>متوازن</b></div></div>
        </div>
        <aside className="ax-panel ax-version-panel"><div className="ax-panel-heading"><div><h3>سجل الإصدارات</h3><small>كل تحديث محفوظ</small></div><History size={17} /></div><div className="ax-version-timeline">
          {[["v1.3", "الإصدار الحالي", "١٨ أبريل ٢٠٢٥", true], ["v1.2", "تحديث بعد عينات إضافية", "٠٦ مارس ٢٠٢٥", false], ["v1.1", "ضبط أنواع الأسئلة", "١٤ يناير ٢٠٢٥", false], ["v1.0", "البصمة الأولى", "٠٢ ديسمبر ٢٠٢٤", false]].map(([v, desc, date, current]) => <div className={`ax-version-row ${current ? "current" : ""}`} key={String(v)}><span className="ax-version-dot" /><div><b dir="ltr">{v}</b><small>{desc}</small><time>{date}</time></div>{current && <span className="ax-current-tag">الحالي</span>}</div>)}
        </div><div className="ax-version-disclaimer"><ShieldCheck size={15} /><span>تُستخدم البصمة كمرجع مساعد، ولا تستبدل حكمك الأكاديمي.</span></div></aside>
      </div>
    </>
  );

  const renderGenerate = () => (
    <>
      {pageHeading("إعداد الامتحان", "حددي مواصفات المسودة التي ستراجعينها قبل اعتمادها.", <span className="ax-draft-tag"><span /> إعداد جديد · غير محفوظ</span>)}
      <div className="ax-generation-layout">
        <div className="ax-main-stack">
          <div className="ax-panel ax-config-panel">
            <div className="ax-panel-heading"><div><h3>محتوى الامتحان</h3><small>اختاري نطاق التغطية</small></div><span className="ax-step-index">١ / ٣</span></div>
            <div className="ax-field-grid">
              <label className="ax-field"><span>المساق</span><button className="ax-select" onClick={() => notify("المساق الحالي: Anatomy I")}><span><Activity size={16} /> Anatomy I</span><ChevronDown size={15} /></button></label>
              <div className="ax-field"><span>نطاق الفصول</span><button className="ax-select ax-add-chapter" aria-expanded={chapterPickerOpen} aria-controls="axiom-chapter-picker" onClick={() => setChapterPickerOpen((open) => !open)}><span><Plus size={15} /> إضافة فصل آخر</span><ChevronDown size={15} /></button></div>
            </div>
            <div className="ax-chapter-scope">
              <div className="ax-chapter-scope-head"><span>الفصول المشمولة في الامتحان</span><small>{selectedChapters.length} {selectedChapters.length === 1 ? "فصل" : "فصول"}</small></div>
              <div className="ax-selected-chapters">
                {selectedChapterOptions.map((chapter) => <div className="ax-selected-chapter" key={chapter.id}>
                  <BookOpen size={15} />
                  <span className="ax-selected-chapter-name" dir="ltr">{chapter.short} — {chapter.label}</span>
                  <span className="ax-included-tag">ضمن النطاق</span>
                  {selectedChapters.length > 1 && <button className="ax-remove-chapter" aria-label={`إزالة ${chapter.short}`} title="إزالة الفصل" onClick={() => removeChapter(chapter.id)}><X size={14} /></button>}
                </div>)}
              </div>
              {chapterPickerOpen && <div className="ax-chapter-menu" id="axiom-chapter-picker">
                <div className="ax-chapter-menu-heading"><b>اختاري فصلاً لإضافته</b><small>يمكن جمع أسئلة من عدة فصول في امتحان واحد.</small></div>
                {availableChapters.filter((chapter) => !selectedChapters.includes(chapter.id)).map((chapter) => <button className="ax-chapter-option" key={chapter.id} onClick={() => addChapter(chapter.id)}>
                  <span className="ax-chapter-option-icon"><Plus size={15} /></span>
                  <span className="ax-chapter-option-copy"><b dir="ltr">{chapter.short} — {chapter.label}</b><small>{chapter.meta}</small></span>
                  <ChevronLeft size={15} />
                </button>)}
                {selectedChapterOptions.length === availableChapters.length && <p className="ax-chapter-menu-empty">جميع فصول المساق المختارة ضمن النطاق.</p>}
              </div>}
              <p className="ax-chapter-help">ستُستخدم مواد الفصول المحددة كلها كمصادر للأسئلة؛ أعداد الأسئلة أدناه هي إجمالي الامتحان.</p>
            </div>
            <style>{`
              .ax-app .ax-add-chapter{color:#496b8d;border-color:#dce5ec;background:#fff}
              .ax-app .ax-add-chapter>span{display:flex;align-items:center;gap:7px}
              .ax-app .ax-chapter-scope{margin:12px 0 16px}
              .ax-app .ax-chapter-scope-head{display:flex;align-items:center;gap:8px;margin-bottom:8px;color:#68798b;font-size:10px}
              .ax-app .ax-chapter-scope-head small{color:#8294a4;background:#f2f5f7;border-radius:12px;padding:2px 7px;font-size:9px}
              .ax-app .ax-selected-chapters{display:flex;flex-wrap:wrap;gap:7px}
              .ax-app .ax-selected-chapter{display:flex;align-items:center;gap:7px;min-height:34px;padding:5px 8px;border:1px solid #e3e9ee;background:#fbfcfd;border-radius:7px;color:#58728c;font-size:10px}
              .ax-app .ax-selected-chapter>svg{flex-shrink:0;color:#6d8ca8}
              .ax-app .ax-selected-chapter-name{color:#50667d;font-family:'IBM Plex Sans','Noto Sans Arabic',sans-serif}
              .ax-app .ax-included-tag{color:#4e7c62;background:#edf5ef;border-radius:4px;padding:2px 5px;font-size:9px;white-space:nowrap}
              .ax-app .ax-remove-chapter{width:26px;height:26px;display:grid;place-items:center;border:0;border-radius:5px;background:transparent;color:#8896a3;padding:0}
              .ax-app .ax-remove-chapter:hover{background:#f7eded;color:#9e5956}
              .ax-app .ax-chapter-menu{margin-top:8px;padding:7px;background:#fff;border:1px solid #e2e8ed;border-radius:8px;box-shadow:0 10px 24px rgba(38,54,74,.08)}
              .ax-app .ax-chapter-menu-heading{padding:6px 8px 8px;border-bottom:1px solid #edf0f3}
              .ax-app .ax-chapter-menu-heading b{display:block;color:#425970;font-size:11px}
              .ax-app .ax-chapter-menu-heading small{display:block;color:#8a98a6;font-size:9px;margin-top:3px}
              .ax-app .ax-chapter-option{width:100%;display:flex;align-items:center;gap:9px;padding:8px;border:0;border-bottom:1px solid #f0f2f4;background:#fff;text-align:right;border-radius:5px}
              .ax-app .ax-chapter-option:last-child{border-bottom:0}
              .ax-app .ax-chapter-option:hover{background:#f5f8fa}
              .ax-app .ax-chapter-option-icon{width:27px;height:27px;display:grid;place-items:center;border-radius:6px;background:#edf3f7;color:#577b9c;flex-shrink:0}
              .ax-app .ax-chapter-option-copy{flex:1;min-width:0}
              .ax-app .ax-chapter-option-copy b{display:block;color:#40566e;font-size:10px;font-weight:600}
              .ax-app .ax-chapter-option-copy small{display:block;color:#909ca8;font-size:9px;margin-top:3px}
              .ax-app .ax-chapter-option>svg{color:#9ba7b1}
              .ax-app .ax-chapter-menu-empty,.ax-app .ax-chapter-help{color:#8795a3;font-size:9px;line-height:1.7;margin:7px 0 0}
              @media(max-width:640px){.ax-app .ax-chapter-scope-head{font-size:12px}.ax-app .ax-selected-chapter{min-height:40px;font-size:11px;gap:6px}.ax-app .ax-included-tag{font-size:10px}.ax-app .ax-remove-chapter{width:32px;height:32px}.ax-app .ax-chapter-option{min-height:48px}.ax-app .ax-chapter-option-copy b{font-size:12px;line-height:1.5}.ax-app .ax-chapter-option-copy small,.ax-app .ax-chapter-help{font-size:11px}.ax-app .ax-chapter-menu-heading b{font-size:13px}.ax-app .ax-chapter-menu-heading small{font-size:11px}}
            `}</style>
            <div className="ax-field-label">أنواع الأسئلة وعددها</div>
            <div className="ax-question-counts">
              {[
                ["اختيار من متعدد", "MCQ", "٥"],
                ["مقالي", "Essay", "٢"],
                ["إجابة قصيرة", "Short answer", "١"],
              ].map(([label, type, count]) => <div className="ax-count-card" key={type}><span className="ax-check-square checked"><Check size={13} /></span><div><b>{label}</b><small>{type}</small></div><div className="ax-stepper"><button onClick={() => notify(`تم تعديل عدد ${label} توضيحياً.`)} aria-label="تقليل">−</button><b>{count}</b><button onClick={() => notify(`تم تعديل عدد ${label} توضيحياً.`)} aria-label="زيادة">+</button></div></div>)}
            </div>
            <div className="ax-count-total"><span>إجمالي الأسئلة</span><b>٨ أسئلة</b></div>
          </div>
          <div className="ax-panel ax-config-panel">
            <div className="ax-panel-heading"><div><h3>مستوى الصعوبة</h3><small>يمكن تعديل صعوبة كل سؤال في المراجعة</small></div><span className="ax-step-index">٢ / ٣</span></div>
            <div className="ax-difficulty-options">
              {["سهل", "متوسط", "متقدم"].map((option, index) => <button className={`ax-difficulty-option ${difficulty === option ? "selected" : ""}`} key={option} onClick={() => setDifficulty(option)}><span className="ax-radio">{difficulty === option && <i />}</span><span><b>{option}</b><small>{["استدعاء المفاهيم الأساسية", "فهم وتطبيق متوازن", "تحليل وربط المفاهيم"][index]}</small></span><span className={`ax-difficulty-bars bars-${index + 1}`}><i /><i /><i /></span></button>)}
            </div>
          </div>
          <div className="ax-panel ax-config-panel">
            <div className="ax-panel-heading"><div><h3>تفضيلات المراجعة</h3><small>اقتراحات يمكن التحكم بها</small></div><span className="ax-step-index">٣ / ٣</span></div>
            <div className="ax-toggle-list">
              {[
                ["استخدام بصمة الأسلوب", "صياغة أقرب لامتحاناتك السابقة", true],
                ["إلزام الاستشهاد بالمصدر", "إظهار المادة والصفحة لكل سؤال", true],
                ["تجنب الأسئلة المتكررة", "مقارنة مع بنك الأسئلة الحالي", true],
                ["موازنة مستوى الصعوبة", "توزيع الأسئلة وفق المستوى المحدد", false],
              ].map(([title, detail], index) => <button className="ax-toggle-row" key={String(title)} onClick={() => setToggles((current) => current.map((value, i) => i === index ? !value : value))}><span className="ax-toggle-copy"><b>{title}</b><small>{detail}</small></span><span className={`ax-switch ${toggles[index] ? "on" : ""}`}><i /></span></button>)}
            </div>
          </div>
        </div>
        <aside className="ax-generation-aside">
           <div className="ax-panel ax-summary-panel"><div className="ax-panel-heading"><div><h3>ملخص الإعداد</h3><small>راجعي اختياراتك</small></div><FileCheck2 size={18} /></div><div className="ax-summary-course"><span className="ax-course-avatar"><Activity size={17} /></span><div><b>Anatomy I</b><small>{selectedChapterOptions.map((chapter) => chapter.short).join(" · ")}</small></div></div><div className="ax-summary-row"><span>نطاق الفصول</span><b>{selectedChapterOptions.length} {selectedChapterOptions.length === 1 ? "فصل" : "فصول"}</b></div><div className="ax-summary-row"><span>الأسئلة</span><b>٨ أسئلة</b></div><div className="ax-summary-row"><span>الصعوبة</span><b>{difficulty}</b></div><div className="ax-summary-row"><span>بصمة الأسلوب</span><b className="ax-green">v1.3 · مفعّلة</b></div><div className="ax-summary-row"><span>الاستشهادات</span><b>مطلوبة</b></div><div className="ax-summary-note"><ShieldCheck size={16} /><span>سيتم إعداد مسودة أولية. لا يُعتمد أي سؤال دون مراجعتك.</span></div><button className="ax-button ax-button-primary ax-button-full" onClick={() => { goTo("progress"); window.setTimeout(() => goTo("review"), 4200); }}>ابدأ التوليد <Sparkles size={16} /></button><div className="ax-prototype-caption">محاكاة مرئية · لا يوجد اتصال بخدمة توليد</div></div>
          <div className="ax-panel ax-quick-context"><div className="ax-panel-heading"><h3>مصادر الفصل</h3><span className="ax-status-pill status-ready"><span /> جاهز</span></div><div><span className="ax-file-mark pdf">PDF</span><span><b>Anatomy Lecture 03</b><small>٢٤ صفحة · ٨ مقاطع ذات صلة</small></span></div><div><span className="ax-file-mark ppt">PPT</span><span><b>Cardiovascular System</b><small>٣٦ شريحة · معالجة مكتملة</small></span></div><button onClick={() => goTo("materials")}>عرض المواد <ArrowLeft size={14} /></button></div>
        </aside>
      </div>
    </>
  );

  const renderProgress = () => (
    <div className="ax-progress-page">
      <div className="ax-progress-overline"><span className="ax-brand-mark ax-brand-mark-small"><span className="ax-mark-a">A</span><i /></span> إعداد مسودة · نموذج توضيحي</div>
      <h1>جاري بناء الامتحان</h1>
      <p className="ax-progress-intro">تجربة مرئية لخطوات إعداد مسودة السؤال. لا يتم استدعاء نموذج ذكاء اصطناعي.</p>
       <div className="ax-progress-summary"><span><Activity size={18} /> Anatomy I</span><i /><span>{selectedChapterOptions.map((chapter) => chapter.short).join(" · ")}</span><i /><b>٨ أسئلة</b></div>
      <div className="ax-progress-visual"><div className="ax-progress-orbit orbit-one" /><div className="ax-progress-orbit orbit-two" /><div className="ax-progress-center"><span className="ax-brand-mark"><span className="ax-mark-a">A</span><i /></span><b>AI</b></div><span className="ax-orbit-node node-one"><FileText size={15} /></span><span className="ax-orbit-node node-two"><Sparkles size={15} /></span><span className="ax-orbit-node node-three"><ShieldCheck size={15} /></span></div>
      <div className="ax-progress-timeline">
        {["تجهيز المادة", "استرجاع المقاطع المناسبة", "تطبيق بصمة الأستاذ", "توليد الأسئلة", "فحص الاستشهادات", "تجهيز المراجعة"].map((step, index) => <div className={`ax-progress-step ${index < 3 ? "done" : index === 3 ? "working" : ""}`} key={step}><span>{index < 3 ? <Check size={13} /> : index === 3 ? <i /> : <b>{index + 1}</b>}</span><small>{step}</small></div>)}
      </div>
      <div className="ax-progress-trust"><ShieldCheck size={16} /><span>سيبقى كل سؤال مسودة حتى تراجعيه وتعتمديه بنفسك.</span></div>
      <button className="ax-button ax-button-secondary" onClick={() => goTo("review")}>الانتقال إلى نموذج المراجعة <ArrowLeft size={15} /></button>
    </div>
  );

  const renderReview = () => (
    <>
       <div className="ax-review-heading"><div><div className="ax-eyebrow"><span className="ax-eyebrow-line" /> مراجعة بشرية مطلوبة</div><h1>مراجعة الأسئلة</h1><p>Anatomy I <i /> {selectedChapterOptions.map((chapter) => `${chapter.short} — ${chapter.label}`).join(" · ")} <i /> مسودة امتحان</p></div><div className="ax-review-heading-actions"><span className="ax-review-progress"><b>{approvalCount}</b> / 8 معتمدة</span>{button("جاهزية التصدير", () => goTo("export"), "secondary", <ArrowLeft size={15} />)}</div></div>
      <div className="ax-review-workspace">
        <aside className="ax-review-list ax-panel">
          <div className="ax-review-list-header"><div><b>الأسئلة</b><small>٨ أسئلة في المسودة</small></div><button className="ax-kebab" onClick={() => notify("يمكن ترتيب أسئلة المسودة يدوياً.")}><MoreHorizontal size={16} /></button></div>
          <div className="ax-question-nav">
            {questions.map((question, index) => <button key={question.id} className={`ax-question-nav-item ${index === selectedQuestion ? "selected" : ""}`} onClick={() => { setSelectedQuestion(index); setEditText(question.text); }}>
              <span className={`ax-q-number ${approved.includes(question.id) ? "approved" : rejected.includes(question.id) ? "rejected" : ""}`}>{String(question.id).padStart(2, "0")}</span>
              <span className="ax-q-nav-copy"><b>السؤال {String(question.id).padStart(2, "0")}</b><small>{question.type} · {question.difficulty}</small><span className="ax-q-confidence">ثقة المصدر <b>{question.confidence}%</b></span></span>
              <span className={`ax-q-status ${approved.includes(question.id) ? "is-approved" : rejected.includes(question.id) ? "is-rejected" : ""}`}>{approved.includes(question.id) ? "معتمد" : rejected.includes(question.id) ? "مرفوض" : "مراجعة"}</span>
            </button>)}
          </div>
          <button className="ax-review-list-footer" onClick={() => goTo("generate")}><Plus size={15} /> إضافة مجموعة أسئلة</button>
        </aside>
        <main className="ax-question-content ax-panel">
          <div className="ax-question-content-top"><div><span className="ax-question-type-tag">{activeQuestion.type}</span><span className="ax-difficulty-tag">{activeQuestion.difficulty}</span></div><button className="ax-kebab" onClick={() => goTo("history")} aria-label="المزيد"><MoreHorizontal size={18} /></button></div>
          <div className="ax-question-number-label">السؤال {String(activeQuestion.id).padStart(2, "0")} <span>من ٨</span></div>
          <h2 className="ax-question-prompt">{activeQuestion.text}</h2>
          <div className="ax-answers-label"><span>الخيارات</span><small>اختاري الإجابة الصحيحة لمراجعتها</small></div>
          <div className="ax-answers">
            {activeQuestion.options.map((option, index) => <button key={option} className={`ax-answer-option ${index === activeQuestion.answer ? "correct" : ""}`} onClick={() => notify(index === activeQuestion.answer ? "هذا هو الخيار المحدد كإجابة صحيحة في المثال." : "اختيارك محفوظ بصرياً في هذه المعاينة.")}><span className="ax-answer-key">{String.fromCharCode(65 + index)}</span><span>{option}</span>{index === activeQuestion.answer && <span className="ax-correct-tag"><Check size={12} /> الإجابة المحددة</span>}</button>)}
          </div>
          <div className="ax-citation-card"><div className="ax-citation-icon"><BookOpen size={17} /></div><div className="ax-citation-copy"><small>المصدر المرتبط</small><b>Anatomy Lecture 03</b><span>Page 27 <i /> Chapter 03 · Cardiovascular System</span></div><button className="ax-citation-open" onClick={() => goTo("materials")}>عرض المصدر <ArrowUpLeft size={14} /></button><div className="ax-citation-confidence"><span>ثقة الاستشهاد</span><b>94%</b><small><span /> تحقق دقيق</small></div></div>
          <div className="ax-question-note"><ShieldCheck size={15} /><span>اقرئي نص السؤال واستشهاده قبل الاعتماد. هذه مسودة مقترحة، وليست قراراً أكاديمياً.</span></div>
          <div className="ax-question-pagination"><button onClick={() => { const next = Math.max(0, selectedQuestion - 1); setSelectedQuestion(next); setEditText(questions[next].text); }} disabled={selectedQuestion === 0}><ChevronRight size={16} /> السابق</button><span>السؤال <b>{String(activeQuestion.id).padStart(2, "0")}</b> من ٠٨</span><button onClick={() => { const next = Math.min(7, selectedQuestion + 1); setSelectedQuestion(next); setEditText(questions[next].text); }} disabled={selectedQuestion === 7}>التالي <ChevronLeft size={16} /></button></div>
        </main>
        <aside className="ax-review-tools ax-panel">
          <div className="ax-review-tools-head"><span className="ax-review-tools-icon"><ShieldCheck size={17} /></span><div><b>قرار الأستاذ</b><small>لكل سؤال على حدة</small></div></div>
          <div className="ax-review-meta"><div><span>النوع</span><b>{activeQuestion.type}</b></div><div><span>الصعوبة</span><b>{activeQuestion.difficulty}</b></div><div><span>ثقة المصدر</span><b className="ax-green">{activeQuestion.confidence}%</b></div><div><span>الحالة</span><b>{approved.includes(activeQuestion.id) ? "معتمد" : rejected.includes(activeQuestion.id) ? "مرفوض" : "بانتظار المراجعة"}</b></div></div>
          <div className="ax-review-actions">
            <button className={`ax-button ax-button-approve ax-button-full ${approved.includes(activeQuestion.id) ? "is-done" : ""}`} onClick={approveCurrent}><Check size={16} /> {approved.includes(activeQuestion.id) ? "تم اعتماد السؤال" : "اعتماد السؤال"}</button>
            <button className="ax-button ax-button-secondary ax-button-full" onClick={() => { setEditText(activeQuestion.text); goTo("editor"); }}><FileText size={15} /> تعديل السؤال</button>
            <button className="ax-button ax-button-quiet ax-button-full" onClick={() => { setRejected((current) => current.includes(activeQuestion.id) ? current : [...current, activeQuestion.id]); setApproved((current) => current.filter((id) => id !== activeQuestion.id)); notify("تم وضع السؤال في حالة مرفوض — قرارك قابل للتغيير."); }}><X size={15} /> رفض السؤال</button>
            <button className="ax-button ax-button-quiet ax-button-full" onClick={() => notify("إعادة التوليد غير متصلة؛ احتفظنا بالمسودة كما هي.")}><Sparkles size={15} /> طلب بديل <span className="ax-mock-only">محاكاة</span></button>
            <button className="ax-button ax-button-quiet ax-button-full" onClick={() => goTo("history")}><History size={15} /> عرض الإصدارات</button>
          </div>
          <div className="ax-human-approval"><div className="ax-human-icon"><GraduationCap size={17} /></div><div><b>لا اعتماد تلقائي</b><small>يظل القرار بيد الأستاذ دائماً.</small></div></div>
        </aside>
      </div>
    </>
  );

  const renderEditor = () => (
    <>
      {pageHeading("تحرير السؤال", "حافظي على أصل السؤال وسجل التعديلات عند كل تغيير.", <span className="ax-version-tag">الإصدار {version}</span>)}
      <div className="ax-editor-layout">
        <div className="ax-main-stack">
          <div className="ax-panel ax-editor-panel">
            <div className="ax-editor-panel-title"><div><h3>نص السؤال</h3><small>التعديل ينشئ إصداراً جديداً عند الحفظ</small></div><span className="ax-editing-tag">قيد التحرير</span></div>
            <textarea className="ax-question-textarea" value={editText} onChange={(event) => setEditText(event.target.value)} aria-label="نص السؤال" />
            <div className="ax-editor-panel-title"><div><h3>الإجابات</h3><small>الإجابة المحددة موضحة للمراجعة</small></div><button className="ax-text-action" onClick={() => notify("إضافة خيار غير مفعّلة في هذه المعاينة.")}><Plus size={14} /> إضافة خيار</button></div>
            {activeQuestion.options.map((option, index) => <div className="ax-edit-answer" key={option}><span className={`ax-answer-key ${index === activeQuestion.answer ? "key-correct" : ""}`}>{String.fromCharCode(65 + index)}</span><input defaultValue={option} aria-label={`الخيار ${index + 1}`} /><button className={`ax-correct-selector ${index === activeQuestion.answer ? "selected" : ""}`} onClick={() => notify("تغيير الإجابة الصحيحة غير مفعّل في هذا النموذج.")}>{index === activeQuestion.answer ? <CheckCircle2 size={17} /> : <span />}</button></div>)}
            <div className="ax-editor-extra"><label><span>الإجابة الصحيحة</span><button onClick={() => notify("المحدد: الخيار " + String.fromCharCode(65 + activeQuestion.answer))}>الخيار {String.fromCharCode(65 + activeQuestion.answer)} <ChevronDown size={14} /></button></label><label><span>الصعوبة</span><button onClick={() => setDifficulty(difficulty === "متوسط" ? "متقدم" : "متوسط")}>{difficulty} <ChevronDown size={14} /></button></label></div>
            <label className="ax-explanation"><span>تفسير الإجابة</span><textarea defaultValue="تزداد المقاومة الوعائية المحيطية عندما تضيق الشُرينات، ما يرفع الضغط الشرياني إذا بقي النتاج القلبي ثابتاً." /></label>
          </div>
          <div className="ax-editor-buttons">{button("حفظ كإصدار جديد", saveEdit, "primary", <Check size={16} />)}{button("إلغاء", () => goTo("review"), "secondary")}</div>
          <div className="ax-editor-review-note"><ShieldCheck size={15} /><span>أي تعديل يُبطل الاعتماد السابق لهذا السؤال حتى تراجعي النسخة الجديدة وتعتمديها.</span></div>
        </div>
        <aside className="ax-panel ax-editor-history">
          <div className="ax-panel-heading"><div><h3>سجل الإصدارات</h3><small>تاريخ السؤال محفوظ</small></div><History size={17} /></div>
          <div className="ax-version-timeline">
            {[
              [`v${version}`, "الإصدار الحالي", "قيد التحرير", true],
              [`v${Math.max(version - 1, 2)}`, "تحرير من الأستاذة", "٢٠ أبريل ٢٠٢٥", false],
              ["v1", "مسودة مقترحة", "١٨ أبريل ٢٠٢٥", false],
            ].map(([v, desc, date, current]) => <div className={`ax-version-row ${current ? "current" : ""}`} key={String(v)}><span className="ax-version-dot" /><div><b dir="ltr">{v}</b><small>{desc}</small><time>{date}</time></div>{current && <span className="ax-current-tag">الحالي</span>}</div>)}
          </div>
          <div className="ax-source-mini"><small>المصدر الأصلي</small><b><FileText size={15} /> Anatomy Lecture 03</b><span>Page 27 · ثقة الاستشهاد 94%</span></div>
          <button className="ax-panel-footer-action" onClick={() => goTo("history")}>فتح سجل النسخ الكامل <ArrowLeft size={14} /></button>
        </aside>
      </div>
    </>
  );

  const renderHistory = () => (
    <>
      {pageHeading("سجل إصدارات السؤال", "تتبعي كيف تطورت المسودة وما الذي تغيّر في كل مراجعة.", button("العودة للمراجعة", () => goTo("review"), "secondary", <ArrowLeft size={15} />))}
      <div className="ax-history-layout">
        <div className="ax-panel ax-history-card"><div className="ax-panel-heading"><div><h3>السؤال {String(activeQuestion.id).padStart(2, "0")}</h3><small>Anatomy I · Chapter 03 · الاختيار من متعدد</small></div><span className="ax-version-tag">٣ إصدارات</span></div>
          <div className="ax-history-timeline">
            <div className="ax-history-event current"><span className="ax-history-event-dot"><Check size={13} /></span><div className="ax-history-event-head"><b>الإصدار {version}</b><span className="ax-current-tag">الحالي</span><time>الآن</time></div><p>{activeQuestion.text}</p><div className="ax-history-actor"><span className="ax-avatar ax-avatar-tiny">س</span> تعديل بواسطة د. سلمى أحمد</div></div>
            <div className="ax-history-event"><span className="ax-history-event-dot"><FileText size={13} /></span><div className="ax-history-event-head"><b>الإصدار 2</b><time>٢٠ أبريل ٢٠٢٥ · ١١:٤٢ ص</time></div><p>صياغة الأستاذة بعد مراجعة المصطلحات العلمية وتدقيق وضوح البدائل.</p><div className="ax-history-actor"><span className="ax-avatar ax-avatar-tiny">س</span> تحرير الأستاذة</div></div>
            <div className="ax-history-event"><span className="ax-history-event-dot"><Sparkles size={13} /></span><div className="ax-history-event-head"><b>الإصدار 1</b><span className="ax-ai-tag">مسودة أولية</span><time>١٨ أبريل ٢٠٢٥ · ٩:١٨ ص</time></div><p>اقتراح أولي مبني على مقطع من Anatomy Lecture 03، صفحة 27.</p><div className="ax-history-source"><BookOpen size={14} /> Anatomy Lecture 03 · Page 27 <span>ثقة 94٪</span></div></div>
          </div>
        </div>
        <aside className="ax-panel ax-history-trust"><span className="ax-trust-emblem"><ShieldCheck size={23} /></span><h3>تتبّع واضح لكل تغيير</h3><p>تُحفظ المسودة المقترحة والتعديلات البشرية كإصدارات منفصلة، لتبقى قرارات المراجعة قابلة للتتبع.</p><div className="ax-history-trust-row"><CheckCircle2 size={16} /><span>المصدر مرتبط بكل إصدار</span></div><div className="ax-history-trust-row"><CheckCircle2 size={16} /><span>التعديل لا يمحو الأصل</span></div><div className="ax-history-trust-row"><CheckCircle2 size={16} /><span>الاعتماد قرار الأستاذ</span></div></aside>
      </div>
    </>
  );

  const renderExport = () => {
    const allApproved = approvalCount === 8;
    return (
      <div className={`ax-export-page ${allApproved ? "ready" : ""}`}>
        <div className="ax-export-overline"><span className={allApproved ? "is-ready" : ""}>{allApproved ? <Check size={16} /> : <ShieldCheck size={16} />}</span> {allApproved ? "مراجعة الأستاذ مكتملة" : "ملخص المراجعة"}</div>
        <h1>{allApproved ? "الامتحان جاهز" : "الامتحان بانتظار مراجعتك"}</h1>
        <p className="ax-export-intro">{allApproved ? "اكتملت مراجعة الأسئلة وربط مصادرها. اختاري صيغة التصدير." : "تُعرض جاهزية التصدير بعد اعتماد كل سؤال يدوياً من الأستاذ."}</p>
        <div className="ax-export-exam-card"><div className="ax-export-emblem"><FileCheck2 size={25} /></div><div><small>مسودة امتحان · Anatomy I</small><h2>Chapter 03 — Cardiovascular System</h2><span>٨ أسئلة <i /> تم إعدادها في ٢٤ أبريل ٢٠٢٥</span></div><span className={`ax-status-pill ${allApproved ? "status-ready" : "status-pending"}`}><span /> {allApproved ? "جاهز للتصدير" : "تحت المراجعة"}</span></div>
        <div className="ax-export-main">
          <div className="ax-panel ax-export-checklist"><div className="ax-panel-heading"><div><h3>قائمة الجاهزية</h3><small>كل البنود مطلوبة قبل التصدير</small></div><span className={`ax-approval-count ${allApproved ? "complete" : ""}`}>{approvalCount} / 8</span></div>
            {[
              [approvalCount === 8, "جميع الأسئلة معتمدة", allApproved ? "اعتماد يدوي من الأستاذ" : `${approvalCount} من ٨ أسئلة اعتمدتها`],
              [allApproved, "جميع المصادر مرتبطة", "مصدر وصفحة موثقان لكل سؤال"],
              [allApproved, "لا توجد أسئلة معلقة", allApproved ? "تمت مراجعة كامل المسودة" : `${8 - approvalCount} سؤالاً بانتظار قرارك`],
              [allApproved, "الامتحان جاهز للتصدير", allApproved ? "اكتملت قائمة الجاهزية" : "تصدير تجريبي بعد اكتمال المراجعة"],
            ].map(([done, title, description]) => <div className={`ax-checklist-row ${done ? "done" : ""}`} key={String(title)}><span>{done ? <Check size={15} /> : <i />}</span><div><b>{title}</b><small>{description}</small></div></div>)}
            {!allApproved && <button className="ax-button ax-button-primary ax-button-full" onClick={() => goTo("review")}>تابعة مراجعة الأسئلة <ArrowLeft size={15} /></button>}
          </div>
          <aside className="ax-export-side"><div className="ax-export-ai-note"><ShieldCheck size={18} /><b>موافقة الأستاذ شرط أساسي</b><p>لا يتم اعتماد أي سؤال تلقائياً. التصدير متاح فقط بعد مراجعة قراراتك.</p></div><div className="ax-export-formats"><h3>صيغة الملف</h3><button className={`ax-export-format ${allApproved ? "" : "disabled"}`} onClick={() => notify(allApproved ? "Word — معاينة فقط، لم يتم إنشاء ملف." : "راجعي الأسئلة الثمانية قبل التصدير.")}><span className="ax-format-icon word">W</span><span><b>تصدير Word</b><small>.docx · يتضمن المصادر</small></span><ArrowLeft size={15} /></button><button className={`ax-export-format ${allApproved ? "" : "disabled"}`} onClick={() => notify(allApproved ? "PDF — معاينة فقط، لم يتم إنشاء ملف." : "راجعي الأسئلة الثمانية قبل التصدير.")}><span className="ax-format-icon pdf-format">P</span><span><b>تصدير PDF</b><small>.pdf · نسخة للطباعة</small></span><ArrowLeft size={15} /></button><div className="ax-mock-only-note">أزرار تصدير شكلية · لا يتم إنشاء ملف</div></div></aside>
        </div>
      </div>
    );
  };

  const renderBank = () => (
    <>
      {pageHeading("بنك الأسئلة", "أسئلة مسوداتك المعتمدة والجاهزة لإعادة الاستخدام داخل المساق.", button("إنشاء امتحان", () => goTo("generate"), "primary", <Plus size={16} />))}
      <div className="ax-bank-summary"><div><small>إجمالي الأسئلة</small><b>١٤٣</b></div><div><small>معتمدة</small><b className="ax-green">٩٧</b></div><div><small>بانتظار المراجعة</small><b>١٨</b></div><div className="ax-bank-search"><label className="ax-search"><Search size={16} /><input value={searchText} onChange={(event) => setSearchText(event.target.value)} placeholder="ابحث في بنك الأسئلة..." /></label><button className="ax-button ax-button-secondary" onClick={() => notify("مرشحات المساق والفصل متاحة في النموذج.")}><Filter size={15} /> مرشحات</button></div></div>
      <div className="ax-bank-filters"><button onClick={() => notify("المساق المحدد: Anatomy I")}>Anatomy I <ChevronDown size={13} /></button><button onClick={() => notify("الفصل المحدد: جميع الفصول")}>كل الفصول <ChevronDown size={13} /></button><button onClick={() => notify("النوع المحدد: كل الأنواع")}>كل الأنواع <ChevronDown size={13} /></button><button onClick={() => notify("الصعوبة المحددة: كل المستويات")}>كل الصعوبات <ChevronDown size={13} /></button><button onClick={() => notify("الحالة المحددة: كل الحالات")}>كل الحالات <ChevronDown size={13} /></button><span>ترتيب حسب: <button onClick={() => notify("ترتيب حسب ثقة الاستشهاد.")}>ثقة الاستشهاد <ChevronDown size={13} /></button></span></div>
      <div className="ax-bank-list">{filteredQuestions.slice(0, 6).map((question) => <button className="ax-bank-card" key={question.id} onClick={() => { setSelectedQuestion(question.id - 1); goTo("review"); }}><div className="ax-bank-card-top"><span>السؤال {String(question.id).padStart(2, "0")}</span><span className="ax-status-pill status-ready"><span /> معتمد</span></div><p>{question.text}</p><div className="ax-bank-card-foot"><span>{question.type}</span><i /><span>{question.difficulty}</span><i /><span>Anatomy Lecture 03 · p. 27</span><div className="ax-citation-mini"><ShieldCheck size={14} /> {question.confidence}%</div></div></button>)}</div>
      <div className="ax-bank-footer">تُعرض عيّنة من بنك الأسئلة · المحتوى توضيحي <button onClick={() => goTo("review")}>فتح مساحة المراجعة <ArrowLeft size={14} /></button></div>
    </>
  );

  const renderUsage = () => (
    <>
      {pageHeading("الاستخدام", "متابعة استهلاك مساحة الأستاذ الشخصية.", <span className="ax-plan-pill">الخطة الشخصية</span>)}
      <div className="ax-usage-hero"><div><div className="ax-eyebrow">رصيد هذا الشهر</div><h2>استخدامك ضمن الحدود</h2><p>يمكنك مواصلة تجهيز الامتحانات ومراجعة الأسئلة.</p></div><div className="ax-usage-circle"><div><b>42</b><span>/ 100</span><small>استخدام</small></div><svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="49" /><circle className="ax-usage-arc" cx="60" cy="60" r="49" /></svg></div><div className="ax-usage-bar"><div><span>الاستخدام الشهري</span><b>٤٢٪</b></div><div className="ax-meter"><i style={{ width: "42%" }} /></div><small>٥٨ عملية متبقية · إعادة ضبط في ١ مايو ٢٠٢٥</small></div></div>
      <div className="ax-usage-detail-grid"><div className="ax-panel ax-usage-detail"><div className="ax-usage-detail-icon"><Sparkles size={19} /></div><small>عمليات التوليد</small><b>١٢</b><span>من ١٠٠ عملية شهرية</span><div className="ax-detail-meter"><i style={{ width: "12%" }} /></div></div><div className="ax-panel ax-usage-detail"><div className="ax-usage-detail-icon blue"><ListChecks size={19} /></div><small>الأسئلة المولدة</small><b>١٤٣</b><span>عبر ١٢ مساقاً نشطاً</span><div className="ax-detail-meter"><i style={{ width: "63%" }} /></div></div><div className="ax-panel ax-usage-detail"><div className="ax-usage-detail-icon amber"><Gauge size={19} /></div><small>استخدام الذكاء التقديري</small><b>١٨٫٤ <em>وحدة</em></b><span>قيمة تقديرية للعرض فقط</span><div className="ax-detail-meter"><i style={{ width: "42%" }} /></div></div></div>
      <div className="ax-usage-footnote"><CircleHelp size={16} /><span>أرقام الاستخدام محاكاة بصرية؛ لا يوجد احتساب أو خصم رصيد حقيقي في هذا النموذج.</span></div>
    </>
  );

  const renderSettings = () => (
    <>
      {pageHeading("الإعدادات", "تفاصيل مساحة الأستاذ وتفضيلات العرض.", button("حفظ التغييرات", () => notify("تم حفظ التفضيلات محلياً في النموذج."), "primary", <Check size={16} />))}
      <div className="ax-settings-layout"><nav className="ax-settings-nav"><button className="active" onClick={() => notify("قسم الحساب محدد.")}><GraduationCap size={16} /> الحساب</button><button onClick={() => notify("قسم المنظمة محدد.")}><BookOpen size={16} /> المنظمة</button><button onClick={() => notify("قسم التفضيلات محدد.")}><Settings2 size={16} /> التفضيلات</button><button onClick={() => notify("قسم الأمان محدد.")}><ShieldCheck size={16} /> الأمان</button><button onClick={() => goTo("usage")}><Gauge size={16} /> الخطة والاستخدام</button><button onClick={() => goTo("states")}><CircleHelp size={16} /> حالات النموذج</button></nav>
        <div className="ax-main-stack">
          <div className="ax-panel ax-settings-section"><div className="ax-panel-heading"><div><h3>الحساب</h3><small>معلومات الأستاذ</small></div><span className="ax-avatar ax-avatar-large">س</span></div><div className="ax-settings-fields"><label><span>الاسم</span><input defaultValue="د. سلمى أحمد" /></label><label><span>البريد الإلكتروني</span><input defaultValue="salma.ahmed@university.edu" dir="ltr" /></label><label><span>المنصب</span><input defaultValue="أستاذة مساعدة · كلية الطب" /></label></div></div>
          <div className="ax-panel ax-settings-section"><div className="ax-panel-heading"><div><h3>المنظمة</h3><small>المؤسسة الأكاديمية المرتبطة</small></div></div><div className="ax-settings-fields"><label><span>اسم المؤسسة</span><input defaultValue="الجامعة — كلية الطب" /></label></div></div>
          <div className="ax-panel ax-settings-section"><div className="ax-panel-heading"><div><h3>التفضيلات</h3><small>طريقة العرض والإشعارات</small></div></div><div className="ax-settings-fields"><label><span>اللغة</span><button className="ax-select" onClick={() => notify("لغة النموذج: العربية.")}>العربية <ChevronDown size={15} /></button></label><label><span>المظهر</span><button className="ax-select" onClick={() => notify("المظهر الفاتح هو المعروض.")}>فاتح <ChevronDown size={15} /></button></label></div><button className="ax-settings-toggle" onClick={(event) => event.currentTarget.classList.toggle("enabled")}><span><b>ملخصات النشاط</b><small>تنبيهات مرئية داخل مساحة الأستاذ</small></span><i /></button></div>
          <div className="ax-panel ax-settings-section"><div className="ax-panel-heading"><div><h3>الأمان والخطة</h3><small>عرض معلومات توضيحية</small></div></div><div className="ax-settings-info"><span><ShieldCheck size={17} /> جلسة آمنة · هذا نموذج بصري فقط</span><button onClick={() => notify("لا توجد جلسات فعلية في هذه المعاينة.")}>تسجيل الخروج من كل الأجهزة <ArrowLeft size={14} /></button></div><div className="ax-plan-row"><span><b>الخطة الشخصية</b><small>الاستخدام الشهري ٤٢ / ١٠٠</small></span><button onClick={() => goTo("usage")}>تفاصيل الاستخدام <ArrowLeft size={14} /></button></div></div>
          <div className="ax-panel ax-settings-section ax-demo-states-teaser"><div><b>هل تراجعين حالات فارغة أو أخطاء؟</b><small>أمثلة مرئية هادئة للتصميم فقط.</small></div><button className="ax-button ax-button-secondary" onClick={() => goTo("states")}>عرض حالات النموذج <ArrowLeft size={14} /></button></div>
        </div>
      </div>
    </>
  );

  const renderStates = () => (
    <>
      {pageHeading("حالات النموذج", "أمثلة مرئية لحالات الفراغ والخطأ — خارج المسار الافتراضي.", button("العودة إلى الإعدادات", () => goTo("settings"), "secondary", <ArrowLeft size={15} />))}
      <div className="ax-state-group"><div className="ax-section-title"><div><h2>حالات فارغة</h2><span>رسالة واضحة وخطوة واحدة مفيدة</span></div><span className="ax-static-label">معاينة تصميمية</span></div><div className="ax-state-cards">
        {[["لا توجد مساقات بعد", "أنشئي مساحة لمساقك لإضافة المحتوى العلمي.", "عرض مساحة تجريبية", <BookOpen size={19} />], ["لا توجد مواد مضافة", "أضيفي مصادرك الأكاديمية ليكون كل سؤال موثقاً.", "عرض المواد", <CloudUpload size={19} />], ["لا توجد امتحانات", "ابدئي بإعداد مسودة جديدة لمراجعتها بنفسك.", "إعداد امتحان", <FileCheck2 size={19} />], ["بصمة الأسلوب غير جاهزة", "تحتاج البصمة إلى عينات امتحانات سابقة.", "عرض البصمة الحالية", <Sparkles size={19} />], ["لا توجد أسئلة", "ستظهر الأسئلة بعد تجهيز مسودة الامتحان.", "إنشاء مسودة", <ListChecks size={19} />]].map(([title, desc, cta, icon]) => <div className="ax-empty-state-card" key={String(title)}><span className="ax-empty-illustration">{icon}</span><b>{title}</b><p>{desc}</p><button onClick={() => goTo(title === "لا توجد مواد مضافة" ? "materials" : title === "لا توجد أسئلة" ? "generate" : title === "بصمة الأسلوب غير جاهزة" ? "style" : "course")}>{cta} <ArrowLeft size={13} /></button></div>)}
      </div></div>
      <div className="ax-state-group"><div className="ax-section-title"><div><h2>أمثلة لحالات الخطأ</h2><span>معلومات عملية بلا تهويل</span></div><span className="ax-static-label">محاكاة</span></div><div className="ax-error-list">
        {[["تعذر رفع الملف", "تعذّر إكمال الرفع في هذه المحاكاة. تحققي من صيغة الملف وحجمه ثم حاولي مجدداً.", "إعادة المحاولة", "amber"], ["خدمة التوليد غير متاحة", "لم يتم إنشاء المسودة. لا تقلقي، لم يُخصم أي استخدام في هذا النموذج.", "العودة للإعداد", "slate"], ["الاستشهاد يحتاج مراجعة", "لم تتطابق إشارة المصدر بما يكفي. راجعي المادة والصفحة قبل اعتماد السؤال.", "فتح السؤال", "red"], ["تعذر تجهيز المسودة", "لم تكتمل الخطوة التوضيحية. يمكنك العودة إلى إعداد الامتحان.", "إعداد جديد", "amber"], ["التصدير بانتظار المراجعة", "تحتاج الأسئلة المعلقة إلى قرار الأستاذ قبل أن يصبح التصدير متاحاً.", "مراجعة الأسئلة", "slate"]].map(([title, desc, action, color]) => <div className={`ax-error-row error-${color}`} key={title}><span><CircleHelp size={17} /></span><div><b>{title}</b><p>{desc}</p></div><button onClick={() => goTo(action === "مراجعة الأسئلة" || action === "فتح السؤال" ? "review" : action === "إعداد جديد" ? "generate" : "materials")}>{action} <ArrowLeft size={13} /></button></div>)}
      </div></div>
    </>
  );

  const renderExams = () => (
    <>
      {pageHeading("الامتحانات", "مسودات الامتحانات السابقة وقرارات المراجعة.", button("إنشاء امتحان", () => goTo("generate"), "primary", <Plus size={16} />))}
      <div className="ax-exam-summary-row"><div><span>كل الامتحانات</span><b>٢٤</b></div><div><span>جاهزة للتصدير</span><b className="ax-green">١٨</b></div><div><span>قيد المراجعة</span><b>٣</b></div><div><span>مسودات أولية</span><b>٣</b></div></div>
      <div className="ax-exam-list">
        {[
          ["Midterm Exam", "Anatomy I", "Chapter 01–03", "جاهز للتصدير", "٨ / ٨ أسئلة معتمدة", "٢٢ أبريل ٢٠٢٥", "ready"],
          ["Cardiovascular Review", "Anatomy I", "Chapter 03", "قيد المراجعة", "٥ / ٨ أسئلة معتمدة", "اليوم · ١١:٤٢ ص", "review"],
          ["Pharmacology Quiz 02", "Pharmacology", "Autonomic drugs", "جاهز للتصدير", "١٠ / ١٠ أسئلة معتمدة", "١٩ أبريل ٢٠٢٥", "ready"],
          ["Medical Ethics — Final", "Medical Ethics", "جميع الفصول", "مسودة أولية", "بانتظار المراجعة", "١٦ أبريل ٢٠٢٥", "draft"],
        ].map(([title, course, scope, status, count, date, type]) => <button className="ax-exam-card" key={title} onClick={() => goTo(type === "review" ? "review" : "export")}><span className={`ax-exam-icon ${type}`}><FileCheck2 size={19} /></span><span className="ax-exam-copy"><b>{title}</b><small>{course} <i /> {scope}</small></span><span className={`ax-status-pill ${type === "ready" ? "status-ready" : type === "review" ? "status-pending" : "status-draft"}`}><span />{status}</span><span className="ax-exam-count">{count}</span><span className="ax-exam-date">{date}</span><ChevronLeft size={16} /></button>)}
      </div>
      <div className="ax-state-note"><ShieldCheck size={16} /><span>المسودات لا تتحول إلى امتحان جاهز إلا بعد مراجعة كل سؤال واعتماده يدوياً.</span></div>
    </>
  );

  const screenContent = () => {
    switch (screen) {
      case "dashboard": return renderDashboard();
      case "courses": return renderCourses();
      case "course": return renderCourse();
      case "materials": return renderMaterials();
      case "style": return renderStyle();
      case "generate": return renderGenerate();
      case "progress": return renderProgress();
      case "review": return renderReview();
      case "editor": return renderEditor();
      case "history": return renderHistory();
      case "export": return renderExport();
      case "bank": return renderBank();
      case "usage": return renderUsage();
      case "settings": return renderSettings();
      case "states": return renderStates();
      case "exams": return renderExams();
      default: return renderDashboard();
    }
  };

  return (
    <div className="ax-app" dir="rtl" lang="ar">
      <style>{`
        .ax-app{--navy:#1f3864;--blue:#2e75b6;--ink:#26364a;--muted:#748296;--line:#e5eaf0;--paper:#fff;--canvas:#f5f7f9;--soft:#f8fafb;--green:#33795e;--green-bg:#edf6f1;--amber:#a96e20;--amber-bg:#fbf4e9;--red:#a04e4d;--red-bg:#f9eeee;min-height:100dvh;background:var(--canvas);color:var(--ink);font-family:'Noto Sans Arabic','IBM Plex Sans',sans-serif;font-size:13px;line-height:1.55;display:flex;direction:rtl;overflow-x:hidden}
        .ax-app *{box-sizing:border-box}.ax-app button,.ax-app input,.ax-app textarea{font:inherit}.ax-app button{color:inherit;cursor:pointer}.ax-app button:focus-visible,.ax-app input:focus-visible,.ax-app textarea:focus-visible{outline:3px solid rgba(46,117,182,.22);outline-offset:2px}.ax-app button:disabled{opacity:.45;cursor:not-allowed}
        .ax-sidebar{width:248px;position:fixed;right:0;top:0;bottom:0;background:#fff;border-left:1px solid #e7ebf0;display:flex;flex-direction:column;z-index:20;padding:23px 16px 14px}.ax-brand{display:flex;align-items:center;gap:11px;padding:0 9px 23px}.ax-brand-mark{width:38px;height:38px;background:var(--navy);color:#fff;border-radius:11px;display:grid;place-items:center;position:relative;overflow:hidden;flex-shrink:0}.ax-mark-a{font-family:'IBM Plex Sans',sans-serif;font-size:24px;font-weight:500;line-height:1}.ax-brand-mark i{position:absolute;bottom:7px;left:8px;width:8px;height:2px;background:#6aa0cc;transform:rotate(-42deg);border-radius:3px}.ax-brand b{display:block;color:#1f3044;font-family:'IBM Plex Sans',sans-serif;font-size:19px;letter-spacing:-.5px;line-height:1.05}.ax-brand small{display:block;color:#8995a3;font-size:10px;margin-top:4px}.ax-course-switch{height:58px;display:flex;align-items:center;gap:9px;text-align:right;padding:8px 9px;border:1px solid var(--line);border-radius:9px;background:#fff;margin-bottom:23px}.ax-course-avatar{width:34px;height:34px;border-radius:9px;background:#edf2f7;color:var(--navy);display:grid;place-items:center;flex-shrink:0}.ax-course-switch-copy{flex:1;min-width:0}.ax-course-switch-copy b{display:block;font-size:12px}.ax-course-switch-copy small{display:block;font-size:10px;color:var(--muted);margin-top:2px}.ax-course-switch>svg{color:#9aa4af}.ax-nav-scroll{overflow:auto;flex:1}.ax-nav-group{margin-bottom:22px}.ax-nav-label{font-size:10px;color:#98a2ae;padding:0 11px;margin-bottom:8px;font-weight:600;letter-spacing:.2px}.ax-nav-item{border:0;background:none;width:100%;height:39px;padding:0 11px;border-radius:7px;display:flex;align-items:center;gap:11px;text-align:right;color:#637084;font-size:12px;margin:2px 0;transition:background .18s,color .18s}.ax-nav-item svg{color:#8996a5}.ax-nav-item:hover{background:#f6f8fa;color:var(--navy)}.ax-nav-item.active{background:#edf2f8;color:var(--navy);font-weight:600}.ax-nav-item.active svg{color:var(--blue)}.ax-nav-count{margin-right:auto;font-size:10px;color:#8290a0;background:#f0f3f6;padding:1px 6px;border-radius:5px}.ax-sidebar-foot{border-top:1px solid #edf0f3;padding-top:13px}.ax-usage-mini{padding:10px 10px 13px;border:1px solid #e8edf2;border-radius:8px;background:#fbfcfd;margin-bottom:12px}.ax-usage-mini-head{display:flex;justify-content:space-between;color:#68778a;font-size:10px}.ax-usage-mini-head b{font-family:'IBM Plex Sans',sans-serif;color:var(--navy);font-size:11px}.ax-meter{height:5px;background:#e9eef3;border-radius:8px;margin-top:9px;overflow:hidden}.ax-meter i{display:block;background:var(--blue);height:100%;border-radius:8px}.ax-usage-mini small{color:#97a1ad;font-size:9px;display:block;margin-top:7px}.ax-instructor{display:flex;align-items:center;gap:9px;width:100%;padding:3px 4px;border:0;background:none;text-align:right}.ax-instructor>span:nth-child(2){flex:1}.ax-instructor b{display:block;font-size:11px}.ax-instructor small{display:block;font-size:10px;color:#8e99a7}.ax-instructor>svg{color:#9ba5af}.ax-avatar{width:30px;height:30px;display:grid;place-items:center;border-radius:50%;background:#e8edf4;color:var(--navy);font-weight:700;font-size:13px}.ax-avatar-large{width:36px;height:36px;font-size:15px}
        .ax-main-shell{margin-right:248px;width:calc(100% - 248px);min-height:100dvh}.ax-topbar{height:62px;position:sticky;top:0;z-index:15;background:rgba(255,255,255,.94);border-bottom:1px solid #e7ebf0;display:flex;align-items:center;justify-content:space-between;padding:0 34px;backdrop-filter:blur(12px)}.ax-breadcrumb{display:flex;align-items:center;gap:9px;color:#31445b;font-size:11px;font-weight:600}.ax-crumb-muted{color:#a1aab5;font-family:'IBM Plex Sans',sans-serif;font-size:13px}.ax-crumb-chevron{color:#adb6c0}.ax-crumb-link{border:0;background:none;color:#738296;padding:0;font-size:11px}.ax-top-actions{display:flex;align-items:center;gap:17px}.ax-prototype-badge{display:flex;align-items:center;gap:6px;font-size:10px;color:#8994a1;border:1px solid #e8edf1;border-radius:20px;padding:5px 9px}.ax-prototype-badge>span{width:6px;height:6px;background:#78a28a;border-radius:50%}.ax-icon-button{width:32px;height:32px;border:0;background:transparent;display:grid;place-items:center;color:#778497;position:relative}.ax-icon-button i{width:5px;height:5px;position:absolute;top:6px;right:7px;border-radius:50%;background:#c7864b;border:1px solid #fff}.ax-profile-chip{display:flex;align-items:center;gap:8px;border:0;background:none;padding:0}.ax-profile-chip>svg{color:#98a2af}.ax-profile-name{font-size:11px}.ax-mobile-menu{display:none}.ax-main-content{max-width:1540px;margin:0 auto;padding:30px 34px 55px}.ax-page-heading{display:flex;align-items:center;justify-content:space-between;gap:20px;margin:0 0 24px}.ax-page-heading h1,.ax-review-heading h1{font-size:25px;letter-spacing:-.65px;color:#22354c;margin:0;font-weight:600}.ax-page-heading p{color:#8591a0;margin:5px 0 0;font-size:12px}.ax-heading-action{display:flex;align-items:center;gap:9px;flex-shrink:0}
        .ax-button{display:inline-flex;align-items:center;justify-content:center;gap:8px;border-radius:7px;padding:9px 14px;min-height:37px;font-size:11px;font-weight:600;border:1px solid transparent;white-space:nowrap;transition:transform .16s,background .16s,border-color .16s}.ax-button:hover{transform:translateY(-1px)}.ax-button-primary{background:var(--navy);color:#fff!important;border-color:var(--navy)}.ax-button-primary:hover{background:#294979}.ax-button-secondary{background:#fff;color:#45586f;border-color:#dfe5eb}.ax-button-secondary:hover{background:#f7f9fb;border-color:#c8d2dc}.ax-button-quiet{background:transparent;color:#748194;border-color:transparent}.ax-button-quiet:hover{background:#f5f7f9}.ax-button-danger{background:#fff;color:var(--red);border-color:#f0dddd}.ax-button-full{width:100%;min-height:39px}.ax-text-action{border:0;background:none;color:#526b86;font-size:10px;display:inline-flex;align-items:center;gap:7px;font-weight:600;padding:5px 0}.ax-text-action:hover{color:var(--blue)}
        .ax-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:23px}.ax-metric{background:#fff;border:1px solid #e8edf1;border-radius:9px;min-height:119px;padding:15px 17px;position:relative}.ax-metric-icon{width:31px;height:31px;border-radius:8px;display:grid;place-items:center;background:#f0f3f7;color:var(--navy);position:absolute;left:15px;top:15px}.ax-metric-icon.blue{color:#3b77a9;background:#eef5fa}.ax-metric-icon.green{color:#428367;background:#eff7f2}.ax-metric-icon.amber{color:#a47739;background:#fbf5eb}.ax-metric-label{font-size:11px;color:#7e8b9a;margin-top:1px}.ax-metric-value{font-family:'IBM Plex Sans',sans-serif;font-weight:600;font-size:27px;color:#263b55;line-height:1.3;margin-top:6px;letter-spacing:-.5px}.ax-metric:nth-child(4) .ax-metric-value{font-size:22px}.ax-metric-note{font-size:10px;color:#a0aab5;margin-top:4px}
        .ax-dashboard-grid{display:grid;grid-template-columns:minmax(0,1fr) 302px;gap:17px;align-items:start}.ax-main-stack,.ax-side-stack{display:flex;flex-direction:column;gap:14px;min-width:0}.ax-create-card{min-height:203px;border-radius:10px;background:#f0f4f8;border:1px solid #e5ebf1;position:relative;overflow:hidden;display:flex;align-items:center;padding:25px 27px;gap:25px}.ax-create-left{width:51%;position:relative;z-index:1}.ax-eyebrow{font-size:10px;color:#7a8b9d;display:flex;align-items:center;gap:7px;font-weight:600}.ax-eyebrow-line{width:16px;height:1px;background:#8da5bc}.ax-create-left h2{font-size:21px;color:#203c60;margin:9px 0 6px;font-weight:600;letter-spacing:-.3px}.ax-create-left p{color:#7d8b9b;font-size:11px;max-width:355px;margin:0 0 15px;line-height:1.85}.ax-create-left .ax-button{min-width:123px}.ax-flow{width:38%;position:relative;z-index:1;margin-right:auto;background:rgba(255,255,255,.65);padding:13px 17px;border:1px solid rgba(255,255,255,.7);border-radius:9px}.ax-flow-step{display:flex;align-items:center;gap:9px;min-height:37px}.ax-flow-step>span{width:24px;height:24px;display:grid;place-items:center;border:1px solid #cbd8e4;border-radius:50%;font-family:'IBM Plex Sans',sans-serif;font-size:11px;color:#587694;background:#fff}.ax-flow-step b{display:block;font-size:10px;color:#364e67}.ax-flow-step small{display:block;color:#96a2ae;font-size:9px}.ax-flow-line{height:10px;border-right:1px dashed #c4d2de;margin-right:11px}.ax-card-watermark{position:absolute;left:-22px;bottom:-97px;font-family:'IBM Plex Sans',sans-serif;font-size:240px;line-height:1;color:rgba(31,56,100,.035);font-weight:500}
        .ax-section-title{display:flex;align-items:center;justify-content:space-between;margin:2px 1px 0}.ax-section-title h2{font-size:15px;margin:0;color:#2c4057;font-weight:600}.ax-section-title>div>span{display:block;color:#9aa4af;font-size:10px;margin-top:3px}.ax-course-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.ax-course-card{background:#fff;border:1px solid #e8edf1;border-radius:9px;min-height:111px;position:relative;text-align:right;padding:13px 14px;transition:border-color .16s,transform .16s}.ax-course-card:hover{border-color:#c6d4e1;transform:translateY(-1px)}.ax-course-card-icon{width:32px;height:32px;border-radius:8px;display:grid;place-items:center;margin-bottom:9px}.course-navy{background:#edf1f6;color:#466384}.course-sage{background:#eff4f0;color:#69816e}.course-sand{background:#f7f3eb;color:#a17e4a}.course-ink{background:#eef1f4;color:#5c6b7b}.ax-course-card-title{display:block;font-family:'IBM Plex Sans','Noto Sans Arabic',sans-serif;font-weight:600;color:#30445d;font-size:13px;direction:ltr;text-align:right}.ax-course-card-meta{display:block;color:#97a1ad;font-size:9px;margin-top:3px}.ax-course-card-meta i,.ax-exam-copy i,.ax-bank-card-foot>i{width:3px;height:3px;border-radius:50%;background:#b9c1ca;display:inline-block;vertical-align:middle;margin:0 5px}.ax-course-card-bottom{display:flex;justify-content:space-between;color:#96a1ae;font-size:9px;margin-top:10px}.ax-course-card-bottom b{color:#617c98;font-family:'IBM Plex Sans',sans-serif;font-weight:500}.ax-course-progress{position:absolute;bottom:0;right:0;left:0;height:2px;background:#f1f3f5}.ax-course-progress i{display:block;height:100%;background:#86a3be}.ax-course-arrow{position:absolute;left:13px;top:19px;color:#b1bbc5}
        .ax-insight{border:1px solid #dce6ef;background:#f2f6f9;border-radius:9px;padding:15px 16px 13px}.ax-insight-top{display:flex;align-items:center;gap:8px}.ax-insight-icon{width:27px;height:27px;display:grid;place-items:center;background:#e2ebf3;color:#426c91;border-radius:7px}.ax-insight-label{font-size:10px;color:#637e98;font-weight:600}.ax-insight-dot{width:5px;height:5px;border-radius:50%;background:#8ba3b8;margin-right:auto}.ax-insight h3{font-size:13px;line-height:1.6;color:#334e68;margin:11px 0 5px;font-weight:600}.ax-insight p{font-size:10px;color:#7c8b9a;line-height:1.8;margin:0}.ax-insight-foot{display:flex;align-items:center;justify-content:space-between;border-top:1px solid #e0e8ef;margin-top:12px;padding-top:10px;font-size:9px;color:#8595a5}.ax-insight-foot button,.ax-insight-cta{display:flex;align-items:center;gap:5px;border:0;background:none;color:#476b8c;font-size:9px;font-weight:600;padding:0}.ax-panel{background:#fff;border:1px solid #e8edf1;border-radius:9px}.ax-panel-heading{display:flex;align-items:center;justify-content:space-between;gap:10px}.ax-panel-heading h3{font-size:12px;color:#35495f;margin:0;font-weight:600}.ax-panel-heading small{font-size:9px;color:#98a3af;display:block;margin-top:3px}.ax-kebab{width:25px;height:25px;border:0;background:transparent;display:grid;place-items:center;color:#9aa5b0;border-radius:5px}.ax-kebab:hover{background:#f3f6f8}.ax-activity-panel{padding:13px 14px 0}.ax-activity-list{margin-top:7px}.ax-activity-row{display:flex;align-items:center;gap:9px;min-height:48px;border-bottom:1px solid #f0f2f4}.ax-activity-icon{width:25px;height:25px;border-radius:7px;display:grid;place-items:center;flex-shrink:0}.ax-activity-icon.material{background:#f0f4f7;color:#69819a}.ax-activity-icon.style{background:#f3f0f7;color:#83729a}.ax-activity-icon.approved{background:#eef6f1;color:#528367}.ax-activity-icon.export{background:#f8f3eb;color:#997849}.ax-activity-row>span:nth-child(2){min-width:0;flex:1}.ax-activity-row b{display:block;font-size:9px;color:#506176;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ax-activity-row small{display:block;font-size:8px;color:#a0aab4;margin-top:2px}.ax-activity-time{font-size:8px;color:#a5afb8;white-space:nowrap}.ax-panel-footer-action{display:flex;justify-content:center;align-items:center;gap:7px;width:100%;height:37px;border:0;background:#fff;color:#6d8196;font-size:9px}.ax-panel-footer-action:hover{color:var(--blue)}.ax-review-reminder{display:flex;align-items:center;gap:10px;padding:12px 13px;border:1px solid #e8edf0;border-radius:8px;background:#fff}.ax-reminder-icon{width:29px;height:29px;border-radius:8px;background:#eff5f1;color:#55826a;display:grid;place-items:center}.ax-review-reminder b{display:block;color:#50675b;font-size:10px}.ax-review-reminder small{display:block;color:#9aa5a0;font-size:9px;margin-top:2px}
        .ax-toolbar{display:flex;gap:9px;align-items:center;margin-bottom:15px}.ax-search{height:36px;border:1px solid #e2e7ec;border-radius:7px;background:#fff;display:flex;align-items:center;gap:8px;padding:0 10px;color:#9ba6b2;min-width:260px}.ax-search input{border:0;outline:none;min-width:0;width:100%;font-size:11px;color:#3f5167;background:transparent}.ax-search input::placeholder{color:#a2acb7}.ax-results-count{margin-right:auto;color:#97a2ae;font-size:10px}.ax-course-list{display:flex;flex-direction:column;gap:8px}.ax-course-list-card{width:100%;min-height:72px;display:flex;align-items:center;gap:14px;padding:10px 14px;border:1px solid #e8edf1;border-radius:8px;background:#fff;text-align:right}.ax-course-list-card:hover{border-color:#cbd7e2}.ax-list-course-icon{width:38px;height:38px;border-radius:9px;display:grid;place-items:center;background:#eff3f7;color:#567795;flex-shrink:0}.list-1{background:#eff5f1;color:#6d8a73}.list-2{background:#f8f3eb;color:#a0814b}.list-3{background:#f1eff6;color:#7e7394}.ax-list-course-info{flex:1;min-width:120px}.ax-list-course-info b{display:block;color:#354b63;font-family:'IBM Plex Sans',sans-serif;text-align:right;font-size:13px}.ax-list-course-info small,.ax-list-stat small{display:block;font-size:9px;color:#99a4af;margin-top:3px}.ax-list-stat{width:78px;text-align:right}.ax-list-stat b{display:block;font-size:10px;color:#64768a;font-weight:500}.ax-status-pill{border-radius:20px;display:inline-flex;align-items:center;gap:6px;padding:4px 8px;font-size:9px;white-space:nowrap}.ax-status-pill>span{width:5px;height:5px;border-radius:50%;background:#548269}.status-ready{background:#eff6f1;color:#4d785e}.status-processing{background:#fbf5ea;color:#a47534}.status-processing>span{background:#c29551}.status-pending{background:#f7f3e9;color:#97763c}.status-pending>span{background:#b6965a}.status-draft{background:#f1f3f5;color:#768393}.status-draft>span{background:#9ba5af}.ax-course-updated{font-size:9px;line-height:1.7;color:#99a3ae;min-width:73px}.ax-row-chevron{color:#b0bac4}.ax-empty-inline{padding:25px;text-align:center;color:#8b96a2;background:#fff;border:1px dashed #dfe5ea;border-radius:8px}.ax-empty-state-mini{display:flex;align-items:center;gap:13px;background:#f0f4f7;border:1px solid #e8edf1;border-radius:9px;padding:13px 16px;margin-top:17px}.ax-empty-illustration{width:38px;height:38px;border:1px solid #e3e9ed;border-radius:10px;background:#f5f8fa;color:#66839c;display:grid;place-items:center;flex-shrink:0}.ax-empty-state-mini>div{flex:1}.ax-empty-state-mini b{font-size:11px;color:#52677e}.ax-empty-state-mini p{font-size:9px;color:#8b97a4;margin:3px 0 0}.ax-empty-state-mini .ax-button{min-height:32px;font-size:9px}
        .ax-course-hero{display:flex;align-items:center;gap:14px;padding:2px 0 21px}.ax-course-hero-icon{width:50px;height:50px;display:grid;place-items:center;border-radius:13px;background:#e9eff5;color:#456a8e}.ax-course-hero-copy{flex:1}.ax-course-hero-copy h1{font-family:'IBM Plex Sans','Noto Sans Arabic',sans-serif;font-size:25px;color:#243c59;line-height:1.2;margin:4px 0 6px}.ax-course-meta-line{display:flex;align-items:center;gap:9px;font-size:10px;color:#8390a0}.ax-course-meta-line>i{width:3px;height:3px;border-radius:50%;background:#b5bec7}.ax-ready-text{color:#4b8060;display:flex;align-items:center;gap:5px}.ax-tabs{display:flex;gap:23px;border-bottom:1px solid #e2e7ec;margin:0 0 19px;padding:0 4px}.ax-tabs button{border:0;background:none;color:#8390a0;font-size:11px;padding:0 0 11px;position:relative}.ax-tabs button.active{color:#345577;font-weight:600}.ax-tabs button.active:after{content:"";position:absolute;bottom:-1px;right:0;left:0;height:2px;background:#527a9e;border-radius:2px}.ax-tabs button>span{font-size:8px;background:#edf1f4;border-radius:8px;padding:1px 5px;margin-right:5px}.ax-course-workspace{display:grid;grid-template-columns:minmax(0,1fr) 278px;gap:16px}.ax-course-overview-grid{display:grid;grid-template-columns:1.45fr .9fr;gap:11px}.ax-chapter-panel,.ax-profile-summary{padding:14px}.ax-chapter-row{display:grid;grid-template-columns:11px 1fr 69px 75px 15px;align-items:center;gap:8px;width:100%;padding:11px 0 10px;border:0;border-bottom:1px solid #f0f2f4;background:#fff;text-align:right}.ax-chapter-row:last-child{border-bottom:0}.ax-chapter-dot{width:7px;height:7px;border-radius:50%;background:#7b9a87}.ax-chapter-row b{display:block;font-family:'IBM Plex Sans',sans-serif;font-size:10px;color:#51677f;direction:ltr;text-align:right}.ax-chapter-row small{display:block;font-size:9px;color:#97a3af;margin-top:3px}.ax-chapter-status{font-size:8px;color:#8c98a4;white-space:nowrap}.ax-chapter-bar{height:3px;border-radius:3px;background:#edf0f2}.ax-chapter-bar i{height:100%;background:#829e8a;border-radius:3px;display:block}.ax-chapter-row>svg{color:#b2bdc7}.ax-version-tag{font-family:'IBM Plex Sans',sans-serif;color:#527799;background:#eff4f8;border:1px solid #e3ebf1;border-radius:5px;font-size:10px;padding:4px 8px;direction:ltr}.ax-profile-quote{background:#f6f8fa;border-radius:7px;padding:11px 11px 10px;margin:15px 0 12px;position:relative}.ax-profile-quote>span{font-family:Georgia,serif;color:#aac0d2;font-size:26px;position:absolute;top:0;left:9px}.ax-profile-quote p{font-size:10px;line-height:1.85;color:#65778b;margin:0;max-width:230px}.ax-profile-summary-bottom{display:flex;align-items:center;justify-content:space-between}.ax-status-pill.status-ready{font-size:8px}.ax-material-strip{display:flex;flex-direction:column;gap:8px}.ax-material-mini{display:flex;align-items:center;gap:10px;background:#fff;border:1px solid #e8edf1;border-radius:8px;padding:9px 12px}.ax-material-mini>div{flex:1}.ax-material-mini b{display:block;font-size:10px;color:#53677d;font-weight:500}.ax-material-mini small{display:block;font-size:9px;color:#a0a9b3;margin-top:3px}.ax-file-mark{width:34px;height:38px;border-radius:6px 6px 8px 6px;background:#f1f4f7;display:grid;place-items:center;color:#657991;font-family:'IBM Plex Sans',sans-serif;font-size:9px;font-weight:700;position:relative;flex-shrink:0}.ax-file-mark:before{content:"";position:absolute;top:0;left:0;border-top:8px solid white;border-right:8px solid transparent}.ax-file-mark.pdf{background:#f8f0ef;color:#a1645e}.ax-file-mark.ppt{background:#f8f2ea;color:#a37b48}.ax-file-mark.doc{background:#edf2f8;color:#56769a}.ax-file-mark.txt{background:#eff4f0;color:#67816f}.ax-insight-compact{padding:14px}.ax-insight-compact h3{font-size:12px}.ax-insight-compact .ax-insight-cta{margin-top:12px;padding-top:10px;border-top:1px solid #e1e8ee;width:100%;justify-content:space-between}.ax-course-quick{padding:13px 14px}.ax-course-quick h3{font-size:11px;margin:0 0 8px;color:#4c6075}.ax-course-quick button{display:flex;align-items:center;gap:8px;width:100%;height:36px;background:#fff;border:0;border-top:1px solid #f0f2f4;color:#718296;text-align:right;font-size:10px}.ax-course-quick button svg:last-child{margin-right:auto;color:#a6b0ba}
        .ax-upload-zone{min-height:168px;background:#fff;border:1px dashed #cbd7e1;border-radius:10px;display:flex;align-items:center;gap:25px;padding:19px 27px;position:relative;overflow:hidden}.ax-upload-art{width:117px;height:116px;position:relative;display:grid;place-items:center;background:#f6f8fa;border:1px solid #edf1f4;border-radius:12px;flex-shrink:0}.ax-upload-ring{width:57px;height:57px;border-radius:50%;display:grid;place-items:center;border:1px solid #cad8e4;background:#fff;color:#50799c;z-index:2}.ax-upload-spark{width:6px;height:6px;border-radius:50%;background:#83a6bf;position:absolute}.ax-upload-spark.one{top:20px;right:24px}.ax-upload-spark.two{bottom:26px;left:22px;background:#b7c4a9}.ax-upload-doc{width:19px;height:25px;border-radius:3px;background:#e7edf3;position:absolute}.ax-upload-doc.doc-one{top:25px;left:23px;transform:rotate(-12deg)}.ax-upload-doc.doc-two{bottom:22px;right:20px;background:#eeeae2;transform:rotate(12deg)}.ax-upload-copy{flex:1}.ax-upload-copy h2{font-size:15px;color:#3e566d;margin:0 0 5px}.ax-upload-copy p{font-size:10px;color:#8c99a7;margin:0}.ax-upload-copy p button{padding:0;border:0;background:none;color:#46739a;font-weight:600}.ax-file-formats{display:flex;align-items:center;gap:6px;margin-top:16px}.ax-file-formats>span{border:1px solid #e5eaf0;border-radius:4px;padding:3px 6px;font-family:'IBM Plex Sans',sans-serif;color:#748497;font-size:8px;font-weight:600}.ax-file-formats small{color:#a2acb6;font-size:9px;margin-right:6px}.ax-upload-corner{position:absolute;left:17px;top:14px;color:#abb8c4}.ax-processing-banner{display:flex;align-items:center;gap:12px;padding:11px 14px;margin:12px 0 21px;background:#f8f6f1;border:1px solid #eee8da;border-radius:8px}.ax-processing-orb{width:31px;height:31px;border-radius:8px;background:#f3ead9;color:#a47e43;display:grid;place-items:center}.ax-processing-banner>div:nth-child(2){min-width:210px;flex:1}.ax-processing-banner b{display:block;color:#736344;font-size:10px}.ax-processing-banner p{color:#a1947b;font-size:9px;margin:3px 0 0}.ax-processing-progress{width:135px}.ax-processing-progress>span{font-size:8px;color:#a1937b}.ax-processing-progress>b{float:left;font-size:9px;color:#9b7947}.ax-processing-progress .ax-meter{margin-top:5px;height:4px;background:#eee8dd}.ax-processing-progress .ax-meter i{background:#be9a5c}.ax-processing-banner>button{border:0;background:none;color:#93794e;font-size:9px;display:flex;align-items:center;gap:5px;white-space:nowrap}.ax-material-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}.ax-material-head h2{font-size:14px;color:#34495f;margin:0}.ax-material-head>div:first-child>span{color:#9ba5af;font-size:9px;display:block;margin-top:3px}.ax-material-filters{display:flex;gap:7px}.ax-material-filters button{border:1px solid #e3e8ed;background:#fff;border-radius:6px;padding:7px 9px;color:#728194;display:flex;align-items:center;gap:6px;font-size:9px}.ax-material-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.ax-material-card{display:grid;grid-template-columns:35px 1fr 22px;align-items:center;column-gap:10px;padding:12px 13px;border:1px solid #e8edf1;border-radius:8px;background:#fff;position:relative;min-height:72px}.ax-material-card-copy{min-width:0}.ax-material-card-copy b{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:#53677e;font-size:10px;font-weight:500}.ax-material-card-copy small{display:block;font-size:8px;color:#9da7b1;margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ax-material-card .ax-status-pill{grid-column:2;justify-self:start;margin-top:5px;padding:2px 7px}.ax-material-card .ax-kebab{grid-column:3;grid-row:1}.ax-material-card-progress{grid-column:1/4;height:2px;background:#f2ecdf;margin-top:8px;border-radius:2px}.ax-material-card-progress i{display:block;width:58%;height:100%;background:#c49c58;border-radius:2px}.ax-state-note{display:flex;align-items:center;gap:8px;margin-top:13px;padding:10px 12px;border-radius:7px;background:#f1f5f7;color:#8191a0;font-size:9px}.ax-state-note svg{color:#758e9f;flex-shrink:0}
        .ax-style-banner{display:flex;align-items:center;gap:14px;padding:19px 21px;border:1px solid #e4eaf0;background:#fff;border-radius:9px;margin-bottom:14px}.ax-style-banner-icon{width:42px;height:42px;border-radius:11px;background:#eef3f7;color:#4f7597;display:grid;place-items:center}.ax-style-banner-copy{flex:1}.ax-style-banner-copy h2{font-size:17px;color:#2c4561;margin:5px 0 3px}.ax-style-banner-copy p{font-size:10px;color:#8b98a5;margin:0}.ax-profile-status{min-width:130px;padding-right:19px;border-right:1px solid #ebeff2;display:flex;align-items:center;gap:8px;flex-wrap:wrap}.ax-profile-status>b{font-family:'IBM Plex Sans',sans-serif;color:#56799a;font-size:11px}.ax-profile-status>small{width:100%;color:#a1aab4;font-size:8px}.ax-style-stats{display:grid;grid-template-columns:repeat(4,1fr);background:#fff;border:1px solid #e8edf1;border-radius:8px;margin-bottom:22px}.ax-style-stat{padding:13px 18px;border-left:1px solid #edf0f3}.ax-style-stat:last-child{border-left:0}.ax-style-stat small{font-size:9px;color:#99a4af;display:block}.ax-style-stat b{display:block;color:#455e77;font-size:15px;margin-top:5px}.ax-style-stat span{display:block;color:#a2abb5;font-size:8px;margin-top:2px}.ax-green{color:#468064!important}.ax-static-label{border:1px solid #e8edf0;border-radius:5px;padding:3px 7px;color:#9aa5af;font-size:8px}.ax-style-content-grid{display:grid;grid-template-columns:minmax(0,1fr) 270px;gap:13px}.ax-style-cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.ax-style-card{background:#fff;border:1px solid #e8edf1;border-radius:8px;padding:14px 15px;min-height:175px;position:relative}.ax-style-card-icon{width:28px;height:28px;border-radius:7px;background:#f0f4f7;color:#6b849d;display:grid;place-items:center;margin-bottom:10px}.ax-style-card>small{font-size:9px;color:#97a2ad}.ax-style-card h3{font-size:15px;color:#405971;margin:4px 0 1px}.ax-style-card>p{font-size:9px;color:#9ba6b0;margin:0}.ax-writing-sample{display:flex;gap:5px;margin-top:13px}.ax-writing-sample span{font-size:8px;color:#6b8197;background:#f1f5f8;border-radius:4px;padding:4px 7px}.ax-complexity-track{display:flex;gap:5px;margin-top:17px}.ax-complexity-track i{height:5px;border-radius:4px;flex:1;background:#ebeff2}.ax-complexity-track i.selected{background:#6888a4}.ax-scale-labels{display:flex;justify-content:space-between;color:#a2abb5;font-size:8px;margin-top:7px}.ax-question-mix{display:flex;flex-direction:column;gap:5px;margin-top:9px}.ax-question-mix>div{display:grid;grid-template-columns:1fr 32px;gap:4px;align-items:center;color:#82909f;font-size:8px}.ax-question-mix b{text-align:left;color:#688097;font-family:'IBM Plex Sans',sans-serif;font-weight:500}.ax-question-mix i{height:3px;border-radius:3px;background:#edf0f3;grid-column:1/3;overflow:hidden}.ax-question-mix em{display:block;background:#7390aa;height:100%;border-radius:3px}.ax-length-number{font-size:27px;font-family:'IBM Plex Sans','Noto Sans Arabic',sans-serif;color:#3e5975;font-weight:600;line-height:1.1;margin-top:8px}.ax-length-number span{font-family:'Noto Sans Arabic',sans-serif;font-size:10px;font-weight:400;color:#9aa5ae}.ax-length-visual{display:flex;align-items:end;gap:5px;height:28px;margin-top:9px}.ax-length-visual span{flex:1;height:var(--h,50%);background:#dce6ed;border-radius:3px 3px 1px 1px}.ax-length-visual span:nth-child(3n){height:80%}.ax-length-visual span:nth-child(2n){height:39%}.ax-length-visual span:nth-child(5n){height:63%;background:#91aabd}.ax-length-caption{display:flex;justify-content:space-between;font-size:8px;color:#a3adb6;margin-top:5px}.ax-length-caption b{font-weight:500;color:#75899c}.ax-style-structure{padding:14px 15px}.ax-structure-row{display:grid;grid-template-columns:1fr 100px 44px;gap:9px;align-items:center;border-top:1px solid #f0f2f4;padding:11px 0;font-size:9px;color:#7e8d9c}.ax-structure-row:first-of-type{margin-top:10px}.ax-structure-row>b{font-size:8px;color:#778c9f;font-weight:500}.ax-structure-scale{display:flex;gap:4px}.ax-structure-scale i{height:4px;border-radius:4px;flex:1;background:#edf0f2}.ax-structure-scale i.on{background:#7897ae}.ax-version-panel{padding:14px 14px 0;align-self:start}.ax-version-panel .ax-panel-heading>svg{color:#8ea0af}.ax-version-timeline{margin:15px 0 5px}.ax-version-row{display:flex;gap:10px;position:relative;padding-bottom:17px}.ax-version-row:not(:last-child):after{content:"";position:absolute;right:4px;top:13px;bottom:0;width:1px;background:#e5eaee}.ax-version-dot{width:9px;height:9px;border-radius:50%;border:2px solid #c5ced7;background:#fff;position:relative;z-index:1;margin-top:4px;flex-shrink:0}.ax-version-row.current .ax-version-dot{background:#6989a5;border-color:#6989a5;box-shadow:0 0 0 3px #edf2f6}.ax-version-row>div{flex:1}.ax-version-row b{font-family:'IBM Plex Sans',sans-serif;color:#627b94;font-size:10px;display:block;line-height:1.3}.ax-version-row small{display:block;color:#64758a;font-size:9px;margin-top:3px}.ax-version-row time{display:block;font-size:8px;color:#a3adb6;margin-top:2px}.ax-current-tag{font-size:8px;color:#4b7a5f;background:#eef6f1;border-radius:4px;padding:3px 6px;white-space:nowrap}.ax-version-disclaimer{display:flex;gap:7px;align-items:flex-start;border-top:1px solid #eef1f4;padding:12px 0;color:#91a0ab;font-size:8px;line-height:1.8}.ax-version-disclaimer svg{color:#75917f;flex-shrink:0}
        .ax-draft-tag{font-size:10px;color:#9a845c;display:flex;align-items:center;gap:7px}.ax-draft-tag span{width:6px;height:6px;border-radius:50%;background:#c5a36c}.ax-generation-layout{display:grid;grid-template-columns:minmax(0,1fr) 286px;gap:14px;align-items:start}.ax-config-panel{padding:17px;margin-bottom:12px}.ax-step-index{color:#9ba6b2;background:#f4f6f8;border-radius:5px;padding:3px 7px;font-size:9px;direction:ltr}.ax-field-grid{display:grid;grid-template-columns:1fr 1.2fr;gap:12px;margin:16px 0 18px}.ax-field>span,.ax-field-label{display:block;font-size:10px;color:#718195;font-weight:600;margin-bottom:6px}.ax-select{height:38px;width:100%;display:flex;align-items:center;justify-content:space-between;border:1px solid #e4e9ee;background:#fff;border-radius:6px;padding:0 10px;color:#4f6278;font-size:10px;text-align:right}.ax-select>span{display:flex;align-items:center;gap:7px}.ax-select>span svg{color:#7f97ac}.ax-select>svg{color:#9faab5}.ax-question-counts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}.ax-count-card{display:flex;align-items:center;gap:8px;padding:10px 9px;border:1px solid #e8edf1;border-radius:7px}.ax-check-square{width:16px;height:16px;border:1px solid #cbd4dc;border-radius:4px;display:grid;place-items:center;flex-shrink:0;color:#fff}.ax-check-square.checked{background:#5b7d9c;border-color:#5b7d9c}.ax-count-card>div:nth-child(2){min-width:0;flex:1}.ax-count-card b{display:block;font-size:9px;color:#53677e;white-space:nowrap}.ax-count-card small{display:block;font-size:8px;color:#a0aab4;margin-top:2px}.ax-stepper{display:flex;align-items:center;gap:5px}.ax-stepper button{width:20px;height:21px;border:1px solid #e4e9ed;border-radius:4px;background:#fff;color:#8391a0;display:grid;place-items:center;padding:0;font-family:'IBM Plex Sans',sans-serif}.ax-stepper b{font-family:'IBM Plex Sans',sans-serif;font-size:10px}.ax-count-total{display:flex;justify-content:space-between;border-top:1px solid #edf0f2;margin-top:13px;padding-top:11px;font-size:9px;color:#909ca8}.ax-count-total b{color:#536b83}.ax-difficulty-options{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:15px}.ax-difficulty-option{display:flex;align-items:flex-start;gap:8px;text-align:right;padding:11px 9px;border:1px solid #e5eaf0;border-radius:7px;background:#fff}.ax-difficulty-option.selected{border-color:#91a9bf;background:#f7f9fb}.ax-radio{width:14px;height:14px;border:1px solid #bdc8d2;border-radius:50%;display:grid;place-items:center;flex-shrink:0;margin-top:2px}.ax-radio i{width:6px;height:6px;border-radius:50%;background:#567d9d}.ax-difficulty-option>span:nth-child(2){flex:1}.ax-difficulty-option b{display:block;color:#53667b;font-size:10px}.ax-difficulty-option small{display:block;color:#9da7b2;font-size:8px;margin-top:4px;line-height:1.5}.ax-difficulty-bars{display:flex;gap:2px;margin-top:4px}.ax-difficulty-bars i{width:5px;height:3px;background:#e8edf1;border-radius:2px}.ax-difficulty-bars.bars-1 i:first-child,.ax-difficulty-bars.bars-2 i:nth-child(-n+2),.ax-difficulty-bars.bars-3 i{background:#7e9ab3}.ax-toggle-list{margin-top:12px}.ax-toggle-row{display:flex;align-items:center;justify-content:space-between;gap:20px;width:100%;min-height:51px;border:0;border-top:1px solid #eef1f3;background:#fff;padding:8px 0;text-align:right}.ax-toggle-copy b{display:block;font-size:10px;color:#566b80;font-weight:500}.ax-toggle-copy small{display:block;font-size:8px;color:#9ba6b0;margin-top:3px}.ax-switch{width:31px;height:18px;border-radius:12px;background:#dfe5ea;padding:2px;flex-shrink:0;transition:background .15s}.ax-switch i{width:14px;height:14px;border-radius:50%;background:#fff;display:block;box-shadow:0 1px 2px #aab4bd;transition:transform .15s}.ax-switch.on{background:#718da7}.ax-switch.on i{transform:translateX(-13px)}.ax-summary-panel{padding:15px}.ax-summary-panel .ax-panel-heading>svg{color:#8ca0b2}.ax-summary-course{display:flex;align-items:center;gap:9px;padding:13px 0;border-bottom:1px solid #eef1f3;margin-top:7px}.ax-summary-course b{display:block;font-family:'IBM Plex Sans',sans-serif;color:#445a71;font-size:11px}.ax-summary-course small{display:block;color:#9aa5af;font-size:9px;margin-top:3px}.ax-summary-row{display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid #f1f3f5;color:#8b97a4;font-size:9px}.ax-summary-row b{font-weight:500;color:#5d7187}.ax-summary-note{display:flex;gap:7px;align-items:flex-start;color:#8191a0;font-size:8px;line-height:1.8;background:#f4f7f8;border-radius:6px;padding:9px;margin:12px 0}.ax-summary-note svg{color:#6d8c7a;flex-shrink:0}.ax-prototype-caption{text-align:center;font-size:8px;color:#a4adb6;margin-top:8px}.ax-quick-context{padding:14px}.ax-quick-context .ax-panel-heading{margin-bottom:11px}.ax-quick-context>div:not(.ax-panel-heading){display:flex;align-items:center;gap:8px;padding:7px 0;border-top:1px solid #f1f3f5}.ax-quick-context>div>span:last-child b{display:block;color:#61748a;font-size:9px;font-weight:500}.ax-quick-context>div>span:last-child small{display:block;color:#a3adb7;font-size:8px;margin-top:2px}.ax-quick-context .ax-file-mark{width:27px;height:30px;font-size:7px}.ax-quick-context>button{display:flex;align-items:center;gap:5px;margin-top:8px;padding:0;border:0;background:none;color:#6d8398;font-size:9px}
        .ax-progress-page{max-width:720px;margin:4vh auto 0;text-align:center;padding:20px 25px 40px}.ax-progress-overline{display:flex;align-items:center;justify-content:center;gap:8px;color:#8595a5;font-size:10px}.ax-brand-mark-small{width:24px;height:24px;border-radius:7px}.ax-brand-mark-small .ax-mark-a{font-size:15px}.ax-progress-page h1{font-size:27px;color:#2b435c;margin:16px 0 5px}.ax-progress-intro{font-size:11px;color:#98a3ad;margin:0}.ax-progress-summary{display:inline-flex;align-items:center;gap:13px;border:1px solid #e7ebef;background:#fff;border-radius:20px;padding:8px 15px;margin:22px auto 6px;color:#728296;font-size:10px}.ax-progress-summary span{display:flex;align-items:center;gap:6px}.ax-progress-summary span svg{color:#6686a4}.ax-progress-summary i{height:11px;width:1px;background:#e0e5e9}.ax-progress-summary b{color:#526d88}.ax-progress-visual{width:162px;height:162px;margin:19px auto 18px;position:relative;display:grid;place-items:center}.ax-progress-orbit{position:absolute;border:1px solid #dfe7ed;border-radius:50%}.orbit-one{inset:5px}.orbit-two{inset:25px;border-style:dashed}.ax-progress-center{width:65px;height:65px;border-radius:50%;background:#fff;box-shadow:0 0 0 7px #f1f5f7,0 3px 18px rgba(51,77,103,.08);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;position:relative;z-index:2}.ax-progress-center .ax-brand-mark{width:28px;height:28px;border-radius:8px}.ax-progress-center .ax-mark-a{font-size:18px}.ax-progress-center b{font-family:'IBM Plex Sans',sans-serif;font-size:8px;color:#8ca0b2}.ax-orbit-node{position:absolute;width:29px;height:29px;border:1px solid #e3eaf0;border-radius:8px;background:#fff;color:#6f8ba4;display:grid;place-items:center;z-index:3}.node-one{top:7px;right:39px}.node-two{bottom:26px;right:9px;color:#9781a4}.node-three{bottom:27px;left:11px;color:#77917e}.ax-progress-timeline{display:grid;grid-template-columns:repeat(6,1fr);max-width:690px;margin:0 auto;position:relative}.ax-progress-timeline:before{content:"";position:absolute;top:10px;right:8%;left:8%;height:1px;background:#e2e8ed}.ax-progress-step{position:relative;display:flex;flex-direction:column;align-items:center;gap:8px;color:#aab3bc}.ax-progress-step>span{width:20px;height:20px;border-radius:50%;background:#f1f4f6;border:1px solid #e4e9ed;display:grid;place-items:center;z-index:1;font-family:'IBM Plex Sans',sans-serif;font-size:8px}.ax-progress-step.done>span{background:#edf5ef;border-color:#dcebe1;color:#588469}.ax-progress-step.working>span{background:#edf3f7;border-color:#d9e4ed}.ax-progress-step.working>span i{width:6px;height:6px;border-radius:50%;background:#5d829f}.ax-progress-step small{font-size:8px;line-height:1.55;max-width:90px}.ax-progress-step.done small,.ax-progress-step.working small{color:#73869a}.ax-progress-trust{display:flex;align-items:center;justify-content:center;gap:7px;color:#8e9b9d;font-size:9px;margin:25px 0 13px}.ax-progress-trust svg{color:#70917c}.ax-progress-page>.ax-button{font-size:10px}
        .ax-review-heading{display:flex;align-items:end;justify-content:space-between;margin-bottom:19px}.ax-review-heading .ax-eyebrow{margin-bottom:6px}.ax-review-heading p{display:flex;align-items:center;gap:7px;color:#8c99a7;font-size:10px;margin:5px 0 0}.ax-review-heading p>i{width:3px;height:3px;border-radius:50%;background:#b5bec7}.ax-review-heading-actions{display:flex;align-items:center;gap:11px}.ax-review-progress{color:#8895a4;font-size:10px}.ax-review-progress b{font-family:'IBM Plex Sans',sans-serif;font-size:14px;color:#476b8b}.ax-review-workspace{display:grid;grid-template-columns:223px minmax(0,1fr) 216px;gap:11px;align-items:start}.ax-review-list{overflow:hidden}.ax-review-list-header{display:flex;align-items:center;justify-content:space-between;padding:12px 12px 11px;border-bottom:1px solid #edf0f3}.ax-review-list-header b{display:block;color:#4d6075;font-size:11px}.ax-review-list-header small{display:block;color:#9ba6b0;font-size:8px;margin-top:3px}.ax-question-nav-item{display:flex;align-items:flex-start;gap:8px;width:100%;padding:10px 9px;border:0;border-bottom:1px solid #f0f2f4;background:#fff;text-align:right;position:relative;transition:background .15s}.ax-question-nav-item:hover{background:#fafbfd}.ax-question-nav-item.selected{background:#f1f5f8}.ax-question-nav-item.selected:before{content:"";position:absolute;right:0;top:0;bottom:0;width:2px;background:#6685a1}.ax-q-number{width:25px;height:25px;border-radius:6px;background:#f1f4f6;display:grid;place-items:center;color:#75869a;font-family:'IBM Plex Sans',sans-serif;font-size:9px;flex-shrink:0}.ax-q-number.approved{background:#edf5ef;color:#548066}.ax-q-number.rejected{background:#f8eeee;color:#a4605f}.ax-q-nav-copy{min-width:0;flex:1}.ax-q-nav-copy>b,.ax-q-nav-copy>b{display:block}.ax-q-nav-copy b{font-size:9px;color:#4b6077;font-weight:600}.ax-q-nav-copy small{font-size:8px;color:#939eaa;display:block;margin-top:3px;white-space:nowrap}.ax-q-confidence{display:block;font-size:8px;color:#a0aab4;margin-top:5px}.ax-q-confidence b{font-family:'IBM Plex Sans',sans-serif;color:#64816f;font-weight:500}.ax-q-status{font-size:7px;color:#a07f49;background:#f8f4e9;padding:3px 5px;border-radius:4px;white-space:nowrap;margin-top:1px}.ax-q-status.is-approved{color:#4d7a5d;background:#eef6f0}.ax-q-status.is-rejected{color:#a05f5e;background:#f8eeee}.ax-review-list-footer{height:37px;width:100%;border:0;background:#fff;color:#70839a;display:flex;align-items:center;justify-content:center;gap:6px;font-size:9px}.ax-question-content{padding:16px 18px}.ax-question-content-top{display:flex;align-items:center;justify-content:space-between}.ax-question-content-top>div{display:flex;gap:6px}.ax-question-type-tag,.ax-difficulty-tag{padding:4px 7px;border-radius:5px;background:#eff4f7;color:#607e98;font-size:8px}.ax-difficulty-tag{background:#f6f3eb;color:#9b8358}.ax-question-number-label{font-family:'IBM Plex Sans','Noto Sans Arabic',sans-serif;font-size:9px;color:#9ba6b1;margin-top:14px}.ax-question-number-label span{color:#b2bbc4}.ax-question-prompt{font-size:17px;line-height:1.8;color:#344a61;font-weight:500;margin:6px 0 17px}.ax-answers-label{display:flex;align-items:center;gap:8px;margin-bottom:7px}.ax-answers-label span{font-size:10px;font-weight:600;color:#62758a}.ax-answers-label small{font-size:8px;color:#a2abb4}.ax-answers{display:flex;flex-direction:column;gap:6px}.ax-answer-option{width:100%;min-height:39px;display:flex;align-items:center;gap:9px;padding:7px 9px;border:1px solid #e9edf0;background:#fff;border-radius:6px;text-align:right;color:#66778b;font-size:10px}.ax-answer-option:hover{border-color:#ced9e2}.ax-answer-option.correct{background:#f6f9f7;border-color:#dce8df;color:#536d5d}.ax-answer-key{width:22px;height:22px;display:grid;place-items:center;border:1px solid #e2e7eb;background:#f7f9fa;border-radius:5px;color:#7d8da0;font-family:'IBM Plex Sans',sans-serif;font-size:9px;font-weight:600;flex-shrink:0}.ax-answer-option.correct .ax-answer-key,.ax-answer-key.key-correct{border-color:#cfdfd3;background:#edf5ef;color:#548067}.ax-correct-tag{margin-right:auto;display:flex;align-items:center;gap:4px;font-size:8px;color:#63816c;white-space:nowrap}.ax-citation-card{display:flex;align-items:center;gap:10px;border:1px solid #e7ebef;background:#f9fbfc;border-radius:7px;padding:10px;margin-top:13px}.ax-citation-icon{width:30px;height:30px;border-radius:7px;display:grid;place-items:center;background:#edf2f6;color:#65829c;flex-shrink:0}.ax-citation-copy{flex:1;min-width:0}.ax-citation-copy small{display:block;color:#9ba6b0;font-size:8px}.ax-citation-copy b{display:block;font-family:'IBM Plex Sans',sans-serif;text-align:right;direction:ltr;color:#536c84;font-size:10px;margin-top:2px}.ax-citation-copy>span{display:block;color:#9aa5af;font-size:8px;margin-top:2px}.ax-citation-copy>span i{width:3px;height:3px;display:inline-block;border-radius:50%;background:#b5bec7;margin:0 5px}.ax-citation-open{border:0;background:none;color:#69829a;font-size:8px;display:flex;align-items:center;gap:4px;white-space:nowrap}.ax-citation-confidence{border-right:1px solid #e4e9ec;padding-right:11px;min-width:80px;display:flex;flex-direction:column;align-items:flex-start}.ax-citation-confidence>span{font-size:8px;color:#98a3ad}.ax-citation-confidence>b{font-family:'IBM Plex Sans',sans-serif;font-size:15px;color:#4d7c61;line-height:1.3}.ax-citation-confidence>small{display:flex;align-items:center;gap:4px;font-size:7px;color:#6e8976}.ax-citation-confidence>small span{width:4px;height:4px;border-radius:50%;background:#6a9476}.ax-question-note{display:flex;align-items:center;gap:7px;color:#87949f;font-size:8px;margin-top:12px}.ax-question-note svg{color:#779381;flex-shrink:0}.ax-question-pagination{display:flex;align-items:center;justify-content:space-between;border-top:1px solid #edf0f2;margin-top:13px;padding-top:10px}.ax-question-pagination button{display:flex;align-items:center;gap:4px;border:0;background:none;color:#708297;font-size:9px}.ax-question-pagination span{font-size:8px;color:#9aa5af}.ax-question-pagination span b{font-family:'IBM Plex Sans',sans-serif;color:#607790}.ax-review-tools{padding:13px}.ax-review-tools-head{display:flex;align-items:center;gap:8px;border-bottom:1px solid #edf0f2;padding-bottom:12px}.ax-review-tools-icon{width:30px;height:30px;border-radius:8px;background:#eff5f1;color:#638673;display:grid;place-items:center}.ax-review-tools-head b{display:block;color:#52677e;font-size:10px}.ax-review-tools-head small{display:block;color:#9da7b1;font-size:8px;margin-top:2px}.ax-review-meta{padding:6px 0 8px;border-bottom:1px solid #edf0f2}.ax-review-meta>div{display:flex;justify-content:space-between;align-items:center;padding:6px 0;font-size:8px}.ax-review-meta>div span{color:#99a3ad}.ax-review-meta>div b{color:#607287;font-weight:500;text-align:left;max-width:115px}.ax-review-actions{display:flex;flex-direction:column;gap:4px;padding-top:11px}.ax-review-actions .ax-button{justify-content:flex-start;min-height:34px;padding-right:10px;font-size:9px}.ax-button-approve{background:#47795e;color:#fff!important;border-color:#47795e}.ax-button-approve:hover{background:#3d6a53}.ax-button-approve.is-done{background:#edf5ef;color:#4f7a5e!important;border-color:#dbe9df}.ax-mock-only{margin-right:auto;color:#a0aab4;font-size:7px}.ax-human-approval{display:flex;align-items:center;gap:8px;background:#f7f9fa;border-radius:6px;padding:8px;margin-top:10px}.ax-human-icon{width:25px;height:25px;display:grid;place-items:center;border-radius:7px;background:#fff;color:#71899e}.ax-human-approval b{display:block;color:#718396;font-size:8px}.ax-human-approval small{display:block;color:#a0aab3;font-size:7px;margin-top:2px}
        .ax-editor-layout{display:grid;grid-template-columns:minmax(0,1fr) 280px;gap:14px;align-items:start}.ax-editor-panel{padding:16px}.ax-editor-panel-title{display:flex;align-items:center;justify-content:space-between;margin-bottom:9px}.ax-editor-panel-title h3{font-size:11px;color:#4d6279;margin:0}.ax-editor-panel-title small{display:block;font-size:8px;color:#9aa5af;margin-top:3px}.ax-editing-tag{background:#f5f2ea;color:#a08554;font-size:8px;border-radius:5px;padding:4px 7px}.ax-question-textarea{width:100%;min-height:84px;resize:vertical;border:1px solid #e2e8ed;border-radius:6px;padding:10px;color:#4c6077;font-size:12px;line-height:1.8;margin-bottom:17px;background:#fff}.ax-edit-answer{display:flex;align-items:center;gap:8px;margin:6px 0}.ax-edit-answer input{height:36px;border:1px solid #e6eaee;background:#fff;border-radius:6px;flex:1;padding:0 9px;min-width:0;color:#61748a;font-size:10px}.ax-correct-selector{width:24px;height:24px;border:0;background:none;color:#6c9275;display:grid;place-items:center}.ax-correct-selector>span{width:14px;height:14px;border:1px solid #cbd4dc;border-radius:50%}.ax-editor-extra{display:flex;gap:10px;margin-top:17px}.ax-editor-extra label{flex:1}.ax-editor-extra label>span,.ax-explanation>span{display:block;color:#758599;font-size:9px;margin-bottom:5px}.ax-editor-extra label button{height:34px;display:flex;justify-content:space-between;align-items:center;width:100%;padding:0 9px;border:1px solid #e4e9ed;background:#fff;border-radius:6px;color:#61758a;font-size:9px}.ax-explanation{display:block;margin-top:14px}.ax-explanation textarea{width:100%;min-height:62px;border:1px solid #e4e9ed;border-radius:6px;padding:9px;color:#77889a;font-size:9px;resize:vertical}.ax-editor-buttons{display:flex;gap:8px}.ax-editor-review-note{display:flex;align-items:center;gap:7px;font-size:9px;color:#87949f}.ax-editor-review-note svg{color:#79927f}.ax-editor-history{padding:14px}.ax-source-mini{border-top:1px solid #edf0f2;padding:12px 0 8px}.ax-source-mini>small{display:block;color:#9aa4af;font-size:8px}.ax-source-mini>b{display:flex;align-items:center;gap:6px;color:#5f748a;font-family:'IBM Plex Sans',sans-serif;font-size:10px;margin-top:6px}.ax-source-mini>b svg{color:#7992a8}.ax-source-mini>span{display:block;font-size:8px;color:#9da7b1;margin-top:4px}.ax-editor-history .ax-panel-footer-action{border-top:1px solid #edf0f2}
        .ax-history-layout{display:grid;grid-template-columns:minmax(0,1fr) 280px;gap:14px;align-items:start}.ax-history-card{padding:16px 19px}.ax-history-timeline{margin-top:19px}.ax-history-event{position:relative;padding-right:30px;padding-bottom:25px;border-right:1px solid #e5eaf0;margin-right:8px}.ax-history-event:last-child{border-right-color:transparent;padding-bottom:0}.ax-history-event-dot{position:absolute;right:-10px;top:0;width:19px;height:19px;border:1px solid #dfe6eb;border-radius:50%;background:#fff;color:#8093a4;display:grid;place-items:center}.ax-history-event.current .ax-history-event-dot{border-color:#bbd1c1;background:#eef6f0;color:#60856b}.ax-history-event-head{display:flex;align-items:center;gap:8px}.ax-history-event-head>b{font-family:'IBM Plex Sans',sans-serif;color:#516b84;font-size:11px}.ax-history-event-head time{margin-right:auto;color:#a4adb6;font-size:8px}.ax-history-event p{color:#78899a;font-size:10px;line-height:1.8;margin:7px 0}.ax-history-actor{display:flex;align-items:center;gap:6px;color:#929da8;font-size:8px}.ax-avatar-tiny{width:20px;height:20px;font-size:9px}.ax-ai-tag{font-size:8px;background:#f2eff6;color:#83749c;padding:3px 6px;border-radius:4px}.ax-history-source{display:flex;align-items:center;gap:6px;font-size:8px;color:#72869a;background:#f5f8fa;padding:7px 8px;border-radius:5px;width:max-content;max-width:100%}.ax-history-source svg{color:#6887a1}.ax-history-source span{color:#64816d;margin-right:4px}.ax-history-trust{padding:19px 17px}.ax-trust-emblem{width:41px;height:41px;border-radius:11px;background:#eef5f0;color:#5e836a;display:grid;place-items:center}.ax-history-trust h3{color:#496257;font-size:13px;margin:12px 0 5px}.ax-history-trust p{font-size:9px;color:#88968f;line-height:1.9;margin:0 0 14px}.ax-history-trust-row{display:flex;align-items:center;gap:7px;color:#6d8374;font-size:9px;padding:7px 0;border-top:1px solid #f0f2f0}.ax-history-trust-row svg{color:#70917b}
        .ax-export-page{max-width:930px;margin:15px auto 0}.ax-export-overline{display:flex;align-items:center;gap:8px;color:#82909e;font-size:10px}.ax-export-overline>span{width:27px;height:27px;border-radius:8px;background:#f1f4f6;color:#7d8d9c;display:grid;place-items:center}.ax-export-overline>span.is-ready{background:#edf5ef;color:#4e8060}.ax-export-page h1{font-size:27px;color:#2b435c;margin:10px 0 4px}.ax-export-intro{font-size:11px;color:#92a0ac;margin:0 0 20px}.ax-export-exam-card{display:flex;align-items:center;gap:13px;padding:16px;background:#fff;border:1px solid #e5eaee;border-radius:9px}.ax-export-emblem{width:43px;height:43px;border-radius:10px;background:#eef3f7;color:#5b7d99;display:grid;place-items:center}.ax-export-exam-card>div:nth-child(2){flex:1}.ax-export-exam-card small{font-size:9px;color:#95a0ab}.ax-export-exam-card h2{font-size:13px;font-family:'IBM Plex Sans','Noto Sans Arabic',sans-serif;color:#425a73;margin:3px 0;direction:ltr;text-align:right}.ax-export-exam-card>div:nth-child(2)>span{font-size:8px;color:#a1aab4}.ax-export-exam-card>div:nth-child(2)>span i{display:inline-block;width:3px;height:3px;border-radius:50%;background:#b7c0c8;margin:0 6px}.ax-export-main{display:grid;grid-template-columns:1fr 288px;gap:13px;margin-top:13px}.ax-export-checklist{padding:16px}.ax-approval-count{font-family:'IBM Plex Sans',sans-serif;color:#9b8257;background:#f7f4ec;border-radius:5px;padding:4px 8px;font-size:10px}.ax-approval-count.complete{background:#eef6f0;color:#4b7b5c}.ax-checklist-row{display:flex;align-items:center;gap:10px;border-top:1px solid #f0f2f4;padding:12px 0}.ax-checklist-row:first-of-type{margin-top:8px}.ax-checklist-row>span{width:23px;height:23px;border:1px solid #e1e6e9;border-radius:50%;display:grid;place-items:center;color:#a2acb5;flex-shrink:0}.ax-checklist-row.done>span{background:#edf5ef;color:#588368;border-color:#dceae0}.ax-checklist-row>span>i{width:6px;height:6px;border-radius:50%;background:#c6a56d}.ax-checklist-row b{display:block;color:#61748a;font-size:10px;font-weight:500}.ax-checklist-row small{display:block;color:#a1aab4;font-size:8px;margin-top:3px}.ax-export-checklist>.ax-button{margin-top:11px}.ax-export-side{display:flex;flex-direction:column;gap:11px}.ax-export-ai-note{padding:14px;border:1px solid #e3ebe5;border-radius:8px;background:#f4f8f5;color:#5f816a}.ax-export-ai-note>svg{color:#658a70}.ax-export-ai-note>b{display:block;font-size:10px;margin:8px 0 4px}.ax-export-ai-note p{font-size:8px;color:#82948a;line-height:1.8;margin:0}.ax-export-formats{padding:14px;border:1px solid #e7ebef;border-radius:8px;background:#fff}.ax-export-formats h3{font-size:11px;color:#596d82;margin:0 0 10px}.ax-export-format{width:100%;display:flex;align-items:center;gap:9px;border:1px solid #e7ebef;border-radius:6px;background:#fff;padding:9px;margin-bottom:7px;text-align:right}.ax-export-format.disabled{background:#fafbfc;opacity:.66}.ax-format-icon{width:26px;height:29px;border-radius:4px;background:#edf2f8;color:#5b7da0;display:grid;place-items:center;font-family:'IBM Plex Sans',sans-serif;font-weight:700;font-size:11px}.ax-format-icon.pdf-format{background:#f8efef;color:#a36461}.ax-export-format>span:nth-child(2){flex:1}.ax-export-format b{display:block;font-size:9px;color:#5b6f85}.ax-export-format small{display:block;font-size:8px;color:#a0aab4;margin-top:2px}.ax-export-format>svg{color:#a2adb7}.ax-mock-only-note{text-align:center;color:#a5aeb7;font-size:8px;margin-top:7px}
        .ax-bank-summary{display:flex;align-items:center;gap:0;background:#fff;border:1px solid #e8edf1;border-radius:8px;padding:12px 14px;margin-bottom:12px}.ax-bank-summary>div:not(.ax-bank-search){padding:0 17px;border-left:1px solid #edf0f2;min-width:112px}.ax-bank-summary>div:nth-child(1){padding-right:3px}.ax-bank-summary small{display:block;color:#9aa5b0;font-size:8px}.ax-bank-summary b{display:block;color:#50677f;font-family:'IBM Plex Sans','Noto Sans Arabic',sans-serif;font-size:16px;margin-top:3px}.ax-bank-search{display:flex;align-items:center;gap:8px;margin-right:auto}.ax-bank-search .ax-search{min-width:200px;height:33px}.ax-bank-search .ax-button{min-height:33px;padding:5px 10px;font-size:9px}.ax-bank-filters{display:flex;align-items:center;gap:7px;margin-bottom:13px}.ax-bank-filters>button,.ax-bank-filters>span>button{border:1px solid #e3e8ed;background:#fff;color:#6f8092;border-radius:5px;padding:6px 8px;display:flex;align-items:center;gap:8px;font-size:8px}.ax-bank-filters>span{display:flex;align-items:center;gap:6px;color:#9aa4ae;font-size:8px;margin-right:auto}.ax-bank-list{display:flex;flex-direction:column;gap:8px}.ax-bank-card{background:#fff;border:1px solid #e8edf1;border-radius:8px;text-align:right;padding:12px 14px}.ax-bank-card:hover{border-color:#cdd8e1}.ax-bank-card-top{display:flex;align-items:center;justify-content:space-between;color:#7b8b9d;font-family:'IBM Plex Sans','Noto Sans Arabic',sans-serif;font-size:9px}.ax-bank-card p{color:#4e637a;font-size:11px;margin:7px 0 9px;line-height:1.7}.ax-bank-card-foot{display:flex;align-items:center;gap:3px;font-size:8px;color:#9aa5af}.ax-citation-mini{margin-right:auto;display:flex;align-items:center;gap:4px;color:#5e826a;font-family:'IBM Plex Sans',sans-serif}.ax-bank-footer{display:flex;align-items:center;justify-content:space-between;color:#a1abb5;font-size:8px;padding:13px 3px}.ax-bank-footer button{border:0;background:none;color:#688099;font-size:9px;display:flex;align-items:center;gap:5px}
        .ax-plan-pill{padding:5px 9px;border-radius:5px;background:#eff3f6;color:#73869a;font-size:9px}.ax-usage-hero{display:grid;grid-template-columns:1fr 150px 1fr;align-items:center;gap:15px;padding:21px 24px;background:#fff;border:1px solid #e8edf1;border-radius:9px;margin-bottom:14px}.ax-usage-hero h2{font-size:17px;color:#405872;margin:6px 0 3px}.ax-usage-hero p{font-size:9px;color:#99a4af;margin:0}.ax-usage-circle{width:127px;height:127px;position:relative;display:grid;place-items:center}.ax-usage-circle svg{position:absolute;inset:0;width:100%;height:100%;transform:rotate(-90deg)}.ax-usage-circle svg circle{fill:none;stroke:#edf1f3;stroke-width:5}.ax-usage-circle svg circle.ax-usage-arc{stroke:#6687a3;stroke-dasharray:308;stroke-dashoffset:179;stroke-linecap:round}.ax-usage-circle>div{display:flex;align-items:baseline;justify-content:center;flex-wrap:wrap;width:80px}.ax-usage-circle b{font-family:'IBM Plex Sans',sans-serif;font-size:25px;color:#3f5b76}.ax-usage-circle>div>span{font-family:'IBM Plex Sans',sans-serif;font-size:9px;color:#9aa5af}.ax-usage-circle small{width:100%;text-align:center;color:#9aa5af;font-size:8px}.ax-usage-bar>div:first-child{display:flex;justify-content:space-between;color:#728398;font-size:9px}.ax-usage-bar>div:first-child b{font-family:'IBM Plex Sans',sans-serif;color:#547797}.ax-usage-bar .ax-meter{height:7px;margin-top:9px}.ax-usage-bar .ax-meter i{background:#6587a4}.ax-usage-bar>small{display:block;color:#a1abb5;font-size:8px;margin-top:8px}.ax-usage-detail-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:11px}.ax-usage-detail{padding:15px;min-height:155px}.ax-usage-detail-icon{width:31px;height:31px;border-radius:8px;background:#f0f4f7;color:#6987a1;display:grid;place-items:center}.ax-usage-detail-icon.blue{background:#eef4f8;color:#5681a5}.ax-usage-detail-icon.amber{background:#f8f4ec;color:#9b814e}.ax-usage-detail>small{display:block;color:#99a4af;font-size:9px;margin-top:11px}.ax-usage-detail>b{display:block;color:#50677f;font-family:'IBM Plex Sans','Noto Sans Arabic',sans-serif;font-size:22px;margin-top:4px}.ax-usage-detail>b em{font-family:'Noto Sans Arabic',sans-serif;font-size:9px;font-style:normal;color:#9aa5af}.ax-usage-detail>span{display:block;color:#a1abb5;font-size:8px}.ax-detail-meter{height:4px;background:#eef1f3;border-radius:3px;margin-top:12px}.ax-detail-meter i{display:block;height:100%;background:#8ca2b4;border-radius:3px}.ax-usage-footnote{display:flex;align-items:center;gap:7px;color:#91a0ac;font-size:9px;margin-top:13px}.ax-usage-footnote svg{color:#8297a9}
        .ax-settings-layout{display:grid;grid-template-columns:190px minmax(0,1fr);gap:13px;align-items:start}.ax-settings-nav{padding:7px;background:#fff;border:1px solid #e8edf1;border-radius:8px;position:sticky;top:76px}.ax-settings-nav button{display:flex;align-items:center;gap:8px;width:100%;height:35px;border:0;background:#fff;text-align:right;color:#7a8999;font-size:9px;padding:0 8px;border-radius:5px}.ax-settings-nav button.active{background:#eff3f7;color:#496a88;font-weight:600}.ax-settings-nav button svg{color:#8497a7}.ax-settings-section{padding:15px}.ax-settings-section .ax-panel-heading{margin-bottom:13px}.ax-settings-fields{display:grid;grid-template-columns:1fr 1fr;gap:11px}.ax-settings-fields label>span{display:block;font-size:8px;color:#8794a2;margin-bottom:5px}.ax-settings-fields input{width:100%;height:35px;border:1px solid #e5e9ed;border-radius:6px;padding:0 9px;color:#65788d;background:#fff;font-size:10px}.ax-settings-fields .ax-select{height:35px}.ax-settings-toggle{display:flex;align-items:center;justify-content:space-between;border:0;border-top:1px solid #edf0f3;background:#fff;width:100%;margin-top:14px;padding:12px 0 1px;text-align:right}.ax-settings-toggle b{display:block;font-size:9px;color:#677a8e}.ax-settings-toggle small{display:block;font-size:8px;color:#9da7b1;margin-top:3px}.ax-settings-toggle i{width:30px;height:17px;border-radius:9px;background:#dfe5e9;position:relative}.ax-settings-toggle i:after{content:"";position:absolute;right:2px;top:2px;width:13px;height:13px;border-radius:50%;background:#fff;box-shadow:0 1px 2px #aab4bb;transition:transform .15s}.ax-settings-toggle.enabled i{background:#6b89a4}.ax-settings-toggle.enabled i:after{transform:translateX(-13px)}.ax-settings-info,.ax-plan-row{display:flex;align-items:center;justify-content:space-between;border-top:1px solid #edf0f3;padding:11px 0;color:#7f8d9b;font-size:9px}.ax-settings-info>span{display:flex;align-items:center;gap:7px}.ax-settings-info svg{color:#7e9985}.ax-settings-info button,.ax-plan-row button{border:0;background:none;color:#71879b;font-size:8px;display:flex;align-items:center;gap:5px}.ax-plan-row>span b{display:block;color:#61748a;font-size:9px;font-weight:500}.ax-plan-row>span small{display:block;color:#9ba6b1;font-size:8px;margin-top:3px}.ax-demo-states-teaser{display:flex;align-items:center;justify-content:space-between;background:#f7f9fa}.ax-demo-states-teaser b{display:block;color:#6a7d8f;font-size:9px}.ax-demo-states-teaser small{display:block;color:#9ca6b0;font-size:8px;margin-top:3px}.ax-demo-states-teaser .ax-button{min-height:31px;font-size:8px}
        .ax-state-group{margin-bottom:22px}.ax-state-group .ax-section-title{margin-bottom:11px}.ax-state-cards{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px}.ax-empty-state-card{background:#fff;border:1px solid #e8edf1;border-radius:8px;padding:12px;min-height:156px;display:flex;flex-direction:column;align-items:flex-start}.ax-empty-state-card .ax-empty-illustration{margin-bottom:9px}.ax-empty-state-card>b{color:#596d82;font-size:9px}.ax-empty-state-card>p{color:#9aa4af;font-size:8px;line-height:1.7;margin:5px 0 8px;flex:1}.ax-empty-state-card>button{display:flex;align-items:center;gap:4px;border:0;background:none;padding:0;color:#64819b;font-size:8px}.ax-error-list{display:flex;flex-direction:column;gap:7px}.ax-error-row{display:flex;align-items:center;gap:10px;padding:10px 12px;border:1px solid #e8edf1;border-radius:7px;background:#fff}.ax-error-row>span{width:27px;height:27px;border-radius:7px;background:#f2f5f7;color:#8595a4;display:grid;place-items:center;flex-shrink:0}.ax-error-row.error-amber>span{background:#f9f5eb;color:#a3844f}.ax-error-row.error-red>span{background:#f8eeee;color:#a76563}.ax-error-row>div{flex:1;min-width:0}.ax-error-row b{color:#68798c;font-size:9px}.ax-error-row p{color:#9ba5af;font-size:8px;margin:2px 0 0}.ax-error-row>button{display:flex;align-items:center;gap:4px;border:0;background:none;color:#71869a;font-size:8px;white-space:nowrap}
        .ax-exam-summary-row{display:grid;grid-template-columns:repeat(4,1fr);background:#fff;border:1px solid #e8edf1;border-radius:8px;margin-bottom:13px}.ax-exam-summary-row>div{padding:11px 15px;border-left:1px solid #eef0f2}.ax-exam-summary-row>div:last-child{border-left:0}.ax-exam-summary-row span{display:block;color:#99a4af;font-size:8px}.ax-exam-summary-row b{display:block;color:#546d85;font-family:'IBM Plex Sans','Noto Sans Arabic',sans-serif;font-size:16px;margin-top:4px}.ax-exam-list{display:flex;flex-direction:column;gap:8px}.ax-exam-card{display:flex;align-items:center;gap:12px;background:#fff;border:1px solid #e8edf1;border-radius:8px;padding:11px 13px;text-align:right}.ax-exam-card:hover{border-color:#ccd8e1}.ax-exam-icon{width:35px;height:35px;border-radius:8px;display:grid;place-items:center;background:#eef4f7;color:#6685a0;flex-shrink:0}.ax-exam-icon.review{background:#f8f4e9;color:#a2874e}.ax-exam-icon.draft{background:#f1f3f5;color:#8b99a7}.ax-exam-copy{flex:1;min-width:160px}.ax-exam-copy b{display:block;color:#4d647c;font-size:10px;font-family:'IBM Plex Sans','Noto Sans Arabic',sans-serif}.ax-exam-copy small{display:block;color:#9ba5af;font-size:8px;margin-top:4px}.ax-exam-count{color:#718397;font-size:8px;min-width:135px}.ax-exam-date{color:#9da7b1;font-size:8px;min-width:98px}
        .ax-toast{position:fixed;bottom:24px;left:25px;z-index:60;display:flex;align-items:center;gap:8px;padding:11px 15px;background:#263d58;color:#fff;border-radius:7px;box-shadow:0 6px 22px rgba(31,56,100,.15);font-size:10px;animation:ax-toast-in .2s ease-out}.ax-toast svg{color:#c0d2df}.ax-mobile-bottom{display:none}@keyframes ax-toast-in{from{opacity:0;transform:translateY(7px)}to{opacity:1;transform:translateY(0)}}
        @media(max-width:1100px){.ax-sidebar{width:220px}.ax-main-shell{margin-right:220px;width:calc(100% - 220px)}.ax-main-content{padding-left:24px;padding-right:24px}.ax-dashboard-grid{grid-template-columns:minmax(0,1fr) 270px}.ax-review-workspace{grid-template-columns:195px minmax(0,1fr) 190px;gap:8px}.ax-review-tools{padding:10px}.ax-question-content{padding:14px}.ax-style-content-grid{grid-template-columns:minmax(0,1fr) 240px}.ax-generation-layout{grid-template-columns:minmax(0,1fr) 260px}}
        @media(max-width:850px){.ax-sidebar{width:195px;padding-right:12px;padding-left:12px}.ax-main-shell{margin-right:195px;width:calc(100% - 195px)}.ax-main-content{padding:23px 18px 48px}.ax-topbar{padding:0 18px}.ax-dashboard-grid{grid-template-columns:1fr}.ax-side-stack{display:grid;grid-template-columns:1fr 1fr}.ax-review-reminder{grid-column:1/-1}.ax-review-workspace{grid-template-columns:180px minmax(0,1fr)}.ax-review-tools{grid-column:1/-1;display:grid;grid-template-columns:1fr 1.3fr;gap:10px;align-items:center}.ax-review-tools-head{border:0;padding:0}.ax-review-meta{display:flex;flex-wrap:wrap;gap:0 13px;border:0;padding:0}.ax-review-meta>div{gap:5px}.ax-review-actions{grid-column:1/-1;flex-direction:row;flex-wrap:wrap;border-top:1px solid #edf0f2;padding-top:9px}.ax-review-actions .ax-button{width:auto;flex:1;min-width:110px}.ax-human-approval{display:none}.ax-course-workspace{grid-template-columns:1fr}.ax-course-workspace>.ax-side-stack{display:grid;grid-template-columns:1fr 1fr}.ax-style-content-grid{grid-template-columns:1fr}.ax-version-panel{display:none}.ax-generation-layout{grid-template-columns:1fr}.ax-generation-aside{display:grid;grid-template-columns:1fr 1fr;gap:10px}.ax-export-main{grid-template-columns:1fr 250px}.ax-state-cards{grid-template-columns:repeat(3,1fr)}.ax-bank-summary>div:not(.ax-bank-search){min-width:auto;padding:0 11px}.ax-bank-search .ax-search{min-width:145px}}
        @media(max-width:640px){.ax-app{display:block}.ax-sidebar{width:min(286px,84vw);right:0;transform:translateX(105%);transition:transform .22s;box-shadow:none}.ax-sidebar.ax-sidebar-open{transform:translateX(0);box-shadow:-14px 0 40px rgba(23,44,66,.12)}.ax-main-shell{margin-right:0;width:100%;min-height:100dvh}.ax-topbar{height:55px;padding:0 14px}.ax-breadcrumb{gap:6px;font-size:10px}.ax-mobile-menu{display:grid;place-items:center;width:29px;height:29px;border:1px solid #e8edf1;border-radius:6px;background:#fff;color:#657991;margin-left:3px}.ax-crumb-extra,.ax-crumb-link{display:none}.ax-top-actions{gap:9px}.ax-prototype-badge{font-size:8px;padding:4px 7px}.ax-profile-name,.ax-profile-chip>svg{display:none}.ax-profile-chip .ax-avatar{width:28px;height:28px}.ax-icon-button{width:28px}.ax-main-content{padding:20px 14px 83px}.ax-page-heading{align-items:flex-start;margin-bottom:17px;gap:10px}.ax-page-heading h1,.ax-review-heading h1{font-size:20px}.ax-page-heading p{font-size:10px;line-height:1.7;max-width:230px}.ax-heading-action{padding-top:2px}.ax-heading-action .ax-button{min-height:34px;padding:7px 9px;font-size:9px}.ax-metrics{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-bottom:14px}.ax-metric{min-height:98px;padding:11px}.ax-metric-icon{width:26px;height:26px;left:10px;top:11px}.ax-metric-icon svg{width:15px}.ax-metric-label{font-size:9px}.ax-metric-value{font-size:22px;margin-top:7px}.ax-metric:nth-child(4) .ax-metric-value{font-size:18px}.ax-metric-note{font-size:8px}.ax-dashboard-grid{gap:12px}.ax-create-card{min-height:auto;padding:16px 14px;display:block}.ax-create-left{width:100%}.ax-create-left h2{font-size:18px;margin-top:7px}.ax-create-left p{font-size:10px;margin-bottom:12px;max-width:100%}.ax-flow{width:100%;display:flex;align-items:center;gap:6px;margin-top:14px;padding:9px 8px}.ax-flow-step{flex:1;min-width:0;gap:6px}.ax-flow-step>span{width:20px;height:20px;font-size:9px}.ax-flow-step b{font-size:8px;white-space:nowrap}.ax-flow-step small{font-size:7px;white-space:nowrap}.ax-flow-line{height:1px;flex:0 0 8px;border:0;border-top:1px dashed #c4d2de;margin:0}.ax-card-watermark{font-size:150px;bottom:-73px}.ax-section-title h2{font-size:13px}.ax-section-title>div>span{font-size:8px}.ax-text-action{font-size:8px}.ax-course-grid{gap:7px}.ax-course-card{padding:10px;min-height:103px}.ax-course-card-icon{width:28px;height:28px;margin-bottom:6px}.ax-course-card-icon svg{width:16px}.ax-course-card-title{font-size:11px}.ax-course-card-meta{font-size:8px}.ax-course-card-bottom{font-size:8px;margin-top:8px}.ax-course-arrow{left:8px;top:13px;width:13px}.ax-side-stack{display:flex;flex-direction:column}.ax-insight{padding:12px}.ax-insight h3{font-size:12px}.ax-insight p{font-size:9px}.ax-activity-panel{padding:11px 12px 0}.ax-activity-row{min-height:43px}.ax-review-reminder{padding:10px}.ax-page-heading .ax-draft-tag{font-size:8px;max-width:105px;line-height:1.6}.ax-toolbar{gap:6px;flex-wrap:wrap}.ax-search{min-width:0;flex:1;height:35px}.ax-toolbar>.ax-button{font-size:9px;padding:6px 8px}.ax-results-count{width:100%;text-align:left;font-size:8px}.ax-course-list-card{display:grid;grid-template-columns:36px 1fr auto 14px;gap:9px;padding:9px 10px;min-height:67px}.ax-list-course-info{min-width:0}.ax-list-course-info b{font-size:11px}.ax-list-course-info small{font-size:8px}.ax-list-stat,.ax-course-updated{display:none}.ax-course-list-card>.ax-status-pill{font-size:7px;padding:4px 6px}.ax-course-list-card>.ax-row-chevron{grid-column:4;grid-row:1}.ax-empty-state-mini{align-items:flex-start;flex-wrap:wrap;padding:11px}.ax-empty-state-mini>div{width:calc(100% - 55px)}.ax-empty-state-mini .ax-button{margin-right:50px}.ax-course-hero{gap:10px;padding-bottom:14px;flex-wrap:wrap}.ax-course-hero-icon{width:40px;height:40px}.ax-course-hero-copy h1{font-size:21px}.ax-course-hero-copy .ax-eyebrow{font-size:8px}.ax-course-meta-line{flex-wrap:wrap;gap:5px;font-size:8px}.ax-course-hero>.ax-button{margin-right:auto;min-height:33px}.ax-tabs{gap:18px;overflow-x:auto;white-space:nowrap;margin:0 -14px 14px;padding:0 14px;scrollbar-width:none}.ax-tabs::-webkit-scrollbar{display:none}.ax-tabs button{font-size:9px;padding-bottom:9px;flex-shrink:0}.ax-course-overview-grid{grid-template-columns:1fr}.ax-chapter-row{grid-template-columns:9px 1fr 70px 15px;gap:6px}.ax-chapter-bar{display:none}.ax-chapter-status{font-size:7px}.ax-course-workspace>.ax-side-stack{display:flex}.ax-material-strip{gap:6px}.ax-upload-zone{min-height:auto;gap:12px;padding:14px 11px}.ax-upload-art{width:67px;height:68px}.ax-upload-ring{width:39px;height:39px}.ax-upload-ring svg{width:20px}.ax-upload-doc.doc-one{top:12px;left:11px}.ax-upload-doc.doc-two{bottom:10px;right:9px}.ax-upload-copy h2{font-size:12px}.ax-upload-copy p{font-size:8px}.ax-file-formats{gap:4px;margin-top:9px;flex-wrap:wrap}.ax-file-formats>span{font-size:7px;padding:2px 4px}.ax-file-formats small{width:100%;font-size:7px;margin-right:0}.ax-processing-banner{display:grid;grid-template-columns:31px 1fr auto;gap:8px;padding:9px}.ax-processing-banner>div:nth-child(2){min-width:0}.ax-processing-banner p{font-size:7px;line-height:1.6}.ax-processing-progress{grid-column:2;width:100%}.ax-processing-banner>button{grid-column:3;grid-row:1;font-size:7px}.ax-material-head{align-items:flex-end}.ax-material-head h2{font-size:12px}.ax-material-filters{gap:4px}.ax-material-filters button{font-size:7px;padding:6px}.ax-material-grid{grid-template-columns:1fr}.ax-material-card{min-height:65px;padding:9px}.ax-state-note{font-size:8px;line-height:1.7}.ax-style-banner{padding:13px;gap:10px;align-items:flex-start}.ax-style-banner-icon{width:33px;height:33px}.ax-style-banner-copy h2{font-size:13px}.ax-style-banner-copy p{font-size:8px;line-height:1.7}.ax-profile-status{min-width:0;padding-right:9px;gap:5px}.ax-profile-status .ax-status-pill{font-size:7px;padding:3px 5px}.ax-profile-status>small{font-size:7px}.ax-style-stats{grid-template-columns:repeat(2,1fr)}.ax-style-stat{padding:10px;border-bottom:1px solid #edf0f3}.ax-style-stat:nth-child(2){border-left:0}.ax-style-stat:nth-child(n+3){border-bottom:0}.ax-style-stat b{font-size:13px}.ax-style-content-grid{display:block}.ax-style-cards{gap:7px}.ax-style-card{padding:11px;min-height:158px}.ax-style-card h3{font-size:12px}.ax-style-card>small{font-size:8px}.ax-style-card>p{font-size:8px}.ax-writing-sample span{font-size:7px;padding:3px 5px}.ax-question-mix>div{font-size:7px}.ax-length-number{font-size:23px}.ax-style-structure{margin-top:8px}.ax-structure-row{grid-template-columns:1fr 72px 38px;font-size:8px;gap:6px}.ax-field-grid{grid-template-columns:1fr;gap:9px;margin:12px 0}.ax-config-panel{padding:13px;margin-bottom:9px}.ax-panel-heading h3{font-size:11px}.ax-question-counts{grid-template-columns:1fr}.ax-count-card{padding:8px}.ax-difficulty-options{grid-template-columns:1fr;gap:6px;margin-top:11px}.ax-difficulty-option{padding:9px}.ax-difficulty-option small{font-size:8px}.ax-generation-aside{display:flex;flex-direction:column}.ax-summary-panel{padding:13px}.ax-quick-context{display:none}.ax-progress-page{margin:5vh auto 0;padding:15px 10px 45px}.ax-progress-page h1{font-size:22px}.ax-progress-intro{font-size:9px;line-height:1.8}.ax-progress-summary{gap:8px;padding:7px 10px;font-size:8px}.ax-progress-visual{width:143px;height:143px}.ax-progress-timeline{grid-template-columns:repeat(3,1fr);row-gap:17px;max-width:360px}.ax-progress-timeline:before{display:none}.ax-progress-step small{font-size:7px}.ax-review-heading{display:block;margin-bottom:14px}.ax-review-heading p{font-size:8px;flex-wrap:wrap}.ax-review-heading-actions{justify-content:space-between;margin-top:10px}.ax-review-heading-actions .ax-button{min-height:33px;font-size:8px}.ax-review-workspace{display:flex;flex-direction:column;gap:9px}.ax-review-list{width:100%;order:0}.ax-review-list-header{padding:9px 10px}.ax-question-nav{display:flex;overflow-x:auto;scrollbar-width:none;padding:5px 5px 6px}.ax-question-nav::-webkit-scrollbar{display:none}.ax-question-nav-item{flex:0 0 115px;min-height:68px;display:grid;grid-template-columns:23px 1fr;gap:5px;padding:7px;border:1px solid #edf0f2;border-radius:6px;margin-left:5px}.ax-question-nav-item.selected:before{right:0;top:auto;bottom:0;left:0;width:auto;height:2px}.ax-q-number{width:21px;height:21px;font-size:8px}.ax-q-nav-copy b{font-size:8px}.ax-q-nav-copy small{font-size:7px}.ax-q-confidence{font-size:7px;margin-top:3px}.ax-q-status{grid-column:2;justify-self:start;font-size:6px}.ax-review-list-footer{height:31px;border-top:1px solid #f0f2f4}.ax-question-content{width:100%;padding:13px}.ax-question-prompt{font-size:15px;margin:5px 0 13px}.ax-answer-option{font-size:9px;line-height:1.6;min-height:38px}.ax-citation-card{gap:7px;flex-wrap:wrap;padding:8px}.ax-citation-copy{flex:1}.ax-citation-open{font-size:7px}.ax-citation-confidence{min-width:75px;padding-right:8px}.ax-question-note{font-size:7px;line-height:1.7}.ax-review-tools{width:100%;display:block;padding:12px}.ax-review-tools-head{padding-bottom:9px;border-bottom:1px solid #edf0f2}.ax-review-meta{display:grid;grid-template-columns:1fr 1fr;padding:4px 0;border-bottom:1px solid #edf0f2}.ax-review-meta>div{font-size:7px}.ax-review-actions{display:grid;grid-template-columns:1fr 1fr;gap:4px;border:0;padding-top:9px}.ax-review-actions .ax-button{width:100%;min-width:0;min-height:36px;font-size:8px}.ax-review-actions .ax-button:first-child{grid-column:1/-1}.ax-human-approval{display:flex}.ax-editor-layout,.ax-history-layout{grid-template-columns:1fr}.ax-editor-history{display:none}.ax-editor-panel{padding:12px}.ax-question-textarea{min-height:95px;font-size:10px}.ax-edit-answer input{font-size:8px}.ax-editor-extra{gap:7px}.ax-editor-buttons{position:sticky;bottom:72px;background:rgba(245,247,249,.94);padding:8px 0;z-index:5}.ax-editor-buttons .ax-button{flex:1}.ax-editor-review-note{font-size:8px;line-height:1.7}.ax-history-card{padding:13px}.ax-history-event p{font-size:9px}.ax-history-trust{padding:14px}.ax-export-page{margin:0}.ax-export-page h1{font-size:22px}.ax-export-intro{font-size:9px;line-height:1.8}.ax-export-exam-card{padding:11px;gap:8px;flex-wrap:wrap}.ax-export-emblem{width:35px;height:35px}.ax-export-exam-card h2{font-size:10px}.ax-export-exam-card .ax-status-pill{margin-right:43px}.ax-export-main{grid-template-columns:1fr}.ax-export-checklist{padding:13px}.ax-export-side{display:grid;grid-template-columns:1fr 1fr;gap:8px}.ax-export-ai-note,.ax-export-formats{padding:10px}.ax-export-formats h3{font-size:9px}.ax-export-format{padding:7px;gap:6px}.ax-export-format b{font-size:8px}.ax-export-format small{font-size:7px}.ax-format-icon{width:22px;height:25px}.ax-mock-only-note{font-size:7px}.ax-bank-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:0;padding:10px}.ax-bank-summary>div:not(.ax-bank-search){padding:0 6px;min-width:0}.ax-bank-summary>div:nth-child(1){padding-right:0}.ax-bank-summary>div:nth-child(3){border-left:0}.ax-bank-summary small{font-size:7px}.ax-bank-summary b{font-size:13px}.ax-bank-search{grid-column:1/-1;margin:9px 0 0;display:flex}.ax-bank-search .ax-search{flex:1;min-width:0}.ax-bank-filters{overflow-x:auto;scrollbar-width:none;padding-bottom:3px}.ax-bank-filters>button{flex-shrink:0;font-size:7px}.ax-bank-filters>span{display:none}.ax-bank-card{padding:10px}.ax-bank-card p{font-size:9px}.ax-bank-card-foot{flex-wrap:wrap;font-size:7px}.ax-bank-footer{font-size:7px}.ax-usage-hero{grid-template-columns:1fr 105px;gap:8px;padding:15px}.ax-usage-hero h2{font-size:14px}.ax-usage-circle{width:100px;height:100px}.ax-usage-circle b{font-size:20px}.ax-usage-bar{grid-column:1/-1}.ax-usage-detail-grid{grid-template-columns:1fr}.ax-usage-detail{min-height:125px}.ax-settings-layout{display:block}.ax-settings-nav{display:flex;overflow-x:auto;position:static;margin-bottom:10px;scrollbar-width:none;gap:3px}.ax-settings-nav button{width:auto;min-width:max-content;padding:0 9px;font-size:8px}.ax-settings-section{padding:12px}.ax-settings-fields{grid-template-columns:1fr}.ax-settings-fields label>span{font-size:8px}.ax-settings-info,.ax-plan-row{align-items:flex-start;gap:9px}.ax-settings-info{flex-wrap:wrap}.ax-demo-states-teaser{gap:8px;align-items:flex-start;flex-direction:column}.ax-state-cards{grid-template-columns:repeat(2,minmax(0,1fr))}.ax-empty-state-card{min-height:143px;padding:10px}.ax-empty-state-card>b{font-size:8px}.ax-empty-state-card>p{font-size:7px}.ax-error-row{align-items:flex-start;flex-wrap:wrap;padding:9px}.ax-error-row>div{width:calc(100% - 45px);flex:1}.ax-error-row p{font-size:7px;line-height:1.7}.ax-error-row>button{margin-right:36px}.ax-exam-summary-row{grid-template-columns:repeat(2,1fr)}.ax-exam-summary-row>div:nth-child(2){border-left:0}.ax-exam-summary-row>div:nth-child(-n+2){border-bottom:1px solid #eef0f2}.ax-exam-card{gap:7px;padding:9px}.ax-exam-copy{min-width:0}.ax-exam-copy b{font-size:9px}.ax-exam-copy small{font-size:7px}.ax-exam-card>.ax-status-pill{display:none}.ax-exam-count{min-width:0;font-size:7px}.ax-exam-date{display:none}.ax-exam-icon{width:30px;height:30px}.ax-mobile-bottom{position:fixed;bottom:0;left:0;right:0;z-index:18;height:59px;padding:5px 9px max(5px,env(safe-area-inset-bottom));background:rgba(255,255,255,.97);border-top:1px solid #e4e9ed;display:grid;grid-template-columns:repeat(4,1fr);backdrop-filter:blur(12px)}.ax-mobile-bottom button{border:0;background:none;color:#8995a2;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;font-size:7px}.ax-mobile-bottom button.active{color:#426888}.ax-mobile-bottom button.active svg{color:#4e7799}.ax-mobile-bottom svg{width:17px;height:17px}.ax-toast{bottom:69px;left:12px;right:12px;justify-content:center;text-align:center;font-size:9px}.ax-results-count{margin-right:0}.ax-settings-layout>.ax-main-stack{gap:9px}}
      `}</style>
      <style>{`
        @media(max-width:640px){
          .ax-app{font-size:14px!important;line-height:1.7!important}
          .ax-app p{font-size:13px!important;line-height:1.8!important}
          .ax-app small,.ax-app time{font-size:11px!important;line-height:1.6!important}
          .ax-app button{font-size:12px!important;min-height:44px}
          .ax-main-content{padding-bottom:100px!important}
          .ax-topbar{height:60px!important}
          .ax-breadcrumb,.ax-crumb-link,.ax-prototype-badge{font-size:11px!important}
          .ax-mobile-menu,.ax-icon-button{width:40px!important;height:40px!important;min-width:40px!important;min-height:40px!important}
          .ax-metric{min-height:112px!important;padding:12px!important}
          .ax-metric-label,.ax-metric-note,.ax-nav-label,.ax-nav-count,.ax-course-card-meta,.ax-course-card-bottom,.ax-list-course-info small,.ax-list-stat,.ax-course-updated,.ax-status-pill,.ax-eyebrow,.ax-section-title>div>span,.ax-insight-label,.ax-insight-foot,.ax-insight-foot button,.ax-activity-time,.ax-flow-step small,.ax-flow-step b,.ax-course-meta-line,.ax-ready-text,.ax-chapter-row b,.ax-chapter-row small,.ax-chapter-status,.ax-file-mark,.ax-file-formats>span,.ax-file-formats small,.ax-processing-banner b,.ax-processing-banner p,.ax-processing-progress>span,.ax-processing-progress>b,.ax-processing-banner>button,.ax-material-card-copy small,.ax-material-card .ax-status-pill,.ax-style-stat small,.ax-style-stat span,.ax-style-card>small,.ax-style-card>p,.ax-writing-sample span,.ax-scale-labels,.ax-question-mix>div,.ax-question-mix b,.ax-length-caption,.ax-structure-row,.ax-structure-row>b,.ax-field>span,.ax-field-label,.ax-count-card small,.ax-difficulty-option small,.ax-toggle-copy small,.ax-summary-row,.ax-summary-note,.ax-progress-step small,.ax-q-nav-copy small,.ax-q-confidence,.ax-q-status,.ax-question-type-tag,.ax-difficulty-tag,.ax-question-number-label,.ax-answers-label small,.ax-correct-tag,.ax-citation-copy small,.ax-citation-copy>span,.ax-citation-confidence>span,.ax-citation-confidence>small,.ax-citation-open,.ax-question-note,.ax-question-pagination span,.ax-review-meta>div,.ax-human-approval small,.ax-editor-panel-title small,.ax-editing-tag,.ax-editor-extra label>span,.ax-explanation>span,.ax-editor-review-note,.ax-history-event-head time,.ax-history-event p,.ax-history-actor,.ax-history-source,.ax-history-trust p,.ax-history-trust-row,.ax-export-overline,.ax-checklist-row small,.ax-export-ai-note p,.ax-export-format small,.ax-mock-only-note,.ax-bank-summary small,.ax-bank-card-top,.ax-bank-card-foot,.ax-bank-footer,.ax-usage-bar>div:first-child,.ax-usage-bar>small,.ax-usage-detail>small,.ax-usage-detail>span,.ax-usage-footnote,.ax-settings-fields label>span,.ax-settings-info,.ax-plan-row,.ax-settings-info button,.ax-plan-row button,.ax-settings-toggle small,.ax-empty-state-card>p,.ax-error-row p,.ax-exam-summary-row span,.ax-exam-copy small,.ax-exam-count{font-size:11px!important;line-height:1.65!important}
          .ax-page-heading h1,.ax-review-heading h1,.ax-progress-page h1,.ax-export-page h1{font-size:22px!important}
          .ax-page-heading p,.ax-review-heading p,.ax-create-left p,.ax-insight p,.ax-upload-copy p,.ax-style-banner-copy p,.ax-progress-intro,.ax-export-intro,.ax-bank-card p{font-size:13px!important;line-height:1.8!important}
          .ax-metric-value,.ax-metric:nth-child(4) .ax-metric-value{font-size:23px!important}
          .ax-section-title h2,.ax-course-quick h3{font-size:16px!important}
          .ax-course-card{min-height:120px!important}
          .ax-course-card-title,.ax-list-course-info b,.ax-activity-row b,.ax-review-reminder b,.ax-panel-heading h3,.ax-question-prompt{font-size:13px!important}
          .ax-flow-step{min-height:44px!important}
          .ax-activity-row{min-height:56px!important}
          .ax-search,.ax-search input,.ax-select,.ax-settings-fields input,.ax-settings-fields .ax-select{height:44px!important;font-size:13px!important}
          .ax-course-list-card,.ax-material-card{min-height:78px!important}
          .ax-tabs button{min-height:44px!important;font-size:12px!important}
          .ax-chapter-row{min-height:55px!important}
          .ax-upload-zone{min-height:130px!important}
          .ax-style-card{min-height:178px!important}
          .ax-count-card{min-height:54px!important}
          .ax-stepper button{min-width:38px;min-height:38px!important}
          .ax-toggle-row{min-height:60px!important}
          .ax-progress-summary,.ax-progress-overline,.ax-progress-trust{font-size:11px!important}
          .ax-progress-step>span{width:23px!important;height:23px!important}
          .ax-question-nav-item{flex-basis:142px!important;min-height:92px!important}
          .ax-q-nav-copy b{font-size:11px!important}
          .ax-question-prompt{font-size:17px!important;line-height:1.85!important}
          .ax-answer-option{min-height:48px!important;font-size:13px!important;line-height:1.7!important;padding:9px!important}
          .ax-answer-key{width:27px!important;height:27px!important;font-size:11px!important}
          .ax-question-pagination button{min-height:44px!important}
          .ax-review-actions .ax-button{min-height:46px!important}
          .ax-edit-answer{min-height:48px!important}
          .ax-edit-answer input,.ax-editor-extra label button{height:44px!important;font-size:12px!important}
          .ax-explanation textarea{min-height:78px!important;font-size:12px!important}
          .ax-empty-state-card{min-height:190px!important}
          .ax-error-row{min-height:78px!important}
          .ax-mobile-bottom{height:70px!important}
          .ax-mobile-bottom button{min-height:48px!important;font-size:11px!important}
          .ax-toast{bottom:78px!important;font-size:12px!important;line-height:1.65!important}
        }
      `}</style>
      {renderSidebar()}
      <div className="ax-main-shell">
        {renderHeader()}
        <main className="ax-main-content">{screenContent()}</main>
      </div>
      <nav className="ax-mobile-bottom">
        {[["dashboard", "الرئيسية", <LayoutDashboard key="dash" />], ["courses", "المساقات", <BookOpen key="courses" />], ["exams", "الامتحانات", <FileCheck2 key="exams" />], ["bank", "الأسئلة", <ListChecks key="bank" />]].map(([id, label, icon]) => <button className={screen === id || (id === "exams" && ["generate", "progress", "review", "editor", "history", "export"].includes(screen)) ? "active" : ""} key={String(id)} onClick={() => goTo(id as Screen)}>{icon}{label}</button>)}
      </nav>
      {toast && <div className="ax-toast" role="status"><CheckCircle2 size={15} />{toast}</div>}
    </div>
  );
}
