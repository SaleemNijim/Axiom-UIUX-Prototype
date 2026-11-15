import { useMemo, useState, type ReactNode } from "react";
import {
  Activity, AlertCircle, ArrowDown, ArrowLeft, ArrowRight, ArrowUp, BookOpen,
  Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, CircleHelp,
  Clock3, Download, Eye, FileCheck2, FileText, Filter, FolderOpen, Globe2,
  GraduationCap, History, Home, Layers3, LayoutGrid, List, LockKeyhole, Menu,
  MoreHorizontal, Pencil, Plus, Search, Settings, ShieldCheck, Sparkles,
  Trash2, UploadCloud, X,
} from "lucide-react";
import "./AxiomProfessorWorkspace.css";

type Locale = "ar" | "en";
type View = "dashboard" | "courses" | "course" | "materials" | "material" | "style" | "questions" | "generate" | "progress" | "results" | "review" | "editor" | "history" | "exams" | "builder" | "finalize" | "export" | "settings";
type QKind = "MCQ" | "Essay";
type QStatus = "pending_review" | "approved" | "rejected";
type EvidenceType = "PROSE" | "CODE" | "TABLE" | "MATH";
type Quality = "verified" | "suspect" | "unverified";
type MaterialStatus = "ready" | "processing" | "needs_attention";
type Course = { id: string; name: string; department: string; year: string; chapters: { id: string; name: string; pages: string; verified: boolean }[] };
type Material = { id: string; courseId: string; name: string; format: "PDF" | "DOCX" | "PPTX"; pages: number; chapter: string; status: MaterialStatus; updated: string; note: string; generationEligible: boolean };
type QuestionVersion = { id: string; version: number; text: string; options: string[]; correct: number; explanation: string; suggestedDifficulty: "Easy" | "Medium" | "Advanced" };
type Evidence = { materialId: string; name: string; version: string; page: number; block: string; text: string; type: EvidenceType; quality: Quality; locatorExists: boolean };
type Question = { id: string; courseId: string; chapterId: string; kind: QKind; status: QStatus; versions: QuestionVersion[]; evidence: Evidence; manualReview: boolean };
type ExamItem = { questionId: string; versionId: string; section: string; marks: number };
type Slot = { index: number; status: "persisted" | "failed_transient" | "failed_final"; questionId?: string };
type GenerationResult = { state: "blocked" | "succeeded" | "partially_succeeded" | "failed"; requested: number; reserved: number; settled: number; released: number; slots: Slot[] } | null;
type ExamSnapshot = { number: number; revision: number; title: string; createdAt: string; items: ExamItem[] };

const coursesSeed: Course[] = [
  { id: "anatomy", name: "Anatomy I", department: "Faculty of Medicine", year: "Year 3", chapters: [
    { id: "ch1", name: "Foundations of Anatomy", pages: "1–18", verified: true },
    { id: "ch2", name: "Tissues and Organization", pages: "19–34", verified: true },
    { id: "ch3", name: "Cardiovascular System", pages: "35–62", verified: true },
    { id: "ch4", name: "Respiratory System", pages: "63–88", verified: true },
  ] },
  { id: "pharma", name: "Pharmacology", department: "Faculty of Medicine", year: "Year 3", chapters: [
    { id: "ph1", name: "Principles of Pharmacology", pages: "1–22", verified: true },
    { id: "ph2", name: "Pharmacokinetics", pages: "23–44", verified: true },
    { id: "ph3", name: "Autonomic Drugs", pages: "45–70", verified: true },
  ] },
  { id: "ethics", name: "Medical Ethics", department: "Faculty of Medicine", year: "Year 3", chapters: [
    { id: "me1", name: "Ethical Principles", pages: "1–20", verified: true },
    { id: "me2", name: "Consent and Capacity", pages: "21–42", verified: true },
  ] },
  { id: "software", name: "Software Engineering", department: "Faculty of Engineering", year: "Year 3", chapters: [
    { id: "se1", name: "Requirements Engineering", pages: "1–30", verified: true },
    { id: "se2", name: "Design and Architecture", pages: "31–60", verified: true },
  ] },
];

const materialsSeed: Material[] = [
  { id: "m1", courseId: "anatomy", name: "Anatomy Lecture 03.pdf", format: "PDF", pages: 24, chapter: "Cardiovascular System", status: "ready", updated: "2026-11-12", note: "Text-based PDF. Extracted text is available in this demo fixture.", generationEligible: true },
  { id: "m2", courseId: "anatomy", name: "Cardiovascular System.pptx", format: "PPTX", pages: 36, chapter: "Cardiovascular System", status: "processing", updated: "2026-11-13", note: "Accepted format; generation-ready status is withheld pending its extraction test gate.", generationEligible: false },
  { id: "m3", courseId: "anatomy", name: "Heart and Great Vessels.docx", format: "DOCX", pages: 18, chapter: "Cardiovascular System", status: "processing", updated: "2026-11-10", note: "Accepted format; generation-ready status is withheld pending its extraction test gate.", generationEligible: false },
  { id: "m4", courseId: "anatomy", name: "Respiratory Lecture.pdf", format: "PDF", pages: 31, chapter: "Respiratory System", status: "needs_attention", updated: "2026-11-09", note: "Some pages have no usable extracted text. Those pages are not evidence for generation.", generationEligible: false },
  { id: "m5", courseId: "pharma", name: "Pharmacology Basics.pdf", format: "PDF", pages: 28, chapter: "Principles of Pharmacology", status: "ready", updated: "2026-11-08", note: "Text-based PDF demo material.", generationEligible: true },
];

const evidenceSeed: Evidence = {
  materialId: "m1", name: "Anatomy Lecture 03.pdf", version: "v1", page: 12, block: "p12-b04",
  text: "The mean arterial pressure is affected by cardiac output and total peripheral resistance. Changes in arteriolar diameter alter peripheral resistance and therefore influence arterial pressure.",
  type: "PROSE", quality: "verified", locatorExists: true,
};

function makeQuestion(id: string, courseId: string, chapterId: string, kind: QKind, status: QStatus, evidence: Evidence, text: string, options: string[], correct: number, explanation: string): Question {
  return { id, courseId, chapterId, kind, status, evidence, manualReview: true, versions: [{ id: `${id}-v1`, version: 1, text, options, correct, explanation, suggestedDifficulty: "Medium" }] };
}

const questionsSeed: Question[] = [
  makeQuestion("q-001", "anatomy", "ch3", "MCQ", "approved", evidenceSeed,
    "Which change most directly increases arterial pressure when cardiac output remains constant?",
    ["A decrease in peripheral resistance", "An increase in peripheral resistance", "A decrease in blood volume", "A decrease in heart rate"], 1,
    "Increased peripheral resistance raises arterial pressure when cardiac output remains constant."),
  makeQuestion("q-002", "anatomy", "ch3", "MCQ", "approved", { ...evidenceSeed, page: 13, block: "p13-b02", text: "Baroreceptors in the aortic arch and carotid sinus detect changes in arterial stretch and send afferent signals to cardiovascular centers." },
    "Where are the major arterial baroreceptors located?", ["Aortic arch and carotid sinus", "Pulmonary veins", "Renal cortex", "Coronary sinus"], 0,
    "The aortic arch and carotid sinus contain the major arterial baroreceptors."),
  makeQuestion("q-003", "anatomy", "ch3", "MCQ", "pending_review", { ...evidenceSeed, quality: "suspect", page: 14, block: "p14-b03" },
    "Which response is expected after an acute decrease in arterial pressure?", ["Increased sympathetic activity", "Reduced heart rate", "Increased parasympathetic activity", "Reduced venous return"], 0,
    "The baroreflex increases sympathetic activity after an acute pressure decrease."),
  makeQuestion("q-004", "anatomy", "ch3", "Essay", "pending_review", { ...evidenceSeed, type: "CODE", page: 15, block: "code-15-01" },
    "Explain how cardiac output and peripheral resistance jointly influence arterial pressure.", [], 0,
    "A complete answer should connect both determinants to arterial pressure."),
];

function versionOf(question: Question): QuestionVersion { return question.versions[question.versions.length - 1]; }
function eligible(question: Question): boolean { return question.evidence.type === "PROSE" && question.evidence.quality === "verified" && question.evidence.locatorExists; }
function Action({ children, onClick, primary = false, disabled = false, icon }: { children: ReactNode; onClick: () => void; primary?: boolean; disabled?: boolean; icon?: ReactNode }) {
  return <button className={`axp-btn ${primary ? "primary" : ""}`} disabled={disabled} onClick={onClick}>{icon}{children}</button>;
}
function Pill({ children, tone = "slate" }: { children: ReactNode; tone?: "slate" | "green" | "amber" | "red" | "blue" }) {
  return <span className={`axp-pill ${tone}`}><i />{children}</span>;
}

