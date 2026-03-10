export const levelBadge: Record<string, string> = {
  ចាប់ផ្តើម:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  មធ្យម:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  កម្រិតខ្ពស់:
    "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
};

export const stats = [
  { value: "100+", label: "សិស្សកំពុងសិក្សា", sub: "អ្នករៀនសកម្ម" },
  { value: "10+", label: "វគ្គសិក្សា", sub: "មេរៀនគ្រប់កម្រិត" },
  { value: "95%", label: "អត្រាពេញចិត្ត", sub: "មតិយោបល់វិជ្ជមាន" },
  { value: "ឥតគិតថ្លៃ", label: "ចាប់ផ្តើម", sub: "ចូលរៀនដោយសេរី" },
];

export const features = [
  {
    emoji: "💻",
    title: "មេរៀនជាភាសាខ្មែរ",
    description:
      "មេរៀនត្រូវបានរៀបចំចាប់ពីមូលដ្ឋានរហូតដល់កម្រិតខ្ពស់ ដោយពន្យល់ជាភាសាខ្មែរងាយយល់ និងអនុវត្តបានពិត។",
    color: "from-blue-500 to-indigo-500",
    shadow: "shadow-blue-500/20",
  },
  {
    emoji: "🎯",
    title: "រៀនតាមគម្រោងពិត",
    description:
      "អ្នកអាចអនុវត្តជាមួយគម្រោងជាក់ស្តែង ដើម្បីពង្រឹងជំនាញ និងបង្កើត portfolio សម្រាប់ការងារពេលអនាគត។",
    color: "from-violet-500 to-purple-500",
    shadow: "shadow-violet-500/20",
  },
  {
    emoji: "🤝",
    title: "មានការគាំទ្រ",
    description:
      "អាចសាកសួរ នៅពេលដែលអ្នកមានសំណួរ ឬត្រូវការជំនួយក្នុងការសិក្សា។",
    color: "from-emerald-500 to-teal-500",
    shadow: "shadow-emerald-500/20",
  },
];

export const featuredCourses = [
  {
    icon: "🌐",
    bg: "from-orange-500 via-red-400 to-pink-500",
    category: "អភិវឌ្ឍន៍វេបសាយ",
    level: "ចាប់ផ្តើម",
    title: "HTML & CSS មូលដ្ឋានគ្រឹះ",
    description:
      "ចាប់ផ្តើមរៀន HTML Tags, CSS Styling, Flexbox និង Grid Layout ជាភាសាខ្មែរងាយយល់។",
    slug: "html-css-fundamentals",
  },
  {
    icon: "⚡",
    bg: "from-yellow-400 via-amber-400 to-orange-400",
    category: "ភាសាកម្មវិធី",
    level: "ចាប់ផ្តើម",
    title: "JavaScript ពីមូលដ្ឋានដល់អនុវត្ត",
    description:
      "រៀន Variables, Functions, DOM, Async/Await និង ES6+ ដើម្បីចាប់ផ្តើមសរសេរកម្មវិធីបានយ៉ាងមុតមាំ។",
    slug: "javascript",
  },
  {
    icon: "⚛️",
    bg: "from-sky-500 via-blue-400 to-indigo-500",
    category: "Frontend",
    level: "មធ្យម",
    title: "React.js សម្រាប់បង្កើត UI ទំនើប",
    description:
      "រៀន Components, Hooks, State Management, Routing និង API Integration សម្រាប់ web app ទំនើប។",
    slug: "react",
  },
  {
    icon: "▲",
    bg: "from-slate-700 via-slate-600 to-slate-500",
    category: "Full-Stack",
    level: "មធ្យម",
    title: "Next.js Full-Stack Development",
    description:
      "សិក្សា SSR, SSG, API Routes, Authentication និង Database Integration ដើម្បីបង្កើត production app។",
    slug: "nextjs",
  },
  {
    icon: "🍃",
    bg: "from-green-500 via-emerald-400 to-teal-500",
    category: "Backend",
    level: "មធ្យម",
    title: "Spring Boot & Java Backend",
    description:
      "រៀន REST API, JPA, Security និងការអភិវឌ្ឍ backend ជាភាសាខ្មែរ ដល់ការប្រើប្រាស់ពិត។",
    slug: "spring-boot",
  },
  {
    icon: "🐳",
    bg: "from-blue-600 via-blue-500 to-cyan-500",
    category: "DevOps",
    level: "កម្រិតខ្ពស់",
    title: "Docker & DevOps Essentials",
    description:
      "ស្គាល់ Containers, CI/CD, Nginx និង Cloud Deployment ដើម្បីរៀបចំ project ឲ្យរត់បានពេញលេញ។",
    slug: "docker-devops",
  },
];

export const techMarquee = [
  { name: "HTML5", icon: "🌐" },
  { name: "CSS3", icon: "🎨" },
  { name: "JavaScript", icon: "⚡" },
  { name: "TypeScript", icon: "🔷" },
  { name: "React", icon: "⚛️" },
  { name: "Next.js", icon: "▲" },
  { name: "Node.js", icon: "🟢" },
  { name: "Python", icon: "🐍" },
  { name: "Java", icon: "☕" },
  { name: "Spring Boot", icon: "🍃" },
  { name: "Docker", icon: "🐳" },
  { name: "Git", icon: "🔁" },
  { name: "MySQL", icon: "🗄️" },
  { name: "MongoDB", icon: "🍃" },
  { name: "Tailwind CSS", icon: "💨" },
  { name: "Flutter", icon: "📱" },
];

