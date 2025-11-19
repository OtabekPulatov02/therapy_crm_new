import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  ru: {
    translation: {
      common: {
        appTitle: "Проекты therapy",
        uploadData: "Загрузить данные",
        uploadDocs: "Добавить документ",
        quickReports: "Быстрый доступ к отчётам",
        newReport: "Новый отчёт",
        documents: "Документы",
        language: "Язык",
        add: "Добавить",
      },
      nav: {
        data: "Данные",
        analysis: "Анализ",
        charts: "Графики",
        reports: "Отчёты",
      },
      filters: {
        date: "Дата",
        diagnosis: "Диагноз",
        project: "Проект",
        group: "Группа пациентов",
      },
      dashboard: {
        projects: "Проекты",
        patients: "Пациенты",
        biomarkers: "Биомаркеры",
        analyses: "Анализы",
      },
      data: {
        uploadHint: "Импортируйте клинические наборы данных или подключите БД.",
        docListEmpty: "Документы ещё не добавлены.",
        docLastUpdated: "Обновлён {{time}} назад",
      },
      analysis: {
        title: "Панель анализа",
        descriptive: "Описательная статистика",
        hypothesis: "T-test / ANOVA",
        survival: "Модели выживаемости",
        ml: "ML модели",
        run: "Запустить",
      },
      charts: {
        title: "Конструктор графиков",
        recent: "Недавние графики",
        kmDemo: "Kaplan-Meier (демо)",
      },
      reports: {
        title: "Отчёты и шаблоны",
        conference: "Конференция",
        clinical: "Клинический",
        export: "Экспортировать",
      },
      login: {
        subtitle: "Войдите в систему для доступа к платформе",
        username: "Имя пользователя",
        usernamePlaceholder: "Введите имя пользователя",
        password: "Пароль",
        passwordPlaceholder: "Введите пароль",
        loginButton: "Войти",
        loggingIn: "Вход...",
        invalidCredentials: "Неверное имя пользователя или пароль",
        logout: "Выйти",
      },
    },
  },
  uz: {
    translation: {
      common: {
        appTitle: "Loyihalar therapy",
        uploadData: "Maʼlumotlarni yuklash",
        uploadDocs: "Hujjat qoʻshish",
        quickReports: "Hisobotlarga tezkor kirish",
        newReport: "Yangi hisobot",
        documents: "Hujjatlar",
        language: "Til",
        add: "Qoʻshish",
      },
      nav: {
        data: "Maʼlumotlar",
        analysis: "Tahlil",
        charts: "Grafiklar",
        reports: "Hisobotlar",
      },
      filters: {
        date: "Sana",
        diagnosis: "Tashxis",
        project: "Loyiha",
        group: "Bemor guruhi",
      },
      dashboard: {
        projects: "Loyihalar",
        patients: "Bemorlar",
        biomarkers: "Biomarkerlar",
        analyses: "Tahlillar",
      },
      data: {
        uploadHint: "Klinik maʼlumotlarni yuklang yoki DB ulang.",
        docListEmpty: "Hujjatlar hali qoʻshilmagan.",
        docLastUpdated: "{{time}} oldin yangilangan",
      },
      analysis: {
        title: "Tahlil paneli",
        descriptive: "Tasviriy statistika",
        hypothesis: "T-test / ANOVA",
        survival: "Omon qolish modellari",
        ml: "ML modellar",
        run: "Ishga tushirish",
      },
      charts: {
        title: "Grafik konstruktori",
        recent: "Soʻnggi grafiklar",
        kmDemo: "Kaplan-Meier (demo)",
      },
      reports: {
        title: "Hisobotlar va shablonlar",
        conference: "Konferensiya",
        clinical: "Klinik",
        export: "Eksport",
      },
      login: {
        subtitle: "Platformaga kirish uchun tizimga kiring",
        username: "Foydalanuvchi nomi",
        usernamePlaceholder: "Foydalanuvchi nomini kiriting",
        password: "Parol",
        passwordPlaceholder: "Parolni kiriting",
        loginButton: "Kirish",
        loggingIn: "Kirilmoqda...",
        invalidCredentials: "Noto'g'ri foydalanuvchi nomi yoki parol",
        logout: "Chiqish",
      },
    },
  },
  en: {
    translation: {
      common: {
        appTitle: "Projects therapy",
        uploadData: "Upload Data",
        uploadDocs: "Add Document",
        quickReports: "Quick access to reports",
        newReport: "New report",
        documents: "Documents",
        language: "Language",
        add: "Add",
      },
      nav: {
        data: "Data",
        analysis: "Analysis",
        charts: "Charts",
        reports: "Reports",
      },
      filters: {
        date: "Date",
        diagnosis: "Diagnosis",
        project: "Project",
        group: "Patient group",
      },
      dashboard: {
        projects: "Projects",
        patients: "Patients",
        biomarkers: "Biomarkers",
        analyses: "Active analyses",
      },
      data: {
        uploadHint: "Import clinical datasets or connect a database.",
        docListEmpty: "No documents added yet.",
        docLastUpdated: "Updated {{time}} ago",
      },
      analysis: {
        title: "Analytics workspace",
        descriptive: "Descriptive stats",
        hypothesis: "T-test / ANOVA",
        survival: "Survival models",
        ml: "ML models",
        run: "Run",
      },
      charts: {
        title: "Chart builder",
        recent: "Recent charts",
        kmDemo: "Kaplan-Meier (demo)",
      },
      reports: {
        title: "Reports & templates",
        conference: "Conference",
        clinical: "Clinical",
        export: "Export",
      },
      login: {
        subtitle: "Sign in to access the platform",
        username: "Username",
        usernamePlaceholder: "Enter your username",
        password: "Password",
        passwordPlaceholder: "Enter your password",
        loginButton: "Sign In",
        loggingIn: "Signing in...",
        invalidCredentials: "Invalid username or password",
        logout: "Logout",
      },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "ru",
  fallbackLng: "ru",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;

