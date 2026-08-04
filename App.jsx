import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, LineChart, Line,
} from "recharts";
import * as XLSX from "xlsx";
import {
  LayoutDashboard, FilePlus2, Wallet, Database, Wrench, AlertTriangle,
  Search, Trash2, X, Plus, ChevronLeft, TrendingUp, TrendingDown,
  Building2, Fuel, ClipboardList, CheckCircle2, UploadCloud, FileSpreadsheet,
  MapPin, BarChart3, Filter, ShieldCheck, Loader2, Printer, ArrowLeft, Sparkles, Pencil, ListChecks, Menu, Sun, Moon,
} from "lucide-react";
import { db, auth } from "./firebase";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";

/* ============================================================
   الرموز والثوابت
============================================================ */
const LIGHT_COLORS = {
  navy: "#0B1524",
  navyLight: "#1E3050",
  navyDeep: "#050A12",
  gold: "#B9862A",
  goldSoft: "#E8C978",
  goldDark: "#8A5F1E",
  teal: "#0E6E64",
  tealSoft: "#CFEAE6",
  cream: "#F6F4EE",
  paper: "#FFFFFF",
  ink: "#141A26",
  slate: "#5B6579",
  slateLight: "#98A1B0",
  border: "#E3DDCE",
  success: "#276B48",
  successBg: "#E5F1EA",
  danger: "#AC4238",
  dangerBg: "#FAEAE8",
};

const DARK_COLORS = {
  navy: "#080D16",
  navyLight: "#16233A",
  navyDeep: "#04070C",
  gold: "#D9AE5C",
  goldSoft: "#8A6B2E",
  goldDark: "#EFCB86",
  teal: "#2CA79A",
  tealSoft: "#123330",
  cream: "#0C121D",
  paper: "#121A29",
  ink: "#EAE7DE",
  slate: "#98A3B4",
  slateLight: "#707B8D",
  border: "#232D42",
  success: "#4CAF7D",
  successBg: "#173327",
  danger: "#E0796C",
  dangerBg: "#3A1E1B",
};

// كائن قابل للتغيير - بتتحدث قيمه عند تبديل الوضع الفاتح/الداكن، وكل المكونات بتقرأه وقت العرض
const COLORS = { ...LIGHT_COLORS };
function applyTheme(theme) {
  Object.assign(COLORS, theme === "dark" ? DARK_COLORS : LIGHT_COLORS);
}

const LOGO_DATA_URI = "data:image/webp;base64,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";

const SOURCES = ["هدي الإسلام", "الكيان الهندسي"];
const CATEGORIES = [
  "أولاً - مصروفات السيارات",
  "ثانياً - صيانة المعدات",
  "خامساً - مصروفات أخرى",
];
const PAYMENT_METHODS = ["نقدي من العهدة", "تحويل بنكي", "شيك"];
const CHART_COLORS = ["#101A2E", "#C69A3C", "#5B7A9E", "#8B9C6E", "#B5453A", "#647085"];

const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;

const fmtMoney = (n) =>
  (Number(n) || 0).toLocaleString("ar-EG", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + " ج.م";

const fmtNum = (n) => (Number(n) || 0).toLocaleString("ar-EG");

const todayISO = () => new Date().toISOString().slice(0, 10);

function classifyVehiclePurpose(purpose = "") {
  if (purpose.includes("كارت") || purpose.includes("ميزان") || purpose.includes("موازين")) return "كارتات وموازين";
  if (purpose.includes("سائق")) return "مصروفات سائقين";
  return "صيانة دورية";
}

/* ============================================================
   تسجيل الدخول والصلاحيات
============================================================ */
function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err) {
      setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div dir="rtl" className="h-screen flex items-center justify-center px-4" style={{ background: COLORS.cream, fontFamily: "'Cairo', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&display=swap');`}</style>
      <form
        onSubmit={submit}
        className="w-full max-w-sm p-6 rounded-2xl border"
        style={{ background: COLORS.paper, borderColor: COLORS.border, boxShadow: "0 8px 30px -10px rgba(16,26,46,0.2)" }}
      >
        <div className="text-center mb-6">
          <div className="font-extrabold text-lg mb-1" style={{ color: COLORS.ink }}>قسم الصيانة والتشغيل</div>
          <div className="text-xs" style={{ color: COLORS.slate }}>سجّل الدخول للمتابعة</div>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: COLORS.slate }}>البريد الإلكتروني</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg text-sm border"
              style={{ borderColor: COLORS.border }}
              dir="ltr"
            />
          </div>
          <div>
            <label className="text-xs font-semibold mb-1 block" style={{ color: COLORS.slate }}>كلمة المرور</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg text-sm border"
              style={{ borderColor: COLORS.border }}
              dir="ltr"
            />
          </div>
          {error && <div className="text-xs font-semibold" style={{ color: COLORS.danger }}>{error}</div>}
          <button
            type="submit"
            disabled={busy}
            className="w-full py-2.5 rounded-lg text-sm font-bold text-white"
            style={{ background: COLORS.navy, opacity: busy ? 0.6 : 1 }}
          >
            {busy ? "جاري الدخول..." : "دخول"}
          </button>
        </div>
      </form>
    </div>
  );
}

function AccessDenied() {
  return (
    <div dir="rtl" className="h-screen flex items-center justify-center px-4" style={{ background: COLORS.cream, fontFamily: "'Cairo', sans-serif" }}>
      <div className="w-full max-w-sm p-6 rounded-2xl border text-center" style={{ background: COLORS.paper, borderColor: COLORS.border }}>
        <div className="font-extrabold text-lg mb-2" style={{ color: COLORS.ink }}>لا يوجد صلاحية لحسابك</div>
        <div className="text-sm mb-4" style={{ color: COLORS.slate }}>تواصل مع مدير النظام لتفعيل صلاحيتك.</div>
        <button
          onClick={() => signOut(auth)}
          className="px-4 py-2 rounded-lg text-sm font-bold text-white"
          style={{ background: COLORS.navy }}
        >
          تسجيل خروج
        </button>
      </div>
    </div>
  );
}


/* ============================================================
   التخزين
============================================================ */
function useStorage(key, initial, shared = true) {
  const [data, setData] = useState(initial);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const ref = doc(db, "maintenance-system", key);
    const unsubscribe = onSnapshot(
      ref,
      (snap) => {
        if (cancelled) return;
        if (snap.exists()) {
          try { setData(JSON.parse(snap.data().value)); } catch (e) { /* تجاهل */ }
        }
        setLoaded(true);
      },
      (err) => {
        console.error("تعذر الاتصال بقاعدة البيانات", err);
        if (!cancelled) setLoaded(true);
      }
    );
    return () => { cancelled = true; unsubscribe(); };
  }, [key]);

  const save = useCallback(async (next) => {
    setData(next);
    try {
      await setDoc(doc(db, "maintenance-system", key), { value: JSON.stringify(next) });
    } catch (e) {
      console.error("تعذر حفظ البيانات", e);
    }
  }, [key]);

  return [data, save, loaded];
}