export const roadmapPaths = [
  {
    title: "Frontend Developer",
    color: "from-blue-600 to-sky-500",
    steps: [
      "HTML & CSS — មូលដ្ឋានគ្រឹះ",
      "JavaScript / TypeScript",
      "React.js / Next.js",
      "UI Libraries & Tailwind CSS",
      "បង្កើត និង Deploy គម្រោង",
    ],
  },
  {
    title: "Backend Developer",
    color: "from-emerald-600 to-teal-500",
    steps: [
      "Java / Python / Node.js",
      "ការរចនា REST API",
      "Database (SQL / NoSQL)",
      "Spring Boot / Express.js",
      "Docker & Deployment",
    ],
  },
  {
    title: "Fullstack Developer",
    color: "from-violet-600 to-purple-500",
    steps: [
      "មូលដ្ឋាន Frontend",
      "Backend & API",
      "ភ្ជាប់ Database",
      "Authentication & Security",
      "Portfolio Project",
    ],
  },
];

export const testimonials = [
  {
    name: "Sophea Rin",
    role: "អ្នកអភិវឌ្ឍន៍ Frontend ថ្មី",
    avatar: "SR",
    text: "ADUTI Learning បានជួយឲ្យខ្ញុំយល់ React ក្នុងរយៈពេលខ្លី។ មេរៀនជាភាសាខ្មែរ ងាយស្រួលអាន និងអនុវត្តតាមបានពិត។",
    stars: 5,
  },
  {
    name: "Dara Meng",
    role: "វិស្វករ Backend",
    avatar: "DM",
    text: "Roadmap ច្បាស់លាស់ណាស់។ ខ្ញុំដឹងថាត្រូវរៀនអ្វីមុន អ្វីក្រោយ ហើយការរៀនតាម project ធ្វើឲ្យខ្ញុំមានទំនុកចិត្តខ្លាំងឡើង។",
    stars: 5,
  },
  {
    name: "Sreyleak Chan",
    role: "អ្នកអភិវឌ្ឍន៍ Fullstack",
    avatar: "SC",
    text: "ការពន្យល់ជាភាសាខ្មែរជួយឲ្យខ្ញុំយល់ concept ពិបាកៗ បានលឿនជាងមុន។ វាជាវេទិកាល្អសម្រាប់អ្នកចង់ចូល IT។",
    stars: 5,
  },
];

export const faqs = [
  {
    q: "តើ​ GrowCodeKh ជាអ្វី?",
    a: "GrowCodeKh គឺជាវេបសាយសិក្សាសរសេរកូដ (programming) ដែលផ្តល់នូវមេរៀន និងឧទាហរណ៍កូដជាភាសាខ្មែរ។ វាជួយអ្នកសិក្សាខ្មែរ ដែលអាចមានការលំបាកក្នុងការសិក្សាជាភាសាអង់គ្លេស ដោយផ្តល់មេរៀនសាមញ្ញ និងងាយយល់។ វេបសាយនេះមានមេរៀនស្តីពី HTML, CSS, JavaScript, Python, Dart, C++, និងភាសាសរសេរកូដផ្សេងទៀត។",
  },
  {
    q: "តើវគ្គសិក្សាទាំងនេះឥតគិតថ្លៃទេ?",
    a: "អ្នកអាចចុះឈ្មោះដោយឥតគិតថ្លៃ ហើយចូលប្រើំពេលណាក៏បាន និងមាន roadmap ។​ វាត្រូវបានបង្កើតឡើងដើម្បីជួយសិស្សខ្មែរ ជាពិសេសអ្នកដែលមានធនធានមានកំណត់ ដើម្បីរៀនជំនាញ IT ដោយមិនចាំបាច់ចំណាយលុយ។",
  },
  {
    q: "តើខ្ញុំត្រូវមានបទពិសោធន៍មុនទេ?",
    a: "មិនចាំបាច់ទេ។ វគ្គសិក្សាចាប់ផ្តើមពីកម្រិតដំបូងបំផុត ហើយមានផ្លូវសិក្សាដែលណែនាំជាជំហានៗ។",
  },
  {
    q: "តើខ្ញុំត្រូវការ​ tool អ្វីដើម្បីចាប់ផ្តើមសិក្សាដែរឬទេ?",
    a: "អ្នកត្រូវការកុំព្យូទ័រ ឬទូរស័ព្ទដែលអាចបើក browser បាន។ សម្រាប់ការអនុវត្តកូដ អ្នកអាចប្រើ online editors ដូចជា Replit, CodePen (សម្រាប់ web), ឬ install IDE ដូចជា VS Code នៅលើកុំព្យូទ័រ។ មេរៀននៅលើវេបសាយនេះមានឧទាហរណ៍កូដដែលអ្នកអាច copy និង run ភ្លាមៗ។",
  },
  {
    q: "តើខ្ញុំអាចទាក់ទង​ Admin បានទេ​ ពេលមានសំណួរ?",
    a: "បាទ/ចាស អ្នកអាចទាក់ទងតាម Telegram​ របស់ GrowCodeKh នៅ https://t.me/Vanreuth ឬតាម Facebook ។ Admin តែងតែឆ្លើយតបសំណួរ និងផ្តល់ជំនួយបន្ថែម។",
  },
  {
    q: "តើខ្ញុំអាចចូលរួមជាមួយសហគមន៍អ្នកសិក្សា GrowCodeKh ដើម្បីចែករំលែកបទពិសោធន៍ និងសំណួរបានទេ?",
    a: "បាទ/ចាស បើអ្នកចង់រួមចំណែក ដូចជាបង្កើតមេរៀនថ្មី ឬកែតម្រូវកំហុស សូមទាក់ទង admin។ វេបសាយនេះត្រូវបានបង្កើតដោយសហគមន៍ និងស្វាគមន៍ការជួយជំនួយពីអ្នកសិក្សាផ្សេងទៀត។",
  },
];