export function AxiomPrototype() {
  const [locale, setLocale] = useState<Locale>("ar");
  const [view, setView] = useState<View>("dashboard");
  const [courseId, setCourseId] = useState("anatomy");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [courses] = useState(coursesSeed);
  const [materials, setMaterials] = useState(materialsSeed);
  const [questions, setQuestions] = useState(questionsSeed);
  const [courseSearch, setCourseSearch] = useState("");
  const [courseMode, setCourseMode] = useState<"grid" | "list">("grid");
  const [courseSort, setCourseSort] = useState<"name" | "department">("name");
  const [materialSearch, setMaterialSearch] = useState("");
  const [materialFilter, setMaterialFilter] = useState<"all" | MaterialStatus>("all");
  const [materialSort, setMaterialSort] = useState<"newest" | "name">("newest");
  const [materialPageIndex, setMaterialPageIndex] = useState(0);
  const [selectedMaterialId, setSelectedMaterialId] = useState("m1");
  const [materialPage, setMaterialPage] = useState(12);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadCase, setUploadCase] = useState<"accepted" | "rejected">("accepted");
  const [materialDrawerOpen, setMaterialDrawerOpen] = useState(false);
  const [questionSearch, setQuestionSearch] = useState("");
  const [questionFilter, setQuestionFilter] = useState<"all" | QStatus>("all");
  const [selectedQuestionId, setSelectedQuestionId] = useState("q-001");
  const [editDraft, setEditDraft] = useState<QuestionVersion | null>(null);
  const [mode, setMode] = useState<"standard" | "advanced">("standard");
  const [scopeSource, setScopeSource] = useState<"toc" | "pages">("toc");
  const [selectedChapters, setSelectedChapters] = useState<string[]>(["ch3"]);
  const [plans, setPlans] = useState<Record<string, { mcq: number; essay: number }>>({ ch3: { mcq: 4, essay: 2 } });
  const [pageFrom, setPageFrom] = useState(35);
  const [pageTo, setPageTo] = useState(62);
  const [coverageFixture, setCoverageFixture] = useState<"full" | "partial" | "blocked">("full");
  const [resultFixture, setResultFixture] = useState<"success" | "partial" | "failed">("partial");
  const [qaOpen, setQaOpen] = useState(false);
  const [scopeConfirmed, setScopeConfirmed] = useState(false);
  const [result, setResult] = useState<GenerationResult>(null);
  const [requestNo, setRequestNo] = useState(0);
  const [examTitle, setExamTitle] = useState("Anatomy I — Midterm Examination");
  const [examItems, setExamItems] = useState<ExamItem[]>([]);
  const [examState, setExamState] = useState<"Draft" | "Finalized">("Draft");
  const [revision, setRevision] = useState(1);
  const [snapshots, setSnapshots] = useState<ExamSnapshot[]>([]);
  const [selectedSnapshotNumber, setSelectedSnapshotNumber] = useState(0);
  const [exportKind, setExportKind] = useState<"student" | "answer">("student");
  const [exportFormat, setExportFormat] = useState<"PDF" | "DOCX">("PDF");

  const t = (ar: string, en: string) => locale === "ar" ? ar : en;
  const dir = locale === "ar" ? "rtl" : "ltr";
  const course = courses.find(item => item.id === courseId) ?? courses[0];
  const material = materials.find(item => item.id === selectedMaterialId) ?? materials[0];
  const question = questions.find(item => item.id === selectedQuestionId) ?? questions[0];
  const current = versionOf(question);
  const currentSnapshot = snapshots[snapshots.length - 1] ?? null;
  const selectedSnapshot = snapshots.find(snapshot => snapshot.number === selectedSnapshotNumber) ?? (examState === "Finalized" ? currentSnapshot : null);
  const courseMaterials = materials.filter(item => item.courseId === courseId);
  const courseQuestions = questions.filter(item => item.courseId === courseId);
  const approvedQuestions = courseQuestions.filter(item => item.status === "approved" && eligible(item));
  const pendingQuestions = courseQuestions.filter(item => item.status === "pending_review");
  const total = selectedChapters.reduce((sum, id) => sum + (plans[id]?.mcq ?? 0) + (plans[id]?.essay ?? 0), 0);
  const coverage = coverageFixture === "full" ? 100 : coverageFixture === "partial" ? 92 : 72;
  const scopeText = scopeSource === "toc"
    ? selectedChapters.map(id => course.chapters.find(ch => ch.id === id)?.name).filter(Boolean).join(" · ")
    : `Pages ${pageFrom}–${pageTo}`;
  const effectiveScope = coverage === 92 ? `Pages ${pageFrom}–${Math.max(pageFrom, pageTo - 4)} (illustrative supported subset)` : scopeText;
  const requestedSlots = selectedChapters.flatMap(chapterId => {
    const chapter = course.chapters.find(ch => ch.id === chapterId);
    const plan = plans[chapterId] ?? { mcq: 0, essay: 0 };
    return [
      ...Array.from({ length: plan.mcq }, () => ({ chapterId, chapterName: chapter?.name ?? "Chapter", kind: "MCQ" as QKind })),
      ...Array.from({ length: plan.essay }, () => ({ chapterId, chapterName: chapter?.name ?? "Chapter", kind: "Essay" as QKind })),
    ];
  });
  const coursesFiltered = courses.filter(item => item.name.toLowerCase().includes(courseSearch.toLowerCase())).sort((a, b) => courseSort === "name" ? a.name.localeCompare(b.name) : a.department.localeCompare(b.department));
  const materialsFiltered = useMemo(() => materials
    .filter(item => item.courseId === courseId && item.name.toLowerCase().includes(materialSearch.toLowerCase()) && (materialFilter === "all" || item.status === materialFilter))
    .sort((a, b) => materialSort === "name" ? a.name.localeCompare(b.name) : b.updated.localeCompare(a.updated)),
  [materials, courseId, materialSearch, materialFilter, materialSort]);
  const materialsPaged = materialsFiltered.slice(materialPageIndex * 5, materialPageIndex * 5 + 5);
  const questionsFiltered = courseQuestions.filter(item => (questionFilter === "all" || item.status === questionFilter) && versionOf(item).text.toLowerCase().includes(questionSearch.toLowerCase()));
  const toastNow = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 2800); };
  const go = (target: View) => { setView(target); setMobileOpen(false); };
  const statusText = (status: MaterialStatus | QStatus) => ({ ready: t("Ready", "Ready"), processing: t("Processing", "Processing"), needs_attention: t("Needs attention", "Needs attention"), pending_review: t("Pending review", "Pending review"), approved: t("Approved", "Approved"), rejected: t("Rejected", "Rejected") } as Record<string, string>)[status];
  const statusTone = (status: MaterialStatus | QStatus): "green" | "blue" | "amber" | "red" => status === "ready" || status === "approved" ? "green" : status === "processing" ? "blue" : status === "rejected" ? "red" : "amber";
  const statusPill = (status: MaterialStatus | QStatus) => <Pill tone={statusTone(status)}>{statusText(status)}</Pill>;
  const btn = (label: string, fn: () => void, primary = false, icon?: ReactNode, disabled = false) => <Action onClick={fn} primary={primary} icon={icon} disabled={disabled}>{label}</Action>;
  const selectCourse = (id: string) => { setCourseId(id); const next = courses.find(item => item.id === id); const first = next?.chapters[0]?.id ?? ""; setSelectedChapters(first ? [first] : []); setPlans(first ? { [first]: { mcq: 3, essay: 1 } } : {}); setSelectedMaterialId(materials.find(item => item.courseId === id && item.generationEligible)?.id ?? "m1"); const firstQuestion = questions.find(item => item.courseId === id); if (firstQuestion) setSelectedQuestionId(firstQuestion.id); go("course"); };
  const updatePlan = (chapterId: string, field: "mcq" | "essay", value: number) => {
    setPlans(old => {
      const row = old[chapterId] ?? { mcq: 0, essay: 0 };
      const selectedTotal = selectedChapters.reduce((sum, id) => sum + (old[id]?.mcq ?? 0) + (old[id]?.essay ?? 0), 0);
      const otherTotal = selectedTotal - row.mcq - row.essay;
      const otherField = field === "mcq" ? row.essay : row.mcq;
      const next = Math.max(0, Math.min(30 - otherTotal - otherField, Math.floor(Number.isFinite(value) ? value : 0)));
      return { ...old, [chapterId]: { ...row, [field]: next } };
    });
    setScopeConfirmed(false);
  };
  const toggleChapter = (id: string) => {
    setSelectedChapters(old => {
      if (old.includes(id)) return old.filter(value => value !== id);
      setPlans(previous => ({ ...previous, [id]: previous[id] ?? { mcq: 0, essay: 0 } }));
      return [...old, id];
    });
    setScopeConfirmed(false);
  };
  const openMaterial = (item: Material) => { setSelectedMaterialId(item.id); setMaterialPage(1); setMaterialDrawerOpen(false); go("material"); };
  const openEditor = (item: Question) => { setSelectedQuestionId(item.id); setEditDraft({ ...versionOf(item), options: [...versionOf(item).options] }); go("editor"); };
  const saveVersion = () => {
    if (!editDraft) return;
    setQuestions(old => old.map(item => {
      if (item.id !== question.id) return item;
      const nextVersion = item.versions[item.versions.length - 1].version + 1;
      return { ...item, status: "pending_review", manualReview: true, versions: [...item.versions, { ...editDraft, id: `${item.id}-v${nextVersion}`, version: nextVersion }] };
    }));
    setEditDraft(null);
    go("review");
    toastNow(t("تم حفظ نسخة جديدة؛ النسخة السابقة محفوظة ويحتاج السؤال إلى مراجعة جديدة.", "A new version was saved; the previous version is preserved and the question requires review again."));
  };
  const approveQuestion = (item: Question) => {
    if (!eligible(item)) { toastNow(t("لا يمكن اعتماد السؤال: الدليل غير مؤهل أو مرجع المصدر غير صالح.", "Approval blocked: evidence is not eligible or its source locator is invalid.")); return; }
    setQuestions(old => old.map(q => q.id === item.id ? { ...q, status: "approved" } : q));
    toastNow(t("تم اعتماد السؤال بقرار الأستاذ.", "Question approved by the instructor."));
  };
  const rejectQuestion = (item: Question) => {
    setQuestions(old => old.map(q => q.id === item.id ? { ...q, status: "rejected" } : q));
    toastNow(t("تم تسجيل قرار الرفض.", "Rejection decision recorded."));
  };
  const bulkApprove = () => {
    const ids = courseQuestions.filter(item => item.status === "pending_review" && eligible(item)).map(item => item.id);
    setQuestions(old => old.map(item => ids.includes(item.id) ? { ...item, status: "approved" } : item));
    toastNow(t(`تم اعتماد ${ids.length} أسئلة مؤهلة فقط.`, `Approved ${ids.length} eligible questions only.`));
  };
  const runGeneration = () => {
    if (!material || material.courseId !== courseId || !material.generationEligible) { toastNow(t("اختر مادة PDF نصية جاهزة ضمن هذا المساق.", "Choose a ready text-based PDF material in this course.")); return; }
    if (total < 1 || total > 30) { toastNow(t("حدد سؤالاً واحداً على الأقل ولا تتجاوز 30 سؤالاً.", "Choose at least one question and no more than 30.")); return; }
    if (scopeSource === "pages" && (pageFrom < 1 || pageTo < pageFrom)) { toastNow(t("أدخل نطاق صفحات صحيحاً.", "Enter a valid page range.")); return; }
    if (!selectedChapters.length) { toastNow(t("اختر فصلاً واحداً على الأقل لتوزيع الأسئلة.", "Select at least one chapter for question distribution.")); return; }
    if (coverage < 80) {
      setResult({ state: "blocked", requested: total, reserved: 0, settled: 0, released: 0, slots: [] });
      go("results");
      return;
    }
    if (coverage >= 80 && coverage < 100 && !scopeConfirmed) { toastNow(t("يلزم تأكيد النطاق الفعلي الأضيق قبل بدء الطلب.", "Confirm the narrower effective scope before starting the request.")); return; }
    const number = requestNo + 1;
    setRequestNo(number);
    const persistedCount = resultFixture === "success" ? total : resultFixture === "partial" ? (total === 1 ? 1 : total - 1) : 0;
    const mcqSamples = [
      { text: "Which change most directly increases arterial pressure when cardiac output remains constant?", options: ["A decrease in peripheral resistance", "An increase in peripheral resistance", "A decrease in blood volume", "A decrease in heart rate"], correct: 1, explanation: "Increased peripheral resistance raises arterial pressure when cardiac output remains constant." },
      { text: "Where are the major arterial baroreceptors located?", options: ["Aortic arch and carotid sinus", "Pulmonary veins", "Renal cortex", "Coronary sinus"], correct: 0, explanation: "The aortic arch and carotid sinus contain the major arterial baroreceptors." },
    ];
    const essaySample = { text: "Explain how cardiac output and peripheral resistance jointly influence arterial pressure.", options: [], correct: 0, explanation: "A complete answer should connect both determinants to arterial pressure." };
    const created = requestedSlots.slice(0, persistedCount).map((slot, index) => {
      const sample = slot.kind === "Essay" ? essaySample : mcqSamples[index % mcqSamples.length];
      const id = `demo-${number}-${index + 1}`;
      return makeQuestion(id, courseId, slot.chapterId, slot.kind, "pending_review", { ...evidenceSeed, materialId: material.id, name: material.name, page: 12 + index, block: `p${12 + index}-b0${(index % 4) + 1}` }, sample.text, sample.options, sample.correct, sample.explanation);
    });
    setQuestions(old => [...old, ...created]);
    const slots: Slot[] = Array.from({ length: total }, (_, index) => {
      if (index < persistedCount) return { index: index + 1, status: "persisted", questionId: created[index].id };
      return { index: index + 1, status: resultFixture === "failed" ? "failed_final" : "failed_transient" };
    });
    setResult({
      state: persistedCount === total ? "succeeded" : persistedCount > 0 ? "partially_succeeded" : "failed",
      requested: total, reserved: total, settled: persistedCount, released: total - persistedCount, slots,
    });
    go("progress");
  };
  const addExamQuestion = (item: Question) => {
    if (examState !== "Draft" || item.status !== "approved" || !eligible(item) || examItems.some(row => row.questionId === item.id)) return;
    setExamItems(old => [...old, { questionId: item.id, versionId: versionOf(item).id, section: "A", marks: 2 }]);
  };
  const moveExamItem = (index: number, delta: -1 | 1) => setExamItems(old => {
    const copy = [...old]; const target = index + delta;
    if (target < 0 || target >= copy.length) return old;
    [copy[index], copy[target]] = [copy[target], copy[index]];
    return copy;
  });
  const replacePinnedVersion = (id: string) => {
    if (examState !== "Draft") return;
    const item = questions.find(q => q.id === id);
    if (!item || item.status !== "approved" || !eligible(item)) return;
    setExamItems(old => old.map(row => row.questionId === id ? { ...row, versionId: versionOf(item).id } : row));
    toastNow(t("تم استبدال النسخة المثبتة صراحةً في المسودة.", "The pinned version was explicitly replaced in the draft."));
  };
  const finalizeExam = () => {
    const valid = examState === "Draft" && examItems.length > 0 && examItems.every(row => {
      const item = questions.find(q => q.id === row.questionId);
      return !!item && item.status === "approved" && eligible(item) && item.versions.some(version => version.id === row.versionId);
    });
    if (!valid) { toastNow(t("الإنهاء محجوب: تحقق من اعتماد الأسئلة والنسخ المثبتة.", "Finalization is blocked: verify question approval and pinned versions.")); return; }
    const nextSnapshot: ExamSnapshot = {
      number: snapshots.length + 1, revision, title: examTitle.trim() || `${course.name} — Exam`,
      createdAt: new Date().toISOString(), items: examItems.map(item => ({ ...item })),
    };
    setSnapshots(old => [...old, nextSnapshot]);
    setSelectedSnapshotNumber(nextSnapshot.number);
    setExamState("Finalized");
    go("finalize");
  };
  const createNewRevision = () => {
    if (!currentSnapshot) { setExamItems([]); setRevision(1); setExamState("Draft"); go("builder"); return; }
    setExamItems(currentSnapshot.items.map(item => ({ ...item })));
    setExamTitle(currentSnapshot.title);
    setRevision(currentSnapshot.revision + 1);
    setExamState("Draft");
    go("builder");
    toastNow(t("أُنشئت مسودة مراجعة مشتقة من اللقطة السابقة؛ النسخة النهائية وملفاتها لم تتغير.", "A new Draft revision was derived from the prior snapshot; the finalized version and its artifacts remain unchanged."));
  };
  const exportArtifact = () => {
    if (!selectedSnapshot) { toastNow(t("يجب اختيار Snapshot نهائي محفوظ أولاً.", "Select a preserved finalized snapshot first.")); return; }
    if (exportKind === "answer") toastNow(t(`معاينة مفتاح الإجابة ${exportFormat} للنسخة v${selectedSnapshot.number} — الصلاحية في هذا النموذج للأستاذ مالك المقرر فقط.`, `Instructor Answer Key ${exportFormat} preview for snapshot v${selectedSnapshot.number} — this demo represents the course owner only.`));
    else toastNow(t(`معاينة نسخة الطالب ${exportFormat} للنسخة v${selectedSnapshot.number} — لا يتم إنشاء ملف فعلي.`, `Student Exam ${exportFormat} preview for snapshot v${selectedSnapshot.number} — no real file is generated.`));
  };

  const pageTitle: Record<View, string> = {
    dashboard: t("الرئيسية", "Dashboard"), courses: t("كل المساقات", "All courses"), course: course.name,
    materials: t("المواد", "Materials"), material: material.name, style: t("بصمة الأسلوب", "Style Profile"),
    questions: t("الأسئلة", "Questions"), generate: t("إعداد التوليد", "Generation setup"), progress: t("مسار بناء الامتحان", "Generation progress"), results: t("نتائج التوليد", "Generation results"),
    review: t("مراجعة الأسئلة", "Question review"), editor: t("تحرير السؤال", "Question editor"), history: t("سجل الإصدارات", "Version history"),
    exams: t("الامتحانات", "Exams"), builder: t("منشئ الامتحان", "Exam Builder"), finalize: t("النسخة النهائية", "Finalized version"),
    export: t("التصدير", "Export"), settings: t("الحساب والإعدادات", "Account & settings"),
  };

  const globalNav = [
    { id: "dashboard" as View, label: t("الرئيسية", "Dashboard"), icon: Home },
    { id: "courses" as View, label: t("كل المساقات", "All courses"), icon: GraduationCap },
    { id: "settings" as View, label: t("الحساب والإعدادات", "Account & settings"), icon: Settings },
  ];
  const courseNav = [
    { id: "course" as View, label: t("نظرة عامة", "Overview"), icon: Layers3 },
    { id: "materials" as View, label: t("المواد", "Materials"), icon: FileText },
    { id: "questions" as View, label: t("الأسئلة", "Questions"), icon: BookOpen },
    { id: "exams" as View, label: t("الامتحانات", "Exams"), icon: FileCheck2 },
    { id: "style" as View, label: t("بصمة الأسلوب", "Style Profile"), icon: Sparkles },
  ];
  const isCourseView = ["course", "materials", "material", "style", "questions", "generate", "progress", "results", "review", "editor", "history", "exams", "builder", "finalize", "export"].includes(view);
  const heading = (eyebrow: string, title: string, subtitle: string, right?: ReactNode) => <div className="axp-heading"><div><small>{eyebrow}</small><h1>{title}</h1><p>{subtitle}</p></div>{right}</div>;
  const SectionHeading = ({ icon, title, subtitle, right }: { icon: ReactNode; title: string; subtitle?: string; right?: ReactNode }) => <div className="axp-section-heading"><div className="axp-section-icon">{icon}</div><div><h2>{title}</h2>{subtitle && <small>{subtitle}</small>}</div>{right && <div className="axp-section-right">{right}</div>}</div>;

  const renderDashboard = () => {
    const needsMaterial = courseMaterials.filter(item => item.status === "needs_attention");
    const needsQuestions = pendingQuestions.length;
    return <>
      {heading(t("مساحة العمل", "Workspace"), t("مرحباً، د. سلمى", "Welcome, Dr. Salma"), t("مساحة عملك الأكاديمية، مع المهام التي تحتاج إلى قرارك.", "Your academic workspace, focused on work that needs your decision."), btn(t("إنشاء مساق", "Create course"), () => go("courses"), true, <Plus />))}
      <section className="axp-panel axp-attention-panel">
        <SectionHeading icon={<AlertCircle />} title={t("يحتاج انتباهك", "Needs your attention")} subtitle={t("تظهر هنا العناصر القابلة للتصرف فقط ضمن بيانات النموذج.", "Only actionable items from the demo fixture appear here.")} />
        <div className="axp-attention-grid">
          {needsMaterial.length > 0 && <button onClick={() => go("materials")}><AlertCircle /><span><b>{t("مادة تحتاج إلى مراجعة", "A material needs attention")}</b><small>{needsMaterial[0].name} · {needsMaterial[0].note}</small></span><ChevronLeft /></button>}
          {needsQuestions > 0 && <button onClick={() => go("questions")}><BookOpen /><span><b>{t("أسئلة بانتظار قرارك", "Questions await your decision")}</b><small>{needsQuestions} · {t("تحتاج إلى مراجعة بشرية", "Require instructor review")}</small></span><ChevronLeft /></button>}
          {needsMaterial.length === 0 && needsQuestions === 0 && <p className="axp-muted">{t("لا توجد عناصر تحتاج إلى انتباه الآن.", "Nothing currently needs your attention.")}</p>}
        </div>
      </section>
      <section className="axp-section">
        <SectionHeading icon={<GraduationCap />} title={t("مساقاتك", "Your courses")} subtitle={t("اختر مساقاً لفتح مساحة العمل الخاصة به.", "Select a course to open its contextual workspace.")} right={btn(t("عرض الكل", "View all"), () => go("courses"))} />
        <div className="axp-course-grid">{courses.map((item, index) => <button className="axp-course-card" key={item.id} onClick={() => selectCourse(item.id)}><span className={`axp-course-art art-${index}`}><GraduationCap /></span><b>{item.name}</b><small>{item.department} · {item.year}</small><span className="axp-course-card-foot">{materials.filter(file => file.courseId === item.id).length} {t("مواد", "materials")}<ChevronLeft /></span></button>)}</div>
      </section>
      <section className="axp-panel">
        <SectionHeading icon={<Clock3 />} title={t("النشاط الأخير", "Recent activity")} subtitle={t("أحداث توضيحية وليست سجلاً إنتاجياً.", "Illustrative demo events, not a production audit log.")} />
        <div className="axp-activity"><div><FileText /><span><b>{t("تم فتح معاينة مادة", "Material preview opened")}</b><small>{course.name} · demo</small></span></div><div><CheckCircle2 /><span><b>{t("قرار مراجعة سابق", "Prior review decision")}</b><small>{course.name} · demo</small></span></div></div>
      </section>
    </>;
  };

  const renderCourses = () => <>
    {heading(t("مساحة العمل", "Workspace"), t("كل المساقات", "All courses"), t("إدارة المساقات وفتح مساحة كل مساق بصورة مستقلة.", "Manage courses and open each course in its own workspace."), btn(t("إنشاء مساق", "Create course"), () => toastNow(t("نقطة دخول إنشاء المساق معروضة؛ حقول الإنشاء غير مخترعة في هذا النموذج.", "The create-course entry point is shown; unspecified creation fields are not invented.")), true, <Plus />))}
    <div className="axp-toolbar"><label className="axp-search"><Search /><input value={courseSearch} onChange={event => setCourseSearch(event.target.value)} placeholder={t("ابحث عن مساق", "Search courses")} /></label><select value={courseSort} onChange={event => setCourseSort(event.target.value as "name" | "department")}><option value="name">{t("ترتيب حسب الاسم", "Sort by name")}</option><option value="department">{t("ترتيب حسب القسم", "Sort by department")}</option></select><div className="axp-view-switch"><button className={courseMode === "grid" ? "active" : ""} onClick={() => setCourseMode("grid")}><LayoutGrid />{t("شبكة", "Grid")}</button><button className={courseMode === "list" ? "active" : ""} onClick={() => setCourseMode("list")}><List />{t("قائمة", "List")}</button></div></div>
    <div className={courseMode === "grid" ? "axp-course-grid" : "axp-course-list"}>{coursesFiltered.map((item, index) => <button className="axp-course-card" key={item.id} onClick={() => selectCourse(item.id)}><span className={`axp-course-art art-${index}`}><GraduationCap /></span><b>{item.name}</b><small>{item.department} · {item.year}</small><span className="axp-course-card-foot">{materials.filter(file => file.courseId === item.id).length} {t("مواد", "materials")}<ChevronLeft /></span></button>)}</div>
    {!coursesFiltered.length && <div className="axp-empty"><FolderOpen /><b>{t("لا توجد نتائج", "No matching courses")}</b><p>{t("غيّر عبارة البحث وحاول مجدداً.", "Change the search term and try again.")}</p></div>}
  </>;

  const renderCourse = () => {
    const nextMaterial = courseMaterials.find(item => item.status === "needs_attention");
    const nextQuestion = pendingQuestions[0];
    const nextAction = nextMaterial ? { label: t("مراجعة مادة", "Review a material"), view: "materials" as View } : nextQuestion ? { label: t("مراجعة الأسئلة", "Review questions"), view: "questions" as View } : { label: t("إعداد امتحان", "Prepare an exam"), view: "generate" as View };
    return <>
      <div className="axp-course-hero"><span><GraduationCap /></span><div><small>{course.department}</small><h1>{course.name}</h1><p>{course.year} · {course.chapters.length} {t("فصول في بيانات النموذج", "demo chapters")}</p></div>{btn(t("إعداد امتحان", "Prepare exam"), () => go("generate"), true, <Sparkles />)}</div>
      <section className="axp-next-action"><div><Sparkles /><span><small>{t("الخطوة التالية", "Next best action")}</small><b>{nextAction.label}</b></span></div>{btn(t("متابعة", "Continue"), () => go(nextAction.view))}</section>
      <div className="axp-state-dimensions">
        <div><small>{t("حالة المواد", "Materials state")}</small><b>{courseMaterials.some(item => item.status === "needs_attention") ? t("يحتاج انتباهاً", "Needs attention") : courseMaterials.some(item => item.status === "processing") ? t("قيد المعالجة", "Processing") : courseMaterials.length ? t("جاهز", "Ready") : t("لا توجد مواد", "No materials")}</b><span>{courseMaterials.length} · {t("مواد", "materials")}</span></div>
        <div><small>{t("حالة المراجعة", "Review state")}</small><b>{pendingQuestions.length ? t("بانتظار قرار الأستاذ", "Awaiting instructor") : t("لا توجد مراجعات معلقة", "No pending review")}</b><span>{courseQuestions.length} · {t("أسئلة", "questions")}</span></div>
        <div><small>{t("حالة الامتحان", "Exam state")}</small><b>{examState === "Draft" ? t("مسودة", "Draft") : t("نهائي", "Finalized")}</b><span>{snapshots.length} · {t("نسخ نهائية محفوظة", "finalized snapshots")}</span></div>
      </div>
      <div className="axp-two-panels">
        <section className="axp-panel"><SectionHeading icon={<BookOpen />} title={t("الفصول والنطاق", "Chapters and scope")} subtitle={t("خرائط فهرس موثقة ضمن بيانات العرض التجريبية.", "Verified TOC mappings in the demo fixture.")} />{course.chapters.map(chapter => <div className="axp-row" key={chapter.id}><BookOpen /><span><b>{chapter.name}</b><small>{t("الصفحات", "Pages")} {chapter.pages}</small></span><Pill tone={chapter.verified ? "green" : "amber"}>{chapter.verified ? t("فهرس موثّق", "Verified TOC") : t("يتطلب تحديد الصفحات", "Page range required")}</Pill></div>)}</section>
        <section className="axp-panel"><SectionHeading icon={<FileText />} title={t("المواد", "Materials")} subtitle={`${courseMaterials.length} ${t("مواد في بيانات العرض", "demo materials")}`} right={btn(t("فتح المواد", "Open materials"), () => go("materials"))} />{courseMaterials.slice(0, 4).map(item => <div className="axp-row" key={item.id}><span className="axp-file-type">{item.format}</span><span><b>{item.name}</b><small>{item.chapter}</small></span>{statusPill(item.status)}</div>)}</section>
      </div>
    </>;
  };

  const renderMaterials = () => <>
    {heading(course.name, t("مواد المساق", "Course materials"), t("مصادرك الأكاديمية وحالة معالجتها ضمن هذا المساق.", "Academic sources and their processing state in this course."), btn(t("إضافة مادة", "Add material"), () => setUploadOpen(true), true, <UploadCloud />))}
    <div className="axp-upload-rule"><ShieldCheck /><div><b>{t("مسار رفع آمن", "Secure upload path")}</b><p>{t("الصيغ المدعومة: PDF وDOCX وPPTX", "Supported formats: PDF, DOCX and PPTX")} · {t("يتم التحقق من الحجم وMagic Bytes ثم الفحص الأمني قبل التخزين الدائم.", "Size and Magic Bytes are validated, then malware scanning occurs before durable storage.")}</p><small>{t("شريحة الاستخراج الأولى تبدأ بملفات PDF النصية. OCR والصفحات الممسوحة مستبعدة.", "The first extraction slice starts with text-based PDFs. OCR and scanned pages are excluded.")}</small></div></div>
    <div className="axp-toolbar"><label className="axp-search"><Search /><input value={materialSearch} onChange={event => { setMaterialSearch(event.target.value); setMaterialPageIndex(0); }} placeholder={t("ابحث في المواد", "Search materials")} /></label><div className="axp-filters"><select value={materialFilter} onChange={event => { setMaterialFilter(event.target.value as "all" | MaterialStatus); setMaterialPageIndex(0); }}><option value="all">{t("كل الحالات", "All statuses")}</option><option value="ready">{t("جاهز", "Ready")}</option><option value="processing">{t("قيد المعالجة", "Processing")}</option><option value="needs_attention">{t("يحتاج انتباهاً", "Needs attention")}</option></select><select value={materialSort} onChange={event => setMaterialSort(event.target.value as "newest" | "name")}><option value="newest">{t("الأحدث أولاً", "Latest update")}</option><option value="name">{t("الاسم", "Name")}</option></select></div></div>
    <div className="axp-table-wrap"><table className="axp-table"><thead><tr><th>{t("المادة", "Material")}</th><th>{t("الصيغة", "Format")}</th><th>{t("الفصل", "Chapter")}</th><th>{t("الحالة", "Status")}</th><th>{t("آخر تحديث", "Updated")}</th><th>{t("إجراءات", "Actions")}</th></tr></thead><tbody>{materialsPaged.map(item => <tr key={item.id} onClick={() => { setSelectedMaterialId(item.id); setMaterialDrawerOpen(true); }}><td><span className="axp-file-type">{item.format}</span><b>{item.name}<small>{item.pages} {t("صفحة/شريحة", "pages/slides")}</small></b></td><td>{item.format}</td><td>{item.chapter}</td><td>{statusPill(item.status)}</td><td dir="ltr">{item.updated}</td><td><button className="axp-icon-btn" aria-label={t("تفاصيل المادة", "Material details")} onClick={event => { event.stopPropagation(); setSelectedMaterialId(item.id); setMaterialDrawerOpen(true); }}><MoreHorizontal /></button></td></tr>)}</tbody></table>{!materialsPaged.length && <div className="axp-empty"><FolderOpen />{t("لا توجد مواد مطابقة.", "No matching materials.")}</div>}</div>
    <div className="axp-pagination"><span>{materialsFiltered.length} {t("نتائج محلية تجريبية", "local demo results")}</span><div><button disabled={!materialPageIndex} onClick={() => setMaterialPageIndex(index => Math.max(0, index - 1))}>{t("السابق", "Previous")}</button><span>{materialPageIndex + 1}</span><button disabled={(materialPageIndex + 1) * 5 >= materialsFiltered.length} onClick={() => setMaterialPageIndex(index => index + 1)}>{t("التالي", "Next")}</button></div></div>
    <p className="axp-demo-note"><InfoIcon />{t("الجدول والترقيم محاكاة محلية؛ لا يوجد استعلام أو رفع ملفات فعلي.", "The table and pagination are local simulation; no real query or file upload is connected.")}</p>
  </>;

  const renderMaterial = () => <>
    {heading(t("مساحة المادة", "Material workspace"), material.name, material.note, btn(t("العودة إلى المواد", "Back to materials"), () => go("materials"), false, <ArrowRight />))}
    <div className="axp-material-split"><aside className="axp-outline"><h2>{t("التنقل في المصدر", "Source outline")}</h2>{Array.from({ length: Math.min(material.pages, 12) }, (_, index) => <button className={materialPage === index + 1 ? "active" : ""} key={index} onClick={() => setMaterialPage(index + 1)}><FileText />{t("صفحة", "Page")} {index + 1}</button>)}</aside><section className="axp-pdf-view"><div className="axp-pdf-bar"><b>{t("معاينة المصدر", "Source preview")}</b><span>{t("الصفحة", "Page")} {materialPage}</span><button onClick={() => toastNow(t("هذه معاينة تخطيطية وليست وثيقة حقيقية.", "This is a layout preview, not a real document."))}><Eye />{t("معاينة", "Preview")}</button></div>{material.generationEligible ? <article className="axp-paper"><small>{course.name} · {material.name} · v1 · demo</small><h2>{t("تنظيم ضغط الدم الشرياني", "Arterial Pressure Regulation")}</h2><p>The cardiovascular system maintains tissue perfusion through coordinated changes in cardiac output and peripheral resistance. Arteriolar diameter is one determinant of peripheral resistance.</p><blockquote>{evidenceSeed.text}</blockquote><p>{t("هذا المقتطف نص تجريبي لشرح معاينة الصفحة والمرجع الدقيق.", "This excerpt is demo text to illustrate the page preview and exact locator.")}</p><footer>{material.name} · Page {materialPage} · {t("بيانات تجريبية", "demo data")}</footer></article> : <article className="axp-paper axp-paper-not-ready"><FileText /><h2>{t("لا توجد معاينة نصية مؤهلة", "No eligible text preview")}</h2><p>{material.note}</p><p>{t("لا يتم عرض محتوى مستخرج وهمي أو استخدام هذه المادة كدليل لتوليد الأسئلة.", "No fabricated extracted text is shown and this material cannot be used as generation evidence.")}</p><footer>{material.name} · {material.format} · demo</footer></article>}<div className="axp-source-inspector"><b>{t("تفاصيل الاستخراج", "Extraction details")}</b><span>{material.generationEligible ? t("يتوفر نص PDF في بيانات العرض.", "Text-based PDF is available in this fixture.") : t("هذه المادة ليست مؤهلة للتوليد في شريحة MVP المعروضة.", "This material is not generation-eligible in the shown MVP slice.")}</span></div></section></div>
  </>;

  const renderStyle = () => <>
    {heading(course.name, t("بصمة أسلوب الأستاذ", "Professor Style Profile"), t("ملف أسلوب مثبت للسياق الأكاديمي في المقرر.", "A pinned style profile for the course's academic context."))}
    <div className="axp-style-banner"><span><Sparkles /></span><div><Pill tone="green">{t("نسخة متاحة", "Available version")}</Pill><h2>Style Profile v1.3</h2><p>{t("تُستخدم النسخة المثبتة في طلب التوليد وفق عقد M6.", "The pinned version is used in generation requests under the M6 contract.")}</p></div></div>
    <div className="axp-two-panels"><section className="axp-panel"><SectionHeading icon={<BookOpen />} title={t("ملامح الأسلوب", "Style characteristics")} />{[[t("الصياغة", "Wording"), t("رسمية ومباشرة", "Formal and direct")], [t("مستوى التفاصيل", "Detail level"), t("متوسط", "Moderate")], [t("الأنماط المرصودة", "Observed formats"), "MCQ · Essay"], [t("حالة الملف", "Profile mode"), t("قراءة فقط", "Read only")]].map(([label, value]) => <div className="axp-row" key={label}><span>{label}</span><b>{value}</b></div>)}</section><section className="axp-panel"><SectionHeading icon={<ShieldCheck />} title={t("حدود التعلم في MVP", "MVP learning boundary")} /><div className="axp-capture-note"><b>{t("التقاط الملاحظات فقط", "Capture only")}</b><p>{t("يمكن تسجيل ملاحظات التعديل، لكنها لا تُستهلك لتغيير التوليد ولا تحدّث Style Profile تلقائياً.", "Edit observations may be captured, but they are not consumed to alter generation and do not automatically update the Style Profile.")}</p></div><div className="axp-version-list"><div><b>v1.3</b><Pill tone="green">{t("الحالية", "Current")}</Pill></div><div><b>v1.2</b><small>{t("نسخة سابقة محفوظة", "Prior version preserved")}</small></div><div><b>v1.1</b><small>{t("نسخة سابقة محفوظة", "Prior version preserved")}</small></div></div></section></div>
  </>;

  const renderGenerate = () => <>
    {heading(course.name, t("إعداد التوليد", "Generation setup"), t("حدد النطاق وتوزيع MCQ وEssay؛ سيبقى كل سؤال بانتظار مراجعتك.", "Choose the scope and distribute MCQ and Essay; every question remains subject to your review."))}
    <div className="axp-generation-layout"><div className="axp-main-stack">
      <section className="axp-panel"><SectionHeading icon={<Layers3 />} title={t("المادة والنطاق المطلوب", "Material and requested scope")} subtitle={t("مصدر النطاق: فهرس محتويات موثّق أو نطاق صفحات يحدده الأستاذ.", "Scope must come from a verified TOC mapping or a professor-selected page range.")} /><label className="axp-source-select">{t("المادة المصدر", "Source material")}<select value={selectedMaterialId} onChange={event => setSelectedMaterialId(event.target.value)}>{courseMaterials.filter(item => item.generationEligible).map(item => <option key={item.id} value={item.id}>{item.name} · {item.format}</option>)}</select>{!courseMaterials.some(item => item.generationEligible) && <small>{t("لا توجد مادة PDF نصية مؤهلة في بيانات هذا المساق.", "No eligible text-based PDF material is available in this course fixture.")}</small>}</label>
        <div className="axp-choice-row"><label><input type="radio" checked={scopeSource === "toc"} onChange={() => { setScopeSource("toc"); setScopeConfirmed(false); }} />{t("فهرس محتويات موثّق", "Verified table of contents")}</label><label><input type="radio" checked={scopeSource === "pages"} onChange={() => { setScopeSource("pages"); setScopeConfirmed(false); }} />{t("نطاق صفحات يحدده الأستاذ", "Professor-selected page range")}</label></div>
        {scopeSource === "pages" && <div className="axp-page-range"><label>{t("من صفحة", "From page")}<input type="number" min={1} value={pageFrom} onChange={event => { setPageFrom(Number(event.target.value)); setScopeConfirmed(false); }} /></label><label>{t("إلى صفحة", "To page")}<input type="number" min={pageFrom} value={pageTo} onChange={event => { setPageTo(Number(event.target.value)); setScopeConfirmed(false); }} /></label></div>}
        <div className="axp-chapter-checks">{course.chapters.map(chapter => <label key={chapter.id}><input type="checkbox" checked={selectedChapters.includes(chapter.id)} onChange={() => toggleChapter(chapter.id)} /><span><b>{chapter.name}</b><small>{chapter.pages} · {chapter.verified ? t("فهرس موثّق", "verified TOC") : t("يتطلب نطاق صفحات", "page range required")}</small></span></label>)}</div>
      </section>
      <section className="axp-panel"><SectionHeading icon={<List />} title={t("توزيع الأسئلة حسب الفصل", "Per-chapter question distribution")} subtitle={t("توزيع MCQ وEssay مدعوم لكل فصل ضمن الطلب نفسه.", "MCQ and Essay counts can be distributed per chapter in the same request.")} />
        <div className="axp-count-chapters">{course.chapters.filter(chapter => selectedChapters.includes(chapter.id)).map(chapter => <div className="axp-count-chapter" key={chapter.id}><div><b>{chapter.name}</b><small>{chapter.pages}</small></div><label>{t("MCQ", "MCQ")}<input type="number" min={0} max={30} value={plans[chapter.id]?.mcq ?? 0} onChange={event => updatePlan(chapter.id, "mcq", Number(event.target.value))} /></label><label>{t("Essay", "Essay")}<input type="number" min={0} max={30} value={plans[chapter.id]?.essay ?? 0} onChange={event => updatePlan(chapter.id, "essay", Number(event.target.value))} /></label><b className="axp-chapter-total">{(plans[chapter.id]?.mcq ?? 0) + (plans[chapter.id]?.essay ?? 0)}</b></div>)}{!selectedChapters.length && <div className="axp-empty">{t("اختر فصلاً لتوزيع الأسئلة.", "Select a chapter to distribute questions.")}</div>}</div>
        <div className="axp-total-row"><span>{t("إجمالي الأسئلة", "Total questions")}</span><b>{total} / 30</b></div><p className="axp-inline-note">{t("الحد الأقصى 30 سؤالاً للطلب الواحد. لا توجد أنواع أسئلة أخرى في العقد الحالي.", "Maximum 30 questions per request. No other question types are in the current contract.")}</p>
      </section>
      <section className="axp-panel"><SectionHeading icon={<Settings />} title={t("طريقة العرض", "Presentation mode")} /><div className="axp-view-switch"><button className={mode === "standard" ? "active" : ""} onClick={() => setMode("standard")}>{t("قياسي", "Standard")}</button><button className={mode === "advanced" ? "active" : ""} onClick={() => setMode("advanced")}>{t("متقدم", "Advanced")}</button></div><p className="axp-inline-note">{t("الوضع المتقدم يعيد ترتيب الحقول نفسها فقط؛ لا يضيف مدخلات أو سلوكاً جديداً لعقد M6.", "Advanced only rearranges the same fields; it adds no request fields or behavior to the M6 contract.")}</p><div className="axp-mandatory-row"><ShieldCheck /><span><b>{t("المصدر والتتبّع إلزاميان دائماً", "Citation and provenance are always required")}</b><small>{t("لا يوجد خيار لتعطيلهما.", "There is no control to disable them.")}</small></span><Pill tone="green">{t("إلزامي", "Required")}</Pill></div><div className="axp-mandatory-row"><Sparkles /><span><b>{t("Style Profile v1.3 مثبتة", "Style Profile v1.3 pinned")}</b><small>{t("تُستخدم النسخة المعتمدة مع الطلب.", "The accepted profile version is pinned to the request.")}</small></span><Pill tone="blue">v1.3</Pill></div><div className="axp-mandatory-row"><Layers3 /><span><b>{t("الصعوبة المقترحة", "Suggested difficulty")}</b><small>{t("ليست مدخلاً للأستاذ؛ تظهر كاقتراح في ناتج السؤال.", "Not an instructor input; it appears as an output suggestion per question.")}</small></span></div></section>
    </div><aside className="axp-main-stack"><section className="axp-panel axp-summary"><SectionHeading icon={<FileCheck2 />} title={t("ملخص الطلب", "Request summary")} /><div className="axp-summary-line"><span>{t("المساق", "Course")}</span><b>{course.name}</b></div><div className="axp-summary-line"><span>{t("النطاق المطلوب", "Requested scope")}</span><b>{scopeText || t("لم يحدد", "Not selected")}</b></div><div className="axp-summary-line"><span>{t("الأسئلة", "Questions")}</span><b>{total}</b></div><div className="axp-summary-line"><span>MCQ</span><b>{selectedChapters.reduce((sum, id) => sum + (plans[id]?.mcq ?? 0), 0)}</b></div><div className="axp-summary-line"><span>Essay</span><b>{selectedChapters.reduce((sum, id) => sum + (plans[id]?.essay ?? 0), 0)}</b></div><div className="axp-summary-line"><span>{t("مصدر التوليد", "Generation source")}</span><b>{material && material.courseId === courseId && material.generationEligible ? material.name : t("لا يوجد مصدر مؤهل", "No eligible source")}</b></div><Pill tone="blue">{mode === "standard" ? t("الوضع القياسي", "Standard mode") : t("ترتيب متقدم للحقول", "Advanced field arrangement")}</Pill>
        <div className="axp-mandatory-row"><ShieldCheck /><span>{t("سيبقى كل سؤال في انتظار مراجعة الأستاذ.", "Every question remains pending instructor review.")}</span></div>
        {coverage === 100 && <Pill tone="green">100% · {t("يمكن المتابعة بالنطاق المطلوب", "Proceed with exact requested scope")}</Pill>}
        {coverage >= 80 && coverage < 100 && <div className="axp-coverage-warning"><Pill tone="amber">{coverage}% · {t("تأكيد مطلوب", "Confirmation required")}</Pill><div><b>{t("النطاق المطلوب", "Requested scope")}</b><span>{scopeText}</span></div><div><b>{t("النطاق الفعلي الأضيق", "Narrower effective scope")}</b><span>{effectiveScope}</span></div><p>{t("لن يبدأ الطلب قبل تأكيدك الصريح للنطاق الأضيق.", "The request will not start until you explicitly confirm the narrower scope.")}</p>{btn(t("تأكيد النطاق المدعوم", "Confirm supported scope"), () => setScopeConfirmed(true), true, <Check />, scopeConfirmed)}{scopeConfirmed && <Pill tone="green">{t("تم التأكيد؛ يمكنك بدء الطلب.", "Confirmed; you may start the request.")}</Pill>}</div>}
        {coverage < 80 && <div className="axp-blocked-note"><AlertCircle />{t("التغطية أقل من 80%. لن تُنشأ مهمة ولن تُحجز حصة ولن يتم الاتصال بمزوّد.", "Coverage is below 80%. No job, quota reservation or provider call will be made.")}</div>}
        {btn(t("بدء التوليد التجريبي", "Start demo generation"), runGeneration, true, <Sparkles />, total < 1 || total > 30 || coverage < 80 || (coverage < 100 && !scopeConfirmed) || !material?.generationEligible || material.courseId !== courseId)}
        <p className="axp-demo-note">{t("محاكاة محلية فقط؛ لا يوجد اتصال بخدمة توليد أو حجز حقيقي.", "Local simulation only; no generation service or real reservation is connected.")}</p>
      </section>
      <details className="axp-qa-details" open={qaOpen} onToggle={event => setQaOpen((event.currentTarget as HTMLDetailsElement).open)}><summary>{t("حالات معاينة QA فقط", "QA preview fixtures only")}</summary><div><label>{t("تغطية النطاق", "Scope coverage")}<select value={coverageFixture} onChange={event => { setCoverageFixture(event.target.value as "full" | "partial" | "blocked"); setScopeConfirmed(false); }}><option value="full">100%</option><option value="partial">92%</option><option value="blocked">72%</option></select></label><label>{t("نتيجة التوليد", "Generation result")}<select value={resultFixture} onChange={event => setResultFixture(event.target.value as "success" | "partial" | "failed")}><option value="success">{t("نجاح كامل", "Full success")}</option><option value="partial">{t("نجاح جزئي", "Partial success")}</option><option value="failed">{t("فشل كامل", "Full failure")}</option></select></label><small>{t("هذه أدوات لإظهار حالات المواصفة في النموذج وليست إعدادات منتج.", "These controls expose spec states in the prototype; they are not product settings.")}</small></div></details>
    </aside></div>
  </>;

  const renderProgress = () => {
    const steps = [
      t("تجهيز المادة", "Prepare material"),
      t("استخراج المقاطع المناسبة", "Retrieve relevant passages"),
      t("تطبيق بصمة الأستاذ", "Apply professor style"),
      t("توليد الأسئلة", "Draft questions"),
      t("فحص الاستشهادات", "Check citations"),
      t("تجهيز المراجعة", "Prepare review"),
    ];
    return <section className="axp-progress-shell">
      <div className="axp-progress-kicker"><span className="axp-brand-mark">A</span><span>{t("إعداد مسودة · نموذج توضيحي", "Draft preparation · visual demo")}</span><Pill tone="blue">{t("مسار توضيحي", "Illustrative flow")}</Pill></div>
      <h1>{t("جاري بناء الامتحان", "Building the exam draft")}</h1>
      <p className="axp-progress-intro">{t("تعرض هذه الشاشة مراحل تجهيز المسودة قبل انتقالك إلى مراجعة الأسئلة. لا يتم تشغيل نموذج ذكاء اصطناعي أو عملية خلفية حقيقية في هذا النموذج.", "This screen presents the stages that prepare a draft before you review its questions. No AI model or real background job is running in this prototype.")}</p>
      <div className="axp-progress-summary"><span><Activity />{course.name}</span><i /><span>{scopeText || t("النطاق المحدد", "Selected scope")}</span><i /><b>{total} {t("سؤالاً", "questions")}</b></div>
      <div className="axp-progress-visual" aria-hidden="true">
        <span className="axp-progress-orbit orbit-one" /><span className="axp-progress-orbit orbit-two" />
        <span className="axp-progress-core"><b>A</b><small>AXIOM</small></span>
        <span className="axp-progress-node node-one"><FileText /></span><span className="axp-progress-node node-two"><Sparkles /></span><span className="axp-progress-node node-three"><ShieldCheck /></span>
      </div>
      <div className="axp-progress-timeline">{steps.map((step, index) => <div className={`axp-progress-step ${index < 3 ? "done" : index === 3 ? "active" : "upcoming"}`} key={step}><span>{index < 3 ? <Check /> : index === 3 ? <i /> : <b>{index + 1}</b>}</span><small>{step}</small></div>)}</div>
      <div className="axp-progress-trust"><ShieldCheck /><span>{t("سيبقى كل سؤال مسودة بانتظار مراجعتك وقرارك؛ لا يعتمد Axiom أي سؤال تلقائياً.", "Every question remains a draft until your review and decision; Axiom never approves questions automatically.")}</span></div>
      <p className="axp-progress-demo-note">{t("الحالة هنا تمثيل بصري للمراحل فقط، وليست مؤشراً حياً للتقدم أو دليلاً على تنفيذ التوليد.", "This is a visual representation of the stages only, not live progress or proof of a running generation job.")}</p>
      <div className="axp-progress-actions">{btn(t("العودة إلى إعداد الامتحان", "Back to exam setup"), () => go("generate"))}{btn(t("الانتقال إلى نتائج المعاينة", "Continue to preview results"), () => go("results"), true, <ArrowLeft />)}</div>
    </section>;
  };

  const renderResults = () => {
    if (!result) return <div className="axp-empty"><Sparkles /><b>{t("لا توجد نتائج بعد", "No results yet")}</b>{btn(t("العودة إلى الإعداد", "Back to setup"), () => go("generate"))}</div>;
    return <>
      {heading(course.name, t("نتائج طلب التوليد", "Generation results"), t("تعرض النتيجة لكل خانة طلب؛ تبقى الأسئلة المحفوظة مستقلة عن الخانات الفاشلة.", "Each request slot has its own outcome; persisted questions remain independent of failed slots."), btn(t("طلب جديد", "New request"), () => go("generate"), false, <Plus />))}
      <section className="axp-panel"><div className="axp-result-status"><Pill tone={result.state === "succeeded" ? "green" : result.state === "partially_succeeded" ? "amber" : "red"}>{result.state === "succeeded" ? t("نجاح كامل", "Succeeded") : result.state === "partially_succeeded" ? t("نجاح جزئي", "Partially succeeded") : result.state === "blocked" ? t("محجوب قبل إنشاء المهمة", "Blocked before job creation") : t("فشل كامل", "Failed")}</Pill><b>{result.settled} / {result.requested} {t("أسئلة حُفظت للمراجعة", "questions persisted for review")}</b></div>
        {result.state === "blocked" && <div className="axp-blocked-note"><AlertCircle />{t("لم تُنشأ مهمة ولم تُحجز أي وحدة ولم يتم الاتصال بمزوّد AI لأن التغطية أقل من 80%.", "No job was created, no units were reserved and no provider was called because coverage was below 80%.")}</div>}
        {result.slots.length > 0 && <div className="axp-slot-list">{result.slots.map(slot => <div className="axp-slot" key={slot.index}><span className="axp-slot-num">{slot.index}</span>{slot.status === "persisted" ? <CheckCircle2 className="success-icon" /> : slot.status === "failed_transient" ? <Clock3 className="warning-icon" /> : <AlertCircle className="danger-icon" />}<div><b>{slot.status === "persisted" ? t("حُفظ السؤال للمراجعة", "Question persisted for review") : slot.status === "failed_transient" ? t("فشل مؤقت في هذه الخانة", "Transient failure in this slot") : t("فشل نهائي في هذه الخانة", "Terminal failure in this slot")}</b><small>{slot.status === "persisted" ? slot.questionId : slot.status === "failed_transient" ? t("ضمن سياسة إعادة المحاولة المحدودة التي يديرها النظام.", "Handled by the bounded system-managed retry policy.") : t("لا يعرض النموذج إجراء Retry للأستاذ؛ القرار ما زال محجوباً.", "No professor Retry action is exposed; terminal retry remains blocked.")}</small></div><Pill tone={slot.status === "persisted" ? "green" : slot.status === "failed_transient" ? "amber" : "red"}>{slot.status === "persisted" ? t("محفوظ", "Persisted") : t("فشل", "Failed")}</Pill></div>)}</div>}
      </section>
      <section className="axp-panel"><SectionHeading icon={<Layers3 />} title={t("تسوية وحدات الطلب", "Request-unit settlement")} subtitle={t("وفق ADR-041: وحدة واحدة لكل سؤال صالح محفوظ بحالة pending_review.", "Under ADR-041: one unit per valid question durably persisted as pending_review.")} /><div className="axp-settlement-grid"><div><small>{t("المحجوز", "Reserved")}</small><b>{result.reserved}</b></div><div><small>{t("تمت تسويته", "Settled")}</small><b>{result.settled}</b></div><div><small>{t("تم تحريره", "Released")}</small><b>{result.released}</b></div></div><p className="axp-inline-note">{t("الخانات الفاشلة أو غير المستخدمة تُحرر. رفض الأستاذ لاحقاً لا يعيد الوحدة التي تمت تسويتها.", "Failed or unused slots are released. A later instructor rejection does not refund a settled unit.")}</p><p className="axp-inline-note">{t("التعافي المتكرر idempotent ولا يعيد إنشاء السؤال المحفوظ أو تسوية وحدته مرة ثانية.", "Idempotent recovery does not recreate persisted questions or settle their units twice.")}</p></section>
      <div className="axp-two-actions">{btn(t("فتح الأسئلة المحفوظة", "Review persisted questions"), () => go("questions"), true, <BookOpen />, result.settled === 0)}{btn(t("إعداد طلب جديد", "Prepare a new request"), () => go("generate"), false, <Plus />)}</div>
    </>;
  };

  const renderQuestions = () => <>
    {heading(course.name, t("الأسئلة", "Questions"), t("بنك الأسئلة ضمن سياق المقرر؛ راجع حالة السؤال وأهلية الدليل بصورة منفصلة.", "The question bank is course-scoped; review question state and evidence eligibility separately."), <div className="axp-heading-actions">{btn(t("اعتماد المؤهل فقط", "Approve eligible only"), bulkApprove, false, <Check />)}{btn(t("إعداد امتحان", "Build an exam"), () => go("builder"), true, <FileCheck2 />)}</div>)}
    <div className="axp-toolbar"><label className="axp-search"><Search /><input value={questionSearch} onChange={event => setQuestionSearch(event.target.value)} placeholder={t("ابحث في الأسئلة", "Search questions")} /></label><select value={questionFilter} onChange={event => setQuestionFilter(event.target.value as "all" | QStatus)}><option value="all">{t("كل الحالات", "All states")}</option><option value="pending_review">{t("بانتظار المراجعة", "Pending review")}</option><option value="approved">{t("معتمد", "Approved")}</option><option value="rejected">{t("مرفوض", "Rejected")}</option></select></div>
    <div className="axp-question-bank">{questionsFiltered.map(item => <button className="axp-question-bank-row" key={item.id} onClick={() => { setSelectedQuestionId(item.id); go("review"); }}><span className="axp-question-index">{item.id}</span><span className="axp-question-bank-copy"><b>{versionOf(item).text}</b><small>{item.kind} · {item.chapterId} · {t("الإصدار", "Version")} {versionOf(item).version}</small></span><span>{statusPill(item.status)}</span><Pill tone={eligible(item) ? "green" : "amber"}>{eligible(item) ? t("دليل مؤهل", "Eligible evidence") : t("دليل يحتاج الانتباه", "Evidence needs attention")}</Pill></button>)}</div>
    {!questionsFiltered.length && <div className="axp-empty"><BookOpen /><b>{t("لا توجد أسئلة مطابقة.", "No matching questions.")}</b></div>}
    <div className="axp-inline-note">{t("بيانات الأسئلة تجريبية. لا توجد نتائج AI حقيقية أو مخزن إنتاجي في هذا النموذج.", "Question data is illustrative. No real AI output or production store is connected.")}</div>
  </>;

  const renderReview = () => {
    if (!courseQuestions.length) return <>{heading(course.name, t("مراجعة الأسئلة", "Question review"), t("لا توجد أسئلة في هذا المقرر ضمن بيانات النموذج.", "There are no questions in this course fixture."))}<div className="axp-panel axp-empty"><BookOpen /><b>{t("لا توجد أسئلة للمراجعة.", "No questions to review.")}</b>{btn(t("إعداد طلب توليد", "Prepare a generation request"), () => go("generate"), true, <Sparkles />)}</div></>;
    return <>
    <div className="axp-review-heading"><div><small>{t("مراجعة بشرية مطلوبة", "Instructor review required")}</small><h1>{t("مراجعة الأسئلة", "Question review")}</h1><p>{course.name} · {courseQuestions.length} {t("أسئلة في بيانات العرض", "demo questions")}</p></div><div className="axp-heading-actions">{btn(t("قائمة الأسئلة", "Question list"), () => go("questions"))}{btn(t("اعتماد المؤهل فقط", "Approve eligible only"), bulkApprove, true, <Check />)}</div></div>
    <div className="axp-review-workspace">
      <aside className="axp-panel axp-review-list">
        <SectionHeading icon={<List />} title={t("قائمة الأسئلة", "Question list")} subtitle={`${courseQuestions.length} ${t("سؤالاً في بيانات العرض", "demo questions")}`} />
        <label className="axp-review-search"><Search /><input value={questionSearch} onChange={event => setQuestionSearch(event.target.value)} placeholder={t("ابحث في الأسئلة", "Search questions")} /></label>
        <select className="axp-review-filter" aria-label={t("تصفية حالة السؤال", "Filter question status")} value={questionFilter} onChange={event => setQuestionFilter(event.target.value as "all" | QStatus)}>
          <option value="all">{t("كل الحالات", "All statuses")}</option>
          <option value="pending_review">{t("بانتظار المراجعة", "Pending review")}</option>
          <option value="approved">{t("معتمد", "Approved")}</option>
          <option value="rejected">{t("مرفوض", "Rejected")}</option>
        </select>
        <div className="axp-review-items">
          {questionsFiltered.map(item => <button className={`axp-review-item ${question.id === item.id ? "active" : ""}`} key={item.id} onClick={() => setSelectedQuestionId(item.id)}>
            <span className="axp-question-index">{item.id.slice(-3)}</span>
            <span className="axp-review-item-copy"><b>{versionOf(item).text}</b><small>{item.kind} · {statusText(item.status)}</small></span>
            <span className={`axp-review-dot ${item.status}`} aria-label={statusText(item.status)} />
          </button>)}
          {!questionsFiltered.length && <div className="axp-review-list-empty">{t("لا توجد أسئلة تطابق البحث أو الحالة المحددة.", "No questions match this search or status filter.")}</div>}
        </div>
        <p className="axp-review-list-note">{t("قرار المراجعة يبقى مستقلاً لكل سؤال؛ حالة السؤال لا تعني أن الدليل صحيح تلقائياً.", "Each question has its own review decision; question status does not imply valid evidence.")}</p>
      </aside>
      <main className="axp-panel axp-question-main"><div className="axp-question-main-head"><div><Pill tone="blue">{question.kind}</Pill><Pill tone={statusTone(question.status)}>{statusText(question.status)}</Pill></div><span>{t("الإصدار", "Version")} {current.version}</span></div><h2>{current.text}</h2>
        {question.kind === "MCQ" ? <div className="axp-option-list">{current.options.map((option, index) => <div className={`axp-option ${index === current.correct ? "correct" : ""}`} key={`${question.id}-${index}`}><span>{String.fromCharCode(65 + index)}</span><p>{option}</p>{index === current.correct && <Pill tone="green">{t("الإجابة المحددة", "Marked answer")}</Pill>}</div>)}</div> : <div className="axp-essay-preview"><b>{t("سؤال مقالي", "Essay prompt")}</b><p>{t("تُراجع الإجابة النموذجية والتفسير مع النص ومصدره.", "The model answer and explanation are reviewed with the question and its source.")}</p></div>}
        <div className="axp-question-metadata"><div><small>{t("الصعوبة المقترحة", "Suggested difficulty")}</small><b>{current.suggestedDifficulty}</b></div><div><small>{t("مراجعة يدوية", "Manual review")}</small><b>{question.manualReview ? t("مطلوبة", "Required") : t("غير مطلوبة", "Not required")}</b></div><div><small>{t("حالة السؤال", "Question state")}</small><b>{statusText(question.status)}</b></div><div><small>{t("أهلية الدليل", "Evidence eligibility")}</small><b>{eligible(question) ? t("مؤهل مبدئياً", "Eligible") : t("غير مؤهل", "Not eligible")}</b></div></div>
        <div className="axp-review-actions">{btn(question.status === "approved" ? t("معتمد", "Approved") : t("اعتماد السؤال", "Approve question"), () => approveQuestion(question), true, <Check />, question.status === "approved" || !eligible(question))}{btn(t("تعديل السؤال", "Edit question"), () => openEditor(question), false, <Pencil />)}{btn(t("رفض السؤال", "Reject question"), () => rejectQuestion(question), false, <X />, question.status === "rejected")}{btn(t("سجل الإصدارات", "Version history"), () => go("history"), false, <History />)}</div>
        {!eligible(question) && <p className="axp-blocked-note"><AlertCircle />{question.evidence.type !== "PROSE" ? t("هذا الدليل ليس PROSE؛ لذلك لا يدخل ضمن أهلية استرجاع Generation v1.", "This evidence is not PROSE, so it is outside Generation v1 retrieval eligibility.") : question.evidence.quality !== "verified" ? t("جودة الدليل ليست verified؛ الاعتماد الجماعي والفردي محجوب.", "Evidence quality is not verified; individual and bulk approval are blocked.") : t("مرجع المصدر لا يطابق موضعاً موجوداً في نسخة المادة.", "The source locator does not resolve to an existing location in the material version.")}</p>}
      </main>
      <aside className="axp-panel axp-evidence-panel"><SectionHeading icon={<ShieldCheck />} title={t("أدلة المصدر", "Source evidence")} subtitle={t("مرجع المصدر ومعاينته", "Source locator and preview")} /><div className="axp-evidence-source"><b>{question.evidence.name}</b><small>{t("الإصدار", "Version")} {question.evidence.version}</small></div><div className="axp-evidence-grid"><div><small>{t("الصفحة", "Page")}</small><b>{question.evidence.page}</b></div><div><small>{t("مرجع المقطع", "Block locator")}</small><b dir="ltr">{question.evidence.block}</b></div><div><small>{t("نوع الدليل", "Evidence type")}</small><b>{question.evidence.type}</b></div><div><small>{t("جودة الدليل", "Evidence quality")}</small><b>{question.evidence.quality}</b></div></div><div className="axp-locator-status"><span>{t("سلامة المرجع", "Locator integrity")}</span><Pill tone={question.evidence.locatorExists ? "green" : "red"}>{question.evidence.locatorExists ? t("الموضع موجود", "Locator exists") : t("الموضع غير موجود", "Locator missing")}</Pill></div><div className="axp-passage"><small>{t("النص المستشهد به", "Cited passage")}</small><p>{question.evidence.text}</p></div><div className="axp-semantic-note"><b>{t("الدعم الدلالي", "Semantic support")}</b><p>{t("يُراجع معنى الاستشهاد منفصلاً عن وجود الصفحة/المقطع. لا تعرض هذه المعاينة تصنيفاً دلالياً أو نسبة غير معتمدة.", "Whether the passage supports the question is assessed separately from locator existence. This preview does not invent a semantic enum or confidence percentage.")}</p></div>{btn(t("فتح صفحة المصدر", "Open source page"), () => { const found = materials.find(item => item.id === question.evidence.materialId); if (found) { setSelectedMaterialId(found.id); setMaterialPage(question.evidence.page); go("material"); } }, false, <Eye />)}</aside>
    </div>
  </>;
  };

  const renderEditor = () => <>
    {heading(course.name, t("تحرير السؤال", "Edit question"), t("يحفظ التعديل كنسخة جديدة ولا يستبدل النسخ السابقة.", "Save edits as a new immutable version; prior versions remain intact."), <Pill tone="blue">v{current.version} → v{current.version + 1}</Pill>)}
    {editDraft && <section className="axp-panel axp-editor-form"><label>{t("نص السؤال", "Question text")}<textarea value={editDraft.text} onChange={event => setEditDraft({ ...editDraft, text: event.target.value })} /></label>{question.kind === "MCQ" && <><b>{t("الخيارات", "Options")}</b>{editDraft.options.map((option, index) => <div className="axp-edit-option" key={index}><input value={option} onChange={event => setEditDraft({ ...editDraft, options: editDraft.options.map((value, i) => i === index ? event.target.value : value) })} /><label><input type="radio" checked={editDraft.correct === index} onChange={() => setEditDraft({ ...editDraft, correct: index })} />{t("الإجابة الصحيحة", "Correct answer")}</label></div>)}</>}<label>{t("تفسير الإجابة", "Answer explanation")}<textarea value={editDraft.explanation} onChange={event => setEditDraft({ ...editDraft, explanation: event.target.value })} /></label><div className="axp-readonly-row"><span>{t("الصعوبة المقترحة", "Suggested difficulty")}</span><b>{editDraft.suggestedDifficulty}</b><small>{t("إشارة ناتج وليست مدخلاً لإعداد التوليد.", "Output suggestion, not a generation request input.")}</small></div><div className="axp-two-actions">{btn(t("حفظ كإصدار جديد", "Save as new version"), saveVersion, true, <Check />)}{btn(t("إلغاء", "Cancel"), () => { setEditDraft(null); go("review"); })}</div></section>}
  </>;

  const renderHistory = () => <>
    {heading(course.name, t("سجل إصدارات السؤال", "Question version history"), t("كل تعديل ينشئ نسخة غير قابلة للتغيير؛ النسخة الأصلية تبقى محفوظة.", "Each edit creates an immutable version; the original remains preserved."), btn(t("العودة للمراجعة", "Back to review"), () => go("review")))}
    <section className="axp-panel"><div className="axp-history-head"><div><b>{question.id}</b><small>{question.kind} · {question.evidence.name}</small></div><Pill tone="blue">{question.versions.length} {t("إصدارات", "versions")}</Pill></div><div className="axp-version-timeline">{[...question.versions].reverse().map((version, index) => <article key={version.id}><span className="timeline-dot" /><div><b>v{version.version} {index === 0 ? t("الحالية", "Current") : ""}</b><small>{version.id}</small><p>{version.text}</p><span>{t("الصعوبة المقترحة", "Suggested difficulty")}: {version.suggestedDifficulty}</span></div></article>)}</div></section>
  </>;

  const renderExams = () => {
    const currentDraftCount = examState === "Draft" ? 1 : 0;
    return <>
      {heading(course.name, t("الامتحانات", "Exams"), t("مسودات الامتحانات والنسخ النهائية الخاصة بهذا المساق.", "Exam drafts and finalized versions for this course."), btn(examState === "Draft" ? t("إنشاء / متابعة امتحان", "Create / continue exam") : t("إنشاء مراجعة جديدة", "Create new revision"), () => { if (examState === "Draft") go("builder"); else createNewRevision(); }, true, <Plus />))}
      <section className="axp-exam-summary" aria-label={t("ملخص سير عمل الامتحانات", "Exam workflow summary")}>
        <div><small>{t("المسودات الحالية", "Current drafts")}</small><b>{currentDraftCount}</b><span>{t("مسودة قيد الإعداد", "Draft in preparation")}</span></div>
        <div><small>{t("النسخ النهائية", "Finalized versions")}</small><b>{snapshots.length}</b><span>{t("لقطات محفوظة وغير قابلة للتغيير", "Preserved immutable snapshots")}</span></div>
        <div><small>{t("أسئلة بانتظار قرارك", "Questions awaiting your decision")}</small><b>{pendingQuestions.length}</b><span>{t("تتطلب مراجعة بشرية", "Require instructor review")}</span></div>
        <div><small>{t("أسئلة معتمدة متاحة", "Approved questions available")}</small><b>{approvedQuestions.length}</b><span>{t("صالحة للإضافة إلى مسودة", "Eligible to add to a draft")}</span></div>
      </section>
      <section className="axp-panel">
        <SectionHeading icon={<FileCheck2 />} title={t("مسودة الامتحان", "Exam draft")} subtitle={t("الامتحان الحالي وسير العمل التالي.", "Current exam draft and its next step.")} />
        <article className="axp-exam-record">
          <span className="axp-exam-record-icon"><FileCheck2 /></span>
          <div className="axp-exam-record-copy"><b>{examTitle}</b><small>{course.name} · {t("المراجعة", "Revision")} {revision} · {examItems.length} {t("أسئلة مختارة", "selected questions")}</small><small>{t("بيانات نموذج محلي؛ لا تمثل امتحانات حقيقية.", "Local demo state; not real exam records.")}</small></div>
          <Pill tone={examState === "Draft" ? "amber" : "green"}>{examState === "Draft" ? t("مسودة", "Draft") : t("نهائي", "Finalized")}</Pill>
          {btn(examState === "Draft" ? t("متابعة الإعداد", "Continue setup") : t("عرض النسخة النهائية", "View finalized version"), () => go(examState === "Draft" ? "builder" : "finalize"), false, <ArrowLeft />)}
        </article>
      </section>
      <section className="axp-panel">
        <SectionHeading icon={<History />} title={t("سجل النسخ النهائية", "Finalized versions")} subtitle={t("كل نسخة نهائية تحفظ أسئلتها وترتيبها وبياناتها كما كانت عند التثبيت.", "Each finalized version preserves its questions, order and composition as finalized.")} />
        {snapshots.map(snapshot => <article className="axp-exam-record" key={snapshot.number}>
          <span className="axp-exam-record-icon finalized"><LockKeyhole /></span>
          <div className="axp-exam-record-copy"><b>{snapshot.title}</b><small>{course.name} · Snapshot v{snapshot.number} · Revision {snapshot.revision} · {snapshot.items.length} {t("أسئلة", "questions")}</small><small>{snapshot.createdAt.slice(0, 10)} · {t("نسخة ثابتة", "Immutable snapshot")}</small></div>
          <Pill tone="green">{t("نهائي", "Finalized")}</Pill>
          {btn(t("عرض التصدير", "View exports"), () => { setSelectedSnapshotNumber(snapshot.number); go("export"); }, false, <Download />)}
        </article>)}
        {!snapshots.length && <div className="axp-empty"><FileCheck2 /><b>{t("لا توجد نسخ نهائية بعد.", "No finalized snapshots yet.")}</b><p>{t("ستظهر هنا بعد اعتماد الأسئلة وتركيب المسودة وتثبيت نسخة الامتحان.", "Finalized versions appear here after composing a draft and finalizing it.")}</p></div>}
        <p className="axp-exam-lifecycle-note">{t("دورة حياة الامتحان: Draft ← Finalized. التصدير حدث للملف وليس حالة جديدة للامتحان؛ إعادة التصدير لا تغيّر النسخة النهائية.", "Exam lifecycle: Draft → Finalized. Export is an artifact event, not a new exam state; re-exporting does not change the finalized version.")}</p>
      </section>
      {pendingQuestions.length > 0 && <section className="axp-panel axp-exam-next-review"><SectionHeading icon={<ShieldCheck />} title={t("توجد أسئلة تنتظر قرارك", "Questions need your decision")} subtitle={t("لا ينتقل أي سؤال إلى منشئ الامتحان قبل اعتمادك له.", "No question enters the exam builder before your approval.")} right={btn(t("فتح مساحة مراجعة الأسئلة", "Open question review"), () => go("questions"), true, <BookOpen />)} /></section>}
    </>;
  };

  const renderBuilder = () => <>
    {heading(course.name, t("منشئ الامتحان", "Exam Builder"), t("اختر الأسئلة المعتمدة، رتّبها، وثبّت نسخة السؤال المختارة.", "Select approved questions, arrange them and pin the selected question versions."), <Pill tone="amber">Draft · Revision {revision}</Pill>)}
    {examState === "Finalized" && <p className="axp-blocked-note">{t("النسخة نهائية وغير قابلة للتعديل. أنشئ Draft revision جديدة للمتابعة.", "This version is finalized and immutable. Create a new Draft revision to continue.")}{btn(t("إنشاء مراجعة جديدة", "Create new revision"), createNewRevision)}</p>}
    <section className="axp-panel"><label className="axp-title-field">{t("عنوان الامتحان", "Exam title")}<input value={examTitle} disabled={examState !== "Draft"} onChange={event => setExamTitle(event.target.value)} /></label><p className="axp-inline-note">{t("منشئ الامتحان ليس محرراً للأسئلة؛ عدّل النص والخيارات في مساحة Question Review.", "The Exam Builder is not a question editor; edit text and options in Question Review.")}</p></section>
    <div className="axp-builder-grid"><section className="axp-panel"><SectionHeading icon={<BookOpen />} title={t("الأسئلة المعتمدة المتاحة", "Available approved questions")} /><div className="axp-available-list">{approvedQuestions.map(item => <div className="axp-available-item" key={item.id}><div><b>{versionOf(item).text}</b><small>{item.id} · {versionOf(item).id} · {item.kind}</small></div>{btn(t("إضافة", "Add"), () => addExamQuestion(item), false, <Plus />, examState !== "Draft" || examItems.some(row => row.questionId === item.id))}</div>)}{!approvedQuestions.length && <div className="axp-empty">{t("لا توجد أسئلة معتمدة ومؤهلة في هذا المقرر.", "No approved eligible questions are available in this course.")}</div>}</div></section>
      <section className="axp-panel"><SectionHeading icon={<Layers3 />} title={t("تركيب المسودة", "Draft composition")} subtitle={`${examItems.length} ${t("أسئلة", "questions")}`} />{examItems.map((row, index) => { const item = questions.find(q => q.id === row.questionId); if (!item) return null; const latestVersion = versionOf(item); const newer = latestVersion.id !== row.versionId; return <div className="axp-builder-item" key={row.questionId}><div className="axp-builder-item-top"><span>{index + 1}</span><div><b>{latestVersion.text}</b><small>{row.questionId} · {t("النسخة المثبتة", "Pinned version")} {row.versionId}</small></div></div>{newer && <div className="axp-new-version"><AlertCircle />{t("توجد نسخة أحدث معتمدة.", "A newer approved version is available.")}{btn(t("استبدال النسخة صراحةً", "Explicitly replace version"), () => replacePinnedVersion(item.id), false, <Check />, examState !== "Draft")}</div>}<div className="axp-composition-controls"><label>{t("القسم", "Section")}<select value={row.section} disabled={examState !== "Draft"} onChange={event => setExamItems(old => old.map((value, i) => i === index ? { ...value, section: event.target.value } : value))}><option value="A">A</option><option value="B">B</option><option value="C">C</option></select></label><label>{t("العلامات", "Marks")}<input type="number" min={0} value={row.marks} disabled={examState !== "Draft"} onChange={event => setExamItems(old => old.map((value, i) => i === index ? { ...value, marks: Math.max(0, Number(event.target.value)) } : value))} /></label><div className="axp-order-actions"><button title={t("تحريك لأعلى", "Move up")} disabled={examState !== "Draft" || index === 0} onClick={() => moveExamItem(index, -1)}><ArrowUp /></button><button title={t("تحريك لأسفل", "Move down")} disabled={examState !== "Draft" || index === examItems.length - 1} onClick={() => moveExamItem(index, 1)}><ArrowDown /></button><button title={t("إزالة", "Remove")} disabled={examState !== "Draft"} onClick={() => setExamItems(old => old.filter(value => value.questionId !== row.questionId))}><Trash2 /></button></div></div></div>; })}{!examItems.length && <div className="axp-empty">{t("أضف سؤالاً معتمداً من القائمة الأخرى.", "Add an approved question from the other list.")}</div>}</section></div>
    <div className="axp-builder-footer"><span>{t("كل عنصر يثبت question_version_id المختار. لا يحدث الاستبدال تلقائياً.", "Each item pins its selected question_version_id. Replacement is never automatic.")}</span>{btn(t("إنهاء وحفظ Snapshot", "Finalize and save snapshot"), finalizeExam, true, <LockKeyhole />, examState !== "Draft" || !examItems.length)}</div>
  </>;

  const renderFinalize = () => <>
    {heading(course.name, t("لقطة نهائية ثابتة", "Immutable finalized snapshot"), t("تم تثبيت ترتيب الأسئلة ونسخها وبيانات التركيب في نسخة مرقّمة.", "Question order, pinned versions and composition metadata are fixed in a numbered version."), <Pill tone="green">{t("نهائي", "Finalized")}</Pill>)}
    {currentSnapshot && <section className="axp-panel"><div className="axp-snapshot-header"><div><small>Snapshot v{currentSnapshot.number}</small><h2>{currentSnapshot.title}</h2><p>{currentSnapshot.items.length} {t("أسئلة مثبتة", "pinned questions")} · Revision {currentSnapshot.revision}</p></div><span><LockKeyhole /></span></div>{currentSnapshot.items.map((row, index) => { const item = questions.find(q => q.id === row.questionId); const selectedVersion = item?.versions.find(version => version.id === row.versionId); return <div className="axp-row" key={`${row.questionId}-${row.versionId}`}><b>{index + 1}.</b><span><b>{selectedVersion?.text ?? row.questionId}</b><small>{row.versionId} · Section {row.section} · {row.marks} {t("علامات", "marks")}</small></span><Pill tone="green">{t("مثبت", "Pinned")}</Pill></div>; })}<div className="axp-two-actions">{btn(t("إعداد التصدير", "Prepare exports"), () => go("export"), true, <Download />)}{btn(t("إنشاء Draft revision جديدة", "Create a new Draft revision"), createNewRevision, false, <Plus />)}</div></section>}
    <section className="axp-panel"><SectionHeading icon={<History />} title={t("سجل النسخ النهائية", "Finalized version history")} />{snapshots.map(snapshot => <div className="axp-row" key={snapshot.number}><FileCheck2 /><span><b>{snapshot.title} · v{snapshot.number}</b><small>{snapshot.items.length} {t("أسئلة", "questions")} · Revision {snapshot.revision}</small></span><Pill tone="green">{t("غير قابلة للتغيير", "Immutable")}</Pill></div>)}</section>
  </>;

  const renderExport = () => <>
    {heading(course.name, t("تصدير الامتحان", "Exam export"), selectedSnapshot ? `${selectedSnapshot.title} · Snapshot v${selectedSnapshot.number}` : t("لا يوجد Snapshot نهائي محدد للتصدير.", "No finalized snapshot is selected for export."))}
    {!selectedSnapshot ? <section className="axp-panel axp-empty"><LockKeyhole /><b>{t("اختر نسخة نهائية محفوظة؛ لا يمكن تصدير Draft.", "Select a preserved finalized snapshot; Drafts cannot be exported.")}</b>{snapshots.map(snapshot => btn(`${snapshot.title} · v${snapshot.number}`, () => setSelectedSnapshotNumber(snapshot.number)))}{btn(t("العودة إلى منشئ الامتحان", "Back to Exam Builder"), () => go("builder"))}</section> : <>
      <div className="axp-export-grid"><section className={`axp-panel axp-export-card ${exportKind === "student" ? "selected" : ""}`}><span className="axp-export-symbol"><FileText /></span><h2>{t("نسخة الطالب", "Student Exam")}</h2><p>{t("أسئلة وتعليمات الطالب فقط؛ دون إجابات صحيحة أو تفسيرات الأستاذ.", "Student-facing instructions and questions only; no correct answers or instructor explanations.")}</p><button onClick={() => setExportKind("student")}>{exportKind === "student" ? t("محدد", "Selected") : t("اختيار", "Select")}</button></section><section className={`axp-panel axp-export-card ${exportKind === "answer" ? "selected" : ""}`}><span className="axp-export-symbol"><BookOpen /></span><h2>{t("مفتاح إجابة الأستاذ", "Instructor Answer Key")}</h2><p>{t("الإجابات الصحيحة أو النموذجية والتفسيرات والعلامات.", "Correct/model answers, explanations and marks.")}</p><Pill tone="amber">{t("صلاحية أستاذ المقرر مطلوبة", "Course-instructor authorization required")}</Pill><button onClick={() => setExportKind("answer")}>{exportKind === "answer" ? t("محدد", "Selected") : t("اختيار", "Select")}</button></section></div>
      <section className="axp-panel"><SectionHeading icon={<Download />} title={t("صيغة الملف", "File format")} subtitle={t("يُنشأ كلا الملفين من Snapshot النهائي نفسه وبتنسيق Axiom ثابت.", "Both artifacts use the same finalized snapshot and a fixed Axiom layout.")} /><div className="axp-view-switch"><button className={exportFormat === "PDF" ? "active" : ""} onClick={() => setExportFormat("PDF")}>PDF</button><button className={exportFormat === "DOCX" ? "active" : ""} onClick={() => setExportFormat("DOCX")}>DOCX</button></div><div className="axp-export-access"><LockKeyhole /><span>{exportKind === "answer" ? t("يتطلب مفتاح الإجابة صلاحية أستاذ المقرر/المالك، وتُفحص صلاحية الوصول في الخادم.", "The Answer Key requires current course-instructor/owner authorization, enforced server-side.") : t("لا تتضمن نسخة الطالب إجابات أو تفسيرات الأستاذ.", "The Student Exam excludes answers and instructor explanations.")}</span></div>{btn(t("معاينة إجراء التصدير", "Preview export action"), exportArtifact, true, <Download />)}<p className="axp-demo-note">{t("هذا Prototype فقط؛ لا يتم إنشاء ملف PDF أو DOCX فعلياً.", "Prototype only; no actual PDF or DOCX file is generated.")}</p></section>
    </>}
  </>;

  const renderSettings = () => <>
    {heading(t("مساحة العمل", "Workspace"), t("الحساب والإعدادات", "Account & settings"), t("إعدادات العرض المحلية للنموذج التفاعلي.", "Local display preferences for the interactive prototype."))}
    <section className="axp-panel"><SectionHeading icon={<Globe2 />} title={t("اللغة والاتجاه", "Language and direction")} /><div className="axp-language-choice"><button className={locale === "ar" ? "active" : ""} onClick={() => setLocale("ar")}>العربية · RTL</button><button className={locale === "en" ? "active" : ""} onClick={() => setLocale("en")}>English · LTR</button></div><p className="axp-inline-note">{t("يتغير اتجاه الواجهة ومحتوى المسميات. البيانات الأكاديمية التجريبية قد تحتفظ بمصطلحاتها الأصلية.", "The interface direction and labels change. Demo academic data may retain its original terminology.")}</p></section>
    <section className="axp-panel"><SectionHeading icon={<ShieldCheck />} title={t("حدود النموذج", "Prototype boundaries")} /><div className="axp-capture-note"><b>{t("لا يوجد Backend أو تخزين دائم", "No backend or persistent storage")}</b><p>{t("كل التفاعلات محلية ومخصصة لمراجعة تجربة المستخدم. لا توجد صلاحيات أو رفع أو توليد أو تصدير فعلي.", "All interactions are local and intended for UX review. No real authorization, upload, generation or export service is connected.")}</p></div></section>
    <details className="axp-qa-details"><summary>{t("معرض حالات الواجهة — QA فقط", "UI state gallery — QA only")}</summary><div className="axp-state-gallery"><article><Pill tone="red">{t("رفض رفع", "Upload rejected")}</Pill><b>{t("ملف غير مدعوم أو مصاب", "Unsupported or infected file")}</b><small>{t("يُرفض قبل التخزين الدائم، ولا يظهر كمادة جاهزة.", "Rejected before durable storage; never shown as a ready material.")}</small></article><article><Pill tone="amber">429</Pill><b>{t("حد أو حصة الطلب", "Request limit / quota")}</b><small>{t("رسالة الحد منفصلة عن الفشل التقني العابر؛ لا نفترض سياسة Retry أو تسوية غير موثقة لهذه الاستجابة.", "Limit response is distinct from transient technical failure; no undocumented retry or settlement behavior is implied.")}</small></article><article><Pill tone="amber">{t("يتطلب مراجعة", "Manual review")}</Pill><b>{t("الدليل يحتاج إلى تحقق", "Evidence requires verification")}</b><small>{t("لا يمكن الاعتماد الجماعي للسؤال غير المؤهل.", "Ineligible questions cannot pass bulk approval.")}</small></article><article><Pill tone="slate">{t("فارغ", "Empty")}</Pill><b>{t("لا توجد بصمة أسلوب بعد", "No Style Profile yet")}</b><small>{t("حالة توضيحية؛ لا يتم إنشاء ملف أو تحديثه تلقائياً.", "Illustrative state; no profile is created or updated automatically.")}</small></article><article><Pill tone="red">{t("تصدير محجوب", "Export blocked")}</Pill><b>{t("لا توجد لقطة Finalized", "No Finalized snapshot")}</b><small>{t("لا يمكن تصدير مسودة Draft.", "A Draft cannot be exported.")}</small></article><article><Pill tone="red">{t("فشل تقني", "Technical failure")}</Pill><b>{t("المزود غير متاح", "Provider unavailable")}</b><small>{t("يُعرض منفصلاً عن استجابة 429؛ إعادة المحاولة محكومة بسياسة النظام فقط.", "Shown separately from 429; retries are governed by system policy only.")}</small></article></div></details>
  </>;

  const content = () => {
    switch (view) {
      case "dashboard": return renderDashboard();
      case "courses": return renderCourses();
      case "course": return renderCourse();
      case "materials": return renderMaterials();
      case "material": return renderMaterial();
      case "style": return renderStyle();
      case "questions": return renderQuestions();
      case "generate": return renderGenerate();
      case "progress": return renderProgress();
      case "results": return renderResults();
      case "review": return renderReview();
      case "editor": return renderEditor();
      case "history": return renderHistory();
      case "exams": return renderExams();
      case "builder": return renderBuilder();
      case "finalize": return renderFinalize();
      case "export": return renderExport();
      case "settings": return renderSettings();
      default: return renderDashboard();
    }
  };

  return <div className={`axp-app ${locale === "en" ? "locale-en" : "locale-ar"}`} dir={dir}>
    <aside className={`axp-sidebar ${mobileOpen ? "open" : ""}`}>
      <div className="axp-brand"><span className="axp-brand-mark">A</span><div><b>Axiom</b><small>{t("مساحة الأستاذ", "Professor Workspace")}</small></div></div>
      <div className="axp-sidebar-section"><small>{t("مساحة العمل", "Workspace")}</small>{globalNav.map(item => { const Icon = item.icon; return <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => go(item.id)}><Icon /><span>{item.label}</span></button>; })}</div>
      <div className="axp-current-course"><small>{t("المساق الحالي", "Current course")}</small><button onClick={() => go("course")}><span className="axp-course-mini"><GraduationCap /></span><span><b>{course.name}</b><em>{course.department}</em></span><ChevronDown /></button></div>
      <div className="axp-sidebar-section course-nav"><small>{t("مساحة المساق", "Course workspace")}</small>{courseNav.map(item => { const Icon = item.icon; return <button key={item.id} className={view === item.id || (item.id === "questions" && ["review", "editor", "history"].includes(view)) || (item.id === "exams" && ["generate", "progress", "results", "builder", "finalize", "export"].includes(view)) || (item.id === "materials" && view === "material") ? "active" : ""} onClick={() => go(item.id)}><Icon /><span>{item.label}</span>{item.id === "questions" && pendingQuestions.length > 0 && <i className="axp-nav-count">{pendingQuestions.length}</i>}</button>; })}</div>
      <div className="axp-sidebar-foot"><div className="axp-profile"><span>س</span><div><b>د. سلمى أحمد</b><small>{t("مالك المقرر · الخطة الشخصية", "Course owner · Personal Plan")}</small></div><MoreHorizontal /></div><p>{t("بيانات تجريبية · لا يوجد اتصال إنتاجي", "Demo data · no production connection")}</p></div>
    </aside>
    {mobileOpen && <button className="axp-mobile-scrim" aria-label={t("إغلاق القائمة", "Close navigation")} onClick={() => setMobileOpen(false)} />}
    <div className="axp-main-shell">
      <header className="axp-topbar"><button className="axp-mobile-menu" onClick={() => setMobileOpen(open => !open)} aria-label={t("فتح القائمة", "Open menu")}><Menu /></button><div className="axp-breadcrumb"><span>Axiom</span><ChevronLeft /><b>{pageTitle[view]}</b></div><div className="axp-topbar-actions"><Pill tone="blue">{t("نموذج تفاعلي · بيانات تجريبية", "Interactive prototype · demo data")}</Pill><button className="axp-language-toggle" onClick={() => setLocale(locale === "ar" ? "en" : "ar")}><Globe2 />{locale === "ar" ? "EN" : "ع"}</button><button className="axp-avatar-btn" onClick={() => go("settings")} aria-label={t("الحساب", "Account")}>س</button></div></header>
      <main className="axp-main-content">{content()}</main>
    </div>
    <nav className="axp-mobile-bottom">{[{ id: "dashboard" as View, label: t("الرئيسية", "Home"), icon: Home }, { id: "course" as View, label: t("المساق", "Course"), icon: GraduationCap }, { id: "materials" as View, label: t("المواد", "Materials"), icon: FileText }, { id: "questions" as View, label: t("الأسئلة", "Questions"), icon: BookOpen }].map(item => { const Icon = item.icon; return <button key={item.id} className={view === item.id || (item.id === "questions" && ["review", "editor", "history"].includes(view)) ? "active" : ""} onClick={() => go(item.id)}><Icon /><span>{item.label}</span></button>; })}</nav>
    {materialDrawerOpen && <div className="axp-drawer-backdrop" role="presentation" onClick={() => setMaterialDrawerOpen(false)}><aside className="axp-material-drawer" role="dialog" aria-modal="true" aria-labelledby="axp-material-drawer-title" onClick={event => event.stopPropagation()}><button className="axp-modal-close" onClick={() => setMaterialDrawerOpen(false)} aria-label={t("إغلاق", "Close")}><X /></button><small>{t("تفاصيل المادة", "Material details")}</small><h2 id="axp-material-drawer-title">{material.name}</h2><div className="axp-drawer-meta"><span>{material.format}</span><span>{material.pages} {t("صفحة/شريحة", "pages/slides")}</span>{statusPill(material.status)}</div><p>{material.note}</p><div className="axp-drawer-rule"><b>{t("أهلية التوليد", "Generation eligibility")}</b><span>{material.generationEligible ? t("PDF نصي جاهز في بيانات العرض.", "Text-based PDF fixture marked ready.") : t("ليست جاهزة للتوليد في شريحة MVP المعروضة.", "Not generation-ready in the shown MVP slice.")}</span></div>{btn(t("فتح مساحة المادة", "Open material workspace"), () => openMaterial(material), true, <Eye />)}{btn(t("إغلاق", "Close"), () => setMaterialDrawerOpen(false))}</aside></div>}
    {uploadOpen && <div className="axp-modal-backdrop" role="presentation" onClick={() => setUploadOpen(false)}><section className="axp-modal" role="dialog" aria-modal="true" aria-labelledby="axp-upload-title" onClick={event => event.stopPropagation()}><button className="axp-modal-close" onClick={() => setUploadOpen(false)} aria-label={t("إغلاق", "Close")}><X /></button><UploadCloud /><h2 id="axp-upload-title">{t("إضافة مادة", "Add material")}</h2><p>{t("الصيغ المدعومة PDF وDOCX وPPTX. التحقق من الحدود وMagic Bytes والفحص الأمني يسبق التخزين الدائم.", "Supported formats are PDF, DOCX and PPTX. Size, Magic Bytes and malware checks precede durable storage.")}</p><div className="axp-file-chips"><Pill tone="blue">PDF</Pill><Pill tone="blue">DOCX</Pill><Pill tone="blue">PPTX</Pill></div><label className="axp-qa-upload-select">{t("حالة QA التوضيحية", "QA preview case")}<select value={uploadCase} onChange={event => setUploadCase(event.target.value as "accepted" | "rejected")}><option value="accepted">{t("صيغة مدعومة / فحص ناجح (مثال)", "Supported format / scan passed (example)")}</option><option value="rejected">{t("ملف غير صالح / مرفوض", "Invalid file / rejected")}</option></select></label>{uploadCase === "rejected" ? <div className="axp-blocked-note"><AlertCircle />{t("تم رفض الملف قبل التخزين الدائم. لن يظهر في قائمة المواد ولن يكون قابلاً للتنزيل أو المعالجة.", "The file is rejected before durable storage. It does not appear in Materials and is not downloadable or processable.")}</div> : <div className="axp-mandatory-row"><ShieldCheck /><span>{t("يجب أن يسبق التحقق من الحجم وMagic Bytes والفحص الأمني التخزين الدائم.", "Size, Magic Bytes and malware checks must precede durable storage.")}</span></div>}<p className="axp-inline-note">{t("هذا النموذج لا يرفع ملفاً ولا يحفظه. أول شريحة استخراج فعلية هي PDF النصي؛ OCR مؤجل.", "This prototype does not upload or store files. The first real extraction slice is text-based PDF; OCR is deferred.")}</p>{btn(t("إغلاق المعاينة", "Close preview"), () => setUploadOpen(false), true)}</section></div>}
    {toast && <div className="axp-toast" role="status"><CheckCircle2 />{toast}</div>}
    <span className="axp-hidden-context">{isCourseView ? course.name : t("مساحة العمل العامة", "Global workspace")}</span>
  </div>;
}

function InfoIcon() { return <CircleHelp size={16} />; }