/* ============================================================
   عناصر واجهة صغيرة
============================================================ */
function KPICard({ label, value, sub, tone = "navy", icon: Icon }) {
  const isGold = tone === "gold";
  const bg = isGold ? `linear-gradient(165deg, ${COLORS.paper}, ${COLORS.cream})` : `linear-gradient(155deg, ${COLORS.navy}, ${COLORS.navyDeep})`;
  const textColor = isGold ? COLORS.ink : "white";
  const labelColor = isGold ? COLORS.slate : "rgba(255,255,255,0.62)";
  const subColor = isGold ? COLORS.slateLight : "rgba(255,255,255,0.55)";
  return (
    <div
      style={{
        background: bg,
        borderRadius: 16,
        border: isGold ? `1px solid ${COLORS.border}` : "none",
        boxShadow: isGold ? "0 2px 4px rgba(16,26,46,0.06), 0 16px 32px -16px rgba(16,26,46,0.22)" : "0 16px 36px -14px rgba(4,7,12,0.55)",
      }}
      className="relative flex-1 min-w-[150px] p-4 md:p-5 overflow-hidden transition-transform duration-200 hover:-translate-y-1"
    >
      <div className="absolute top-0 right-0 left-0 h-[4px]" style={{ background: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.teal})` }} />
      {!isGold && (
        <>
          <div className="absolute -left-8 -top-8 w-28 h-28 rounded-full" style={{ background: "rgba(255,255,255,0.04)" }} />
          <div className="absolute -left-3 -bottom-10 w-24 h-24 rounded-full" style={{ background: "rgba(255,255,255,0.03)" }} />
        </>
      )}
      <div className="relative flex items-center justify-between mb-3.5">
        <span className="text-[11px] font-bold tracking-wide" style={{ color: labelColor, letterSpacing: "0.01em" }}>{label}</span>
        {Icon && (
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: isGold ? `${COLORS.goldSoft}35` : "rgba(255,255,255,0.10)", border: isGold ? `1px solid ${COLORS.gold}66` : "1px solid rgba(255,255,255,0.08)" }}
          >
            <Icon size={15} style={{ color: isGold ? COLORS.gold : "rgba(255,255,255,0.9)" }} />
          </div>
        )}
      </div>
      <div className="relative text-[26px] leading-none font-extrabold tabular-nums" style={{ color: textColor, letterSpacing: "-0.01em" }}>{value}</div>
      {sub && <div className="relative text-xs mt-2" style={{ color: subColor }}>{sub}</div>}
    </div>
  );
}

function SectionCard({ title, action, children, className = "" }) {
  return (
    <div
      className={`rounded-[18px] border overflow-hidden ${className}`}
      style={{ borderColor: COLORS.border, background: COLORS.paper, boxShadow: "0 2px 4px rgba(16,26,46,0.05), 0 16px 32px -18px rgba(16,26,46,0.20)", borderRight: `4px solid ${COLORS.gold}` }}
    >
      {title && (
        <div className="flex items-center justify-between px-5 md:px-6 pt-4 pb-3 border-b" style={{ borderColor: COLORS.border, background: `${COLORS.cream}80` }}>
          <h3 className="font-bold text-[13.5px] flex items-center gap-2.5" style={{ color: COLORS.ink }}>
            <span className="w-1 h-4 rounded-full" style={{ background: `linear-gradient(180deg, ${COLORS.gold}, ${COLORS.teal})` }} />
            {title}
          </h3>
          {action}
        </div>
      )}
      <div className="p-5 md:p-6">{children}</div>
    </div>
  );
}

function Field({ label, children, required }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold mb-1.5" style={{ color: COLORS.slate }}>
        {label} {required && <span style={{ color: COLORS.danger }}>*</span>}
      </span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2";

function TextInput(props) {
  const inputStyle = { borderColor: COLORS.border, background: COLORS.paper, color: COLORS.ink, "--tw-ring-color": COLORS.gold };
  return <input {...props} className={`${inputCls} ${props.className || ""}`} style={{ ...inputStyle, ...props.style }} />;
}
function Select({ children, ...props }) {
  const inputStyle = { borderColor: COLORS.border, background: COLORS.paper, color: COLORS.ink, "--tw-ring-color": COLORS.gold };
  return (
    <select {...props} className={`${inputCls} ${props.className || ""}`} style={{ ...inputStyle, ...props.style }}>
      {children}
    </select>
  );
}

function ExportButtons({ onExcel, onPdf }) {
  return (
    <div className="flex gap-2">
      {onExcel && (
        <button onClick={onExcel} className="px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2" style={{ background: COLORS.cream, color: COLORS.ink }}>
          <FileSpreadsheet size={16} /> تصدير إكسل
        </button>
      )}
      {onPdf && (
        <button onClick={onPdf} className="px-4 py-2.5 rounded-lg text-sm font-bold text-white flex items-center gap-2" style={{ background: COLORS.gold, color: COLORS.navy }}>
          <Printer size={16} /> طباعة / PDF
        </button>
      )}
    </div>
  );
}

function EmptyState({ icon: Icon, title, sub }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3" style={{ background: COLORS.cream }}>
        <Icon size={24} style={{ color: COLORS.slateLight }} />
      </div>
      <div className="font-semibold text-sm" style={{ color: COLORS.ink }}>{title}</div>
      {sub && <div className="text-xs mt-1" style={{ color: COLORS.slateLight }}>{sub}</div>}
    </div>
  );
}

function downloadPrintableHTML(title, bodyHtml, filename) {
  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>${title}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap');
        * { font-family: 'Cairo', sans-serif; box-sizing: border-box; }
        body { margin: 0; direction: rtl; background: #fff; }
        @page { size: A4 portrait; margin: 10mm 8mm; }
        .toolbar { position: sticky; top: 0; background: #101A2E; padding: 14px 16px; display: flex; justify-content: center; gap: 10px; z-index: 10; }
        .toolbar button { background: #C69A3C; color: #101A2E; border: none; border-radius: 8px; padding: 12px 28px; font-weight: 800; font-size: 16px; font-family: 'Cairo', sans-serif; cursor: pointer; }
        .toolbar p { color: #fff; font-size: 12px; margin: 0; align-self: center; }
        .content { margin: 16px; }
        table { border-collapse: collapse; width: 100% !important; min-width: 0 !important; font-size: 11px; }
        th, td { border: 1px solid #999; padding: 5px 7px; }
        @media print { .toolbar { display: none; } .content { margin: 0; } }
      </style>
    </head>
    <body>
      <div class="toolbar">
        <button onclick="window.print()">🖨️ اضغط هنا للطباعة أو الحفظ كـ PDF</button>
        <p>لو الزرار ده مش شغال: من قائمة المتصفح (⋯) اختار "طباعة" أو "Print"</p>
      </div>
      <div class="content">${bodyHtml}</div>
    </body>
    </html>
  `;
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".html") ? filename : `${filename}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

function exportToExcel({ expenses, custodies, revenues }) {
  const custodyLabel = (id) => custodies.find((c) => c.id === id)?.label || "";
  const expenseRows = expenses.map((e) => ({
    "المصدر": e.source, "معرف العهدة": custodyLabel(e.custodyId), "التصنيف": e.category,
    "كود المعدة": e.equipmentCode, "النوع": e.equipmentType, "الماركة": e.brand,
    "موقع العمل": e.location, "التاريخ": e.date, "الغرض من الصرف": e.purpose, "ملاحظات": e.notes,
    "طريقة الصرف": e.paymentMethod, "نقدي من العهدة": Number(e.cash) || 0, "تحويل بنكي": Number(e.transfer) || 0,
    "شيك": Number(e.check) || 0, "الإجمالي": (Number(e.cash) || 0) + (Number(e.transfer) || 0) + (Number(e.check) || 0),
  }));
  const custodyRows = custodies.map((c) => ({
    "معرف العهدة": c.label, "المصدر": c.source, "الفترة من": c.periodFrom, "الفترة إلى": c.periodTo,
    "عهدة مرحلة من الفترة السابقة": Number(c.broughtForward) || 0, "إجمالي التحويلات": Number(c.transfersIn) || 0,
  }));
  const revenueRows = (revenues || []).map((r) => ({
    "كود المعدة": r.equipmentCode, "النوع": r.equipmentType, "الجهة المستأجرة": r.renter,
    "شهر البداية": r.startMonth, "عدد الشهور": Number(r.months) || 0,
    "سعر الشهر": Number(r.monthlyRate) || 0, "الإجمالي": Number(r.total) || 0, "ملاحظات": r.notes,
  }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(custodyRows), "ملخص العهد");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(expenseRows), "قاعدة البيانات");
  if (revenueRows.length) XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(revenueRows), "الإيرادات");
  XLSX.writeFile(wb, `تصدير_نظام_الصيانة_${todayISO()}.xlsx`);
}

/* ============================================================
   التطبيق
============================================================ */
export default function App() {
  const [authUser, setAuthUser] = useState(undefined); // undefined = جاري الفحص، null = مفيش دخول
  const [role, setRole] = useState(undefined); // undefined = جاري الفحص، null = مفيش صلاحية
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setAuthUser(u || null);
      if (!u) setRole(null);
    });
    return () => unsub();
  }, []);
  useEffect(() => {
    if (!authUser) return;
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDoc(doc(db, "users", authUser.uid));
        if (cancelled) return;
        setRole(snap.exists() ? snap.data().role || null : null);
      } catch (e) {
        if (!cancelled) setRole(null);
      }
    })();
    return () => { cancelled = true; };
  }, [authUser]);

  const [expenses, saveExpenses, expensesLoaded] = useStorage("expenses", []);
  const [custodies, saveCustodies, custodiesLoaded] = useStorage("custodies", []);
  const [revenues, saveRevenues, revenuesLoaded] = useStorage("revenues", []);
  const [fuelRecords, saveFuelRecords, fuelLoaded] = useStorage("fuelRecords", []);
  const [oilRecords, saveOilRecords, oilLoaded] = useStorage("oilRecords", []);
  const [equipmentCodes, saveEquipmentCodes, codesLoaded] = useStorage("equipmentCodes", []);
  const [salaries, saveSalaries, salariesLoaded] = useStorage("salaries", []);
  const [view, setView] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const v = params.get("view");
      const validViews = [
        "home", "dashboard", "analysis", "revenueAnalysis", "entry", "revenue", "custodies",
        "database", "equipment", "profitability", "maintenanceLog", "fuel", "oils", "fuelAnalysis",
        "equipmentCodes", "salaries", "print", "alerts", "import", "export",
      ];
      if (v && validViews.includes(v)) return v;
    } catch (e) {}
    return "home";
  });
  const [isEmbedded] = useState(() => {
    try {
      return new URLSearchParams(window.location.search).has("view");
    } catch (e) {
      return false;
    }
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(typeof window !== "undefined" ? window.innerWidth >= 768 : true);
  useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth >= 768);
    handler();
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  const showSidebar = isDesktop || sidebarOpen;
  const [theme, saveTheme, themeLoaded] = useStorage("themePreference", "light", false);
  applyTheme(theme);
  const [toast, setToast] = useState(null);

  const showToast = (msg, tone = "success") => {
    setToast({ msg, tone });
    setTimeout(() => setToast(null), 2600);
  };

  const [lastAction, setLastAction] = useState(null);
  const storeSavers = {
    expenses: saveExpenses, custodies: saveCustodies, revenues: saveRevenues,
    fuelRecords: saveFuelRecords, oilRecords: saveOilRecords, equipmentCodes: saveEquipmentCodes, salaries: saveSalaries,
  };
  const pushUndo = (storeKey, prevValue) => setLastAction([{ storeKey, prevValue }]);
  const pushUndoMulti = (entries) => setLastAction(entries);
  const handleUndo = () => {
    if (!lastAction) return;
    lastAction.forEach(({ storeKey, prevValue }) => storeSavers[storeKey](prevValue));
    setLastAction(null);
    showToast("تم التراجع عن آخر تعديل");
  };

  const addExpense = (entry) => {
    pushUndo("expenses", expenses);
    const next = [...expenses, { ...entry, location: cleanText(entry.location), id: uid() }];
    saveExpenses(next);
    showToast("تم حفظ بند الصرف بنجاح");
  };

  const deleteExpense = (id) => {
    pushUndo("expenses", expenses);
    saveExpenses(expenses.filter((e) => e.id !== id));
    showToast("تم حذف البند", "danger");
  };

  const updateExpense = (id, updates) => {
    pushUndo("expenses", expenses);
    const cleaned = updates.location !== undefined ? { ...updates, location: cleanText(updates.location) } : updates;
    saveExpenses(expenses.map((e) => (e.id === id ? { ...e, ...cleaned } : e)));
    showToast("تم تعديل بند الصرف");
  };

  const updateExpenseLoaded = (id, loadedAmount) => {
    pushUndo("expenses", expenses);
    saveExpenses(expenses.map((e) => (e.id === id ? { ...e, loadedAmount } : e)));
    showToast("تم تحديث المبلغ المحمّل");
  };

  const addRevenue = (entry) => {
    pushUndo("revenues", revenues);
    const total = (Number(entry.months) || 0) * (Number(entry.monthlyRate) || 0);
    saveRevenues([...revenues, { ...entry, location: cleanText(entry.location), total, id: uid() }]);
    showToast("تم حفظ بند الإيراد بنجاح");
  };

  const deleteRevenue = (id) => {
    pushUndo("revenues", revenues);
    saveRevenues(revenues.filter((r) => r.id !== id));
    showToast("تم حذف بند الإيراد", "danger");
  };

  const addFuelRecord = (rec) => {
    pushUndo("fuelRecords", fuelRecords);
    const distance = (Number(rec.odometerEnd) || 0) - (Number(rec.odometerStart) || 0);
    const total = (Number(rec.quantity) || 0) * (Number(rec.pricePerLiter) || 0) + (Number(rec.commission) || 0) + (Number(rec.tax) || 0);
    const rate = Number(rec.quantity) ? distance / Number(rec.quantity) : 0;
    saveFuelRecords([...fuelRecords, { ...rec, distance, total, rate, id: uid() }]);
    showToast("تم حفظ سجل السولار بنجاح");
  };

  const deleteFuelRecord = (id) => {
    pushUndo("fuelRecords", fuelRecords);
    saveFuelRecords(fuelRecords.filter((r) => r.id !== id));
    showToast("تم حذف سجل السولار", "danger");
  };

  const bulkImportFuel = (newRecords, mode) => {
    pushUndo("fuelRecords", fuelRecords);
    if (mode === "replace") saveFuelRecords(newRecords);
    else saveFuelRecords([...fuelRecords, ...newRecords]);
    showToast(`تم استيراد ${newRecords.length} سجل سولار`);
  };

  const addOilRecord = (rec) => {
    pushUndo("oilRecords", oilRecords);
    const total = (Number(rec.quantity) || 0) * (Number(rec.unitPrice) || 0);
    saveOilRecords([...oilRecords, { ...rec, total, equipmentCode: rec.equipmentCode, location: cleanText(rec.location), id: uid() }]);
    showToast("تم حفظ مسحوبات الزيوت بنجاح");
  };

  const deleteOilRecord = (id) => {
    pushUndo("oilRecords", oilRecords);
    saveOilRecords(oilRecords.filter((r) => r.id !== id));
    showToast("تم حذف السجل", "danger");
  };

  const bulkImportOils = (newRecords, mode) => {
    pushUndo("oilRecords", oilRecords);
    if (mode === "replace") saveOilRecords(newRecords);
    else saveOilRecords([...oilRecords, ...newRecords]);
    showToast(`تم استيراد ${newRecords.length} سجل زيوت وفلاتر`);
  };

  const addEquipmentCode = (c) => {
    pushUndo("equipmentCodes", equipmentCodes);
    saveEquipmentCodes([...equipmentCodes, { ...c, location: cleanText(c.location), id: uid() }]);
    showToast("تم إضافة الكود");
  };
  const updateEquipmentCode = (id, updates) => {
    pushUndo("equipmentCodes", equipmentCodes);
    const cleaned = updates.location !== undefined ? { ...updates, location: cleanText(updates.location) } : updates;
    saveEquipmentCodes(equipmentCodes.map((c) => (c.id === id ? { ...c, ...cleaned } : c)));
    showToast("تم تعديل الكود");
  };
  const deleteEquipmentCode = (id) => {
    pushUndo("equipmentCodes", equipmentCodes);
    saveEquipmentCodes(equipmentCodes.filter((c) => c.id !== id));
    showToast("تم حذف الكود", "danger");
  };
  const bulkImportEquipmentCodes = (newCodes, mode) => {
    pushUndo("equipmentCodes", equipmentCodes);
    if (mode === "replace") saveEquipmentCodes(newCodes);
    else saveEquipmentCodes([...equipmentCodes, ...newCodes]);
    showToast(`تم استيراد ${newCodes.length} كود معدة`);
  };

  const mergeCodeSpellings = (oldSpellings, canonical) => {
    pushUndoMulti([
      { storeKey: "expenses", prevValue: expenses },
      { storeKey: "fuelRecords", prevValue: fuelRecords },
      { storeKey: "oilRecords", prevValue: oilRecords },
      { storeKey: "revenues", prevValue: revenues },
      { storeKey: "equipmentCodes", prevValue: equipmentCodes },
    ]);
    const oldSet = new Set(oldSpellings.map((s) => normCode(s)));
    const matches = (v) => oldSet.has(normCode(v));

    saveExpenses(expenses.map((e) => (matches(e.equipmentCode) ? { ...e, equipmentCode: canonical } : e)));
    saveFuelRecords(fuelRecords.map((r) => (matches(r.code) ? { ...r, code: canonical } : r)));
    saveOilRecords(oilRecords.map((r) => (matches(r.equipmentCode) ? { ...r, equipmentCode: canonical } : r)));
    saveRevenues(revenues.map((r) => (matches(r.equipmentCode) ? { ...r, equipmentCode: canonical } : r)));
    // في أكواد المعدات: سيب سجل واحد بس بالإملاء الموحّد، واحذف الباقي
    const seenCanonical = { current: false };
    const cleanedCodes = [];
    equipmentCodes.forEach((c) => {
      if (matches(c.code)) {
        if (!seenCanonical.current) {
          cleanedCodes.push({ ...c, code: canonical });
          seenCanonical.current = true;
        }
        // تجاهل باقي النسخ المكررة
      } else {
        cleanedCodes.push(c);
      }
    });
    saveEquipmentCodes(cleanedCodes);
    showToast("تم دمج الكود بنجاح");
  };

  const addSalary = (s) => {
    pushUndo("salaries", salaries);
    saveSalaries([...salaries, { ...s, loadedAmount: 0, id: uid() }]);
    showToast("تم حفظ بند المرتبات");
  };
  const deleteSalary = (id) => {
    pushUndo("salaries", salaries);
    saveSalaries(salaries.filter((s) => s.id !== id));
    showToast("تم حذف بند المرتبات", "danger");
  };
  const updateSalary = (id, updates) => {
    pushUndo("salaries", salaries);
    saveSalaries(salaries.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    showToast("تم تحديث بند المرتبات");
  };
  const updateSalaryLoaded = (id, loadedAmount) => {
    pushUndo("salaries", salaries);
    saveSalaries(salaries.map((s) => (s.id === id ? { ...s, loadedAmount } : s)));
    showToast("تم تحديث المبلغ المحمّل");
  };

  const addCustody = (c) => {
    pushUndo("custodies", custodies);
    const next = [...custodies, { ...c, id: uid() }];
    saveCustodies(next);
    showToast("تم إضافة العهدة");
  };

  const updateCustody = (id, updates) => {
    pushUndo("custodies", custodies);
    saveCustodies(custodies.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    showToast("تم تعديل بيانات العهدة");
  };

  const deleteCustody = (id) => {
    if (expenses.some((e) => e.custodyId === id)) {
      showToast("لا يمكن حذف عهدة مرتبطة ببنود صرف", "danger");
      return;
    }
    pushUndo("custodies", custodies);
    saveCustodies(custodies.filter((c) => c.id !== id));
    showToast("تم حذف العهدة", "danger");
  };

  const custodyTotals = useMemo(() => {
    const map = {};
    for (const c of custodies) {
      const spent = expenses.filter((e) => e.custodyId === c.id).reduce((s, e) => s + (Number(e.cash) || 0) + (Number(e.transfer) || 0) + (Number(e.check) || 0), 0);
      const available = (Number(c.broughtForward) || 0) + (Number(c.transfersIn) || 0);
      map[c.id] = { spent, available, remaining: available - spent };
    }
    return map;
  }, [custodies, expenses]);

  const bulkImport = ({ newCustodies, newExpenses, mode }) => {
    pushUndoMulti([
      { storeKey: "custodies", prevValue: custodies },
      { storeKey: "expenses", prevValue: expenses },
    ]);
    if (mode === "replace") {
      saveCustodies(newCustodies);
      saveExpenses(newExpenses);
    } else {
      saveCustodies([...custodies, ...newCustodies]);
      saveExpenses([...expenses, ...newExpenses]);
    }
    showToast(`تم استيراد ${newCustodies.length} عهدة و ${newExpenses.length} بند صرف`);
  };

  const loading = !expensesLoaded || !custodiesLoaded || !revenuesLoaded || !fuelLoaded || !codesLoaded || !salariesLoaded;

  const NAV = [
    { key: "home", label: "الصفحة الرئيسية", icon: Building2 },
    { key: "dashboard", label: "تقرير تنفيذي", icon: LayoutDashboard },
    { key: "analysis", label: "تحليل المصروفات", icon: BarChart3 },
    { key: "revenueAnalysis", label: "تحليل الإيرادات", icon: TrendingUp },
    { key: "entry", label: "إدخال بند صرف", icon: FilePlus2 },
    { key: "revenue", label: "الإيرادات", icon: Wallet },
    { key: "custodies", label: "العهد", icon: ClipboardList },
    { key: "database", label: "قاعدة البيانات", icon: Database },
    { key: "equipment", label: "بطاقة أداء المعدات", icon: Wrench },
    { key: "profitability", label: "ربحية المعدات", icon: TrendingUp },
    { key: "maintenanceLog", label: "سجل الصيانة", icon: ListChecks },
    { key: "fuel", label: "السولار", icon: Fuel },
    { key: "oils", label: "الزيوت والفلاتر", icon: Wrench },
    { key: "fuelAnalysis", label: "تحليل السولار", icon: BarChart3 },
    { key: "equipmentCodes", label: "أكواد المعدات", icon: ListChecks },
    { key: "salaries", label: "المرتبات", icon: Wallet },
    { key: "print", label: "طباعة عهدة", icon: Printer },
    { key: "alerts", label: "تنبيهات ومراجعة", icon: AlertTriangle },
    { key: "import", label: "استيراد من إكسل", icon: UploadCloud },
    { key: "export", label: "تصدير البيانات", icon: FileSpreadsheet },
  ];

  if (authUser === undefined || (authUser && role === undefined)) {
    return (
      <div className="h-screen flex items-center justify-center" style={{ background: COLORS.cream }}>
        <div className="text-sm font-semibold" style={{ color: COLORS.slate }}>جاري التحقق من الدخول...</div>
      </div>
    );
  }
  if (!authUser) return <LoginScreen />;
  if (role !== "admin" && role !== "oils") return <AccessDenied />;

  if (role === "oils") {
    return (
      <div dir="rtl" className="h-screen flex flex-col overflow-hidden" style={{ background: COLORS.cream, fontFamily: "'Cairo', sans-serif" }}>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700&display=swap');`}</style>
        <div className="flex items-center justify-between px-4 md:px-8 py-3 border-b" style={{ background: COLORS.paper, borderColor: COLORS.border }}>
          <div className="font-extrabold text-sm" style={{ color: COLORS.ink }}>الزيوت والفلاتر</div>
          <button
            onClick={() => signOut(auth)}
            className="px-3 py-1.5 rounded-lg text-xs font-bold text-white"
            style={{ background: COLORS.navy }}
          >
            تسجيل خروج
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {!oilLoaded ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-sm font-semibold" style={{ color: COLORS.slate }}>جاري تحميل البيانات...</div>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-8">
              <OilsView records={oilRecords} equipmentCodes={equipmentCodes} expenses={expenses} onAdd={addOilRecord} onDelete={deleteOilRecord} onImport={bulkImportOils} />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="h-screen flex overflow-hidden" style={{ background: COLORS.cream, fontFamily: "'Cairo', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@700;800;900&family=Cairo:wght@400;500;600;700&display=swap');
        * { font-family: 'Cairo', sans-serif; -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; }
        .display-font { font-family: 'Tajawal', sans-serif; }
        ::-webkit-scrollbar { width: 8px; height: 8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${COLORS.slateLight}55; border-radius: 8px; }
        ::-webkit-scrollbar-thumb:hover { background: ${COLORS.slateLight}88; }
        table { border-collapse: collapse; }
        button { transition: background-color .15s ease, color .15s ease, box-shadow .15s ease, transform .15s ease, opacity .15s ease; }
        button:active { transform: scale(0.98); }
        input, select, textarea { transition: border-color .15s ease, box-shadow .15s ease; }
        input:focus, select:focus, textarea:focus { outline: none; box-shadow: 0 0 0 3px ${COLORS.gold}2A; border-color: ${COLORS.gold} !important; }
        @page { size: A4 portrait; margin: 10mm 8mm; }
        .print-only-area { position: absolute; left: -99999px; top: -99999px; }
        .profit-summary-grid { display: flex; flex-wrap: wrap; gap: 8px; }
        .profit-summary-box { flex: 1 1 22%; min-width: 130px; }
        @media print {
          body * { visibility: hidden; }
          #print-area, #print-area * { visibility: visible; }
          #print-area { position: absolute; top: 0; right: 0; left: 0; width: 100%; padding: 0; }
          #print-area table { width: 100% !important; min-width: 0 !important; font-size: 9px; table-layout: fixed; }
          #print-area th, #print-area td { padding: 3px 4px !important; word-break: break-word; overflow-wrap: break-word; }
          #print-area th, #print-area td { border: 1px solid #999; padding: 4px 6px; }
          #print-area thead { display: table-header-group; }
          #print-area tr { page-break-inside: avoid; }
          .totals-signatures-block { page-break-inside: avoid; }
          #print-area table.profit-table { font-size: 7px; }
          #print-area table.profit-table th, #print-area table.profit-table td { padding: 2px 3px !important; word-break: normal; overflow-wrap: break-word; line-height: 1.25; }
          #print-area table.profit-table th:first-child,
          #print-area table.profit-table td:first-child { width: 19% !important; min-width: 19% !important; white-space: normal !important; overflow: visible !important; }
          #print-area table.profit-table td:first-child .code-cell-inner { display: flex !important; flex-direction: column !important; align-items: center !important; gap: 2px !important; }
          #print-area table.profit-table td:first-child .code-badge { min-width: 0 !important; }
          .profit-summary-grid { flex-wrap: wrap !important; }
          .profit-summary-box { flex: 1 1 23% !important; min-width: 0 !important; padding: 4px !important; }
          .profit-summary-box .profit-summary-label { font-size: 7px !important; }
          .profit-summary-box .profit-summary-value { font-size: 9px !important; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* خلفية تراكب عند فتح القائمة في الموبايل */}
      {!isDesktop && sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-20" onClick={() => setSidebarOpen(false)} />
      )}

      {/* الشريط الجانبي */}
      {showSidebar && !isEmbedded && (
      <aside
        className={isDesktop ? "w-64 shrink-0 flex flex-col text-white" : "w-64 shrink-0 flex flex-col text-white fixed inset-y-0 right-0 z-30"}
        style={{ background: `linear-gradient(185deg, ${COLORS.navy}, ${COLORS.navyDeep})` }}
      >
        <div className="px-5 py-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 bg-white p-1.5 shadow-lg">
              <img src={LOGO_DATA_URI} alt="El Rabeh" className="w-full h-full object-contain" />
            </div>
            <div className="min-w-0">
              <div className="font-extrabold text-sm leading-tight display-font truncate">قسم الصيانة والتشغيل</div>
              <div className="text-[10.5px] tracking-wide text-white/45 mt-0.5">EL RABEH FOR GENERAL CONTRACTING</div>
            </div>
          </div>
          {!isDesktop && (
            <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg shrink-0" style={{ background: "rgba(255,255,255,0.08)" }}>
              <X size={16} />
            </button>
          )}
        </div>
        <div className="px-3 pt-3">
          <button
            onClick={() => saveTheme(theme === "dark" ? "light" : "dark")}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition hover:bg-white/[0.12]"
            style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            {theme === "dark" ? <><Sun size={14} /> الوضع الفاتح</> : <><Moon size={14} /> الوضع الداكن</>}
          </button>
        </div>
        <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
          {NAV.map((n) => {
            const active = view === n.key;
            return (
              <button
                key={n.key}
                onClick={() => { setView(n.key); setSidebarOpen(false); }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13.5px] font-semibold transition-all text-right"
                style={{
                  background: active ? `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.teal})` : "transparent",
                  color: active ? COLORS.navyDeep : "rgba(255,255,255,0.68)",
                  boxShadow: active ? "0 6px 16px -6px rgba(176,141,66,0.5)" : "none",
                }}
                onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = "transparent"; }}
              >
                <n.icon size={16} />
                {n.label}
              </button>
            );
          })}
        </nav>
        <div className="px-3 pb-3 space-y-2">
          <button
            onClick={() => exportToExcel({ expenses, custodies, revenues })}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-bold transition hover:bg-white/[0.12]"
            style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <FileSpreadsheet size={15} /> تصدير كل البيانات لإكسل
          </button>
          <button
            onClick={() => signOut(auth)}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-bold transition hover:bg-white/[0.12]"
            style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            تسجيل خروج
          </button>
        </div>
        <div className="px-5 py-4 border-t border-white/10 text-[10.5px] text-white/35">
          البيانات محفوظة ومشتركة بين كل المستخدمين
        </div>
      </aside>
      )}

      {/* المحتوى */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 md:px-8 py-3 border-b" style={{ background: `${COLORS.cream}E6`, backdropFilter: "blur(8px)", borderColor: COLORS.border }}>
          <div className="flex items-center gap-2">
            {!isDesktop && !isEmbedded && (
              <>
                <button onClick={() => setSidebarOpen(true)} className="px-3 py-2 rounded-xl flex items-center gap-2" style={{ background: COLORS.navy }}>
                  <Menu size={18} className="text-white" />
                  <span className="text-xs font-bold text-white">القائمة</span>
                </button>
                <button onClick={() => setView("home")} className="px-3 py-2 rounded-xl flex items-center gap-2" style={{ background: `linear-gradient(135deg, ${COLORS.gold}, ${COLORS.goldDark})` }}>
                  <Building2 size={18} style={{ color: COLORS.navyDeep }} />
                </button>
              </>
            )}
          </div>
          <div className="text-xs font-semibold hidden sm:block" style={{ color: COLORS.slateLight }}>
            {new Date().toLocaleDateString("ar-EG", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </div>
          <div className="flex items-center gap-3">
            {lastAction && (
              <button onClick={handleUndo} className="px-3 py-2 rounded-xl flex items-center gap-1.5 text-xs font-bold" style={{ background: COLORS.paper, color: COLORS.ink, border: `1px solid ${COLORS.border}` }}>
                <ArrowLeft size={14} /> تراجع عن آخر تعديل
              </button>
            )}
            <div className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full" style={{ color: COLORS.teal, background: `${COLORS.tealSoft}` }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: COLORS.teal }} />
              <span className="hidden sm:inline">متصل ومحفوظ تلقائيًا</span>
            </div>
          </div>
        </div>
        {loading ? (
          <div className="h-screen flex items-center justify-center">
            <div className="text-sm font-semibold" style={{ color: COLORS.slate }}>جاري تحميل البيانات...</div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto px-4 md:px-8 py-6 md:py-8">
            {view === "home" && <HomeView expenses={expenses} custodies={custodies} revenues={revenues} custodyTotals={custodyTotals} fuelRecords={fuelRecords} oilRecords={oilRecords} salaries={salaries} onNavigate={setView} />}
            {view === "dashboard" && <Dashboard expenses={expenses} custodies={custodies} custodyTotals={custodyTotals} />}
            {view === "analysis" && <AnalysisView expenses={expenses} custodies={custodies} custodyTotals={custodyTotals} />}
            {view === "revenueAnalysis" && <RevenueAnalysisView revenues={revenues} expenses={expenses} />}
            {view === "entry" && <EntryForm custodies={custodies} custodyTotals={custodyTotals} expenses={expenses} equipmentCodes={equipmentCodes} onAdd={addExpense} onGoCustodies={() => setView("custodies")} />}
            {view === "revenue" && <RevenueView revenues={revenues} expenses={expenses} equipmentCodes={equipmentCodes} onAdd={addRevenue} onDelete={deleteRevenue} />}
            {view === "custodies" && <Custodies custodies={custodies} custodyTotals={custodyTotals} onAdd={addCustody} onUpdate={updateCustody} onDelete={deleteCustody} />}
            {view === "database" && <DatabaseView expenses={expenses} custodies={custodies} equipmentCodes={equipmentCodes} onDelete={deleteExpense} onUpdate={updateExpense} />}
            {view === "equipment" && <EquipmentView expenses={expenses} revenues={revenues} />}
            {view === "profitability" && <ProfitabilityView expenses={expenses} revenues={revenues} fuelRecords={fuelRecords} oilRecords={oilRecords} salaries={salaries} equipmentCodes={equipmentCodes} />}
            {view === "maintenanceLog" && <MaintenanceLogView expenses={expenses} />}
            {view === "fuel" && <FuelView records={fuelRecords} onAdd={addFuelRecord} onDelete={deleteFuelRecord} onImport={bulkImportFuel} />}
            {view === "oils" && <OilsView records={oilRecords} equipmentCodes={equipmentCodes} expenses={expenses} onAdd={addOilRecord} onDelete={deleteOilRecord} onImport={bulkImportOils} />}
            {view === "fuelAnalysis" && <FuelAnalysisView records={fuelRecords} />}
            {view === "equipmentCodes" && <EquipmentCodesView codes={equipmentCodes} expenses={expenses} fuelRecords={fuelRecords} oilRecords={oilRecords} revenues={revenues} onAdd={addEquipmentCode} onUpdate={updateEquipmentCode} onDelete={deleteEquipmentCode} onImport={bulkImportEquipmentCodes} onMerge={mergeCodeSpellings} />}
            {view === "salaries" && <SalariesGate><SalariesView salaries={salaries} equipmentCodes={equipmentCodes} onAdd={addSalary} onUpdate={updateSalary} onDelete={deleteSalary} /></SalariesGate>}
            {view === "print" && <PrintView custodies={custodies} custodyTotals={custodyTotals} expenses={expenses} />}
            {view === "alerts" && <AlertsView custodies={custodies} custodyTotals={custodyTotals} expenses={expenses} revenues={revenues} salaries={salaries} onUpdateExpenseLoaded={updateExpenseLoaded} onUpdateSalaryLoaded={updateSalaryLoaded} />}
            {view === "import" && <ImportView onImport={bulkImport} existingCounts={{ custodies: custodies.length, expenses: expenses.length }} />}
            {view === "export" && <ExportView expenses={expenses} custodies={custodies} revenues={revenues} />}
          </div>
        )}
      </main>

      {toast && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-xl text-sm font-semibold text-white shadow-lg flex items-center gap-2"
          style={{ background: toast.tone === "danger" ? COLORS.danger : COLORS.success }}
        >
          <CheckCircle2 size={16} />
          {toast.msg}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   لوحة التقرير التنفيذي
============================================================ */
/* ============================================================
   الصفحة الرئيسية
============================================================ */
function HomeView({ expenses, custodies, revenues, custodyTotals, fuelRecords, oilRecords, salaries, onNavigate }) {
  const total = expenses.reduce((s, e) => s + (Number(e.cash) || 0) + (Number(e.transfer) || 0) + (Number(e.check) || 0), 0);
  const totalRevenue = (revenues || []).reduce((s, r) => s + (Number(r.total) || 0), 0);
  const deficits = Object.values(custodyTotals).filter((v) => v.remaining < 0).length;

  const custodyExpenseTotal = total;
  const fuelTotal = (fuelRecords || []).reduce((s, r) => s + (Number(r.total) || 0), 0);
  const oilTotal = (oilRecords || []).reduce((s, r) => s + (Number(r.total) || 0), 0);
  const salaryTotal = (salaries || []).reduce((s, x) => s + (Number(x.amount) || 0), 0);
  const grandTotal = custodyExpenseTotal + fuelTotal + oilTotal + salaryTotal;

  const CARDS = [
    { key: "dashboard", label: "تقرير تنفيذي", desc: "مؤشرات حية ورسوم بيانية شاملة", icon: LayoutDashboard, color: COLORS.navy },
    { key: "analysis", label: "تحليل المصروفات", desc: "المواقع، الاتجاه الزمني، ومقارنة العهد", icon: BarChart3, color: "#2E7A50" },
    { key: "revenueAnalysis", label: "تحليل الإيرادات", desc: "أداء الإيراد لكل معدة وجهة مستأجرة", icon: TrendingUp, color: COLORS.gold },
    { key: "entry", label: "إدخال بند صرف", desc: "سجّل معاملة مصروف جديدة", icon: FilePlus2, color: "#5B7A9E" },
    { key: "revenue", label: "الإيرادات", desc: "سجّل إيراد تأجير معدة شهري", icon: Wallet, color: "#8B9C6E" },
    { key: "custodies", label: "العهد", desc: "إدارة عهد الصرف لكل جهة", icon: ClipboardList, color: "#647085" },
    { key: "database", label: "قاعدة البيانات", desc: "كل بنود الصرف قابلة للبحث والفلترة", icon: Database, color: "#1C2C4A" },
    { key: "equipment", label: "بطاقة أداء المعدات", desc: "تكلفة وربحية كل معدة وسيارة", icon: Wrench, color: "#6A4A2E" },
    { key: "profitability", label: "ربحية المعدات", desc: "صافي ربح كل معدة شامل التكلفة الموزّعة", icon: TrendingUp, color: "#1B5E20" },
    { key: "maintenanceLog", label: "سجل الصيانة", desc: "كل تاريخ صيانة معدة معينة بالتفصيل", icon: ListChecks, color: "#4A5568" },
    { key: "fuel", label: "السولار", desc: "سجل تفصيلي لاستهلاك السولار + استيراد وتصدير وطباعة", icon: Fuel, color: "#00838F" },
    { key: "oils", label: "الزيوت والفلاتر", desc: "مسحوبات الزيوت والفلاتر، محمّلة كمصروف مباشر على المعدات", icon: Wrench, color: "#6D4C41" },
    { key: "fuelAnalysis", label: "تحليل السولار", desc: "معدل الاستهلاك، التكلفة، والاتجاه الشهري", icon: BarChart3, color: "#00695C" },
    { key: "equipmentCodes", label: "أكواد المعدات", desc: "قائمة مرجعية بكل المعدات ومالكها وموقعها", icon: ListChecks, color: "#6A4A2E" },
    { key: "salaries", label: "المرتبات", desc: "مرتبات سائقين (مباشرة على المعدات) ومشرفين ومحاسبين (موزّعة)", icon: Wallet, color: "#5B4A8A" },
    { key: "print", label: "طباعة عهدة", desc: "نموذج تصفية عهدة رسمي جاهز للطباعة", icon: Printer, color: "#9C7A1E" },
    { key: "alerts", label: "تنبيهات ومراجعة", desc: "عهد بعجز، صيانة متأخرة، وجودة البيانات", icon: AlertTriangle, color: COLORS.danger },
    { key: "import", label: "استيراد من إكسل", desc: "ارفع ملف واستورد كل بياناتك دفعة واحدة", icon: UploadCloud, color: "#1565C0" },
    { key: "export", label: "تصدير البيانات", desc: "نزّل كل بياناتك في ملف إكسل منظم", icon: FileSpreadsheet, color: "#455A64" },
  ];

  return (
    <div className="space-y-8">
      <div className="rounded-2xl overflow-hidden relative" style={{ background: COLORS.navy }}>
        <div className="absolute -left-10 -top-10 w-56 h-56 rounded-full bg-white/5" />
        <div className="absolute left-24 -bottom-16 w-40 h-40 rounded-full bg-white/5" />
        <div className="relative px-6 md:px-10 py-10 md:py-14 text-white">
          <img src={LOGO_DATA_URI} alt="El Rabeh" className="h-10 md:h-12 mb-6 bg-white rounded-lg px-3 py-1.5 inline-block" style={{ objectFit: "contain" }} />
          <div className="flex items-center gap-2 text-xs font-bold mb-4" style={{ color: COLORS.goldSoft }}>
            <Sparkles size={14} /> نظام إدارة متكامل
          </div>
          <h1 className="text-2xl md:text-4xl font-extrabold display-font mb-3">قسم الصيانة والتشغيل</h1>
          <p className="text-sm md:text-base text-white/60 max-w-lg mb-8">
            متابعة مصروفات وإيرادات وصيانة المعدات والسيارات في مكان واحد — مصروفات، عهد، إيرادات، وتقارير احترافية جاهزة.
          </p>
          <div className="flex flex-wrap gap-6 md:gap-10">
            <div>
              <div className="text-xs text-white/50 font-semibold mb-1">إجمالي المصروفات (كل المصادر)</div>
              <div className="text-xl md:text-2xl font-extrabold tabular-nums">{fmtMoney(grandTotal)}</div>
            </div>
            <div>
              <div className="text-xs text-white/50 font-semibold mb-1">إجمالي الإيرادات</div>
              <div className="text-xl md:text-2xl font-extrabold tabular-nums" style={{ color: COLORS.goldSoft }}>{fmtMoney(totalRevenue)}</div>
            </div>
            <div>
              <div className="text-xs text-white/50 font-semibold mb-1">عدد العهد</div>
              <div className="text-xl md:text-2xl font-extrabold tabular-nums">{fmtNum(custodies.length)}</div>
            </div>
            <div>
              <div className="text-xs text-white/50 font-semibold mb-1">عهد بها عجز</div>
              <div className="text-xl md:text-2xl font-extrabold tabular-nums" style={{ color: deficits > 0 ? "#F0A8A0" : "white" }}>{fmtNum(deficits)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard label="مصروفات من خلال العهد" value={fmtMoney(custodyExpenseTotal)} icon={Database} />
        <KPICard label="مصروفات زيوت وفلاتر" value={fmtMoney(oilTotal)} tone="gold" icon={Wrench} />
        <KPICard label="مرتبات" value={fmtMoney(salaryTotal)} icon={Wallet} />
        <KPICard label="سولار" value={fmtMoney(fuelTotal)} tone="gold" icon={Fuel} />
      </div>

      <div>
        <h2 className="text-sm font-bold mb-4" style={{ color: COLORS.slate }}>الوصول السريع</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CARDS.map((c) => (
            <button
              key={c.key}
              onClick={() => onNavigate(c.key)}
              className="text-right bg-white rounded-2xl border p-5 flex items-start gap-4 transition hover:-translate-y-0.5"
              style={{ borderColor: COLORS.border, boxShadow: "0 1px 2px rgba(16,26,46,0.04), 0 8px 20px -12px rgba(16,26,46,0.10)" }}
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: c.color }}>
                <c.icon size={19} className="text-white" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-sm mb-1" style={{ color: COLORS.ink }}>{c.label}</div>
                <div className="text-xs leading-relaxed" style={{ color: COLORS.slateLight }}>{c.desc}</div>
              </div>
              <ArrowLeft size={15} className="shrink-0 mt-1" style={{ color: COLORS.slateLight }} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Dashboard({ expenses, custodies, custodyTotals }) {
  const total = expenses.reduce((s, e) => s + (Number(e.cash) || 0) + (Number(e.transfer) || 0) + (Number(e.check) || 0), 0);
  const values = Object.values(custodyTotals);
  const highest = values.length ? Math.max(...values.map((v) => v.spent)) : 0;
  const deficits = values.filter((v) => v.remaining < 0).length;

  const byCategory = useMemo(() => {
    const map = {};
    for (const e of expenses) {
      const t = (Number(e.cash) || 0) + (Number(e.transfer) || 0) + (Number(e.check) || 0);
      map[e.category] = (map[e.category] || 0) + t;
    }
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  const bySource = useMemo(() => {
    const map = {};
    for (const e of expenses) {
      const t = (Number(e.cash) || 0) + (Number(e.transfer) || 0) + (Number(e.check) || 0);
      map[e.source] = (map[e.source] || 0) + t;
    }
    return Object.entries(map).map(([name, total]) => ({ name, total }));
  }, [expenses]);

  const topEquipment = useMemo(() => {
    const map = {};
    for (const e of expenses) {
      if (!e.equipmentCode || isCostPoolCode(e.equipmentCode)) continue;
      const t = (Number(e.cash) || 0) + (Number(e.transfer) || 0) + (Number(e.check) || 0);
      map[e.equipmentCode] = (map[e.equipmentCode] || 0) + t;
    }
    return Object.entries(map)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
  }, [expenses]);

  return (
    <div className="space-y-6">
      <Header title="التقرير التنفيذي" sub="نظرة شاملة على المصروفات والعهد" />

      <div className="flex flex-wrap gap-4">
        <KPICard label="إجمالي المصروفات المسجلة" value={fmtMoney(total)} icon={Wallet} />
        <KPICard label="عدد العهد المسجلة" value={fmtNum(custodies.length)} tone="gold" icon={ClipboardList} />
        <KPICard label="أعلى عهدة من حيث الصرف" value={fmtMoney(highest)} icon={TrendingUp} />
        <KPICard label="عدد عهد بها عجز" value={fmtNum(deficits)} tone={deficits > 0 ? "gold" : "navy"} icon={AlertTriangle} />
      </div>

      {expenses.length === 0 ? (
        <SectionCard>
          <EmptyState icon={FilePlus2} title="لا توجد بيانات بعد" sub="ابدأ بإضافة عهدة ثم سجّل أول بند صرف من قائمة الإدخال" />
        </SectionCard>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <SectionCard title="إجمالي المصروفات حسب التصنيف">
            <div dir="ltr"><ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={byCategory} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={95} label={(d) => fmtMoney(d.value)}>
                  {byCategory.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => fmtMoney(v)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer></div>
          </SectionCard>

          <SectionCard title="إجمالي المصروفات حسب الجهة">
            <div dir="ltr"><ResponsiveContainer width="100%" height={260}>
              <BarChart data={bySource}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => fmtMoney(v)} />
                <Bar dataKey="total" fill={COLORS.navy} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer></div>
          </SectionCard>

          <SectionCard title="أعلى المعدات من حيث التكلفة" className="lg:col-span-2">
            <div dir="ltr"><ResponsiveContainer width="100%" height={280}>
              <BarChart data={topEquipment} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => fmtMoney(v)} />
                <Bar dataKey="total" fill={COLORS.gold} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer></div>
          </SectionCard>
        </div>
      )}
    </div>
  );
}

function Header({ title, sub, action }) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-3">
      <div>
        <div className="flex items-center gap-2.5">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: COLORS.gold }} />
          <h1 className="text-[22px] md:text-[26px] font-extrabold display-font" style={{ color: COLORS.ink, letterSpacing: "-0.01em" }}>{title}</h1>
        </div>
        {sub && <p className="text-[13px] mt-1.5 leading-relaxed" style={{ color: COLORS.slate }}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}

/* ============================================================
   نموذج إدخال بند صرف
============================================================ */
function EntryForm({ custodies, custodyTotals, expenses, equipmentCodes, onAdd, onGoCustodies }) {
  const empty = {
    source: SOURCES[0], custodyId: "", category: CATEGORIES[0], equipmentCode: "",
    equipmentType: "", brand: "", location: "", date: todayISO(), purpose: "",
    notes: "", paymentMethod: PAYMENT_METHODS[0], cash: "", transfer: "", check: "",
  };

  const latestCustodyId = (source) => {
    const list = custodies.filter((c) => c.source === source);
    if (list.length === 0) return "";
    const sorted = [...list].sort((a, b) => (b.periodFrom || "").localeCompare(a.periodFrom || ""));
    return sorted[0].id;
  };

  const [form, setForm] = useState(() => ({ ...empty, custodyId: latestCustodyId(empty.source) }));

  const codeMap = useMemo(() => {
    const map = {};
    equipmentCodes.forEach((c) => {
      if (isCostPoolCode(c.code)) return;
      map[normCode(c.code)] = { display: String(c.code || ""), type: c.type, brand: c.brand, location: c.location };
    });
    expenses.forEach((e) => {
      const nc = normCode(e.equipmentCode);
      if (nc && !map[nc]) map[nc] = { display: String(e.equipmentCode || ""), type: e.equipmentType, brand: e.brand, location: e.location };
    });
    return map;
  }, [equipmentCodes, expenses]);

  const codeOptions = useMemo(() => Object.values(codeMap).sort((a, b) => a.display.localeCompare(b.display)), [codeMap]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSourceChange = (e) => {
    const newSource = e.target.value;
    setForm((f) => ({ ...f, source: newSource, custodyId: latestCustodyId(newSource) }));
  };

  const handleCodeChange = (e) => {
    const code = e.target.value;
    const known = codeMap[normCode(code)];
    setForm((f) => ({
      ...f,
      equipmentCode: code,
      equipmentType: known ? known.type : f.equipmentType,
      brand: known ? known.brand : f.brand,
      location: known && known.location ? known.location : f.location,
    }));
  };

  const total = (Number(form.cash) || 0) + (Number(form.transfer) || 0) + (Number(form.check) || 0);
  const filteredCustodies = custodies.filter((c) => c.source === form.source);

  const submit = (e) => {
    e.preventDefault();
    if (!form.custodyId) return;
    onAdd(form);
    setForm({ ...empty, source: form.source, custodyId: form.custodyId, category: form.category, date: todayISO() });
  };

  if (custodies.length === 0) {
    return (
      <div className="space-y-6">
        <Header title="إدخال بند صرف" />
        <SectionCard>
          <EmptyState icon={Wallet} title="لازم تضيف عهدة الأول" sub="مفيش عهد مسجلة حاليًا — روح لتاب العهد وضيف واحدة قبل ما تسجل بند صرف" />
          <div className="flex justify-center mt-2">
            <button onClick={onGoCustodies} className="px-5 py-2.5 rounded-lg text-sm font-bold text-white flex items-center gap-2" style={{ background: COLORS.navy }}>
              الذهاب لتاب العهد <ChevronLeft size={16} />
            </button>
          </div>
        </SectionCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Header title="إدخال بند صرف" sub="سجّل بيانات الصرف وهتتحفظ فورًا لكل المستخدمين" />
      <form onSubmit={submit}>
        <SectionCard>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="الجهة" required>
              <Select value={form.source} onChange={handleSourceChange}>
                {SOURCES.map((s) => <option key={s}>{s}</option>)}
              </Select>
            </Field>
            <Field label="العهدة" required>
              <Select value={form.custodyId} onChange={set("custodyId")} required>
                <option value="">اختر العهدة</option>
                {filteredCustodies.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
              </Select>
            </Field>
            <Field label="التصنيف" required>
              <Select value={form.category} onChange={set("category")}>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </Select>
            </Field>

            <Field label="كود المعدة">
              <Select value={form.equipmentCode} onChange={handleCodeChange}>
                <option value="">اختر كود المعدة</option>
                {codeOptions.map((c) => <option key={c.display} value={c.display}>{c.display}</option>)}
              </Select>
            </Field>
            <Field label="النوع">
              <TextInput value={form.equipmentType} onChange={set("equipmentType")} placeholder="مثال: حفار" />
            </Field>
            <Field label="الماركة">
              <TextInput value={form.brand} onChange={set("brand")} placeholder="مثال: Komatsu" />
            </Field>

            <Field label="موقع العمل">
              <TextInput value={form.location} onChange={set("location")} placeholder="مثال: الورشة" />
            </Field>
            <Field label="التاريخ" required>
              <TextInput type="date" value={form.date} onChange={set("date")} required />
            </Field>
            <Field label="طريقة الصرف" required>
              <Select value={form.paymentMethod} onChange={set("paymentMethod")}>
                {PAYMENT_METHODS.map((p) => <option key={p}>{p}</option>)}
              </Select>
            </Field>

            <Field label="الغرض من الصرف" required>
              <TextInput value={form.purpose} onChange={set("purpose")} required placeholder="مثال: تغيير زيت وفلاتر" />
            </Field>
            <Field label="ملاحظات">
              <TextInput value={form.notes} onChange={set("notes")} placeholder="اختياري" />
            </Field>
            <div />

            <Field label="نقدي من العهدة">
              <TextInput type="number" step="0.01" value={form.cash} onChange={set("cash")} placeholder="0" />
            </Field>
            <Field label="تحويل بنكي">
              <TextInput type="number" step="0.01" value={form.transfer} onChange={set("transfer")} placeholder="0" />
            </Field>
            <Field label="شيك">
              <TextInput type="number" step="0.01" value={form.check} onChange={set("check")} placeholder="0" />
            </Field>
          </div>

          <div className="flex items-center justify-between mt-6 pt-5 border-t" style={{ borderColor: COLORS.border }}>
            <div className="text-sm">
              <span style={{ color: COLORS.slate }}>الإجمالي: </span>
              <span className="font-bold text-lg tabular-nums" style={{ color: COLORS.ink }}>{fmtMoney(total)}</span>
            </div>
            <button type="submit" className="px-6 py-2.5 rounded-lg text-sm font-bold text-white flex items-center gap-2" style={{ background: COLORS.gold, color: COLORS.navy }}>
              <Plus size={17} /> حفظ بند الصرف
            </button>
          </div>
        </SectionCard>
      </form>
    </div>
  );
}

/* ============================================================
   العهد
============================================================ */
function Custodies({ custodies, custodyTotals, onAdd, onUpdate, onDelete }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const empty = { source: SOURCES[0], label: "", periodFrom: todayISO(), periodTo: "", broughtForward: "", transfersIn: "" };
  const [form, setForm] = useState(empty);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const lastRemainingBySource = (source) => {
    const list = custodies.filter((c) => c.source === source);
    if (list.length === 0) return "";
    const sorted = [...list].sort((a, b) => (b.periodFrom || "").localeCompare(a.periodFrom || ""));
    const last = sorted[0];
    const remaining = custodyTotals[last.id]?.remaining;
    return remaining !== undefined ? remaining : "";
  };

  const startAdd = () => {
    setEditingId(null);
    setForm({ ...empty, broughtForward: lastRemainingBySource(empty.source) });
    setShowForm(true);
  };

  const handleSourceChange = (e) => {
    const newSource = e.target.value;
    setForm((f) => ({ ...f, source: newSource, broughtForward: editingId ? f.broughtForward : lastRemainingBySource(newSource) }));
  };

  const startEdit = (c) => {
    setEditingId(c.id);
    setForm({ source: c.source, label: c.label, periodFrom: c.periodFrom, periodTo: c.periodTo || "", broughtForward: c.broughtForward, transfersIn: c.transfersIn });
    setShowForm(true);
  };

  const cancel = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(empty);
  };

  const handleExcelExport = () => {
    const rowsOut = custodies.map((c) => {
      const t = custodyTotals[c.id] || { spent: 0, available: 0, remaining: 0 };
      return {
        "العهدة": c.label, "الجهة": c.source, "الفترة من": c.periodFrom, "الفترة إلى": c.periodTo,
        "عهدة مرحلة من الفترة السابقة": Number(c.broughtForward) || 0, "إجمالي التحويلات": Number(c.transfersIn) || 0,
        "المتاح": t.available, "المصروف": t.spent, "المتبقي": t.remaining,
      };
    });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rowsOut), "العهد");
    XLSX.writeFile(wb, `العهد_${todayISO()}.xlsx`);
  };
  const handlePdfExport = () => {
    window.print();
  };

  const submit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!form.label || !form.label.trim()) {
      alert("لازم تكتب اسم أو رقم العهدة");
      return;
    }
    if (editingId) {
      onUpdate(editingId, form);
    } else {
      onAdd(form);
    }
    cancel();
  };

  return (
    <div className="space-y-6">
      <Header
        title="العهد"
        sub="إدارة عهد الصرف الخاصة بكل جهة"
        action={
          <div className="flex flex-wrap gap-2">
            <ExportButtons onExcel={handleExcelExport} onPdf={handlePdfExport} />
            <button onClick={() => (showForm ? cancel() : startAdd())} className="px-4 py-2.5 rounded-lg text-sm font-bold text-white flex items-center gap-2" style={{ background: COLORS.navy }}>
              {showForm ? <X size={16} /> : <Plus size={16} />} {showForm ? "إلغاء" : "عهدة جديدة"}
            </button>
          </div>
        }
      />

      {showForm && (
        <form onSubmit={submit}>
          <SectionCard title={editingId ? "تعديل بيانات العهدة" : "بيانات العهدة الجديدة"}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="الجهة" required>
                <Select value={form.source} onChange={handleSourceChange}>{SOURCES.map((s) => <option key={s}>{s}</option>)}</Select>
              </Field>
              <Field label="اسم/رقم العهدة" required>
                <TextInput value={form.label} onChange={set("label")} required placeholder="مثال: تصفية عهدة هدي الإسلام (1)" />
              </Field>
              <div />
              <Field label="الفترة من" required>
                <TextInput type="date" value={form.periodFrom} onChange={set("periodFrom")} required />
              </Field>
              <Field label="الفترة إلى">
                <TextInput type="date" value={form.periodTo} onChange={set("periodTo")} />
              </Field>
              <div />
              <Field label="عهدة مرحّلة من فترة سابقة (تلقائي - تقدر تعدّلها)">
                <TextInput type="number" step="0.01" value={form.broughtForward} onChange={set("broughtForward")} placeholder="0" />
              </Field>
              <Field label="تحويلات مستلمة">
                <TextInput type="number" step="0.01" value={form.transfersIn} onChange={set("transfersIn")} placeholder="0" />
              </Field>
            </div>
            <div className="flex justify-end mt-5 pt-4 border-t" style={{ borderColor: COLORS.border }}>
              <button type="submit" className="px-6 py-2.5 rounded-lg text-sm font-bold text-white" style={{ background: COLORS.gold, color: COLORS.navy }}>
                {editingId ? "حفظ التعديلات" : "حفظ العهدة"}
              </button>
            </div>
          </SectionCard>
        </form>
      )}

      {custodies.length === 0 ? (
        <SectionCard><EmptyState icon={Wallet} title="لا توجد عهد مسجلة" sub="ابدأ بإضافة أول عهدة من الزر أعلاه" /></SectionCard>
      ) : (
        <SectionCard title={`كل العهد (${custodies.length})`}>
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: `linear-gradient(90deg, ${COLORS.navy}, ${COLORS.navyLight})` }}>
                  {["العهدة", "الجهة", "الفترة", "متاح", "مصروف", "المتبقي", ""].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-right text-xs font-bold" style={{ color: "rgba(255,255,255,0.88)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {custodies.map((c) => {
                  const t = custodyTotals[c.id] || { spent: 0, available: 0, remaining: 0 };
                  const deficit = t.remaining < 0;
                  return (
                    <tr key={c.id} className="border-t" style={{ borderColor: COLORS.border }}>
                      <td className="px-4 py-3 font-semibold" style={{ color: COLORS.ink }}>{c.label}</td>
                      <td className="px-4 py-3" style={{ color: COLORS.slate }}>{c.source}</td>
                      <td className="px-4 py-3 text-xs" style={{ color: COLORS.slate }}>{c.periodFrom}{c.periodTo ? ` → ${c.periodTo}` : ""}</td>
                      <td className="px-4 py-3 tabular-nums">{fmtMoney(t.available)}</td>
                      <td className="px-4 py-3 tabular-nums">{fmtMoney(t.spent)}</td>
                      <td className="px-4 py-3 tabular-nums font-bold" style={{ color: deficit ? COLORS.danger : COLORS.success }}>
                        {fmtMoney(t.remaining)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => startEdit(c)} className="p-1.5 rounded-md hover:bg-gray-100" style={{ color: COLORS.slate }}>
                            <Pencil size={15} />
                          </button>
                          <button onClick={() => onDelete(c.id)} className="p-1.5 rounded-md hover:bg-red-50" style={{ color: COLORS.danger }}>
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}

      <div className="print-only-area" id="print-area">
        <h2 style={{ fontFamily: "Cairo", textAlign: "center", marginBottom: 12 }}>كشف العهد</h2>
        <table>
          <thead><tr>{["العهدة", "الجهة", "الفترة", "متاح", "مصروف", "المتبقي"].map((h) => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {custodies.map((c) => {
              const t = custodyTotals[c.id] || { spent: 0, available: 0, remaining: 0 };
              return (
                <tr key={c.id}>
                  <td>{c.label}</td><td>{c.source}</td><td>{c.periodFrom}{c.periodTo ? ` → ${c.periodTo}` : ""}</td>
                  <td>{fmtMoney(t.available)}</td><td>{fmtMoney(t.spent)}</td><td>{fmtMoney(t.remaining)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============================================================
   قاعدة البيانات
============================================================ */
function DatabaseView({ expenses, custodies, equipmentCodes, onDelete, onUpdate }) {
  const [q, setQ] = useState("");
  const [catFilter, setCatFilter] = useState("");
  const [srcFilter, setSrcFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [editing, setEditing] = useState(null);
  const custodyLabel = (id) => custodies.find((c) => c.id === id)?.label || "—";

  const codeMap = useMemo(() => {
    const map = {};
    equipmentCodes.forEach((c) => {
      if (isCostPoolCode(c.code)) return;
      map[normCode(c.code)] = { display: String(c.code || ""), type: c.type, brand: c.brand, location: c.location };
    });
    expenses.forEach((e) => {
      const nc = normCode(e.equipmentCode);
      if (nc && !map[nc]) map[nc] = { display: String(e.equipmentCode || ""), type: e.equipmentType, brand: e.brand, location: e.location };
    });
    return map;
  }, [equipmentCodes, expenses]);
  const codeOptions = useMemo(() => Object.values(codeMap).sort((a, b) => a.display.localeCompare(b.display)), [codeMap]);

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return expenses
      .filter((e) => !term || [e.equipmentCode, e.purpose, e.location, e.notes, custodyLabel(e.custodyId)].join(" ").toLowerCase().includes(term))
      .filter((e) => !catFilter || e.category === catFilter)
      .filter((e) => !srcFilter || e.source === srcFilter)
      .filter((e) => !dateFrom || (e.date && e.date >= dateFrom))
      .filter((e) => !dateTo || (e.date && e.date <= dateTo))
      .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  }, [expenses, q, catFilter, srcFilter, dateFrom, dateTo, custodies]);

  const rowsTotal = rows.reduce((s, e) => s + (Number(e.cash) || 0) + (Number(e.transfer) || 0) + (Number(e.check) || 0), 0);

  const saveEdit = (e) => {
    e.preventDefault();
    onUpdate(editing.id, editing);
    setEditing(null);
  };
  const setField = (k) => (e) => setEditing((f) => ({ ...f, [k]: e.target.value }));

  const handleEditCodeChange = (e) => {
    const code = e.target.value;
    const known = codeMap[normCode(code)];
    setEditing((f) => ({
      ...f,
      equipmentCode: code,
      equipmentType: known ? known.type : f.equipmentType,
      brand: known ? known.brand : f.brand,
      location: known && known.location ? known.location : f.location,
    }));
  };

  const handleExcelExport = () => {
    const rowsOut = rows.map((e) => ({
      "التاريخ": e.date, "الجهة": e.source, "العهدة": custodyLabel(e.custodyId), "التصنيف": e.category,
      "كود المعدة": e.equipmentCode, "النوع": e.equipmentType, "الماركة": e.brand, "الموقع": e.location,
      "الغرض من الصرف": e.purpose, "ملاحظات": e.notes, "طريقة الصرف": e.paymentMethod,
      "نقدي": Number(e.cash) || 0, "تحويل": Number(e.transfer) || 0, "شيك": Number(e.check) || 0,
    }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rowsOut), "قاعدة البيانات");
    XLSX.writeFile(wb, `قاعدة_البيانات_${todayISO()}.xlsx`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <Header
        title="قاعدة البيانات"
        sub={`${expenses.length} بند صرف مسجل`}
        action={
          <div className="no-print flex flex-wrap gap-2">
            <ExportButtons onExcel={handleExcelExport} onPdf={handlePrint} />
          </div>
        }
      />

      {editing && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4" style={{ background: "rgba(16,26,46,0.5)" }}>
          <form onSubmit={saveEdit} className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6" style={{ background: COLORS.paper }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-lg" style={{ color: COLORS.ink }}>تعديل بند الصرف</h3>
              <button type="button" onClick={() => setEditing(null)} className="p-1.5 rounded-md hover:bg-gray-100"><X size={18} /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="الجهة"><Select value={editing.source} onChange={setField("source")}>{SOURCES.map((s) => <option key={s}>{s}</option>)}</Select></Field>
              <Field label="التصنيف"><Select value={editing.category} onChange={setField("category")}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</Select></Field>
              <Field label="التاريخ"><TextInput type="date" value={editing.date} onChange={setField("date")} /></Field>
              <Field label="كود المعدة">
                <Select value={editing.equipmentCode} onChange={handleEditCodeChange}>
                  <option value="">اختر كود المعدة</option>
                  {codeOptions.map((c) => <option key={c.display} value={c.display}>{c.display}</option>)}
                </Select>
              </Field>
              <Field label="النوع"><TextInput value={editing.equipmentType} onChange={setField("equipmentType")} /></Field>
              <Field label="الماركة"><TextInput value={editing.brand} onChange={setField("brand")} /></Field>
              <Field label="الموقع"><TextInput value={editing.location} onChange={setField("location")} /></Field>
              <Field label="طريقة الصرف"><Select value={editing.paymentMethod} onChange={setField("paymentMethod")}>{PAYMENT_METHODS.map((p) => <option key={p}>{p}</option>)}</Select></Field>
              <div />
              <Field label="نقدي"><TextInput type="number" step="0.01" value={editing.cash} onChange={setField("cash")} /></Field>
              <Field label="تحويل"><TextInput type="number" step="0.01" value={editing.transfer} onChange={setField("transfer")} /></Field>
              <Field label="شيك"><TextInput type="number" step="0.01" value={editing.check} onChange={setField("check")} /></Field>
              <div className="md:col-span-3"><Field label="الغرض من الصرف"><TextInput value={editing.purpose} onChange={setField("purpose")} /></Field></div>
              <div className="md:col-span-3"><Field label="ملاحظات"><TextInput value={editing.notes} onChange={setField("notes")} /></Field></div>
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t" style={{ borderColor: COLORS.border }}>
              <button type="button" onClick={() => setEditing(null)} className="px-5 py-2.5 rounded-lg text-sm font-bold" style={{ color: COLORS.slate }}>إلغاء</button>
              <button type="submit" className="px-6 py-2.5 rounded-lg text-sm font-bold text-white" style={{ background: COLORS.gold, color: COLORS.navy }}>حفظ التعديلات</button>
            </div>
          </form>
        </div>
      )}

      <SectionCard>
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: COLORS.slateLight }} />
            <TextInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث بالكود، الموقع، الغرض من الصرف..." className="pr-9" />
          </div>
          <button onClick={() => setShowFilters((s) => !s)} className="px-4 rounded-lg border flex items-center gap-2 text-sm font-semibold shrink-0" style={{ borderColor: COLORS.border, color: showFilters ? COLORS.gold : COLORS.slate }}>
            <Filter size={15} /> فلاتر
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 p-3 rounded-lg" style={{ background: COLORS.cream }}>
            <Field label="التصنيف">
              <Select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}>
                <option value="">الكل</option>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </Select>
            </Field>
            <Field label="الجهة">
              <Select value={srcFilter} onChange={(e) => setSrcFilter(e.target.value)}>
                <option value="">الكل</option>
                {SOURCES.map((s) => <option key={s}>{s}</option>)}
              </Select>
            </Field>
            <Field label="من تاريخ">
              <TextInput type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </Field>
            <Field label="إلى تاريخ">
              <TextInput type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </Field>
          </div>
        )}

        {(q || catFilter || srcFilter || dateFrom || dateTo) && (
          <div className="text-xs font-semibold mb-3" style={{ color: COLORS.slate }}>
            {fmtNum(rows.length)} نتيجة — إجمالي {fmtMoney(rowsTotal)}
          </div>
        )}

        {rows.length === 0 ? (
          <EmptyState icon={Database} title="لا توجد نتائج" />
        ) : (
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: `linear-gradient(90deg, ${COLORS.navy}, ${COLORS.navyLight})` }}>
                  {["التاريخ", "العهدة", "التصنيف", "كود المعدة", "الموقع", "الغرض من الصرف", "الإجمالي", ""].map((h) => (
                    <th key={h} className="px-3 py-2.5 text-right text-xs font-bold whitespace-nowrap" style={{ color: "rgba(255,255,255,0.88)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((e) => {
                  const total = (Number(e.cash) || 0) + (Number(e.transfer) || 0) + (Number(e.check) || 0);
                  return (
                    <tr key={e.id} className="border-t hover:bg-gray-50" style={{ borderColor: COLORS.border }}>
                      <td className="px-3 py-2.5 text-xs whitespace-nowrap" style={{ color: COLORS.slate }}>{e.date}</td>
                      <td className="px-3 py-2.5 text-xs whitespace-nowrap">{custodyLabel(e.custodyId)}</td>
                      <td className="px-3 py-2.5 text-xs whitespace-nowrap">{e.category}</td>
                      <td className="px-3 py-2.5 font-semibold whitespace-nowrap">{e.equipmentCode || "—"}</td>
                      <td className="px-3 py-2.5 text-xs whitespace-nowrap">{e.location || "—"}</td>
                      <td className="px-3 py-2.5 text-xs max-w-[220px] truncate" title={e.purpose}>{e.purpose}</td>
                      <td className="px-3 py-2.5 tabular-nums font-semibold whitespace-nowrap">{fmtMoney(total)}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setEditing({ ...e })} className="p-1.5 rounded-md hover:bg-gray-100" style={{ color: COLORS.slate }}>
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => onDelete(e.id)} className="p-1.5 rounded-md hover:bg-red-50" style={{ color: COLORS.danger }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <div className="print-only-area" id="print-area">
        <h2 style={{ fontFamily: "Cairo", textAlign: "center" }}>قاعدة البيانات</h2>
        <table>
          <thead>
            <tr>{["التاريخ", "الجهة", "التصنيف", "كود المعدة", "النوع", "الموقع", "الغرض من الصرف", "نقدي", "تحويل", "شيك"].map((h) => <th key={h}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((e) => (
              <tr key={e.id}>
                <td>{e.date}</td><td>{e.source}</td><td>{e.category}</td><td>{e.equipmentCode}</td>
                <td>{e.equipmentType}</td><td>{e.location}</td><td>{e.purpose}</td>
                <td>{Number(e.cash) ? fmtNum(e.cash) : ""}</td>
                <td>{Number(e.transfer) ? fmtNum(e.transfer) : ""}</td>
                <td>{Number(e.check) ? fmtNum(e.check) : ""}</td>
              </tr>
            ))}
            <tr><td colSpan={7}><b>الإجمالي</b></td><td colSpan={3}><b>{fmtMoney(rowsTotal)}</b></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============================================================
   بطاقة أداء المعدات
============================================================ */
function classifyVehicleRow(purpose = "") {
  if (purpose.includes("كارت") || purpose.includes("ميزان") || purpose.includes("موازين")) return "cards";
  if (purpose.includes("سائق")) return "driver";
  return "routine";
}

/* ============================================================
   سجل الصيانة
============================================================ */
function MaintenanceLogView({ expenses }) {
  const [code, setCode] = useState("");

  const knownCodes = useMemo(() => [...new Set(expenses.filter((e) => e.equipmentCode).map((e) => e.equipmentCode))].sort(), [expenses]);

  const records = useMemo(() => {
    if (!code) return [];
    return expenses
      .filter((e) => e.equipmentCode === code && (e.category === "أولاً - مصروفات السيارات" || e.category === "ثانياً - صيانة المعدات"))
      .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  }, [expenses, code]);

  const total = records.reduce((s, e) => s + (Number(e.cash) || 0) + (Number(e.transfer) || 0) + (Number(e.check) || 0), 0);

  const handleExcelExport = () => {
    const rowsOut = records.map((e) => ({
      "التاريخ": e.date, "التصنيف": e.category, "الغرض من الصرف": e.purpose, "الموقع": e.location,
      "الإجمالي": (Number(e.cash) || 0) + (Number(e.transfer) || 0) + (Number(e.check) || 0),
    }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rowsOut), "سجل الصيانة");
    XLSX.writeFile(wb, `سجل_صيانة_${code}_${todayISO()}.xlsx`);
  };
  const handlePdfExport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <Header
        title="سجل الصيانة"
        sub="اكتب كود المعدة عشان تشوف كل تاريخ صيانتها بالتفصيل"
        action={code && records.length > 0 ? <ExportButtons onExcel={handleExcelExport} onPdf={handlePdfExport} /> : null}
      />

      <SectionCard>
        <Field label="كود المعدة">
          <TextInput list="log-codes" value={code} onChange={(e) => setCode(e.target.value)} placeholder="مثال: EX-200-32" />
          <datalist id="log-codes">{knownCodes.map((c) => <option key={c} value={c} />)}</datalist>
        </Field>
      </SectionCard>

      {!code ? (
        <SectionCard><EmptyState icon={ListChecks} title="اكتب كود معدة عشان تشوف سجل صيانتها" /></SectionCard>
      ) : records.length === 0 ? (
        <SectionCard><EmptyState icon={ListChecks} title={`مفيش سجل صيانة لكود "${code}"`} sub="تأكد إن الكود مطابق تمامًا لما هو مسجل في بند الصرف" /></SectionCard>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4">
            <KPICard label="عدد مرات الصيانة" value={fmtNum(records.length)} icon={Wrench} />
            <KPICard label="إجمالي التكلفة" value={fmtMoney(total)} tone="gold" icon={Wallet} />
          </div>
          <SectionCard title={`سجل صيانة ${code} (${records.length})`}>
            <div className="overflow-x-auto -mx-5">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: `linear-gradient(90deg, ${COLORS.navy}, ${COLORS.navyLight})` }}>
                    {["التاريخ", "التصنيف", "الغرض من الصرف", "الموقع", "الإجمالي"].map((h) => (
                      <th key={h} className="px-4 py-2.5 text-right text-xs font-bold whitespace-nowrap" style={{ color: "rgba(255,255,255,0.88)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {records.map((e) => (
                    <tr key={e.id} className="border-t" style={{ borderColor: COLORS.border }}>
                      <td className="px-4 py-2.5 text-xs whitespace-nowrap" style={{ color: COLORS.slate }}>{e.date}</td>
                      <td className="px-4 py-2.5 text-xs whitespace-nowrap">{e.category}</td>
                      <td className="px-4 py-2.5 text-sm">{e.purpose}</td>
                      <td className="px-4 py-2.5 text-xs whitespace-nowrap">{e.location || "—"}</td>
                      <td className="px-4 py-2.5 tabular-nums font-bold whitespace-nowrap">{fmtMoney((Number(e.cash) || 0) + (Number(e.transfer) || 0) + (Number(e.check) || 0))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>

          <div className="print-only-area" id="print-area">
            <h2 style={{ fontFamily: "Cairo", textAlign: "center", marginBottom: 12 }}>سجل صيانة {code}</h2>
            <table>
              <thead><tr>{["التاريخ", "التصنيف", "الغرض من الصرف", "الموقع", "الإجمالي"].map((h) => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {records.map((e) => (
                  <tr key={e.id}>
                    <td>{e.date}</td><td>{e.category}</td><td>{e.purpose}</td><td>{e.location}</td>
                    <td>{fmtMoney((Number(e.cash) || 0) + (Number(e.transfer) || 0) + (Number(e.check) || 0))}</td>
                  </tr>
                ))}
                <tr><td colSpan={4}><b>الإجمالي</b></td><td><b>{fmtMoney(total)}</b></td></tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

/* ============================================================
   السولار - سجل تفصيلي + استيراد/تصدير/طباعة
============================================================ */
function FuelView({ records, onAdd, onDelete, onImport }) {
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [q, setQ] = useState("");
  const fileRef = useRef(null);
  const printRef = useRef(null);
  const [importPreview, setImportPreview] = useState(null);
  const [importMode, setImportMode] = useState("append");

  const empty = { date: todayISO(), time: "", code: "", vehicleType: "", driverName: "", station: "", fuelType: "", odometerStart: "", odometerEnd: "", quantity: "", pricePerLiter: "", commission: "", tax: "", notes: "" };
  const [form, setForm] = useState(empty);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const distancePreview = (Number(form.odometerEnd) || 0) - (Number(form.odometerStart) || 0);
  const totalPreview = (Number(form.quantity) || 0) * (Number(form.pricePerLiter) || 0) + (Number(form.commission) || 0) + (Number(form.tax) || 0);

  const submit = (e) => {
    e.preventDefault();
    onAdd(form);
    setForm({ ...empty, date: form.date, code: "", vehicleType: "" });
  };

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return [...records]
      .filter((r) => !term || [r.code, r.vehicleType, r.driverName, r.station, r.notes].join(" ").toLowerCase().includes(term))
      .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  }, [records, q]);

  const totalCost = records.reduce((s, r) => s + (Number(r.total) || 0), 0);
  const totalQty = records.reduce((s, r) => s + (Number(r.quantity) || 0), 0);
  const totalDist = records.reduce((s, r) => s + (Number(r.distance) || 0), 0);
  const avgRate = totalQty ? totalDist / totalQty : 0;

  const handleFile = async (file) => {
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { cellDates: true });
      const sheetName = wb.SheetNames.includes("Fuel Transactions") ? "Fuel Transactions" : wb.SheetNames[0];
      const ws = wb.Sheets[sheetName];
      const allRows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
      const headerRow = (allRows[0] || []).map((h) => String(h || "").trim());
      const colIndex = (names) => {
        for (const name of names) {
          const idx = headerRow.indexOf(name);
          if (idx !== -1) return idx;
        }
        // مطابقة تقريبية احتياطية لو الاسم مش مطابق حرفيًا
        for (const name of names) {
          const idx = headerRow.findIndex((h) => h && (h.includes(name) || name.includes(h)));
          if (idx !== -1) return idx;
        }
        return -1;
      };
      const idxDate = colIndex(["التاريخ"]);
      const idxTime = colIndex(["الوقت"]);
      const idxCode = colIndex(["رقم اللوحة", "كود المعدة"]);
      const idxType = colIndex(["نوع المركبة", "النوع"]);
      const idxDriverName = colIndex(["إسم السائق", "اسم السائق"]);
      const idxStation = colIndex(["المحطة"]);
      const idxFuelType = colIndex(["نوع الوقود"]);
      const idxQty = colIndex(["الكمية", "الكمية (لتر)", "كمية", "لتر"]);
      const idxCommission = colIndex(["العمولة"]);
      const idxTax = colIndex(["الضريبة"]);
      const idxTotal = colIndex(["الإجمالي"]);
      const idxOdoStart = colIndex(["قراءة العداد أول الفترة"]);
      const idxOdoEnd = colIndex(["عداد الكيلومترات", "قراءة العداد آخر الفترة"]);
      const idxDistance = colIndex(["المسافه", "المسافة"]);
      const idxRate = colIndex(["معدل الإستهلاك", "معدل الاستهلاك"]);
      const idxNotes = colIndex(["ملاحظات"]);

      if (idxCode === -1) {
        alert('تعذّر التعرف على عمود "رقم اللوحة" أو "كود المعدة" في الملف — تأكد إن الملف بنفس تنسيق تقرير محطات الوقود أو تصدير سجل السولار من البرنامج.');
        return;
      }

      const rowsRaw = allRows.slice(1).filter((r) => r[idxCode]);
      const parsed = rowsRaw.map((r) => {
        const quantity = Number(r[idxQty]) || 0;
        const total = Number(r[idxTotal]) || 0;
        const commission = idxCommission !== -1 ? Number(r[idxCommission]) || 0 : 0;
        const tax = idxTax !== -1 ? Number(r[idxTax]) || 0 : 0;
        const distance = idxDistance !== -1 ? Number(r[idxDistance]) || 0 : 0;
        return {
          id: uid(),
          date: idxDate !== -1 ? toISODate(r[idxDate]) : "",
          time: idxTime !== -1 ? String(r[idxTime] || "") : "",
          code: r[idxCode] || "",
          vehicleType: idxType !== -1 ? (r[idxType] || "").toString().trim() : "",
          driverName: idxDriverName !== -1 ? r[idxDriverName] || "" : "",
          station: idxStation !== -1 ? r[idxStation] || "" : "",
          fuelType: idxFuelType !== -1 ? r[idxFuelType] || "" : "",
          odometerStart: idxOdoStart !== -1 ? r[idxOdoStart] : "",
          odometerEnd: idxOdoEnd !== -1 ? r[idxOdoEnd] : "",
          quantity,
          pricePerLiter: quantity ? (total - commission - tax) / quantity : 0,
          commission,
          tax,
          distance,
          total,
          rate: idxRate !== -1 ? (Number(r[idxRate]) || (quantity ? distance / quantity : 0)) : (quantity ? distance / quantity : 0),
          notes: idxNotes !== -1 ? r[idxNotes] || "" : "",
        };
      }).filter((r) => r.code);
      if (parsed.length === 0) {
        alert("مفيش صفوف صالحة للاستيراد في الملف ده.");
        return;
      }
      setImportPreview(parsed);
    } catch (err) {
      alert("تعذّرت قراءة الملف — تأكد إنه بنفس تنسيق تقرير محطات الوقود.");
    }
  };

  const confirmImport = () => {
    if (!importPreview) return;
    onImport(importPreview, importMode);
    setImportPreview(null);
    setShowImport(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleExport = () => {
    const rowsOut = records.map((r) => ({
      "التاريخ": r.date, "الوقت": r.time, "كود المعدة": r.code, "النوع": r.vehicleType,
      "اسم السائق": r.driverName, "المحطة": r.station, "نوع الوقود": r.fuelType,
      "قراءة العداد أول الفترة": r.odometerStart, "قراءة العداد آخر الفترة": r.odometerEnd,
      "المسافة": r.distance, "الكمية (لتر)": r.quantity, "سعر اللتر": r.pricePerLiter,
      "العمولة": r.commission, "الضريبة": r.tax,
      "الإجمالي": r.total, "معدل الاستهلاك": r.rate, "ملاحظات": r.notes,
    }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rowsOut), "سجل السولار");
    XLSX.writeFile(wb, `سجل_السولار_${todayISO()}.xlsx`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <Header
        title="السولار"
        sub="سجل تفصيلي لاستهلاك السولار لكل معدة"
        action={
          <div className="flex flex-wrap gap-2">
            <button onClick={() => { setShowForm((s) => !s); setShowImport(false); }} className="px-4 py-2.5 rounded-lg text-sm font-bold text-white flex items-center gap-2" style={{ background: COLORS.navy }}>
              {showForm ? <X size={16} /> : <Plus size={16} />} {showForm ? "إلغاء" : "سجل جديد"}
            </button>
            <button onClick={() => { setShowImport((s) => !s); setShowForm(false); }} className="px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2" style={{ background: COLORS.cream, color: COLORS.ink }}>
              <UploadCloud size={16} /> استيراد
            </button>
            <button onClick={handleExport} className="px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2" style={{ background: COLORS.cream, color: COLORS.ink }}>
              <FileSpreadsheet size={16} /> تصدير
            </button>
            <button onClick={handlePrint} className="px-4 py-2.5 rounded-lg text-sm font-bold text-white flex items-center gap-2" style={{ background: COLORS.gold, color: COLORS.navy }}>
              <Printer size={16} /> طباعة
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard label="إجمالي تكلفة السولار" value={fmtMoney(totalCost)} icon={Fuel} />
        <KPICard label="إجمالي الكمية (لتر)" value={fmtNum(totalQty.toFixed(0))} tone="gold" icon={Fuel} />
        <KPICard label="إجمالي المسافة (كم)" value={fmtNum(totalDist.toFixed(0))} icon={TrendingUp} />
        <KPICard label="متوسط الاستهلاك" value={`${avgRate.toFixed(2)} كم/لتر`} tone="gold" icon={BarChart3} />
      </div>

      {showForm && (
        <form onSubmit={submit}>
          <SectionCard title="سجل سولار جديد">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="التاريخ" required><TextInput type="date" value={form.date} onChange={set("date")} required /></Field>
              <Field label="الوقت"><TextInput value={form.time} onChange={set("time")} placeholder="مثال: 7:49 م" /></Field>
              <Field label="كود المعدة" required><TextInput value={form.code} onChange={set("code")} required placeholder="مثال: ط ط ق 3742" /></Field>
              <Field label="النوع"><TextInput value={form.vehicleType} onChange={set("vehicleType")} placeholder="مثال: تريلا" /></Field>
              <Field label="اسم السائق"><TextInput value={form.driverName} onChange={set("driverName")} placeholder="اختياري" /></Field>
              <Field label="المحطة"><TextInput value={form.station} onChange={set("station")} placeholder="اختياري" /></Field>
              <Field label="نوع الوقود"><TextInput value={form.fuelType} onChange={set("fuelType")} placeholder="مثال: ديزل" /></Field>
              <Field label="قراءة العداد أول الفترة"><TextInput type="number" value={form.odometerStart} onChange={set("odometerStart")} placeholder="0" /></Field>
              <Field label="قراءة العداد آخر الفترة"><TextInput type="number" value={form.odometerEnd} onChange={set("odometerEnd")} placeholder="0" /></Field>
              <Field label="الكمية (لتر)" required><TextInput type="number" step="0.01" value={form.quantity} onChange={set("quantity")} required placeholder="0" /></Field>
              <Field label="سعر اللتر" required><TextInput type="number" step="0.01" value={form.pricePerLiter} onChange={set("pricePerLiter")} required placeholder="0" /></Field>
              <Field label="العمولة"><TextInput type="number" step="0.01" value={form.commission} onChange={set("commission")} placeholder="0" /></Field>
              <Field label="الضريبة"><TextInput type="number" step="0.01" value={form.tax} onChange={set("tax")} placeholder="0" /></Field>
              <Field label="ملاحظات"><TextInput value={form.notes} onChange={set("notes")} placeholder="اختياري" /></Field>
            </div>
            <div className="flex items-center justify-between mt-6 pt-5 border-t" style={{ borderColor: COLORS.border }}>
              <div className="text-sm" style={{ color: COLORS.slate }}>
                المسافة: <b style={{ color: COLORS.ink }}>{fmtNum(distancePreview)} كم</b> — الإجمالي: <b style={{ color: COLORS.ink }}>{fmtMoney(totalPreview)}</b>
              </div>
              <button type="submit" className="px-6 py-2.5 rounded-lg text-sm font-bold text-white" style={{ background: COLORS.gold, color: COLORS.navy }}>حفظ السجل</button>
            </div>
          </SectionCard>
        </form>
      )}

      {showImport && (
        <SectionCard title="استيراد من إكسل">
          <div
            className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50"
            style={{ borderColor: COLORS.border }}
            onClick={() => fileRef.current?.click()}
          >
            <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])} />
            <FileSpreadsheet size={26} className="mb-2" style={{ color: COLORS.slateLight }} />
            <div className="font-bold text-sm" style={{ color: COLORS.ink }}>اضغط لاختيار ملف تقرير محطات الوقود</div>
          </div>
          {importPreview && (
            <div className="mt-4">
              <div className="text-sm font-semibold mb-3" style={{ color: COLORS.slate }}>هيتم استيراد {importPreview.length} سجل</div>
              <div className="flex gap-3 mb-4">
                <label className="flex items-center gap-2 text-sm"><input type="radio" checked={importMode === "append"} onChange={() => setImportMode("append")} /> إضافة للموجود</label>
                <label className="flex items-center gap-2 text-sm"><input type="radio" checked={importMode === "replace"} onChange={() => setImportMode("replace")} /> استبدال الكل</label>
              </div>
              <button onClick={confirmImport} className="px-5 py-2.5 rounded-lg text-sm font-bold text-white" style={{ background: COLORS.gold, color: COLORS.navy }}>تأكيد الاستيراد</button>
            </div>
          )}
        </SectionCard>
      )}

      {records.length === 0 ? (
        <SectionCard><EmptyState icon={Fuel} title="لا توجد سجلات سولار بعد" /></SectionCard>
      ) : (
        <SectionCard title={`السجل (${rows.length})`}>
          <div className="relative mb-4">
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: COLORS.slateLight }} />
            <TextInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث بكود المعدة أو النوع..." className="pr-9" />
          </div>
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: `linear-gradient(90deg, ${COLORS.navy}, ${COLORS.navyLight})` }}>
                  {["التاريخ", "كود المعدة", "النوع", "السائق", "المحطة", "المسافة", "الكمية", "الإجمالي", "معدل الاستهلاك", ""].map((h) => (
                    <th key={h} className="px-3 py-2.5 text-right text-xs font-bold whitespace-nowrap" style={{ color: "rgba(255,255,255,0.88)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t" style={{ borderColor: COLORS.border }}>
                    <td className="px-3 py-2.5 text-xs whitespace-nowrap" style={{ color: COLORS.slate }}>{r.date}</td>
                    <td className="px-3 py-2.5 font-semibold whitespace-nowrap">{r.code}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap">{r.vehicleType || "—"}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-xs">{r.driverName || "—"}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-xs">{r.station || "—"}</td>
                    <td className="px-3 py-2.5 tabular-nums">{fmtNum(r.distance)}</td>
                    <td className="px-3 py-2.5 tabular-nums">{fmtNum(r.quantity)}</td>
                    <td className="px-3 py-2.5 tabular-nums font-bold">{fmtMoney(r.total)}</td>
                    <td className="px-3 py-2.5 tabular-nums">{(Number(r.rate) || 0).toFixed(2)}</td>
                    <td className="px-3 py-2.5"><button onClick={() => onDelete(r.id)} className="p-1.5 rounded-md hover:bg-red-50" style={{ color: COLORS.danger }}><Trash2 size={14} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}

      <div className="print-only-area" id="print-area">
        <div ref={printRef}>
          <h2 style={{ fontFamily: "Cairo", textAlign: "center" }}>سجل استهلاك السولار</h2>
          <table>
            <thead><tr>{["التاريخ", "كود المعدة", "النوع", "السائق", "المحطة", "المسافة", "الكمية", "الإجمالي", "معدل الاستهلاك"].map((h) => <th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.date}</td><td>{r.code}</td><td>{r.vehicleType}</td>
                  <td>{r.driverName || ""}</td><td>{r.station || ""}</td>
                  <td>{fmtNum(r.distance)}</td><td>{fmtNum(r.quantity)}</td>
                  <td>{fmtMoney(r.total)}</td><td>{(Number(r.rate) || 0).toFixed(2)}</td>
                </tr>
              ))}
              <tr><td colSpan={6}><b>الإجمالي</b></td><td><b>{fmtNum(totalQty.toFixed(0))}</b></td><td><b>{fmtMoney(totalCost)}</b></td><td><b>{avgRate.toFixed(2)}</b></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   الزيوت والفلاتر
============================================================ */
const OIL_ITEM_TYPES = ["زيت محرك", "زيت هيدروليك", "زيت جير", "فلتر زيت", "فلتر هواء", "فلتر سولار", "فلتر هيدروليك", "شحم", "أخرى"];

function OilsView({ records, equipmentCodes, expenses, onAdd, onDelete, onImport }) {
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [q, setQ] = useState("");
  const fileRef = useRef(null);
  const [importPreview, setImportPreview] = useState(null);
  const [importMode, setImportMode] = useState("append");

  const empty = { date: todayISO(), equipmentCode: "", equipmentType: "", location: "", itemType: "", quantity: "", unitPrice: "", notes: "" };
  const [form, setForm] = useState(empty);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const codeMap = useMemo(() => {
    const map = {};
    equipmentCodes.forEach((c) => {
      if (isCostPoolCode(c.code)) return;
      map[normCode(c.code)] = { display: String(c.code || ""), type: c.type, location: c.location };
    });
    expenses.forEach((e) => {
      const nc = normCode(e.equipmentCode);
      if (nc && !map[nc]) map[nc] = { display: String(e.equipmentCode || ""), type: e.equipmentType, location: e.location };
    });
    return map;
  }, [equipmentCodes, expenses]);
  const codeOptions = useMemo(() => Object.values(codeMap).sort((a, b) => a.display.localeCompare(b.display)), [codeMap]);

  const handleCodeChange = (e) => {
    const code = e.target.value;
    const known = codeMap[normCode(code)];
    setForm((f) => ({
      ...f,
      equipmentCode: code,
      equipmentType: known ? known.type : f.equipmentType,
      location: known && known.location ? known.location : f.location,
    }));
  };

  const totalPreview = (Number(form.quantity) || 0) * (Number(form.unitPrice) || 0);

  const submit = (e) => {
    e.preventDefault();
    onAdd(form);
    setForm({ ...empty, date: form.date });
  };

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return [...records]
      .filter((r) => !term || [r.equipmentCode, r.equipmentType, r.itemType, r.location, r.notes].join(" ").toLowerCase().includes(term))
      .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  }, [records, q]);

  const totalCost = records.reduce((s, r) => s + (Number(r.total) || 0), 0);

  const handleExcelExport = () => {
    const rowsOut = records.map((r) => ({
      "التاريخ": r.date, "كود المعدة": r.equipmentCode, "النوع": r.equipmentType, "الموقع": r.location,
      "الصنف": r.itemType, "الكمية": r.quantity, "سعر الوحدة": r.unitPrice, "الإجمالي": r.total, "ملاحظات": r.notes,
    }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rowsOut), "الزيوت والفلاتر");
    XLSX.writeFile(wb, `الزيوت_والفلاتر_${todayISO()}.xlsx`);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleFile = async (file) => {
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { cellDates: true });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const allRows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
      const headerRow = (allRows[0] || []).map((h) => String(h || "").trim());
      const colIndex = (names) => {
        for (const name of names) {
          const idx = headerRow.indexOf(name);
          if (idx !== -1) return idx;
        }
        for (const name of names) {
          const idx = headerRow.findIndex((h) => h && (h.includes(name) || name.includes(h)));
          if (idx !== -1) return idx;
        }
        return -1;
      };
      const idxDate = colIndex(["التاريخ"]);
      const idxCode = colIndex(["كود المعدة"]);
      const idxType = colIndex(["النوع"]);
      const idxLocation = colIndex(["الموقع"]);
      const idxItemType = colIndex(["الصنف", "نوع الصنف"]);
      const idxQty = colIndex(["الكمية"]);
      const idxUnitPrice = colIndex(["سعر الوحدة"]);
      const idxTotal = colIndex(["الإجمالي"]);
      const idxNotes = colIndex(["ملاحظات"]);

      if (idxCode === -1) {
        alert('تعذّر التعرف على عمود "كود المعدة" في الملف.');
        return;
      }
      const parsed = allRows.slice(1).filter((r) => r[idxCode]).map((r) => {
        const quantity = Number(r[idxQty]) || 0;
        const total = idxTotal !== -1 ? Number(r[idxTotal]) || 0 : 0;
        const unitPrice = idxUnitPrice !== -1 ? Number(r[idxUnitPrice]) || 0 : (quantity ? total / quantity : 0);
        return {
          id: uid(),
          date: idxDate !== -1 ? toISODate(r[idxDate]) : "",
          equipmentCode: r[idxCode] || "",
          equipmentType: idxType !== -1 ? r[idxType] || "" : "",
          location: idxLocation !== -1 ? r[idxLocation] || "" : "",
          itemType: idxItemType !== -1 ? r[idxItemType] || "" : "",
          quantity,
          unitPrice,
          total: total || quantity * unitPrice,
          notes: idxNotes !== -1 ? r[idxNotes] || "" : "",
        };
      }).filter((r) => r.equipmentCode);
      if (parsed.length === 0) {
        alert("مفيش صفوف صالحة للاستيراد في الملف ده.");
        return;
      }
      setImportPreview(parsed);
    } catch (err) {
      alert("تعذّر قراءة الملف — تأكد إنه ملف إكسل صحيح.");
    }
  };

  const confirmImport = () => {
    onImport(importPreview, importMode);
    setImportPreview(null);
    setShowImport(false);
  };

  return (
    <div className="space-y-6">
      <Header
        title="الزيوت والفلاتر"
        sub="سجل مسحوبات الزيوت والفلاتر لكل معدة — بتتحمّل كمصروفات مباشرة في تاب ربحية المعدات"
        action={
          <div className="flex flex-wrap gap-2">
            <ExportButtons onExcel={handleExcelExport} onPdf={handlePrint} />
            <button onClick={() => { setShowImport((s) => !s); setShowForm(false); }} className="px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2" style={{ background: COLORS.cream, color: COLORS.ink }}>
              <UploadCloud size={16} /> استيراد
            </button>
            <button onClick={() => setShowForm((s) => !s)} className="px-4 py-2.5 rounded-lg text-sm font-bold text-white flex items-center gap-2" style={{ background: COLORS.navy }}>
              {showForm ? <X size={16} /> : <Plus size={16} />} {showForm ? "إلغاء" : "سجل جديد"}
            </button>
          </div>
        }
      />

      <KPICard label="إجمالي تكلفة الزيوت والفلاتر" value={fmtMoney(totalCost)} icon={Wrench} tone="gold" />

      {showImport && (
        <SectionCard title="استيراد من إكسل">
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:bg-gray-50"
            style={{ borderColor: COLORS.border }}
          >
            <UploadCloud size={28} className="mx-auto mb-2" style={{ color: COLORS.slateLight }} />
            <p className="text-sm font-semibold" style={{ color: COLORS.ink }}>دوس هنا لاختيار ملف إكسل</p>
            <p className="text-xs mt-1" style={{ color: COLORS.slateLight }}>الأعمدة المتوقعة: التاريخ، كود المعدة، النوع، الموقع، الصنف، الكمية، سعر الوحدة، الإجمالي، ملاحظات</p>
            <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])} />
          </div>

          {importPreview && (
            <div className="mt-5">
              <div className="flex items-center gap-4 mb-3">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" checked={importMode === "append"} onChange={() => setImportMode("append")} /> إضافة للموجود
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="radio" checked={importMode === "replace"} onChange={() => setImportMode("replace")} /> استبدال الكل
                </label>
              </div>
              <p className="text-sm font-semibold mb-3" style={{ color: COLORS.ink }}>هيتم استيراد {fmtNum(importPreview.length)} سجل</p>
              <button onClick={confirmImport} className="px-5 py-2.5 rounded-lg text-sm font-bold text-white" style={{ background: COLORS.gold, color: COLORS.navy }}>تأكيد الاستيراد</button>
            </div>
          )}
        </SectionCard>
      )}

      {showForm && (
        <form onSubmit={submit}>
          <SectionCard title="سجل زيوت وفلاتر جديد">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="التاريخ" required><TextInput type="date" value={form.date} onChange={set("date")} required /></Field>
              <Field label="كود المعدة" required>
                <Select value={form.equipmentCode} onChange={handleCodeChange} required>
                  <option value="">اختر كود المعدة</option>
                  {codeOptions.map((c) => <option key={c.display} value={c.display}>{c.display}</option>)}
                </Select>
              </Field>
              <Field label="النوع"><TextInput value={form.equipmentType} onChange={set("equipmentType")} placeholder="مثال: حفار" /></Field>
              <Field label="الموقع"><TextInput value={form.location} onChange={set("location")} placeholder="اختياري" /></Field>
              <Field label="الصنف" required>
                <TextInput list="oil-item-types" value={form.itemType} onChange={set("itemType")} required placeholder="اكتب اسم الصنف" />
                <datalist id="oil-item-types">
                  {OIL_ITEM_TYPES.map((t) => <option key={t} value={t} />)}
                </datalist>
              </Field>
              <Field label="الكمية" required><TextInput type="number" step="0.01" value={form.quantity} onChange={set("quantity")} required placeholder="0" /></Field>
              <Field label="سعر الوحدة" required><TextInput type="number" step="0.01" value={form.unitPrice} onChange={set("unitPrice")} required placeholder="0" /></Field>
              <Field label="ملاحظات"><TextInput value={form.notes} onChange={set("notes")} placeholder="اختياري" /></Field>
            </div>
            <div className="flex items-center justify-between mt-6 pt-5 border-t" style={{ borderColor: COLORS.border }}>
              <div className="text-sm" style={{ color: COLORS.slate }}>
                الإجمالي: <b style={{ color: COLORS.ink }}>{fmtMoney(totalPreview)}</b>
              </div>
              <button type="submit" className="px-6 py-2.5 rounded-lg text-sm font-bold text-white" style={{ background: COLORS.gold, color: COLORS.navy }}>حفظ السجل</button>
            </div>
          </SectionCard>
        </form>
      )}

      <SectionCard>
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: COLORS.slateLight }} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث بكود المعدة أو الصنف..." className="w-full pr-9 pl-3 py-2.5 rounded-lg text-sm border" style={{ borderColor: COLORS.border }} />
          </div>
        </div>

        {rows.length === 0 ? (
          <EmptyState icon={Wrench} title="لا توجد سجلات بعد" />
        ) : (
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: `linear-gradient(90deg, ${COLORS.navy}, ${COLORS.navyLight})` }}>
                  {["التاريخ", "كود المعدة", "النوع", "الصنف", "الكمية", "الإجمالي", ""].map((h) => (
                    <th key={h} className="px-3 py-2.5 text-right text-xs font-bold whitespace-nowrap" style={{ color: "rgba(255,255,255,0.88)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t" style={{ borderColor: COLORS.border }}>
                    <td className="px-3 py-2.5 text-xs whitespace-nowrap" style={{ color: COLORS.slate }}>{r.date}</td>
                    <td className="px-3 py-2.5 font-semibold whitespace-nowrap">{r.equipmentCode}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap">{r.equipmentType || "—"}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap">{r.itemType || "—"}</td>
                    <td className="px-3 py-2.5 tabular-nums">{fmtNum(r.quantity)}</td>
                    <td className="px-3 py-2.5 tabular-nums font-bold">{fmtMoney(r.total)}</td>
                    <td className="px-3 py-2.5"><button onClick={() => onDelete(r.id)} className="p-1.5 rounded-md hover:bg-red-50" style={{ color: COLORS.danger }}><Trash2 size={14} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <div className="print-only-area" id="print-area">
        <h2 style={{ fontFamily: "Cairo", textAlign: "center" }}>سجل الزيوت والفلاتر</h2>
        <table>
          <thead><tr>{["التاريخ", "كود المعدة", "النوع", "الصنف", "الكمية", "سعر الوحدة", "الإجمالي"].map((h) => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.date}</td><td>{r.equipmentCode}</td><td>{r.equipmentType}</td><td>{r.itemType}</td>
                <td>{fmtNum(r.quantity)}</td><td>{fmtMoney(r.unitPrice)}</td><td>{fmtMoney(r.total)}</td>
              </tr>
            ))}
            <tr><td colSpan={6}><b>الإجمالي</b></td><td><b>{fmtMoney(totalCost)}</b></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============================================================
   تحليل السولار
============================================================ */
function FuelAnalysisView({ records }) {
  if (records.length === 0) {
    return (
      <div className="space-y-6">
        <Header title="تحليل السولار" sub="تحليلات استهلاك السولار" />
        <SectionCard><EmptyState icon={Fuel} title="لا توجد بيانات كافية للتحليل بعد" /></SectionCard>
      </div>
    );
  }

  const byCode = useMemo(() => {
    const map = {};
    records.forEach((r) => {
      if (!map[r.code]) map[r.code] = { code: r.code, total: 0, distance: 0, quantity: 0 };
      map[r.code].total += Number(r.total) || 0;
      map[r.code].distance += Number(r.distance) || 0;
      map[r.code].quantity += Number(r.quantity) || 0;
    });
    return Object.values(map).map((v) => ({ ...v, rate: v.quantity ? v.distance / v.quantity : 0 }));
  }, [records]);

  const topCost = [...byCode].sort((a, b) => b.total - a.total).slice(0, 8);
  const worstEfficiency = [...byCode].filter((v) => v.rate > 0).sort((a, b) => a.rate - b.rate).slice(0, 8);

  const monthly = useMemo(() => {
    const map = {};
    records.forEach((r) => {
      if (!r.date) return;
      const key = r.date.slice(0, 7);
      map[key] = (map[key] || 0) + (Number(r.total) || 0);
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).map(([month, total]) => ({ month, total }));
  }, [records]);

  return (
    <div className="space-y-6">
      <Header title="تحليل السولار" sub="التكلفة، الكفاءة، والاتجاه الشهري لاستهلاك السولار" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SectionCard title="أعلى المعدات تكلفة سولار">
          <div dir="ltr"><ResponsiveContainer width="100%" height={250}>
            <BarChart data={topCost} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis dataKey="code" type="category" width={90} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => fmtMoney(v)} />
              <Bar dataKey="total" fill={COLORS.gold} radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer></div>
        </SectionCard>
        <SectionCard title="أقل المعدات كفاءة (كم/لتر)">
          {worstEfficiency.length === 0 ? (
            <div className="py-10 text-center text-sm" style={{ color: COLORS.slateLight }}>
              مفيش بيانات كفاءة كافية — محتاج سجلات فيها قراءة عداد أول وآخر الفترة (مش أول تعبئة لكل معدة)
            </div>
          ) : (
            <div dir="ltr"><ResponsiveContainer width="100%" height={250}>
              <BarChart data={worstEfficiency} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="code" type="category" width={90} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => v.toFixed(2)} />
                <Bar dataKey="rate" fill={COLORS.danger} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer></div>
          )}
        </SectionCard>
        <SectionCard title="الاتجاه الشهري لتكلفة السولار" className="lg:col-span-2">
          {monthly.length === 0 ? (
            <div className="py-10 text-center text-sm" style={{ color: COLORS.slateLight }}>
              مفيش تواريخ صحيحة كفاية في السجلات لعرض الاتجاه الشهري
            </div>
          ) : (
            <div dir="ltr"><ResponsiveContainer width="100%" height={260}>
              <LineChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => fmtMoney(v)} />
                <Line type="monotone" dataKey="total" stroke={COLORS.gold} strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer></div>
          )}
        </SectionCard>
      </div>
    </div>
  );
}

/* ============================================================
   أكواد المعدات (مرجعي)
============================================================ */
function EquipmentCodesView({ codes, expenses, fuelRecords, oilRecords, revenues, onAdd, onUpdate, onDelete, onImport, onMerge }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [importPreview, setImportPreview] = useState(null);
  const [importMode, setImportMode] = useState("append");
  const [mergeChoice, setMergeChoice] = useState({});
  const fileRef = useRef(null);
  const empty = { code: "", type: "", brand: "", owner: SOURCES[0], location: "" };
  const [form, setForm] = useState(empty);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const startAdd = () => { setEditingId(null); setForm(empty); setShowForm(true); setShowImport(false); };
  const startEdit = (c) => { setEditingId(c.id); setForm({ code: c.code, type: c.type, brand: c.brand, owner: c.owner, location: c.location }); setShowForm(true); setShowImport(false); };
  const cancel = () => { setShowForm(false); setEditingId(null); setForm(empty); };

  const duplicateGroups = useMemo(() => {
    const groups = {};
    const add = (raw) => {
      const nc = normCode(raw);
      if (!nc || isCostPoolCode(nc)) return;
      const label = String(raw).trim();
      const lk = looseKey(nc);
      if (!groups[lk]) groups[lk] = {};
      groups[lk][label] = (groups[lk][label] || 0) + 1;
    };
    codes.forEach((c) => c.code && add(c.code));
    expenses.forEach((e) => e.equipmentCode && add(e.equipmentCode));
    fuelRecords.forEach((r) => r.code && add(r.code));
    oilRecords.forEach((r) => r.equipmentCode && add(r.equipmentCode));
    revenues.forEach((r) => r.equipmentCode && add(r.equipmentCode));

    return Object.entries(groups)
      .map(([lk, spellings]) => ({ lk, spellings: Object.entries(spellings).map(([label, count]) => ({ label, count })) }))
      .filter((g) => g.spellings.length > 1);
  }, [codes, expenses, fuelRecords, oilRecords, revenues]);

  const handleExcelExport = () => {
    const rowsOut = codes.map((c) => ({ "كود المعدة": c.code, "النوع": c.type, "الماركة": c.brand, "المالك": c.owner, "الموقع": c.location }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rowsOut), "أكواد المعدات");
    XLSX.writeFile(wb, `أكواد_المعدات_${todayISO()}.xlsx`);
  };
  const handlePdfExport = () => {
    window.print();
  };

  const submit = (e) => {
    e.preventDefault();
    if (editingId) onUpdate(editingId, form);
    else onAdd(form);
    cancel();
  };

  const addCostPool = (owner) => {
    onAdd({ code: `Cost Pool - ${owner === "هدي الإسلام" ? "Hadi" : "AlKayan"}`, type: "مجمع تكلفة", brand: "-", owner, location: "-" });
  };

  const handleFile = async (file) => {
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { cellDates: true });
      const sheetName = wb.SheetNames.includes("أكواد المعدات") ? "أكواد المعدات" : wb.SheetNames[0];
      const ws = wb.Sheets[sheetName];
      const allRows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
      const headerRow = (allRows[0] || []).map((h) => String(h || "").trim());
      const colIndex = (names) => {
        for (const name of names) {
          const idx = headerRow.indexOf(name);
          if (idx !== -1) return idx;
        }
        for (const name of names) {
          const idx = headerRow.findIndex((h) => h && (h.includes(name) || name.includes(h)));
          if (idx !== -1) return idx;
        }
        return -1;
      };
      const idxCode = colIndex(["كود المعدة"]);
      const idxType = colIndex(["النوع"]);
      const idxBrand = colIndex(["الماركة"]);
      const idxOwner = colIndex(["المالك"]);
      const idxLocation = colIndex(["الموقع"]);
      if (idxCode === -1) {
        alert('تعذّر التعرف على عمود "كود المعدة" في الملف.');
        return;
      }
      const matchOwner = (val) => {
        const nv = normCode(val);
        const found = SOURCES.find((s) => normCode(s) === nv);
        return found || SOURCES[0];
      };
      const parsed = allRows.slice(1).filter((r) => r[idxCode]).map((r) => ({
        id: uid(),
        code: r[idxCode] || "",
        type: idxType !== -1 ? r[idxType] || "" : "",
        brand: idxBrand !== -1 ? r[idxBrand] || "" : "",
        owner: idxOwner !== -1 ? matchOwner(r[idxOwner]) : SOURCES[0],
        location: idxLocation !== -1 ? r[idxLocation] || "" : "",
      }));
      if (parsed.length === 0) {
        alert("مفيش صفوف صالحة للاستيراد في الملف ده.");
        return;
      }
      setImportPreview(parsed);
    } catch (err) {
      alert("تعذّرت قراءة الملف.");
    }
  };

  const confirmImport = () => {
    if (!importPreview) return;
    onImport(importPreview, importMode);
    setImportPreview(null);
    setShowImport(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="space-y-6">
      <Header
        title="أكواد المعدات"
        sub="قائمة مرجعية بكل المعدات والسيارات، مالكها، وموقعها"
        action={
          <div className="flex flex-wrap gap-2">
            <ExportButtons onExcel={handleExcelExport} onPdf={handlePdfExport} />
            <button onClick={() => { setShowImport((s) => !s); setShowForm(false); }} className="px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2" style={{ background: COLORS.cream, color: COLORS.ink }}>
              <UploadCloud size={16} /> استيراد
            </button>
            <button onClick={() => (showForm ? cancel() : startAdd())} className="px-4 py-2.5 rounded-lg text-sm font-bold text-white flex items-center gap-2" style={{ background: COLORS.navy }}>
              {showForm ? <X size={16} /> : <Plus size={16} />} {showForm ? "إلغاء" : "كود جديد"}
            </button>
          </div>
        }
      />

      {duplicateGroups.length > 0 && (
        <SectionCard title={`أكواد مكررة بترتيب كلمات مختلف (${duplicateGroups.length})`}>
          <p className="text-sm mb-4" style={{ color: COLORS.slate }}>
            الأكواد دي على الأغلب نفس المعدة بس اتكتبت بترتيب مختلف في أماكن مختلفة (زي "8619 ط ط ر" و"ط ط ر 8619"). النظام بيتعامل معاها كنفس المعدة في الحسابات تلقائيًا، بس لو حبيت توحّد شكلها في البيانات نفسها، اختار الصيغة الصح وادمجها.
          </p>
          <div className="space-y-4">
            {duplicateGroups.map((g) => {
              const chosen = mergeChoice[g.lk] || g.spellings[0].label;
              return (
                <div key={g.lk} className="p-4 rounded-lg" style={{ background: COLORS.cream }}>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {g.spellings.map((s) => (
                      <label key={s.label} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer" style={{ background: chosen === s.label ? COLORS.gold : COLORS.paper, color: chosen === s.label ? COLORS.navy : COLORS.ink, border: `1px solid ${COLORS.border}` }}>
                        <input type="radio" className="hidden" checked={chosen === s.label} onChange={() => setMergeChoice((m) => ({ ...m, [g.lk]: s.label }))} />
                        <span className="font-bold">{s.label}</span>
                        <span className="text-xs opacity-70">({fmtNum(s.count)} سجل)</span>
                      </label>
                    ))}
                  </div>
                  <button
                    onClick={() => onMerge(g.spellings.map((s) => s.label), chosen)}
                    className="px-4 py-2 rounded-lg text-xs font-bold text-white"
                    style={{ background: COLORS.navy }}
                  >
                    دمج كل الصيغ دي في "{chosen}"
                  </button>
                </div>
              );
            })}
          </div>
        </SectionCard>
      )}

      {showImport && (
        <SectionCard title="استيراد من إكسل">
          <div
            className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50"
            style={{ borderColor: COLORS.border }}
            onClick={() => fileRef.current?.click()}
          >
            <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])} />
            <FileSpreadsheet size={26} className="mb-2" style={{ color: COLORS.slateLight }} />
            <div className="font-bold text-sm" style={{ color: COLORS.ink }}>اضغط لاختيار ملف إكسل فيه أعمدة: كود المعدة، النوع، الماركة، المالك، الموقع</div>
          </div>
          {importPreview && (
            <div className="mt-4">
              <div className="text-sm font-semibold mb-3" style={{ color: COLORS.slate }}>هيتم استيراد {importPreview.length} كود</div>
              <div className="flex gap-3 mb-4">
                <label className="flex items-center gap-2 text-sm"><input type="radio" checked={importMode === "append"} onChange={() => setImportMode("append")} /> إضافة للموجود</label>
                <label className="flex items-center gap-2 text-sm"><input type="radio" checked={importMode === "replace"} onChange={() => setImportMode("replace")} /> استبدال الكل</label>
              </div>
              <button onClick={confirmImport} className="px-5 py-2.5 rounded-lg text-sm font-bold text-white" style={{ background: COLORS.gold, color: COLORS.navy }}>تأكيد الاستيراد</button>
            </div>
          )}
        </SectionCard>
      )}

      {showForm && (
        <form onSubmit={submit}>
          <SectionCard title={editingId ? "تعديل كود المعدة" : "كود معدة جديد"}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="كود المعدة" required><TextInput value={form.code} onChange={set("code")} required placeholder="مثال: EX-200-32" /></Field>
              <Field label="النوع"><TextInput value={form.type} onChange={set("type")} placeholder="مثال: حفار" /></Field>
              <Field label="الماركة"><TextInput value={form.brand} onChange={set("brand")} placeholder="مثال: Komatsu" /></Field>
              <Field label="المالك" required><Select value={form.owner} onChange={set("owner")}>{SOURCES.map((s) => <option key={s}>{s}</option>)}</Select></Field>
              <Field label="الموقع"><TextInput value={form.location} onChange={set("location")} placeholder="مثال: الورشة" /></Field>
            </div>
            <div className="flex justify-end mt-5 pt-4 border-t" style={{ borderColor: COLORS.border }}>
              <button type="submit" className="px-6 py-2.5 rounded-lg text-sm font-bold text-white" style={{ background: COLORS.gold, color: COLORS.navy }}>
                {editingId ? "حفظ التعديلات" : "حفظ الكود"}
              </button>
            </div>
          </SectionCard>
        </form>
      )}

      <SectionCard title="مجمعات التكلفة (Cost Pool)">
        <p className="text-sm mb-4" style={{ color: COLORS.slate }}>
          كود وهمي لكل جهة تسجّل عليه المصروفات اللي مالهاش علاقة بمعدة معينة (إيجارات، رواتب إدارية، عمولات...)،
          عشان بعدين توزّعها على المعدات حسب نصيب كل واحدة من التكلفة المباشرة.
        </p>
        <div className="flex flex-wrap gap-3">
          {SOURCES.map((s) => {
            const exists = codes.some((c) => c.type === "مجمع تكلفة" && c.owner === s);
            return (
              <button key={s} disabled={exists} onClick={() => addCostPool(s)}
                className="px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 disabled:opacity-40"
                style={{ background: exists ? COLORS.cream : COLORS.gold, color: COLORS.navy }}>
                <Plus size={14} /> {exists ? `مجمع تكلفة ${s} (موجود)` : `إضافة مجمع تكلفة لـ ${s}`}
              </button>
            );
          })}
        </div>
      </SectionCard>

      {codes.length === 0 ? (
        <SectionCard><EmptyState icon={ListChecks} title="لا توجد أكواد مسجلة بعد" /></SectionCard>
      ) : (
        <SectionCard title={`كل الأكواد (${codes.length})`}>
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: `linear-gradient(90deg, ${COLORS.navy}, ${COLORS.navyLight})` }}>
                  {["كود المعدة", "النوع", "الماركة", "المالك", "الموقع", ""].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-right text-xs font-bold whitespace-nowrap" style={{ color: "rgba(255,255,255,0.88)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {codes.map((c) => (
                  <tr key={c.id} className="border-t" style={{ borderColor: COLORS.border }}>
                    <td className="px-4 py-2.5 font-semibold whitespace-nowrap">{c.code}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap">{c.type || "—"}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap">{c.brand || "—"}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap">{c.owner}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap">{c.location || "—"}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-1">
                        <button onClick={() => startEdit(c)} className="p-1.5 rounded-md hover:bg-gray-100" style={{ color: COLORS.slate }}><Pencil size={15} /></button>
                        <button onClick={() => onDelete(c.id)} className="p-1.5 rounded-md hover:bg-red-50" style={{ color: COLORS.danger }}><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}

      <div className="print-only-area" id="print-area">
        <h2 style={{ fontFamily: "Cairo", textAlign: "center", marginBottom: 12 }}>أكواد المعدات</h2>
        <table>
          <thead><tr>{["كود المعدة", "النوع", "الماركة", "المالك", "الموقع"].map((h) => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>
            {codes.map((c) => (
              <tr key={c.id}><td>{c.code}</td><td>{c.type}</td><td>{c.brand}</td><td>{c.owner}</td><td>{c.location}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============================================================
   المرتبات
============================================================ */
function SalariesGate({ children }) {
  const [checking, setChecking] = useState(true);
  const [storedPassword, setStoredPassword] = useState(null); // null = لسه بيتحمّل، "" = مفيش كلمة سر متسجّلة
  const [unlocked, setUnlocked] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [newPass1, setNewPass1] = useState("");
  const [newPass2, setNewPass2] = useState("");
  const [saving, setSaving] = useState(false);
  const [changingPass, setChangingPass] = useState(false);
  const boxStyle = { background: COLORS.paper, borderColor: COLORS.border, boxShadow: "0 8px 30px -10px rgba(16,26,46,0.15)" };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const snap = await getDoc(doc(db, "maintenance-system", "salariesPassword"));
        if (cancelled) return;
        setStoredPassword(snap.exists() ? snap.data().value || "" : "");
      } catch (e) {
        if (!cancelled) setStoredPassword("");
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const submitUnlock = (e) => {
    e.preventDefault();
    if (input === storedPassword) { setUnlocked(true); setError(""); }
    else setError("كلمة السر غير صحيحة");
  };

  const submitSetup = async (e) => {
    e.preventDefault();
    if (newPass1.length < 4) { setError("كلمة السر لازم تكون 4 حروف/أرقام على الأقل"); return; }
    if (newPass1 !== newPass2) { setError("كلمتا السر مش متطابقتين"); return; }
    setSaving(true);
    try {
      await setDoc(doc(db, "maintenance-system", "salariesPassword"), { value: newPass1 });
      setStoredPassword(newPass1);
      setUnlocked(true);
      setChangingPass(false);
      setNewPass1("");
      setNewPass2("");
      setError("");
    } catch (e) {
      setError("حصل خطأ أثناء الحفظ، حاول تاني");
    } finally {
      setSaving(false);
    }
  };

  if (checking) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-sm font-semibold" style={{ color: COLORS.slate }}>جاري التحقق...</div>
      </div>
    );
  }

  if (unlocked) {
    return (
      <div>
        <div className="no-print flex justify-end mb-2">
          <button onClick={() => setChangingPass((v) => !v)} className="text-xs font-bold flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ color: COLORS.slate, background: COLORS.cream }}>
            <ShieldCheck size={13} /> {changingPass ? "إلغاء" : "تغيير كلمة السر"}
          </button>
        </div>
        {changingPass && (
          <form onSubmit={submitSetup} className="no-print mb-4 p-4 rounded-xl border max-w-sm mr-auto" style={boxStyle}>
            <div className="text-xs mb-3 font-bold" style={{ color: COLORS.ink }}>تحديد كلمة سر جديدة</div>
            <div className="space-y-3">
              <TextInput type="password" placeholder="كلمة السر الجديدة" value={newPass1} onChange={(e) => setNewPass1(e.target.value)} dir="ltr" />
              <TextInput type="password" placeholder="تأكيد كلمة السر" value={newPass2} onChange={(e) => setNewPass2(e.target.value)} dir="ltr" />
              {error && <div className="text-xs font-semibold" style={{ color: COLORS.danger }}>{error}</div>}
              <button type="submit" disabled={saving} className="w-full py-2 rounded-lg text-xs font-bold text-white" style={{ background: COLORS.navy, opacity: saving ? 0.6 : 1 }}>
                {saving ? "جاري الحفظ..." : "حفظ كلمة السر الجديدة"}
              </button>
            </div>
          </form>
        )}
        {children}
      </div>
    );
  }

  if (storedPassword === "") {
    return (
      <div className="flex items-center justify-center py-16">
        <form onSubmit={submitSetup} className="w-full max-w-sm p-6 rounded-2xl border" style={boxStyle}>
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck size={20} style={{ color: COLORS.gold }} />
            <div className="font-extrabold" style={{ color: COLORS.ink }}>تأمين تاب المرتبات</div>
          </div>
          <div className="text-xs mb-4" style={{ color: COLORS.slate }}>أول مرة تفتح التاب ده — حدد كلمة سر هتُطلب في كل مرة حد يحاول يفتحه.</div>
          <div className="space-y-3">
            <Field label="كلمة السر الجديدة"><TextInput type="password" value={newPass1} onChange={(e) => setNewPass1(e.target.value)} dir="ltr" /></Field>
            <Field label="تأكيد كلمة السر"><TextInput type="password" value={newPass2} onChange={(e) => setNewPass2(e.target.value)} dir="ltr" /></Field>
            {error && <div className="text-xs font-semibold" style={{ color: COLORS.danger }}>{error}</div>}
            <button type="submit" disabled={saving} className="w-full py-2.5 rounded-lg text-sm font-bold text-white" style={{ background: COLORS.navy, opacity: saving ? 0.6 : 1 }}>
              {saving ? "جاري الحفظ..." : "حفظ وفتح"}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-16">
      <form onSubmit={submitUnlock} className="w-full max-w-sm p-6 rounded-2xl border" style={boxStyle}>
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck size={20} style={{ color: COLORS.gold }} />
          <div className="font-extrabold" style={{ color: COLORS.ink }}>تاب المرتبات محمي</div>
        </div>
        <div className="text-xs mb-4" style={{ color: COLORS.slate }}>اكتب كلمة السر للمتابعة</div>
        <div className="space-y-3">
          <TextInput type="password" value={input} onChange={(e) => setInput(e.target.value)} dir="ltr" autoFocus />
          {error && <div className="text-xs font-semibold" style={{ color: COLORS.danger }}>{error}</div>}
          <button type="submit" className="w-full py-2.5 rounded-lg text-sm font-bold text-white" style={{ background: COLORS.navy }}>دخول</button>
        </div>
      </form>
    </div>
  );
}

function SalariesView({ salaries, equipmentCodes, onAdd, onUpdate, onDelete }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [q, setQ] = useState("");
  const empty = { month: todayISO().slice(0, 7), source: SOURCES[0], salaryType: "driver", employeeName: "", equipmentCode: "", amount: "" };
  const [form, setForm] = useState(empty);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const codeOptions = useMemo(
    () => equipmentCodes.filter((c) => c.owner === form.source).filter((c) => !isCostPoolCode(c.code)),
    [equipmentCodes, form.source]
  );

  const startAdd = () => { setEditingId(null); setForm(empty); setShowForm(true); };
  const startEdit = (s) => {
    setEditingId(s.id);
    setForm({
      month: s.month || todayISO().slice(0, 7),
      source: s.source || SOURCES[0],
      salaryType: s.salaryType === "driver" ? "driver" : "indirect",
      employeeName: s.employeeName || "",
      equipmentCode: s.equipmentCode || "",
      amount: s.amount ?? "",
    });
    setShowForm(true);
  };
  const cancel = () => { setShowForm(false); setEditingId(null); setForm(empty); };

  const submit = (e) => {
    e.preventDefault();
    const payload = form.salaryType === "driver" ? form : { ...form, equipmentCode: "" };
    if (editingId) onUpdate(editingId, payload);
    else onAdd(payload);
    cancel();
  };

  const isDirect = (s) => s.salaryType === "driver" && s.equipmentCode;
  const total = salaries.reduce((s, r) => s + (Number(r.amount) || 0), 0);
  const totalDirect = salaries.filter(isDirect).reduce((s, r) => s + (Number(r.amount) || 0), 0);
  const totalIndirect = total - totalDirect;
  const bySource = SOURCES.map((s) => {
    const list = salaries.filter((r) => r.source === s);
    const direct = list.filter(isDirect).reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
    const sourceTotal = list.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
    return { source: s, total: sourceTotal, direct, indirect: sourceTotal - direct };
  });

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return [...salaries]
      .filter((s) => !term || [s.employeeName, s.equipmentCode, s.source, s.month].join(" ").toLowerCase().includes(term))
      .sort((a, b) => (b.month || "").localeCompare(a.month || ""));
  }, [salaries, q]);

  const handlePrint = () => window.print();

  return (
    <div className="space-y-6">
      <Header
        title="المرتبات"
        sub="مرتبات السائقين بيتحملوا مباشرة على كود المعدة، ومرتبات المشرفين والمحاسبين بتتحط كمجمع تكلفة يتوزّع على المعدات"
        action={
          <div className="no-print flex flex-wrap gap-2 items-center">
            <button onClick={handlePrint} className="px-4 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 border" style={{ borderColor: COLORS.border, color: COLORS.ink }}>
              <Printer size={16} /> طباعة
            </button>
            <button onClick={() => (showForm ? cancel() : startAdd())} className="px-4 py-2.5 rounded-lg text-sm font-bold text-white flex items-center gap-2" style={{ background: COLORS.navy }}>
              {showForm ? <X size={16} /> : <Plus size={16} />} {showForm ? "إلغاء" : "بند مرتبات جديد"}
            </button>
          </div>
        }
      />

      <div id="print-area">
        <div className="no-print grid grid-cols-2 sm:grid-cols-3 gap-4">
          <KPICard label="إجمالي المرتبات الكلي" value={fmtMoney(total)} icon={Wallet} />
          <KPICard label="مرتبات مباشرة (سائقين)" value={fmtMoney(totalDirect)} tone="gold" icon={Wallet} />
          <KPICard label="مرتبات غير مباشرة (مشرفين ومحاسبين)" value={fmtMoney(totalIndirect)} tone="gold" icon={Wallet} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {bySource.map((b) => (
            <SectionCard key={b.source} title={`مرتبات ${b.source}`}>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg text-center" style={{ background: COLORS.cream }}>
                  <div className="text-[10px] font-bold mb-1" style={{ color: COLORS.slate }}>الإجمالي</div>
                  <div className="text-sm font-extrabold tabular-nums">{fmtMoney(b.total)}</div>
                </div>
                <div className="p-3 rounded-lg text-center" style={{ background: COLORS.cream }}>
                  <div className="text-[10px] font-bold mb-1" style={{ color: COLORS.slate }}>مباشر</div>
                  <div className="text-sm font-extrabold tabular-nums">{fmtMoney(b.direct)}</div>
                </div>
                <div className="p-3 rounded-lg text-center" style={{ background: COLORS.cream }}>
                  <div className="text-[10px] font-bold mb-1" style={{ color: COLORS.slate }}>غير مباشر</div>
                  <div className="text-sm font-extrabold tabular-nums">{fmtMoney(b.indirect)}</div>
                </div>
              </div>
            </SectionCard>
          ))}
        </div>

        {showForm && (
          <form onSubmit={submit} className="no-print mt-6">
            <SectionCard title={editingId ? "تعديل بند مرتبات" : "بند مرتبات جديد"}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="الشهر" required><TextInput type="month" value={form.month} onChange={set("month")} required /></Field>
                <Field label="الجهة" required><Select value={form.source} onChange={set("source")}>{SOURCES.map((s) => <option key={s}>{s}</option>)}</Select></Field>
                <Field label="نوع المرتب" required>
                  <Select value={form.salaryType} onChange={set("salaryType")}>
                    <option value="driver">سائق / عامل معدة (تكلفة مباشرة)</option>
                    <option value="indirect">مشرف أو محاسب (مجمع تكلفة يُوزّع)</option>
                  </Select>
                </Field>
                <Field label="اسم الموظف" required><TextInput value={form.employeeName} onChange={set("employeeName")} required placeholder="اسم السائق أو الموظف" /></Field>
                {form.salaryType === "driver" && (
                  <Field label="كود المعدة" required>
                    <Select value={form.equipmentCode} onChange={set("equipmentCode")} required>
                      <option value="">اختر كود المعدة</option>
                      {codeOptions.map((c) => <option key={c.id} value={c.code}>{c.code}</option>)}
                    </Select>
                  </Field>
                )}
                <Field label="المبلغ" required><TextInput type="number" step="0.01" value={form.amount} onChange={set("amount")} required placeholder="0" /></Field>
              </div>
              <div className="flex justify-end gap-2 mt-5 pt-4 border-t" style={{ borderColor: COLORS.border }}>
                <button type="button" onClick={cancel} className="px-6 py-2.5 rounded-lg text-sm font-bold border" style={{ borderColor: COLORS.border, color: COLORS.ink }}>إلغاء</button>
                <button type="submit" className="px-6 py-2.5 rounded-lg text-sm font-bold text-white" style={{ background: COLORS.gold, color: COLORS.navy }}>حفظ</button>
              </div>
            </SectionCard>
          </form>
        )}

        {salaries.length === 0 ? (
          <SectionCard className="mt-6"><EmptyState icon={Wallet} title="لا توجد بنود مرتبات مسجلة بعد" /></SectionCard>
        ) : (
          <SectionCard className="mt-6" title={`السجل (${filtered.length} من ${salaries.length})`}>
            <div className="no-print mb-4 relative">
              <Search size={16} className="absolute top-1/2 -translate-y-1/2 right-3" style={{ color: COLORS.slateLight }} />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث بالاسم أو كود المعدة أو الجهة أو الشهر..." className="w-full pr-9 pl-3 py-2.5 rounded-lg text-sm border" style={{ borderColor: COLORS.border }} />
            </div>
            <div className="overflow-x-auto -mx-5">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: `linear-gradient(90deg, ${COLORS.navy}, ${COLORS.navyLight})` }}>
                    {["الشهر", "الجهة", "النوع", "اسم الموظف", "كود المعدة", "المبلغ", ""].map((h) => (
                      <th key={h} className="px-4 py-2.5 text-right text-xs font-bold" style={{ color: "rgba(255,255,255,0.88)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <tr key={s.id} className="border-t" style={{ borderColor: COLORS.border }}>
                      <td className="px-4 py-2.5 whitespace-nowrap">{s.month}</td>
                      <td className="px-4 py-2.5 whitespace-nowrap">{s.source}</td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        {isDirect(s) ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold" style={{ background: COLORS.successBg, color: COLORS.success }}>مباشر</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold" style={{ background: COLORS.cream, color: COLORS.slate }}>غير مباشر</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">{s.employeeName || "—"}</td>
                      <td className="px-4 py-2.5 whitespace-nowrap">{isDirect(s) ? s.equipmentCode : "—"}</td>
                      <td className="px-4 py-2.5 tabular-nums font-bold">{fmtMoney(s.amount)}</td>
                      <td className="px-4 py-2.5 no-print">
                        <div className="flex items-center gap-1">
                          <button onClick={() => startEdit(s)} className="p-1.5 rounded-md hover:bg-black/5" style={{ color: COLORS.slate }}><Pencil size={14} /></button>
                          <button onClick={() => onDelete(s.id)} className="p-1.5 rounded-md hover:bg-red-50" style={{ color: COLORS.danger }}><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-sm" style={{ color: COLORS.slate }}>لا توجد نتائج مطابقة للبحث</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </SectionCard>
        )}
      </div>
    </div>
  );
}

const isCostPoolCode = (code) => !!code && code.toLowerCase().includes("cost pool");
const isPendingCode = (code) => { const t = String(code || "").trim(); return t === "_" || t === "-" || t === ""; };

/* ============================================================
   ربحية المعدات (شاملة: إيراد - تكلفة مباشرة - حصة من التكلفة الموزّعة)
============================================================ */
const normCode = (s) => String(s || "").trim().replace(/\s+/g, " ").toUpperCase();
const looseKey = (nc) => nc.split(" ").filter(Boolean).sort().join(" ");

// تنظيف عام لأي نص عربي حر (زي الموقع) عشان "الورشة" و"الورشـــة" يتحسبوا نفس القيمة
const cleanText = (s) =>
  String(s || "")
    .replace(/\u0640/g, "") // إزالة التطويل
    .replace(/\s+/g, " ")
    .trim();


function ProfitabilityView({ expenses, revenues, fuelRecords, oilRecords, salaries, equipmentCodes }) {
  // يحل أي كود لصورته الموحّدة، حتى لو كلماته مكتوبة بترتيب مختلف (مثال: "8619 ط ط ر" و"ط ط ر 8619")
  const resolveCode = useMemo(() => {
    const groups = {};
    const allRaw = [];
    equipmentCodes.forEach((c) => { if (!isCostPoolCode(c.code)) allRaw.push({ nc: normCode(c.code), fromRegistry: true }); });
    expenses.forEach((e) => { const nc = normCode(e.equipmentCode); if (nc && !isCostPoolCode(nc)) allRaw.push({ nc, fromRegistry: false }); });
    fuelRecords.forEach((r) => { const nc = normCode(r.code); if (nc) allRaw.push({ nc, fromRegistry: false }); });
    oilRecords.forEach((r) => { const nc = normCode(r.equipmentCode); if (nc) allRaw.push({ nc, fromRegistry: false }); });
    revenues.forEach((r) => { const nc = normCode(r.equipmentCode); if (nc) allRaw.push({ nc, fromRegistry: false }); });
    salaries.forEach((s) => { if (s.salaryType === "driver" && s.equipmentCode) { const nc = normCode(s.equipmentCode); if (nc) allRaw.push({ nc, fromRegistry: false }); } });

    allRaw.forEach(({ nc, fromRegistry }) => {
      const lk = looseKey(nc);
      if (!groups[lk]) groups[lk] = { canonical: nc, hasRegistry: fromRegistry };
      else if (fromRegistry && !groups[lk].hasRegistry) { groups[lk] = { canonical: nc, hasRegistry: true }; }
    });

    return (rawCode) => {
      const nc = normCode(rawCode);
      if (!nc) return "";
      const lk = looseKey(nc);
      return groups[lk] ? groups[lk].canonical : nc;
    };
  }, [equipmentCodes, expenses, fuelRecords, oilRecords, revenues, salaries]);

  const ownerByCode = useMemo(() => {
    const map = {};
    equipmentCodes.forEach((c) => { map[resolveCode(c.code)] = c.owner; });
    expenses.forEach((e) => {
      const rc = resolveCode(e.equipmentCode);
      if (rc && !map[rc] && e.source) map[rc] = e.source;
    });
    return map;
  }, [equipmentCodes, expenses, resolveCode]);

  const typeByCode = useMemo(() => {
    const map = {};
    equipmentCodes.forEach((c) => { if (c.type) map[resolveCode(c.code)] = c.type; });
    expenses.forEach((e) => {
      const rc = resolveCode(e.equipmentCode);
      if (rc && !map[rc] && e.equipmentType) map[rc] = e.equipmentType;
    });
    return map;
  }, [equipmentCodes, expenses, resolveCode]);

  const TYPE_BADGE_COLORS = ["#C69A3C", "#4C7A94", "#8B6BA8", "#5A9367", "#B85C5C", "#6B8CAE", "#9C7B4F"];
  const typeBadgeColor = (typeRaw) => {
    const type = String(typeRaw || "");
    if (!type) return null;
    let hash = 0;
    for (let i = 0; i < type.length; i++) hash = (hash * 31 + type.charCodeAt(i)) >>> 0;
    return TYPE_BADGE_COLORS[hash % TYPE_BADGE_COLORS.length];
  };

  const poolCodeByOwner = useMemo(() => {
    const map = {};
    equipmentCodes.forEach((c) => { if (isCostPoolCode(c.code)) map[c.owner] = normCode(c.code); });
    return map;
  }, [equipmentCodes]);

  const vehicleCodes = useMemo(() => {
    const set = new Set();
    expenses.forEach((e) => {
      if (e.category === "أولاً - مصروفات السيارات") {
        const rc = resolveCode(e.equipmentCode);
        if (rc) set.add(rc);
      }
    });
    return set;
  }, [expenses, resolveCode]);

  const pendingByOwner = useMemo(() => {
    const map = {};
    expenses.filter((e) => isPendingCode(e.equipmentCode)).forEach((e) => {
      const owner = e.source || "غير محدد";
      const amount = (Number(e.cash) || 0) + (Number(e.transfer) || 0) + (Number(e.check) || 0);
      if (!map[owner]) map[owner] = [];
      map[owner].push({ id: e.id, purpose: e.purpose || "بند بدون وصف", amount });
    });
    return map;
  }, [expenses]);

  const rows = useMemo(() => {
    const realCodes = new Set(equipmentCodes.filter((c) => !isCostPoolCode(c.code)).map((c) => resolveCode(c.code)));
    expenses.forEach((e) => { if (isPendingCode(e.equipmentCode)) return; const rc = resolveCode(e.equipmentCode); if (rc && !isCostPoolCode(rc)) realCodes.add(rc); });
    fuelRecords.forEach((r) => { const rc = resolveCode(r.code); if (rc) realCodes.add(rc); });
    oilRecords.forEach((r) => { const rc = resolveCode(r.equipmentCode); if (rc) realCodes.add(rc); });
    revenues.forEach((r) => { const rc = resolveCode(r.equipmentCode); if (rc) realCodes.add(rc); });
    salaries.forEach((s) => { if (s.salaryType === "driver" && s.equipmentCode) { const rc = resolveCode(s.equipmentCode); if (rc) realCodes.add(rc); } });

    const maintCost = {}, cardsCost = {}, fuelCost = {}, oilCost = {}, driverSalaryCost = {}, revenue = {};
    const classifyPurpose = (purpose, isVehicleCode) => {
      const p = String(purpose || "");
      if (/كارت|ميزان|موازين/.test(p)) return "cards";
      // زيت العربيات بيتحسب من قاعدة البيانات، أما زيت المعدات فبييجي من تاب الزيوت والفلاتر بس
      if (isVehicleCode && /زيت/.test(p)) return "oil";
      return "maint";
    };
    expenses.forEach((e) => {
      if (isPendingCode(e.equipmentCode)) return;
      const rc = resolveCode(e.equipmentCode);
      if (!rc || isCostPoolCode(rc)) return;
      const t = (Number(e.cash) || 0) + (Number(e.transfer) || 0) + (Number(e.check) || 0);
      const cls = classifyPurpose(e.purpose, vehicleCodes.has(rc));
      if (cls === "cards") cardsCost[rc] = (cardsCost[rc] || 0) + t;
      else if (cls === "oil") oilCost[rc] = (oilCost[rc] || 0) + t;
      else maintCost[rc] = (maintCost[rc] || 0) + t;
    });
    fuelRecords.forEach((r) => {
      const rc = resolveCode(r.code);
      if (!rc) return;
      fuelCost[rc] = (fuelCost[rc] || 0) + (Number(r.total) || 0);
    });
    oilRecords.forEach((r) => {
      const rc = resolveCode(r.equipmentCode);
      if (!rc) return;
      oilCost[rc] = (oilCost[rc] || 0) + (Number(r.total) || 0);
    });
    revenues.forEach((r) => {
      const rc = resolveCode(r.equipmentCode);
      if (!rc) return;
      revenue[rc] = (revenue[rc] || 0) + (Number(r.total) || 0);
    });
    salaries.forEach((s) => {
      if (s.salaryType !== "driver" || !s.equipmentCode) return;
      const rc = resolveCode(s.equipmentCode);
      if (!rc) return;
      driverSalaryCost[rc] = (driverSalaryCost[rc] || 0) + (Number(s.amount) || 0);
    });

    // التكلفة الغير مباشرة = مجمع التكلفة (مصروفات أخرى) + مرتبات المشرفين والمحاسبين (مرتبات غير مباشرة)
    // مرتبات السائقين تُحمّل مباشرة على كود المعدة بتاعهم، والسيارات مستبعدة نهائيًا من التوزيع
    const poolByOwner = {}, indirectSalaryByOwner = {}, revenueByOwner = {};
    SOURCES.forEach((s) => {
      const poolCode = poolCodeByOwner[s];
      poolByOwner[s] = poolCode
        ? expenses.filter((e) => normCode(e.equipmentCode) === poolCode).reduce((sum, e) => sum + (Number(e.cash) || 0) + (Number(e.transfer) || 0) + (Number(e.check) || 0), 0)
        : 0;
      indirectSalaryByOwner[s] = salaries
        .filter((x) => x.source === s && !(x.salaryType === "driver" && x.equipmentCode))
        .reduce((sum, x) => sum + (Number(x.amount) || 0), 0);
      revenueByOwner[s] = 0;
    });
    realCodes.forEach((code) => {
      if (vehicleCodes.has(code)) return;
      const owner = ownerByCode[code];
      if (owner && SOURCES.includes(owner)) revenueByOwner[owner] += (revenue[code] || 0);
    });

    return [...realCodes].map((code) => {
      const owner = ownerByCode[code] || "غير محدد";
      const maint = maintCost[code] || 0;
      const cards = cardsCost[code] || 0;
      const fuel = fuelCost[code] || 0;
      const oil = oilCost[code] || 0;
      const driverSalary = driverSalaryCost[code] || 0;
      const direct = maint + cards + fuel + oil + driverSalary;
      const isVehicle = vehicleCodes.has(code);
      const rev = revenue[code] || 0;
      // قاعدة التوزيع: الأعلى إيراد، الأعلى نصيب من التكلفة الغير مباشرة
      const ownerRevenueTotal = revenueByOwner[owner] || 0;
      const distributable = !isVehicle && ownerRevenueTotal > 0 && SOURCES.includes(owner);
      const shareOther = distributable ? (poolByOwner[owner] || 0) * (rev / ownerRevenueTotal) : 0;
      const shareSalary = distributable ? (indirectSalaryByOwner[owner] || 0) * (rev / ownerRevenueTotal) : 0;
      const share = shareOther + shareSalary;
      const totalCost = direct + share;
      return { code, owner, isVehicle, type: typeByCode[code] || "", maint, cards, fuel, oil, driverSalary, direct, shareOther, shareSalary, share, totalCost, revenue: rev, net: rev - totalCost };
    }).sort((a, b) => {
      const typeCompare = String(a.type || "").localeCompare(String(b.type || ""), "ar");
      if (typeCompare !== 0) return typeCompare;
      return String(a.code || "").localeCompare(String(b.code || ""), "ar", { numeric: true });
    });
  }, [expenses, revenues, fuelRecords, oilRecords, salaries, equipmentCodes, ownerByCode, typeByCode, poolCodeByOwner, resolveCode, vehicleCodes]);

  const totals = rows.reduce((acc, r) => ({
    maint: acc.maint + r.maint, cards: acc.cards + r.cards, fuel: acc.fuel + r.fuel, oil: acc.oil + r.oil,
    driverSalary: acc.driverSalary + r.driverSalary, direct: acc.direct + r.direct,
    shareOther: acc.shareOther + r.shareOther, shareSalary: acc.shareSalary + r.shareSalary, share: acc.share + r.share, cost: acc.cost + r.totalCost,
    revenue: acc.revenue + r.revenue, net: acc.net + r.net,
  }), { maint: 0, cards: 0, fuel: 0, oil: 0, driverSalary: 0, direct: 0, shareOther: 0, shareSalary: 0, share: 0, cost: 0, revenue: 0, net: 0 });

  if (rows.length === 0) {
    return (
      <div className="space-y-6">
        <Header title="ربحية المعدات" sub="صافي ربح كل معدة شامل التكلفة المباشرة وغير المباشرة" />
        <SectionCard><EmptyState icon={TrendingUp} title="لا توجد بيانات كافية بعد" sub="محتاج بيانات في المصروفات أو السولار أو الإيرادات على الأقل" /></SectionCard>
      </div>
    );
  }

  const [printOwner, setPrintOwner] = useState("الكل");
  const ownerGroupsAll = [...SOURCES, "غير محدد"].map((owner) => ({ owner, list: rows.filter((r) => r.owner === owner) })).filter((g) => g.list.length > 0 || (pendingByOwner[g.owner] || []).length > 0);
  const ownerGroups = printOwner === "الكل" ? ownerGroupsAll : ownerGroupsAll.filter((g) => g.owner === printOwner);

  const handlePrint = () => window.print();

  return (
    <div className="space-y-6">
      <Header
        title="ربحية المعدات"
        sub="الإيراد ناقص التكلفة المباشرة (صيانة + سولار + زيوت + مرتبات سائقين) ناقص نصيبها من التكلفة الغير مباشرة (مرتبات مشرفين ومحاسبين + مصروفات أخرى)، موزّعة بحسب نسبة كل معدة من إجمالي الإيراد — الأعلى إيرادًا يتحمّل أكبر نصيب (السيارات مستبعدة من التوزيع)"
        action={
          <div className="no-print flex flex-wrap gap-2 items-center">
            <Select value={printOwner} onChange={(e) => setPrintOwner(e.target.value)} className="!w-auto">
              <option value="الكل">كل الجهات</option>
              {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
            <button onClick={handlePrint} className="px-5 py-2.5 rounded-lg text-sm font-bold text-white flex items-center gap-2" style={{ background: COLORS.gold, color: COLORS.navy }}>
              <Printer size={16} /> طباعة
            </button>
          </div>
        }
      />

      <div id="print-area">
      <div className="no-print grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPICard label="إجمالي الإيراد" value={fmtMoney(totals.revenue)} icon={TrendingUp} />
        <KPICard label="كارتات" value={fmtMoney(totals.cards)} tone="gold" icon={Wrench} />
        <KPICard label="مصروفات صيانة" value={fmtMoney(totals.maint)} tone="gold" icon={Wrench} />
        <KPICard label="مصروفات سولار" value={fmtMoney(totals.fuel)} tone="gold" icon={Fuel} />
        <KPICard label="مصروفات زيوت وفلاتر" value={fmtMoney(totals.oil)} tone="gold" icon={Wrench} />
        <KPICard label="مرتبات مباشرة (سائقين)" value={fmtMoney(totals.driverSalary)} tone="gold" icon={Wallet} />
      </div>
      <div className="no-print grid grid-cols-2 md:grid-cols-3 gap-4">
        <KPICard label="مرتبات غير مباشرة (مشرفين ومحاسبين)" value={fmtMoney(totals.shareSalary)} icon={Wallet} />
        <KPICard label="مصروفات أخرى غير مباشرة" value={fmtMoney(totals.shareOther)} icon={Wallet} />
        <KPICard label="إجمالي التكلفة الغير مباشرة" value={fmtMoney(totals.share)} tone="gold" icon={Wallet} />
      </div>
      <div className="no-print grid grid-cols-2 gap-4">
        <KPICard label="إجمالي التكلفة (كل الجهات، شامل كل المرتبات)" value={fmtMoney(totals.cost)} tone="gold" icon={Wallet} />
        <KPICard label="صافي الربح الكلي" value={fmtMoney(totals.net)} icon={totals.net >= 0 ? TrendingUp : TrendingDown} />
      </div>

      {ownerGroups.map((g) => {
        const gTotals = g.list.reduce((acc, r) => ({
          maint: acc.maint + r.maint, cards: acc.cards + r.cards, fuel: acc.fuel + r.fuel, oil: acc.oil + r.oil,
          driverSalary: acc.driverSalary + r.driverSalary, direct: acc.direct + r.direct,
          shareOther: acc.shareOther + r.shareOther, shareSalary: acc.shareSalary + r.shareSalary, share: acc.share + r.share,
          cost: acc.cost + r.totalCost, revenue: acc.revenue + r.revenue, net: acc.net + r.net,
        }), { maint: 0, cards: 0, fuel: 0, oil: 0, driverSalary: 0, direct: 0, shareOther: 0, shareSalary: 0, share: 0, cost: 0, revenue: 0, net: 0 });
        return (
          <SectionCard key={g.owner} title={`${g.owner} (${g.list.length} معدة)`}>
            <div className="profit-summary-grid mb-4">
              <div className="p-3 rounded-lg text-center profit-summary-box" style={{ background: COLORS.cream }}>
                <div className="text-[10px] font-bold mb-1 profit-summary-label" style={{ color: COLORS.slate }}>كارتات</div>
                <div className="text-sm font-extrabold tabular-nums profit-summary-value">{fmtMoney(gTotals.cards)}</div>
              </div>
              <div className="p-3 rounded-lg text-center profit-summary-box" style={{ background: COLORS.cream }}>
                <div className="text-[10px] font-bold mb-1 profit-summary-label" style={{ color: COLORS.slate }}>مصروفات صيانة</div>
                <div className="text-sm font-extrabold tabular-nums profit-summary-value">{fmtMoney(gTotals.maint)}</div>
              </div>
              <div className="p-3 rounded-lg text-center profit-summary-box" style={{ background: COLORS.cream }}>
                <div className="text-[10px] font-bold mb-1 profit-summary-label" style={{ color: COLORS.slate }}>مصروفات سولار</div>
                <div className="text-sm font-extrabold tabular-nums profit-summary-value">{fmtMoney(gTotals.fuel)}</div>
              </div>
              <div className="p-3 rounded-lg text-center profit-summary-box" style={{ background: COLORS.cream }}>
                <div className="text-[10px] font-bold mb-1 profit-summary-label" style={{ color: COLORS.slate }}>مصروفات زيوت</div>
                <div className="text-sm font-extrabold tabular-nums profit-summary-value">{fmtMoney(gTotals.oil)}</div>
              </div>
              <div className="p-3 rounded-lg text-center profit-summary-box" style={{ background: COLORS.cream }}>
                <div className="text-[10px] font-bold mb-1 profit-summary-label" style={{ color: COLORS.slate }}>مرتب مباشر</div>
                <div className="text-sm font-extrabold tabular-nums profit-summary-value">{fmtMoney(gTotals.driverSalary)}</div>
              </div>
              <div className="p-3 rounded-lg text-center profit-summary-box" style={{ background: COLORS.cream }}>
                <div className="text-[10px] font-bold mb-1 profit-summary-label" style={{ color: COLORS.slate }}>مرتب غير مباشر</div>
                <div className="text-sm font-extrabold tabular-nums profit-summary-value">{fmtMoney(gTotals.shareSalary)}</div>
              </div>
              <div className="p-3 rounded-lg text-center profit-summary-box" style={{ background: COLORS.cream }}>
                <div className="text-[10px] font-bold mb-1 profit-summary-label" style={{ color: COLORS.slate }}>مصروفات أخرى</div>
                <div className="text-sm font-extrabold tabular-nums profit-summary-value">{fmtMoney(gTotals.shareOther)}</div>
              </div>
              <div className="p-3 rounded-lg text-center profit-summary-box" style={{ background: gTotals.net >= 0 ? COLORS.successBg : COLORS.dangerBg }}>
                <div className="text-[10px] font-bold mb-1 profit-summary-label" style={{ color: COLORS.slate }}>صافي الربح</div>
                <div className="text-sm font-extrabold tabular-nums profit-summary-value" style={{ color: gTotals.net >= 0 ? COLORS.success : COLORS.danger }}>{fmtMoney(gTotals.net)}</div>
              </div>
            </div>
            <div className="overflow-x-auto -mx-5">
              <table className="w-full text-sm profit-table">
                <thead>
                  <tr style={{ background: `linear-gradient(90deg, ${COLORS.navy}, ${COLORS.navyLight})` }}>
                    {["كود المعدة", "كارتات", "صيانة", "سولار", "زيوت", "مرتب مباشر", "إجمالي مباشر", "مرتب غير مباشر", "مصروفات أخرى", "إجمالي غير مباشر", "إجمالي التكلفة", "الإيراد", "صافي الربح"].map((h, i) => (
                      <th key={h} className="px-3 py-2.5 text-right text-xs font-bold" style={{ color: "rgba(255,255,255,0.88)", minWidth: i === 0 ? 320 : 90 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {g.list.map((r) => (
                    <tr key={r.code} className="border-t" style={{ borderColor: COLORS.border }}>
                      <td className="px-3 py-2.5 font-semibold whitespace-nowrap" style={{ minWidth: 280 }}>
                        <div className="flex items-center justify-between gap-2 code-cell-inner">
                          <span style={{ display: "inline-block" }}>{r.code}</span>
                          {r.type ? (
                            <span
                              className="inline-flex items-center justify-center px-2 py-1 rounded text-[9px] font-bold text-white whitespace-nowrap flex-shrink-0 code-badge"
                              style={{ background: typeBadgeColor(r.type), minWidth: 70 }}
                            >
                              {r.type}
                            </span>
                          ) : (
                            <span style={{ minWidth: 70, display: "inline-block" }} />
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 tabular-nums whitespace-nowrap">{fmtMoney(r.cards)}</td>
                      <td className="px-3 py-2.5 tabular-nums whitespace-nowrap">{fmtMoney(r.maint)}</td>
                      <td className="px-3 py-2.5 tabular-nums whitespace-nowrap">{fmtMoney(r.fuel)}</td>
                      <td className="px-3 py-2.5 tabular-nums whitespace-nowrap">{fmtMoney(r.oil)}</td>
                      <td className="px-3 py-2.5 tabular-nums whitespace-nowrap">{fmtMoney(r.driverSalary)}</td>
                      <td className="px-3 py-2.5 tabular-nums whitespace-nowrap">{fmtMoney(r.direct)}</td>
                      <td className="px-3 py-2.5 tabular-nums whitespace-nowrap">{r.isVehicle ? "—" : fmtMoney(r.shareSalary)}</td>
                      <td className="px-3 py-2.5 tabular-nums whitespace-nowrap">{r.isVehicle ? "—" : fmtMoney(r.shareOther)}</td>
                      <td className="px-3 py-2.5 tabular-nums whitespace-nowrap">{r.isVehicle ? "—" : fmtMoney(r.share)}</td>
                      <td className="px-3 py-2.5 tabular-nums font-semibold whitespace-nowrap">{fmtMoney(r.totalCost)}</td>
                      <td className="px-3 py-2.5 tabular-nums whitespace-nowrap">{fmtMoney(r.revenue)}</td>
                      <td className="px-3 py-2.5 tabular-nums font-bold whitespace-nowrap" style={{ color: r.net >= 0 ? COLORS.success : COLORS.danger }}>{fmtMoney(r.net)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>
        );
      })}
      </div>
    </div>
  );
}

function EquipmentView({ expenses, revenues }) {
  const revByCode = useMemo(() => {
    const map = {};
    for (const r of revenues || []) {
      const t = Number(r.total) || 0;
      map[r.equipmentCode] = (map[r.equipmentCode] || 0) + t;
    }
    return map;
  }, [revenues]);

  const heavyRows = useMemo(() => {
    const map = {};
    for (const e of expenses) {
      if (!e.equipmentCode || isCostPoolCode(e.equipmentCode) || e.category !== "ثانياً - صيانة المعدات") continue;
      const total = (Number(e.cash) || 0) + (Number(e.transfer) || 0) + (Number(e.check) || 0);
      if (!map[e.equipmentCode]) map[e.equipmentCode] = { code: e.equipmentCode, type: e.equipmentType, brand: e.brand, count: 0, total: 0, lastDate: e.date };
      map[e.equipmentCode].count += 1;
      map[e.equipmentCode].total += total;
      if (e.date > map[e.equipmentCode].lastDate) map[e.equipmentCode].lastDate = e.date;
    }
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [expenses]);

  const vehicleRows = useMemo(() => {
    const map = {};
    for (const e of expenses) {
      if (!e.equipmentCode || isCostPoolCode(e.equipmentCode) || e.category !== "أولاً - مصروفات السيارات") continue;
      const total = (Number(e.cash) || 0) + (Number(e.transfer) || 0) + (Number(e.check) || 0);
      if (!map[e.equipmentCode]) map[e.equipmentCode] = { code: e.equipmentCode, type: e.equipmentType, brand: e.brand, cards: 0, driver: 0, routine: 0, lastDate: e.date };
      const bucket = classifyVehicleRow(e.purpose);
      map[e.equipmentCode][bucket] += total;
      if (e.date > map[e.equipmentCode].lastDate) map[e.equipmentCode].lastDate = e.date;
    }
    return Object.values(map).map((v) => ({ ...v, total: v.cards + v.driver + v.routine })).sort((a, b) => b.total - a.total);
  }, [expenses]);

  const allCodes = useMemo(() => [...new Set([...heavyRows.map((r) => r.code), ...vehicleRows.map((r) => r.code)])], [heavyRows, vehicleRows]);
  const hasRevenue = allCodes.some((c) => revByCode[c] > 0);

  const byType = useMemo(() => {
    const map = {};
    [...heavyRows, ...vehicleRows].forEach((r) => {
      const t = r.type || "غير محدد";
      map[t] = (map[t] || 0) + r.total;
    });
    return Object.entries(map).map(([name, total]) => ({ name, total })).sort((a, b) => b.total - a.total);
  }, [heavyRows, vehicleRows]);

  const mostFrequent = useMemo(() =>
    [...heavyRows].sort((a, b) => b.count - a.count).slice(0, 6),
    [heavyRows]);

  const top5ByCost = useMemo(() =>
    [...heavyRows, ...vehicleRows].sort((a, b) => b.total - a.total).slice(0, 5),
    [heavyRows, vehicleRows]);

  return (
    <div className="space-y-6">
      <Header title="بطاقة أداء المعدات" sub="مفصولة بين المعدات الثقيلة والسيارات، مع الربحية لو مسجّل إيراد" />

      {heavyRows.length === 0 && vehicleRows.length === 0 ? (
        <SectionCard><EmptyState icon={Wrench} title="لا توجد بيانات معدات بعد" /></SectionCard>
      ) : (
        <>
          <SectionCard title="أعلى 5 معدات من حيث تكلفة الصيانة">
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {top5ByCost.map((r, i) => (
                <div key={r.code} className="p-3 rounded-xl text-center" style={{ background: i === 0 ? COLORS.gold : COLORS.cream }}>
                  <div className="text-[10px] font-bold mb-1" style={{ color: i === 0 ? COLORS.navy : COLORS.slate }}>#{i + 1}</div>
                  <div className="font-extrabold text-sm mb-1" style={{ color: i === 0 ? COLORS.navy : COLORS.ink }}>{r.code}</div>
                  <div className="text-xs font-bold tabular-nums" style={{ color: i === 0 ? COLORS.navy : COLORS.slate }}>{fmtMoney(r.total)}</div>
                </div>
              ))}
            </div>
          </SectionCard>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <SectionCard title="إجمالي التكلفة حسب نوع المعدة">
              <div dir="ltr"><ResponsiveContainer width="100%" height={230}>
                <BarChart data={byType} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v) => fmtMoney(v)} />
                  <Bar dataKey="total" fill={COLORS.navy} radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer></div>
            </SectionCard>
            <SectionCard title="أعلى المعدات تكرارًا في الصيانة">
              <div dir="ltr"><ResponsiveContainer width="100%" height={230}>
                <BarChart data={mostFrequent}>
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                  <XAxis dataKey="code" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" name="عدد مرات الصيانة" fill={COLORS.gold} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer></div>
            </SectionCard>
          </div>
          <SectionCard title={`أولاً: المعدات الثقيلة (${heavyRows.length})`}>
            {heavyRows.length === 0 ? (
              <div className="text-sm py-4 text-center" style={{ color: COLORS.slateLight }}>لا توجد معدات ثقيلة مسجلة</div>
            ) : (
              <div className="overflow-x-auto -mx-5">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: `linear-gradient(90deg, ${COLORS.navy}, ${COLORS.navyLight})` }}>
                      {["كود المعدة", "النوع", "الماركة", "عدد مرات الصيانة", "إجمالي التكلفة", "متوسط التكلفة",
                        ...(hasRevenue ? ["الإيراد", "صافي الربح"] : []), "آخر تاريخ", "الترتيب"].map((h) => (
                        <th key={h} className="px-3 py-2.5 text-right text-xs font-bold whitespace-nowrap" style={{ color: "rgba(255,255,255,0.88)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {heavyRows.map((r, i) => {
                      const rev = revByCode[r.code] || 0;
                      const net = rev - r.total;
                      return (
                        <tr key={r.code} className="border-t" style={{ borderColor: COLORS.border }}>
                          <td className="px-3 py-2.5 font-semibold whitespace-nowrap">{r.code}</td>
                          <td className="px-3 py-2.5 whitespace-nowrap">{r.type || "—"}</td>
                          <td className="px-3 py-2.5 whitespace-nowrap">{r.brand || "—"}</td>
                          <td className="px-3 py-2.5 tabular-nums">{fmtNum(r.count)}</td>
                          <td className="px-3 py-2.5 tabular-nums font-bold">{fmtMoney(r.total)}</td>
                          <td className="px-3 py-2.5 tabular-nums">{fmtMoney(r.total / r.count)}</td>
                          {hasRevenue && (
                            <>
                              <td className="px-3 py-2.5 tabular-nums">{fmtMoney(rev)}</td>
                              <td className="px-3 py-2.5 tabular-nums font-bold" style={{ color: net >= 0 ? COLORS.success : COLORS.danger }}>{fmtMoney(net)}</td>
                            </>
                          )}
                          <td className="px-3 py-2.5 text-xs whitespace-nowrap" style={{ color: COLORS.slate }}>{r.lastDate}</td>
                          <td className="px-3 py-2.5">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold" style={{ background: i < 3 ? COLORS.goldSoft : COLORS.cream, color: COLORS.navy }}>{i + 1}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>

          <SectionCard title={`ثانياً: السيارات (${vehicleRows.length}) - مقسّمة كارتات/سائقين/دورية`}>
            {vehicleRows.length === 0 ? (
              <div className="text-sm py-4 text-center" style={{ color: COLORS.slateLight }}>لا توجد سيارات مسجلة</div>
            ) : (
              <div className="overflow-x-auto -mx-5">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: `linear-gradient(90deg, ${COLORS.navy}, ${COLORS.navyLight})` }}>
                      {["كود السيارة", "النوع", "الماركة", "كارتات وموازين", "مصروفات سائقين", "صيانة دورية", "الإجمالي الكلي",
                        ...(hasRevenue ? ["الإيراد", "صافي الربح"] : []), "آخر تاريخ", "الترتيب"].map((h) => (
                        <th key={h} className="px-3 py-2.5 text-right text-xs font-bold whitespace-nowrap" style={{ color: "rgba(255,255,255,0.88)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {vehicleRows.map((r, i) => {
                      const rev = revByCode[r.code] || 0;
                      const net = rev - r.total;
                      return (
                        <tr key={r.code} className="border-t" style={{ borderColor: COLORS.border }}>
                          <td className="px-3 py-2.5 font-semibold whitespace-nowrap">{r.code}</td>
                          <td className="px-3 py-2.5 whitespace-nowrap">{r.type || "—"}</td>
                          <td className="px-3 py-2.5 whitespace-nowrap">{r.brand || "—"}</td>
                          <td className="px-3 py-2.5 tabular-nums">{fmtMoney(r.cards)}</td>
                          <td className="px-3 py-2.5 tabular-nums">{fmtMoney(r.driver)}</td>
                          <td className="px-3 py-2.5 tabular-nums">{fmtMoney(r.routine)}</td>
                          <td className="px-3 py-2.5 tabular-nums font-bold">{fmtMoney(r.total)}</td>
                          {hasRevenue && (
                            <>
                              <td className="px-3 py-2.5 tabular-nums">{fmtMoney(rev)}</td>
                              <td className="px-3 py-2.5 tabular-nums font-bold" style={{ color: net >= 0 ? COLORS.success : COLORS.danger }}>{fmtMoney(net)}</td>
                            </>
                          )}
                          <td className="px-3 py-2.5 text-xs whitespace-nowrap" style={{ color: COLORS.slate }}>{r.lastDate}</td>
                          <td className="px-3 py-2.5">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold" style={{ background: i < 3 ? COLORS.goldSoft : COLORS.cream, color: COLORS.navy }}>{i + 1}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </SectionCard>
        </>
      )}
    </div>
  );
}

/* ============================================================
   استيراد من إكسل
============================================================ */
const ARABIC_MONTHS = {
  "يناير": 1, "فبراير": 2, "مارس": 3, "أبريل": 4, "ابريل": 4, "مايو": 5, "يونيو": 6,
  "يوليو": 7, "أغسطس": 8, "اغسطس": 8, "سبتمبر": 9, "أكتوبر": 10, "اكتوبر": 10, "نوفمبر": 11, "ديسمبر": 12,
};

function toISODate(val) {
  if (val === null || val === undefined || val === "") return "";
  if (val instanceof Date && !isNaN(val)) return val.toISOString().slice(0, 10);
  if (typeof val === "number") {
    try {
      const d = XLSX.SSF.parse_date_code(val);
      if (d) return `${d.y}-${String(d.m).padStart(2, "0")}-${String(d.d).padStart(2, "0")}`;
    } catch (e) { /* تجاهل */ }
  }
  if (typeof val === "string") {
    const trimmed = val.trim();
    // صيغة "21 يوليو 2026" بأسماء الشهور العربية
    const arabicMatch = trimmed.match(/^(\d{1,2})\s+([^\s\d]+)\s+(\d{4})$/);
    if (arabicMatch) {
      const [, day, monthName, year] = arabicMatch;
      const month = ARABIC_MONTHS[monthName];
      if (month) return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    }
    const d = new Date(trimmed);
    if (!isNaN(d)) return d.toISOString().slice(0, 10);
    return trimmed;
  }
  return "";
}

/* ============================================================
   تصدير البيانات
============================================================ */
function ExportView({ expenses, custodies, revenues }) {
  const [done, setDone] = useState(false);

  const handleExport = () => {
    exportToExcel({ expenses, custodies, revenues });
    setDone(true);
    setTimeout(() => setDone(false), 3000);
  };

  return (
    <div className="space-y-6">
      <Header title="تصدير البيانات" sub="نزّل كل بياناتك في ملف إكسل واحد منظم" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SectionCard>
          <div className="text-xs font-semibold mb-1" style={{ color: COLORS.slate }}>العهد</div>
          <div className="text-2xl font-extrabold tabular-nums" style={{ color: COLORS.ink }}>{fmtNum(custodies.length)}</div>
        </SectionCard>
        <SectionCard>
          <div className="text-xs font-semibold mb-1" style={{ color: COLORS.slate }}>بنود الصرف</div>
          <div className="text-2xl font-extrabold tabular-nums" style={{ color: COLORS.ink }}>{fmtNum(expenses.length)}</div>
        </SectionCard>
        <SectionCard>
          <div className="text-xs font-semibold mb-1" style={{ color: COLORS.slate }}>بنود الإيراد</div>
          <div className="text-2xl font-extrabold tabular-nums" style={{ color: COLORS.ink }}>{fmtNum((revenues || []).length)}</div>
        </SectionCard>
      </div>

      <SectionCard title="تصدير ملف إكسل شامل">
        <p className="text-sm mb-5" style={{ color: COLORS.slate }}>
          هيتحمّل ملف واحد فيه 3 شيتات: "ملخص العهد"، "قاعدة البيانات"، و"الإيرادات" (لو موجودة) —
          بنفس أسماء الأعمدة اللي تقدر تفتحها في إكسل مباشرة أو تستوردها تاني هنا لاحقًا.
        </p>
        <button
          onClick={handleExport}
          className="px-6 py-3 rounded-lg text-sm font-bold text-white flex items-center gap-2"
          style={{ background: COLORS.gold, color: COLORS.navy }}
        >
          <FileSpreadsheet size={17} /> تحميل ملف الإكسل
        </button>
        {done && (
          <div className="mt-4 flex items-center gap-2 text-sm font-semibold" style={{ color: COLORS.success }}>
            <CheckCircle2 size={16} /> تم تحميل الملف بنجاح
          </div>
        )}
      </SectionCard>
    </div>
  );
}

function ImportView({ onImport, existingCounts }) {
  const fileRef = useRef(null);
  const [status, setStatus] = useState("idle"); // idle | parsing | ready | error
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(null); // { custodies, expenses, custodyLabels }
  const [mode, setMode] = useState("append");

  const handleFile = async (file) => {
    setStatus("parsing");
    setError("");
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { cellDates: true });

      const custodySheet = wb.Sheets["ملخص العهد"];
      const dbSheet = wb.Sheets["قاعدة البيانات"];
      if (!custodySheet || !dbSheet) {
        throw new Error('الملف لازم يحتوي على شيتين بالاسم "ملخص العهد" و"قاعدة البيانات"');
      }

      const custodyRows = XLSX.utils.sheet_to_json(custodySheet, { header: 1, defval: "" }).slice(1).filter((r) => r[1]);
      const dbRows = XLSX.utils.sheet_to_json(dbSheet, { header: 1, defval: "" }).slice(1).filter((r) => r[3]);

      const normalizeLabel = (s) =>
        String(s || "")
          .replace(/\u0640/g, "") // إزالة التطويل
          .replace(/[\u0622\u0623\u0625]/g, "\u0627") // توحيد أشكال الألف
          .replace(/\s+/g, " ")
          .trim();

      const labelToId = {};
      const newCustodies = custodyRows.map((r) => {
        const id = uid();
        labelToId[normalizeLabel(r[1])] = id;
        return {
          id,
          source: r[2] || "",
          label: r[1] || "",
          periodFrom: toISODate(r[4]),
          periodTo: toISODate(r[5]),
          broughtForward: Number(r[7]) || 0,
          transfersIn: Number(r[6]) || 0,
        };
      });

      let unmatched = 0;
      const newExpenses = dbRows.map((r) => {
        const custodyLabel = normalizeLabel(r[3]);
        const custodyId = labelToId[custodyLabel] || "";
        if (!custodyId) unmatched += 1;
        return {
          id: uid(),
          source: r[1] || "",
          custodyId,
          category: r[6] || "",
          equipmentCode: r[7] || "",
          equipmentType: r[8] || "",
          brand: r[9] || "",
          location: r[10] || "",
          date: toISODate(r[11]),
          purpose: r[12] || "",
          notes: r[13] || "",
          paymentMethod: r[14] || PAYMENT_METHODS[0],
          cash: Number(r[15]) || 0,
          transfer: Number(r[16]) || 0,
          check: Number(r[17]) || 0,
        };
      });

      setPreview({ newCustodies, newExpenses, unmatched });
      setStatus("ready");
    } catch (e) {
      setError(e.message || "تعذّرت قراءة الملف");
      setStatus("error");
    }
  };

  const confirm = () => {
    if (!preview) return;
    onImport({ newCustodies: preview.newCustodies, newExpenses: preview.newExpenses, mode });
    setPreview(null);
    setStatus("idle");
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="space-y-6">
      <Header title="استيراد من إكسل" sub="ارفع ملف الإكسل اللي فيه شيتات ملخص العهد وقاعدة البيانات وهيتقروا تلقائيًا" />

      <SectionCard>
        <div
          className="border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition hover:bg-gray-50"
          style={{ borderColor: COLORS.border }}
          onClick={() => fileRef.current?.click()}
        >
          <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])} />
          {status === "parsing" ? (
            <Loader2 size={30} className="animate-spin mb-3" style={{ color: COLORS.gold }} />
          ) : (
            <FileSpreadsheet size={30} className="mb-3" style={{ color: COLORS.slateLight }} />
          )}
          <div className="font-bold text-sm" style={{ color: COLORS.ink }}>
            {status === "parsing" ? "جاري قراءة الملف..." : "اضغط لاختيار ملف إكسل"}
          </div>
          <div className="text-xs mt-1" style={{ color: COLORS.slateLight }}>لازم يحتوي على شيت "ملخص العهد" وشيت "قاعدة البيانات"</div>
        </div>

        {status === "error" && (
          <div className="mt-4 p-3 rounded-lg text-sm font-semibold flex items-center gap-2" style={{ background: COLORS.dangerBg, color: COLORS.danger }}>
            <AlertTriangle size={16} /> {error}
          </div>
        )}
      </SectionCard>

      {status === "ready" && preview && (
        <SectionCard title="معاينة قبل الاستيراد">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
            <div className="p-3 rounded-lg" style={{ background: COLORS.cream }}>
              <div className="text-xs font-semibold" style={{ color: COLORS.slate }}>عهد جديدة</div>
              <div className="text-xl font-bold tabular-nums" style={{ color: COLORS.ink }}>{fmtNum(preview.newCustodies.length)}</div>
            </div>
            <div className="p-3 rounded-lg" style={{ background: COLORS.cream }}>
              <div className="text-xs font-semibold" style={{ color: COLORS.slate }}>بنود صرف جديدة</div>
              <div className="text-xl font-bold tabular-nums" style={{ color: COLORS.ink }}>{fmtNum(preview.newExpenses.length)}</div>
            </div>
            {preview.unmatched > 0 && (
              <div className="p-3 rounded-lg col-span-2" style={{ background: COLORS.dangerBg }}>
                <div className="text-xs font-semibold" style={{ color: COLORS.danger }}>بنود بدون عهدة مطابقة</div>
                <div className="text-xl font-bold tabular-nums" style={{ color: COLORS.danger }}>{fmtNum(preview.unmatched)}</div>
              </div>
            )}
          </div>

          <Field label="طريقة الاستيراد">
            <div className="flex gap-3">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" checked={mode === "append"} onChange={() => setMode("append")} /> إضافة إلى البيانات الحالية ({existingCounts.expenses} بند موجود)
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" checked={mode === "replace"} onChange={() => setMode("replace")} /> استبدال كل البيانات الحالية
              </label>
            </div>
          </Field>

          <div className="flex justify-end gap-3 mt-5 pt-4 border-t" style={{ borderColor: COLORS.border }}>
            <button onClick={() => { setPreview(null); setStatus("idle"); }} className="px-5 py-2.5 rounded-lg text-sm font-bold" style={{ color: COLORS.slate }}>إلغاء</button>
            <button onClick={confirm} className="px-6 py-2.5 rounded-lg text-sm font-bold text-white flex items-center gap-2" style={{ background: COLORS.gold, color: COLORS.navy }}>
              <UploadCloud size={16} /> تأكيد الاستيراد
            </button>
          </div>
        </SectionCard>
      )}
    </div>
  );
}

/* ============================================================
   تحليل متقدم
============================================================ */
function AnalysisView({ expenses, custodies, custodyTotals }) {
  const totalAll = expenses.reduce((s, e) => s + (Number(e.cash) || 0) + (Number(e.transfer) || 0) + (Number(e.check) || 0), 0);

  const byLocation = useMemo(() => {
    const map = {};
    for (const e of expenses) {
      const loc = cleanText(e.location) || "غير محدد";
      const t = (Number(e.cash) || 0) + (Number(e.transfer) || 0) + (Number(e.check) || 0);
      map[loc] = (map[loc] || 0) + t;
    }
    return Object.entries(map).map(([name, total]) => ({ name, total, pct: totalAll ? total / totalAll : 0 })).sort((a, b) => b.total - a.total).slice(0, 10);
  }, [expenses, totalAll]);

  const monthly = useMemo(() => {
    const map = {};
    for (const e of expenses) {
      if (!e.date) continue;
      const key = e.date.slice(0, 7);
      const t = (Number(e.cash) || 0) + (Number(e.transfer) || 0) + (Number(e.check) || 0);
      map[key] = (map[key] || 0) + t;
    }
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).map(([month, total]) => ({ month, total }));
  }, [expenses]);

  const catBySource = useMemo(() => {
    const sources = [...new Set(expenses.map((e) => e.source))];
    const cats = [...new Set(expenses.map((e) => e.category))];
    return cats.map((cat) => {
      const row = { name: cat };
      sources.forEach((s) => {
        row[s] = expenses.filter((e) => e.category === cat && e.source === s)
          .reduce((sum, e) => sum + (Number(e.cash) || 0) + (Number(e.transfer) || 0) + (Number(e.check) || 0), 0);
      });
      return row;
    });
  }, [expenses]);

  const sources = [...new Set(expenses.map((e) => e.source))];

  const topPeriods = useMemo(() =>
    custodies.map((c) => ({ name: c.label, total: custodyTotals[c.id]?.spent || 0 }))
      .sort((a, b) => b.total - a.total).slice(0, 8), [custodies, custodyTotals]);

  if (expenses.length === 0) {
    return (
      <div className="space-y-6">
        <Header title="تحليل" sub="تحليلات تفصيلية إضافية" />
        <SectionCard><EmptyState icon={BarChart3} title="لا توجد بيانات كافية للتحليل بعد" /></SectionCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Header title="تحليل" sub="تحليلات تفصيلية: المواقع، الاتجاه الزمني، ومقارنة العهد" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SectionCard title="أعلى المواقع من حيث المصروفات">
          <div className="space-y-2.5">
            {byLocation.map((l) => (
              <div key={l.name}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold flex items-center gap-1.5" style={{ color: COLORS.ink }}><MapPin size={12} />{l.name}</span>
                  <span className="tabular-nums font-bold" style={{ color: COLORS.slate }}>{fmtMoney(l.total)}</span>
                </div>
                <div className="h-2 rounded-full" style={{ background: COLORS.cream }}>
                  <div className="h-2 rounded-full" style={{ width: `${Math.max(l.pct * 100, 3)}%`, background: COLORS.gold }} />
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="أعلى العهد من حيث الصرف">
          <div dir="ltr"><ResponsiveContainer width="100%" height={260}>
            <BarChart data={topPeriods} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis dataKey="name" type="category" width={90} tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v) => fmtMoney(v)} />
              <Bar dataKey="total" fill={COLORS.navy} radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer></div>
        </SectionCard>

        <SectionCard title="الاتجاه الزمني الشهري للمصروفات" className="lg:col-span-2">
          <div dir="ltr"><ResponsiveContainer width="100%" height={260}>
            <LineChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => fmtMoney(v)} />
              <Line type="monotone" dataKey="total" stroke={COLORS.gold} strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer></div>
        </SectionCard>

        <SectionCard title="مقارنة التصنيف حسب الجهة" className="lg:col-span-2">
          <div dir="ltr"><ResponsiveContainer width="100%" height={280}>
            <BarChart data={catBySource}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => fmtMoney(v)} />
              <Legend />
              {sources.map((s, i) => <Bar key={s} dataKey={s} stackId="a" fill={CHART_COLORS[i % CHART_COLORS.length]} radius={i === sources.length - 1 ? [6, 6, 0, 0] : [0, 0, 0, 0]} />)}
            </BarChart>
          </ResponsiveContainer></div>
        </SectionCard>
      </div>
    </div>
  );
}

/* ============================================================
   تحليل الإيرادات
============================================================ */
function RevenueAnalysisView({ revenues, expenses }) {
  const totalRevenue = revenues.reduce((s, r) => s + (Number(r.total) || 0), 0);

  const byEquipment = useMemo(() =>
    Object.entries(
      revenues.reduce((acc, r) => { acc[r.equipmentCode] = (acc[r.equipmentCode] || 0) + (Number(r.total) || 0); return acc; }, {})
    ).map(([name, total]) => ({ name, total })).sort((a, b) => b.total - a.total).slice(0, 10),
    [revenues]);

  const byRenter = useMemo(() =>
    Object.entries(
      revenues.reduce((acc, r) => { acc[r.renter] = (acc[r.renter] || 0) + (Number(r.total) || 0); return acc; }, {})
    ).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
    [revenues]);

  const monthly = useMemo(() => {
    const map = {};
    for (const r of revenues) {
      if (!r.startMonth) continue;
      const [y, m] = r.startMonth.split("-").map(Number);
      for (let i = 0; i < (Number(r.months) || 1); i++) {
        const d = new Date(y, m - 1 + i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        map[key] = (map[key] || 0) + (Number(r.monthlyRate) || 0);
      }
    }
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).map(([month, total]) => ({ month, total }));
  }, [revenues]);

  const netByEquipment = useMemo(() => {
    const cost = {};
    for (const e of expenses) {
      if (!e.equipmentCode) continue;
      cost[e.equipmentCode] = (cost[e.equipmentCode] || 0) + (Number(e.cash) || 0) + (Number(e.transfer) || 0) + (Number(e.check) || 0);
    }
    const rev = {};
    for (const r of revenues) rev[r.equipmentCode] = (rev[r.equipmentCode] || 0) + (Number(r.total) || 0);
    const codes = [...new Set([...Object.keys(cost), ...Object.keys(rev)])];
    return codes.map((code) => ({ code, revenue: rev[code] || 0, cost: cost[code] || 0, net: (rev[code] || 0) - (cost[code] || 0) }))
      .filter((x) => x.revenue > 0)
      .sort((a, b) => b.net - a.net);
  }, [revenues, expenses]);

  if (revenues.length === 0) {
    return (
      <div className="space-y-6">
        <Header title="تحليل الإيرادات" sub="أداء إيرادات تأجير المعدات" />
        <SectionCard><EmptyState icon={TrendingUp} title="لا توجد إيرادات مسجلة بعد" sub="سجّل بنود إيراد من تاب الإيرادات عشان تقدر تشوف التحليل هنا" /></SectionCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Header title="تحليل الإيرادات" sub="أداء إيرادات تأجير المعدات حسب المعدة، الجهة، والشهر" />

      <KPICard label="إجمالي الإيرادات المسجلة" value={fmtMoney(totalRevenue)} icon={TrendingUp} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SectionCard title="أعلى المعدات من حيث الإيراد">
          <div dir="ltr"><ResponsiveContainer width="100%" height={260}>
            <BarChart data={byEquipment} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => fmtMoney(v)} />
              <Bar dataKey="total" fill={COLORS.gold} radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer></div>
        </SectionCard>

        <SectionCard title="توزيع الإيرادات حسب الجهة المستأجرة">
          <div dir="ltr"><ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={byRenter} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={(d) => fmtMoney(d.value)}>
                {byRenter.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => fmtMoney(v)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer></div>
        </SectionCard>

        <SectionCard title="الاتجاه الشهري للإيرادات" className="lg:col-span-2">
          <div dir="ltr"><ResponsiveContainer width="100%" height={260}>
            <LineChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v) => fmtMoney(v)} />
              <Line type="monotone" dataKey="total" stroke={COLORS.gold} strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer></div>
        </SectionCard>

        <SectionCard title="صافي الربح لكل معدة (إيراد - تكلفة)" className="lg:col-span-2">
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: `linear-gradient(90deg, ${COLORS.navy}, ${COLORS.navyLight})` }}>
                  {["كود المعدة", "الإيراد", "التكلفة", "صافي الربح"].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-right text-xs font-bold" style={{ color: "rgba(255,255,255,0.88)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {netByEquipment.map((r) => (
                  <tr key={r.code} className="border-t" style={{ borderColor: COLORS.border }}>
                    <td className="px-4 py-2.5 font-semibold">{r.code}</td>
                    <td className="px-4 py-2.5 tabular-nums">{fmtMoney(r.revenue)}</td>
                    <td className="px-4 py-2.5 tabular-nums">{fmtMoney(r.cost)}</td>
                    <td className="px-4 py-2.5 tabular-nums font-bold" style={{ color: r.net >= 0 ? COLORS.success : COLORS.danger }}>{fmtMoney(r.net)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function RevenueView({ revenues, expenses, equipmentCodes, onAdd, onDelete }) {
  const [showForm, setShowForm] = useState(false);
  const empty = { equipmentCode: "", equipmentType: "", location: "", renter: "", startMonth: todayISO().slice(0, 7), months: "1", monthlyRate: "", paymentMethod: PAYMENT_METHODS[0], notes: "" };
  const [form, setForm] = useState(empty);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const knownCodes = useMemo(() => {
    const map = {};
    equipmentCodes.forEach((c) => { map[normCode(c.code)] = { type: c.type, location: c.location }; });
    expenses.forEach((e) => {
      const nc = normCode(e.equipmentCode);
      if (nc && !map[nc]) map[nc] = { type: e.equipmentType, location: e.location };
    });
    return map;
  }, [equipmentCodes, expenses]);

  const handleCodeChange = (e) => {
    const code = e.target.value;
    const known = knownCodes[normCode(code)];
    setForm((f) => ({
      ...f,
      equipmentCode: code,
      equipmentType: known ? known.type : f.equipmentType,
      location: known && known.location ? known.location : f.location,
    }));
  };

  const total = (Number(form.months) || 0) * (Number(form.monthlyRate) || 0);

  const submit = (e) => {
    e.preventDefault();
    onAdd(form);
    setForm(empty);
    setShowForm(false);
  };

  const [monthFrom, setMonthFrom] = useState("");
  const [monthTo, setMonthTo] = useState("");
  const filteredRevenues = useMemo(() => {
    return revenues
      .filter((r) => !monthFrom || (r.startMonth && r.startMonth >= monthFrom))
      .filter((r) => !monthTo || (r.startMonth && r.startMonth <= monthTo));
  }, [revenues, monthFrom, monthTo]);

  const totalRevenue = filteredRevenues.reduce((s, r) => s + (Number(r.total) || 0), 0);

  return (
    <div className="space-y-6">
      <Header
        title="الإيرادات"
        sub="إيرادات تأجير المعدات على أساس شهري - لحساب صافي الربح في بطاقة أداء المعدات"
        action={
          <button onClick={() => setShowForm((s) => !s)} className="px-4 py-2.5 rounded-lg text-sm font-bold text-white flex items-center gap-2" style={{ background: COLORS.navy }}>
            {showForm ? <X size={16} /> : <Plus size={16} />} {showForm ? "إلغاء" : "بند إيراد جديد"}
          </button>
        }
      />

      <KPICard label={monthFrom || monthTo ? "إجمالي الإيرادات (الفترة المختارة)" : "إجمالي الإيرادات المسجلة"} value={fmtMoney(totalRevenue)} icon={TrendingUp} />

      <SectionCard title="تحديد فترة">
        <div className="grid grid-cols-2 gap-4">
          <Field label="من شهر"><TextInput type="month" value={monthFrom} onChange={(e) => setMonthFrom(e.target.value)} /></Field>
          <Field label="إلى شهر"><TextInput type="month" value={monthTo} onChange={(e) => setMonthTo(e.target.value)} /></Field>
        </div>
      </SectionCard>

      {showForm && (
        <form onSubmit={submit}>
          <SectionCard title="بيانات بند الإيراد الشهري">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="كود المعدة" required>
                <TextInput list="rev-codes" value={form.equipmentCode} onChange={handleCodeChange}
                  required placeholder="مثال: EX-200-32" />
                <datalist id="rev-codes">{Object.keys(knownCodes).map((c) => <option key={c} value={c} />)}</datalist>
              </Field>
              <Field label="النوع">
                <TextInput value={form.equipmentType} onChange={set("equipmentType")} placeholder="مثال: حفار" />
              </Field>
              <Field label="الموقع">
                <TextInput value={form.location} onChange={set("location")} placeholder="مثال: الورشة" />
              </Field>
              <Field label="الجهة المستأجرة" required>
                <TextInput value={form.renter} onChange={set("renter")} required placeholder="اسم الشركة أو الموقع" />
              </Field>

              <Field label="شهر البداية" required>
                <TextInput type="month" value={form.startMonth} onChange={set("startMonth")} required />
              </Field>
              <Field label="عدد الشهور" required>
                <TextInput type="number" step="1" min="1" value={form.months} onChange={set("months")} required placeholder="1" />
              </Field>
              <Field label="طريقة التحصيل">
                <Select value={form.paymentMethod} onChange={set("paymentMethod")}>{PAYMENT_METHODS.map((p) => <option key={p}>{p}</option>)}</Select>
              </Field>

              <Field label="سعر الإيجار الشهري" required>
                <TextInput type="number" step="0.01" value={form.monthlyRate} onChange={set("monthlyRate")} required placeholder="0" />
              </Field>
              <Field label="ملاحظات">
                <TextInput value={form.notes} onChange={set("notes")} placeholder="اختياري" />
              </Field>
            </div>

            <div className="flex items-center justify-between mt-6 pt-5 border-t" style={{ borderColor: COLORS.border }}>
              <div className="text-sm">
                <span style={{ color: COLORS.slate }}>الإجمالي ({form.months || 0} شهر × {fmtMoney(form.monthlyRate)}): </span>
                <span className="font-bold text-lg tabular-nums" style={{ color: COLORS.ink }}>{fmtMoney(total)}</span>
              </div>
              <button type="submit" className="px-6 py-2.5 rounded-lg text-sm font-bold text-white flex items-center gap-2" style={{ background: COLORS.gold, color: COLORS.navy }}>
                <Plus size={17} /> حفظ بند الإيراد
              </button>
            </div>
          </SectionCard>
        </form>
      )}

      {revenues.length === 0 ? (
        <SectionCard><EmptyState icon={TrendingUp} title="لا توجد إيرادات مسجلة بعد" sub="ضيف أول بند إيراد من الزر أعلاه عشان تقدر تشوف صافي الربح في بطاقة أداء المعدات" /></SectionCard>
      ) : filteredRevenues.length === 0 ? (
        <SectionCard><EmptyState icon={TrendingUp} title="لا توجد إيرادات في الفترة دي" /></SectionCard>
      ) : (
        <SectionCard title={`بنود الإيراد (${filteredRevenues.length})`}>
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: `linear-gradient(90deg, ${COLORS.navy}, ${COLORS.navyLight})` }}>
                  {["كود المعدة", "الجهة المستأجرة", "شهر البداية", "عدد الشهور", "سعر الشهر", "الإجمالي", ""].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-right text-xs font-bold whitespace-nowrap" style={{ color: "rgba(255,255,255,0.88)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...filteredRevenues].sort((a, b) => (b.startMonth || "").localeCompare(a.startMonth || "")).map((r) => (
                  <tr key={r.id} className="border-t" style={{ borderColor: COLORS.border }}>
                    <td className="px-4 py-2.5 font-semibold whitespace-nowrap">{r.equipmentCode}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap">{r.renter}</td>
                    <td className="px-4 py-2.5 text-xs whitespace-nowrap" style={{ color: COLORS.slate }}>{r.startMonth}</td>
                    <td className="px-4 py-2.5 tabular-nums">{fmtNum(r.months)}</td>
                    <td className="px-4 py-2.5 tabular-nums">{fmtMoney(r.monthlyRate)}</td>
                    <td className="px-4 py-2.5 tabular-nums font-bold">{fmtMoney(r.total)}</td>
                    <td className="px-4 py-2.5">
                      <button onClick={() => onDelete(r.id)} className="p-1.5 rounded-md hover:bg-red-50" style={{ color: COLORS.danger }}>
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}
    </div>
  );
}

/* ============================================================
   طباعة عهدة
============================================================ */
const SIGNATURES = [
  "محاسب الجهة المنفّذة",
  "محاسب الجهة المستفيدة",
  "المدير التنفيذي",
  "رئيس مجلس الإدارة",
];

function PrintView({ custodies, custodyTotals, expenses }) {
  const [custodyId, setCustodyId] = useState(custodies[0]?.id || "");
  const printRef = useRef(null);
  const custody = custodies.find((c) => c.id === custodyId);
  const items = expenses.filter((e) => e.custodyId === custodyId);
  const totals = custodyTotals[custodyId] || { spent: 0, available: 0, remaining: 0 };

  const mergeKey = (code) => (code ? looseKey(normCode(code)) : "");

  const sortForMerge = (rows) => {
    const withIdx = rows.map((r, i) => ({ r, i, key: mergeKey(r.equipmentCode) }));
    const firstIndex = {};
    withIdx.forEach(({ key, i }) => { if (key && !(key in firstIndex)) firstIndex[key] = i; });
    withIdx.sort((a, b) => {
      const oa = a.key ? firstIndex[a.key] : a.i;
      const ob = b.key ? firstIndex[b.key] : b.i;
      if (oa !== ob) return oa - ob;
      if (a.key && a.key === b.key) return (a.r.date || "").localeCompare(b.r.date || "");
      return a.i - b.i;
    });
    return withIdx.map((x) => x.r);
  };

  const withMergeInfo = (rows) => rows.map((row, i) => {
    const key = mergeKey(row.equipmentCode);
    const prevKey = i > 0 ? mergeKey(rows[i - 1].equipmentCode) : "";
    const isNewGroup = i === 0 || !key || prevKey !== key;
    let span = 1;
    if (isNewGroup && key) {
      for (let j = i + 1; j < rows.length && mergeKey(rows[j].equipmentCode) === key; j++) span++;
    }
    return { ...row, _mergeStart: isNewGroup, _mergeSpan: span };
  });

  const grouped = CATEGORIES.map((cat) => ({
    cat,
    rows: withMergeInfo(sortForMerge(items.filter((e) => e.category === cat))),
  })).filter((g) => g.rows.length > 0);

  const sumBy = (key) => items.reduce((s, e) => s + (Number(e[key]) || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  const handleExcelExport = () => {
    const rowsOut = items.map((e) => ({
      "التاريخ": e.date, "التصنيف": e.category, "كود المعدة": e.equipmentCode, "النوع": e.equipmentType,
      "الماركة": e.brand, "الموقع": e.location, "الغرض من الصرف": e.purpose,
      "نقدي": Number(e.cash) || 0, "تحويل": Number(e.transfer) || 0, "شيك": Number(e.check) || 0,
    }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rowsOut), "بنود العهدة");
    XLSX.writeFile(wb, `${custody?.label || "عهدة"}_${todayISO()}.xlsx`);
  };

  if (custodies.length === 0) {
    return (
      <div className="space-y-6">
        <Header title="طباعة عهدة" />
        <SectionCard><EmptyState icon={Printer} title="لا توجد عهد لطباعتها" sub="ضيف عهدة الأول من تاب العهد" /></SectionCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="no-print">
        <Header
          title="طباعة عهدة"
          sub="اختار العهدة وهيتجهز نموذج تصفية رسمي جاهز للطباعة"
          action={
            <div className="flex flex-wrap gap-2">
              <ExportButtons onExcel={handleExcelExport} />
              <button onClick={handlePrint} className="px-5 py-2.5 rounded-lg text-sm font-bold text-white flex items-center gap-2" style={{ background: COLORS.gold, color: COLORS.navy }}>
                <Printer size={16} /> طباعة / PDF
              </button>
            </div>
          }
        />
        <div className="mt-4 max-w-sm">
          <Field label="اختر العهدة">
            <Select value={custodyId} onChange={(e) => setCustodyId(e.target.value)}>
              {custodies.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </Select>
          </Field>
        </div>
      </div>

      {custody && (
        <div id="print-area" ref={printRef} className="bg-white border rounded-2xl p-6 text-xs" style={{ borderColor: COLORS.border, fontFamily: "'Cairo', sans-serif" }}>
          <div className="flex items-center justify-between border-b-2 pb-3 mb-3" style={{ borderColor: COLORS.navy }}>
            <img src={LOGO_DATA_URI} alt="El Rabeh" style={{ height: 40, objectFit: "contain" }} />
            <div className="text-center">
              <div className="font-extrabold text-base display-font" style={{ color: COLORS.gold }}>نموذج تصفية عهدة</div>
              <div className="font-bold">{custody.source}</div>
            </div>
            <div className="text-left text-[11px]" style={{ color: COLORS.slate }}>
              <div>من: {custody.periodFrom}</div>
              <div>إلى: {custody.periodTo || "—"}</div>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-2 mb-4">
            {[
              ["إجمالي التحويلات", custody.transfersIn],
              ["عهدة مرحلة سابقة", custody.broughtForward],
              ["إجمالي المتاح", totals.available],
              ["إجمالي المصروفات", totals.spent],
              ["الرصيد المرحّل", totals.remaining],
            ].map(([label, val]) => (
              <div key={label} className="text-center p-2 rounded-lg" style={{ background: COLORS.cream }}>
                <div className="text-[9px] font-bold mb-1" style={{ color: COLORS.slate }}>{label}</div>
                <div className="font-extrabold tabular-nums" style={{ color: Number(val) < 0 ? COLORS.danger : COLORS.ink }}>{fmtMoney(val)}</div>
              </div>
            ))}
          </div>

          <div className="overflow-x-auto">
          {grouped.map((g) => (
            <table key={g.cat} className="w-full border-collapse text-xs" style={{ minWidth: 900, marginBottom: 0 }}>
              <colgroup>
                <col style={{ width: "3%" }} />
                <col style={{ width: "7%" }} />
                <col style={{ width: "8%" }} />
                <col style={{ width: "7%" }} />
                <col style={{ width: "8%" }} />
                <col style={{ width: "8%" }} />
                <col style={{ width: "20%" }} />
                <col style={{ width: "12%" }} />
                <col style={{ width: "9%" }} />
                <col style={{ width: "9%" }} />
                <col style={{ width: "9%" }} />
              </colgroup>
              <thead>
                <tr style={{ background: COLORS.goldSoft }}>
                  <td colSpan={11} className="border px-3 py-1.5 font-extrabold" style={{ borderColor: COLORS.border, color: COLORS.navy }}>{g.cat}</td>
                </tr>
                <tr style={{ background: COLORS.navy, color: "white" }}>
                  {["م", "التاريخ", "كود المعدة", "النوع", "الماركة", "الموقع", "الغرض من الصرف", "ملاحظات", "نقدي", "تحويل", "شيك"].map((h) => (
                    <th key={h} className="border px-2.5 py-2.5 font-bold" style={{ borderColor: COLORS.navy }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {g.rows.map((e, i) => (
                  <tr key={e.id}>
                    <td className="border px-2.5 py-2 text-center" style={{ borderColor: COLORS.border }}>{i + 1}</td>
                    {e._mergeStart && (
                      <td rowSpan={e._mergeSpan} className="border px-2.5 py-2 text-center align-middle whitespace-nowrap" style={{ borderColor: COLORS.border }}>{e.date}</td>
                    )}
                    {e._mergeStart && (
                      <td rowSpan={e._mergeSpan} className="border px-2.5 py-2 text-center align-middle" style={{ borderColor: COLORS.border }}>{e.equipmentCode || "—"}</td>
                    )}
                    {e._mergeStart && (
                      <td rowSpan={e._mergeSpan} className="border px-2.5 py-2 text-center align-middle" style={{ borderColor: COLORS.border }}>{e.equipmentType || "—"}</td>
                    )}
                    {e._mergeStart && (
                      <td rowSpan={e._mergeSpan} className="border px-2.5 py-2 text-center align-middle" style={{ borderColor: COLORS.border }}>{e.brand || "—"}</td>
                    )}
                    {e._mergeStart && (
                      <td rowSpan={e._mergeSpan} className="border px-2.5 py-2 text-center align-middle" style={{ borderColor: COLORS.border }}>{e.location || "—"}</td>
                    )}
                    <td className="border px-2.5 py-2 leading-relaxed" style={{ borderColor: COLORS.border }}>{e.purpose}</td>
                    <td className="border px-2.5 py-2 leading-relaxed" style={{ borderColor: COLORS.border }}>{e.notes || ""}</td>
                    <td className="border px-2.5 py-2 text-center tabular-nums" style={{ borderColor: COLORS.border }}>{Number(e.cash) ? fmtNum(e.cash) : ""}</td>
                    <td className="border px-2.5 py-2 text-center tabular-nums" style={{ borderColor: COLORS.border }}>{Number(e.transfer) ? fmtNum(e.transfer) : ""}</td>
                    <td className="border px-2.5 py-2 text-center tabular-nums" style={{ borderColor: COLORS.border }}>{Number(e.check) ? fmtNum(e.check) : ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ))}
          <div className="totals-signatures-block">
          <table className="w-full border-collapse text-xs" style={{ minWidth: 900 }}>
            <colgroup>
              <col style={{ width: "3%" }} /><col style={{ width: "7%" }} /><col style={{ width: "8%" }} />
              <col style={{ width: "7%" }} /><col style={{ width: "8%" }} /><col style={{ width: "8%" }} />
              <col style={{ width: "20%" }} /><col style={{ width: "12%" }} />
              <col style={{ width: "9%" }} /><col style={{ width: "9%" }} /><col style={{ width: "9%" }} />
            </colgroup>
            <tbody>
              <tr style={{ background: COLORS.navy, color: "white" }}>
                <td colSpan={8} className="border px-3 py-2 font-extrabold text-center" style={{ borderColor: COLORS.navy }}>الإجمالي</td>
                <td className="border px-2.5 py-2 text-center font-bold tabular-nums" style={{ borderColor: COLORS.navy }}>{fmtNum(sumBy("cash"))}</td>
                <td className="border px-2.5 py-2 text-center font-bold tabular-nums" style={{ borderColor: COLORS.navy }}>{fmtNum(sumBy("transfer"))}</td>
                <td className="border px-2.5 py-2 text-center font-bold tabular-nums" style={{ borderColor: COLORS.navy }}>{fmtNum(sumBy("check"))}</td>
              </tr>
            </tbody>
          </table>
          </div>
          </div>

          <div className="totals-signatures-block grid grid-cols-4 gap-6 mt-4 pt-4">
            {SIGNATURES.map((s) => (
              <div key={s} className="text-center">
                <div className="border-b pb-8 mb-1" style={{ borderColor: COLORS.ink }} />
                <div className="font-bold text-[10px]" style={{ color: COLORS.slate }}>التوقيع / {s}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AlertsView({ custodies, custodyTotals, expenses, revenues, salaries, onUpdateExpenseLoaded, onUpdateSalaryLoaded }) {
  const [loadedInputs, setLoadedInputs] = useState({});
  const [expenseLoadedInputs, setExpenseLoadedInputs] = useState({});
  const deficitCustodies = custodies.filter((c) => (custodyTotals[c.id]?.remaining || 0) < 0);

  const pendingExpenses = useMemo(
    () =>
      expenses
        .filter((e) => isPendingCode(e.equipmentCode))
        .filter((e) => {
          const amount = (Number(e.cash) || 0) + (Number(e.transfer) || 0) + (Number(e.check) || 0);
          const loaded = Number(e.loadedAmount) || 0;
          return amount - loaded > 0;
        }),
    [expenses]
  );

  const pendingSalaries = useMemo(
    () =>
      salaries.filter((s) => {
        const amount = Number(s.amount) || 0;
        const loaded = Number(s.loadedAmount) || 0;
        return amount - loaded > 0;
      }),
    [salaries]
  );

  const missingData = expenses.filter((e) => !e.category || !e.purpose || !e.custodyId);

  const duplicates = useMemo(() => {
    const seen = {};
    const dups = [];
    for (const e of expenses) {
      const total = (Number(e.cash) || 0) + (Number(e.transfer) || 0) + (Number(e.check) || 0);
      const key = [e.custodyId, e.equipmentCode, e.purpose, e.date, total].join("|");
      if (seen[key]) dups.push(e);
      else seen[key] = true;
    }
    return dups;
  }, [expenses]);

  const overdueEquipment = useMemo(() => {
    const map = {};
    for (const e of expenses) {
      if (!e.equipmentCode || !e.date) continue;
      if (!map[e.equipmentCode] || e.date > map[e.equipmentCode]) map[e.equipmentCode] = e.date;
    }
    const now = new Date();
    return Object.entries(map)
      .map(([code, lastDate]) => {
        const days = Math.floor((now - new Date(lastDate)) / 86400000);
        return { code, lastDate, days };
      })
      .filter((x) => x.days > 30)
      .sort((a, b) => b.days - a.days);
  }, [expenses]);

  const noMaintenanceEquipment = useMemo(() => {
    const withExpense = new Set(expenses.filter((e) => e.equipmentCode).map((e) => e.equipmentCode));
    const withRevenue = new Set((revenues || []).filter((r) => r.equipmentCode).map((r) => r.equipmentCode));
    return [...withRevenue].filter((code) => !withExpense.has(code));
  }, [expenses, revenues]);

  return (
    <div className="space-y-6">
      <Header title="تنبيهات ومراجعة" sub="عهد بها عجز، صيانة متأخرة، وفحص جودة البيانات" />

      <SectionCard title={`مصروفات مسجّلة بدون كود معدة (بانتظار التحميل) (${pendingExpenses.length})`}>
        {pendingExpenses.length === 0 ? (
          <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: COLORS.success }}>
            <CheckCircle2 size={16} /> مفيش بنود معلّقة حاليًا
          </div>
        ) : (
          <div className="space-y-2">
            {pendingExpenses.map((e) => {
              const amount = (Number(e.cash) || 0) + (Number(e.transfer) || 0) + (Number(e.check) || 0);
              const loaded = Number(e.loadedAmount) || 0;
              const remaining = amount - loaded;
              const inputVal = expenseLoadedInputs[e.id] !== undefined ? expenseLoadedInputs[e.id] : loaded;
              return (
                <div key={e.id} className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg" style={{ background: COLORS.cream }}>
                  <div className="flex items-start gap-2 text-sm flex-1 min-w-[200px]">
                    <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" style={{ color: COLORS.slate }} />
                    <div>
                      <span style={{ color: COLORS.ink }}>{e.purpose || "بند بدون وصف"}</span>
                      <span style={{ color: COLORS.slate }}> — {e.source || "غير محدد"} — الإجمالي </span>
                      <b className="tabular-nums" style={{ color: COLORS.ink }}>{fmtMoney(amount)}</b>
                      <span style={{ color: COLORS.slate }}> — المتبقي </span>
                      <b className="tabular-nums" style={{ color: remaining > 0 ? COLORS.danger : COLORS.success }}>{fmtMoney(remaining)}</b>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs" style={{ color: COLORS.slate }}>تم تحميل:</label>
                    <input
                      type="number"
                      step="0.01"
                      value={inputVal}
                      onChange={(ev) => setExpenseLoadedInputs((m) => ({ ...m, [e.id]: ev.target.value }))}
                      className="w-28 px-2 py-1.5 rounded-lg text-sm border text-center"
                      style={{ borderColor: COLORS.border }}
                    />
                    <button
                      onClick={() => onUpdateExpenseLoaded(e.id, Number(inputVal) || 0)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-white"
                      style={{ background: COLORS.gold, color: COLORS.navy }}
                    >
                      حفظ
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      <SectionCard title="متابعة تحميل المرتبات على المعدات">
        {pendingSalaries.length === 0 ? (
          <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: COLORS.success }}>
            <CheckCircle2 size={16} /> لا توجد بنود مرتبات معلّقة حاليًا
          </div>
        ) : (
          <div className="space-y-2">
            {pendingSalaries.map((s) => {
              const amount = Number(s.amount) || 0;
              const loaded = Number(s.loadedAmount) || 0;
              const remaining = amount - loaded;
              const inputVal = loadedInputs[s.id] !== undefined ? loadedInputs[s.id] : loaded;
              return (
                <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg" style={{ background: COLORS.cream }}>
                  <div className="text-sm flex-1 min-w-[200px]">
                    <span style={{ color: COLORS.ink }}>{s.source} — {s.month}</span>
                    <span style={{ color: COLORS.slate }}> — الإجمالي </span>
                    <b className="tabular-nums" style={{ color: COLORS.ink }}>{fmtMoney(amount)}</b>
                    <span style={{ color: COLORS.slate }}> — المتبقي </span>
                    <b className="tabular-nums" style={{ color: remaining > 0 ? COLORS.danger : COLORS.success }}>{fmtMoney(remaining)}</b>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs" style={{ color: COLORS.slate }}>تم تحميل:</label>
                    <input
                      type="number"
                      step="0.01"
                      value={inputVal}
                      onChange={(e) => setLoadedInputs((m) => ({ ...m, [s.id]: e.target.value }))}
                      className="w-28 px-2 py-1.5 rounded-lg text-sm border text-center"
                      style={{ borderColor: COLORS.border }}
                    />
                    <button
                      onClick={() => onUpdateSalaryLoaded(s.id, Number(inputVal) || 0)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold text-white"
                      style={{ background: COLORS.gold, color: COLORS.navy }}
                    >
                      حفظ
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      <SectionCard title="عهد بها عجز (المصروف أكبر من المتاح)">
        {deficitCustodies.length === 0 ? (
          <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: COLORS.success }}>
            <CheckCircle2 size={17} /> لا توجد عهد بها عجز حاليًا
          </div>
        ) : (
          <div className="space-y-2">
            {deficitCustodies.map((c) => (
              <div key={c.id} className="flex items-center justify-between p-3 rounded-lg" style={{ background: COLORS.dangerBg }}>
                <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: COLORS.danger }}>
                  <AlertTriangle size={15} /> {c.label}
                </div>
                <div className="text-sm font-bold tabular-nums" style={{ color: COLORS.danger }}>
                  {fmtMoney(custodyTotals[c.id].remaining)}
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard title="معدات متأخرة في الصيانة (أكثر من 30 يوم)">
        {overdueEquipment.length === 0 ? (
          <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: COLORS.success }}>
            <CheckCircle2 size={17} /> لا توجد معدات متأخرة حاليًا
          </div>
        ) : (
          <div className="overflow-x-auto -mx-5">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: `linear-gradient(90deg, ${COLORS.navy}, ${COLORS.navyLight})` }}>
                  {["كود المعدة", "آخر صيانة", "عدد الأيام"].map((h) => (
                    <th key={h} className="px-4 py-2 text-right text-xs font-bold" style={{ color: "rgba(255,255,255,0.88)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {overdueEquipment.map((o) => (
                  <tr key={o.code} className="border-t" style={{ borderColor: COLORS.border }}>
                    <td className="px-4 py-2.5 font-semibold">{o.code}</td>
                    <td className="px-4 py-2.5 text-xs" style={{ color: COLORS.slate }}>{o.lastDate}</td>
                    <td className="px-4 py-2.5 font-bold" style={{ color: COLORS.danger }}>{o.days} يوم</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>

      <SectionCard title="معدات لها إيراد بدون أي سجل صيانة">
        {noMaintenanceEquipment.length === 0 ? (
          <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: COLORS.success }}>
            <CheckCircle2 size={17} /> كل المعدات اللي بتحقق إيراد ليها سجل صيانة
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {noMaintenanceEquipment.map((code) => (
              <span key={code} className="px-3 py-1.5 rounded-lg text-xs font-bold" style={{ background: COLORS.dangerBg, color: COLORS.danger }}>{code}</span>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard title="فحص جودة البيانات">
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: missingData.length > 0 ? COLORS.dangerBg : COLORS.successBg }}>
            <span className="text-sm font-semibold flex items-center gap-2" style={{ color: missingData.length > 0 ? COLORS.danger : COLORS.success }}>
              <ShieldCheck size={15} /> بنود ناقصة البيانات (بدون تصنيف أو عهدة أو غرض صرف)
            </span>
            <span className="text-sm font-bold">{fmtNum(missingData.length)}</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: duplicates.length > 0 ? COLORS.dangerBg : COLORS.successBg }}>
            <span className="text-sm font-semibold flex items-center gap-2" style={{ color: duplicates.length > 0 ? COLORS.danger : COLORS.success }}>
              <ShieldCheck size={15} /> بنود مكررة على الأرجح (نفس العهدة والكود والقيمة والتاريخ)
            </span>
            <span className="text-sm font-bold">{fmtNum(duplicates.length)}</span>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
