export type RoadmapStage = {
  id: string;
  phase: number;
  title: string;
  titleKh: string;
  window: string;
  focus: string;
  focusKh: string;
  topics: { name: string; icon: string; desc: string }[];
  outcomes: string[];
  outcomesKh: string[];
  project: string;
  projectKh: string;
  color: string;
  resources: { label: string; url: string; internal?: boolean }[];
};

export type RoadmapPath = {
  id: "frontend" | "backend" | "fullstack";
  label: string;
  labelKh: string;
  tagline: string;
  taglineKh: string;
  summary: string;
  summaryKh: string;
  responsibilities: string[];
  tools: string[];
  icon: string;
  accent: string;
  gradient: string;
  stages: RoadmapStage[];
};

export const learningCourseLinks = [
  { label: "HTML សម្រាប់អ្នកចាប់ផ្តើម", href: "/courses/html-សម្រាប់អ្នកចាប់ផ្តើម-1" },
  { label: "CSS Styling ជាភាសាខ្មែរ", href: "/courses/css-styling-ជាភាសាខ្មែរ-full-course-1" },
  { label: "JavaScript ជាភាសាខ្មែរ", href: "/courses/javascript-ជាភាសាខ្មែរ-1" },
  { label: "React.js ជាភាសាខ្មែរ", href: "/courses/reactjs-ជាភាសាខ្មែរ-1" },
  { label: "Next.js ជាភាសាខ្មែរ", href: "/courses/nextjs-ជាភាសាខ្មែរ" },
  { label: "Java ជាភាសាខ្មែរ", href: "/courses/java-ជាភាសាខ្មែរ" },
  { label: "Spring Boot ជាភាសាខ្មែរ", href: "/courses/spring-boot-ជាភាសាខ្មែរ" },
  { label: "Git & DevOps Fundamentals", href: "/courses/git-devops-fundamentals-1" },
] as const;

export const roadmapPaths: RoadmapPath[] = [
  // ─────────────────────────────────────────────
  // FRONTEND
  // ─────────────────────────────────────────────
  {
    id: "frontend",
    label: "Frontend",
    labelKh: "ផ្នែកមុខ",
    tagline: "Build beautiful, responsive user interfaces",
    taglineKh: "បង្កើតចំណុចប្រទាក់ស្អាត ប្រើការបានគ្រប់ឧបករណ៍",
    summary:
      "A frontend developer builds the part of a website or app that users can see and interact with.",
    summaryKh:
      "Frontend Developer គឺជាអ្នកបង្កើតផ្នែកដែលអ្នកប្រើប្រាស់មើលឃើញ និងអាចប្រាស្រ័យទាក់ទងបានដោយផ្ទាល់ — រួមមានប៊ូតុង, ទម្រង់, ម៉ឺនុយ, និងរូបរាងទំព័រទាំងមូល",
    responsibilities: [
      "Create pages, buttons, forms, navigation, and layouts",
      "Make the website responsive on mobile, tablet, and desktop",
      "Connect the UI to APIs and improve user experience",
    ],
    tools: ["HTML", "CSS", "JavaScript", "React", "Next.js"],
    icon: "🖥️",
    accent: "blue",
    gradient: "from-blue-600 to-sky-500",
    stages: [
      {
        id: "fe-1",
        phase: 1,
        title: "Web Foundations",
        titleKh: "មូលដ្ឋានគ្រឹះនៃការអភិវឌ្ឍ Web",
        window: "ខែ 1–2",
        focus:
          "Master HTML structure, CSS styling and layout systems before touching JavaScript.",
        focusKh:
          "ដំណាក់កាលនេះផ្តោតលើការរៀនមូលដ្ឋានគ្រឹះចំនួនបីយ៉ាងគឺ HTML សម្រាប់រៀបចំរចនាសម្ព័ន្ធទំព័រ, CSS សម្រាប់តុបតែងរូបរាង, និង Layout Systems ដូចជា Flexbox និង Grid សម្រាប់ចាត់វាងធាតុនានា។ ការយល់ដឹងទាំងនេះជាគ្រឹះដ៏សំខាន់ដែលអ្នក Frontend Developer ជំនាញទាំងអស់ត្រូវចេះ",
        topics: [
          { name: "HTML5 Semantics", icon: "🌐", desc: "Tags, forms, accessibility, SEO" },
          { name: "CSS Fundamentals", icon: "🎨", desc: "Selectors, box model, typography" },
          { name: "Flexbox & Grid", icon: "⬜", desc: "Modern layout systems" },
          { name: "Responsive Design", icon: "📱", desc: "Media queries, mobile-first" },
          { name: "Git & GitHub", icon: "🔁", desc: "Version control basics" },
        ],
        outcomes: [
          "Build any static webpage from a design mockup",
          "Write semantic, accessible HTML",
          "Create responsive layouts with Flexbox and Grid",
          "Use Git for version control",
        ],
        outcomesKh: [
          "អាចបង្កើតទំព័រ Web static ណាមួយតាម design mockup ដែលបានផ្តល់ឱ្យ",
          "សរសេរ HTML ប្រើ tag ត្រឹមត្រូវ មានន័យច្បាស់ និងងាយស្រួលសម្រាប់ SEO",
          "បង្កើត Layout ដែលអាចបត់បែនបានតាម Screen ដោយប្រើ Flexbox និង Grid",
          "ប្រើប្រាស់ Git ដើម្បីតាមដានការផ្លាស់ប្តូរ code និងធ្វើការជាក្រុម",
        ],
        project:
          "Personal Portfolio Website — responsive, multi-section, deployed to GitHub Pages",
        projectKh:
          "បង្កើតគេហទំព័រ Portfolio ផ្ទាល់ខ្លួន ដែលមានច្រើនផ្នែក (About, Skills, Projects, Contact) ដំណើរការបានល្អលើទូរស័ព្ទ Tablet និង Desktop ហើយ deploy ទៅ GitHub Pages ដើម្បីឱ្យអ្នកដទៃចូលមើលបាន",
        color: "from-orange-500 to-pink-500",
        resources: [
          { label: "HTML Course", url: "/courses/html-សម្រាប់អ្នកចាប់ផ្តើម", internal: true },
          {
            label: "CSS Course",
            url: "/courses/css-styling-ជាភាសាខ្មែរ-full-course",
            internal: true,
          },
          {
            label: "Git & DevOps Course",
            url: "/courses/git-devops-fundamentals",
            internal: true,
          },
          { label: "MDN Web Docs", url: "https://developer.mozilla.org" },
          { label: "CSS Tricks", url: "https://css-tricks.com" },
        ],
      },
      {
        id: "fe-2",
        phase: 2,
        title: "JavaScript Mastery",
        titleKh: "JavaScript ស៊ីជម្រៅ",
        window: "ខែ 2–4",
        focus:
          "Learn JavaScript from variables to async programming and DOM manipulation.",
        focusKh:
          "ដំណាក់កាលនេះគឺជាចំណុចចាប់ផ្តើមនៃការធ្វើឱ្យទំព័រ Web មានជីវិត។ លោកអ្នកនឹងរៀន JavaScript ចាប់ពីអថេរ, មុខងារ, array, object រហូតដល់ការគ្រប់គ្រង DOM, ការ Fetch ទិន្នន័យពី API និងការសរសេរ Code ទំនើបជាមួយ ES6+ និង TypeScript",
        topics: [
          {
            name: "JS Core",
            icon: "⚡",
            desc: "Variables, functions, arrays, objects",
          },
          {
            name: "DOM Manipulation",
            icon: "🌳",
            desc: "Events, selectors, dynamic content",
          },
          {
            name: "ES6+ Features",
            icon: "✨",
            desc: "Arrow functions, destructuring, modules",
          },
          {
            name: "Async JavaScript",
            icon: "⏳",
            desc: "Promises, async/await, fetch API",
          },
          {
            name: "TypeScript Basics",
            icon: "🔷",
            desc: "Types, interfaces, generics",
          },
        ],
        outcomes: [
          "Write clean JavaScript with ES6+ syntax",
          "Manipulate the DOM dynamically",
          "Fetch and display data from APIs",
          "Understand TypeScript fundamentals",
        ],
        outcomesKh: [
          "សរសេរ JavaScript ស្អាត អានបានច្បាស់ ដោយប្រើ syntax ទំនើបបែប ES6+",
          "ផ្លាស់ប្តូរ HTML DOM ឱ្យមានភាពស្វ័យប្រវត្តិតាមការចុចប៊ូតុង ឬការបញ្ចូលទិន្នន័យ",
          "ទាញយកទិន្នន័យពី API ខាងក្រៅ ហើយបង្ហាញលទ្ធផលនៅក្នុង UI",
          "យល់ TypeScript ដើម្បីសរសេរ code ដែលមានប្រភេទទិន្នន័យច្បាស់លាស់ និងកំហុសតិច",
        ],
        project:
          "Weather Dashboard App — fetches real API data, dynamic UI updates",
        projectKh:
          "បង្កើត App ព្យាករណ៍អាកាសធាតុ ដែល Fetch ទិន្នន័យពី API ពិតប្រាកដ បង្ហាញសីតុណ្ហភាព ស្ថានភាពអាកាស និង Forecast ច្រើនថ្ងៃ ដោយ UI ធ្វើបច្ចុប្បន្នភាពដោយស្វ័យប្រវត្តិ",
        color: "from-yellow-400 to-orange-500",
        resources: [
          {
            label: "JavaScript Course",
            url: "/courses/javascript-ជាភាសាខ្មែរ",
            internal: true,
          },
          { label: "JavaScript.info", url: "https://javascript.info" },
          { label: "TypeScript Docs", url: "https://typescriptlang.org" },
        ],
      },
      {
        id: "fe-3",
        phase: 3,
        title: "React & Modern UI",
        titleKh: "React និង UI ទំនើប",
        window: "ខែ 4–6",
        focus:
          "Build component-based UIs with React, manage state, and integrate with APIs.",
        focusKh:
          "ដំណាក់កាលនេះលោកអ្នកនឹងចូលរៀន React ដែលជា Library ពេញនិយមបំផុតសម្រាប់បង្កើត UI ទំនើប។ លោកអ្នកនឹងរៀនការបង្កើត Components, ការគ្រប់គ្រង State ជាមួយ Hooks, ការ Navigate រវាងទំព័រ, ការភ្ជាប់ API, និងការ Style ដ៏ឆាប់រហ័សជាមួយ Tailwind CSS",
        topics: [
          {
            name: "React Components",
            icon: "⚛️",
            desc: "JSX, props, component patterns",
          },
          {
            name: "Hooks",
            icon: "🪝",
            desc: "useState, useEffect, useContext, custom hooks",
          },
          {
            name: "React Router",
            icon: "🗺️",
            desc: "Client-side routing, nested routes",
          },
          {
            name: "State Management",
            icon: "🗄️",
            desc: "Context API, Zustand, Redux basics",
          },
          {
            name: "Tailwind CSS",
            icon: "💨",
            desc: "Utility-first styling, dark mode",
          },
        ],
        outcomes: [
          "Build full React applications with multiple pages",
          "Manage complex state with hooks and context",
          "Consume REST APIs and handle loading/error states",
          "Style apps with Tailwind CSS",
        ],
        outcomesKh: [
          "បង្កើត React Application ពេញលេញដែលមានច្រើនទំព័រ ប្រើ React Router ដើម្បី Navigate",
          "គ្រប់គ្រង State ស្មុគស្មាញដោយប្រើ Hooks, Context API ឬ Zustand",
          "ភ្ជាប់ REST API ហើយគ្រប់គ្រង Loading, Error, និង Empty State ឱ្យបានត្រឹមត្រូវ",
          "Style Component ស្អាត ឆ្លើយតបបានលឿន ដោយប្រើ Tailwind CSS",
        ],
        project:
          "E-commerce Product Listing — cart, filters, API integration, auth",
        projectKh:
          "បង្កើត App លក់ទំនិញ ដែលមានការបង្ហាញផលិតផល, Filter តាមប្រភេទ, ប្រព័ន្ធ Cart, API ភ្ជាប់ Backend, និង Authentication ដើម្បីចូលគណនី",
        color: "from-sky-500 to-indigo-500",
        resources: [
          {
            label: "React Course",
            url: "/courses/reactjs-ជាភាសាខ្មែរ",
            internal: true,
          },
          { label: "React Docs", url: "https://react.dev" },
          { label: "Tailwind CSS", url: "https://tailwindcss.com" },
        ],
      },
      {
        id: "fe-4",
        phase: 4,
        title: "Next.js & Production",
        titleKh: "Next.js និងការដាក់ប្រើប្រាស់ Production",
        window: "ខែ 6–8",
        focus:
          "Ship production-grade apps with Next.js, performance optimization, and deployment.",
        focusKh:
          "ដំណាក់កាលចុងក្រោយនេះគឺការដំឡើងកម្រិតទៅ Next.js Framework ដ៏មានឥទ្ធិពល ដែលភ្ជាប់ Frontend និង Backend ចូលគ្នា។ លោកអ្នកនឹងរៀន Server-Side Rendering, Authentication, Web Performance, Testing, ហើយ Deploy App ជាក់ស្តែងទៅ Vercel",
        topics: [
          {
            name: "Next.js App Router",
            icon: "▲",
            desc: "SSR, SSG, ISR, layouts",
          },
          {
            name: "API Routes",
            icon: "🔌",
            desc: "Full-stack API within Next.js",
          },
          {
            name: "Authentication",
            icon: "🔐",
            desc: "NextAuth, session, JWT",
          },
          {
            name: "Web Performance",
            icon: "⚡",
            desc: "Core Web Vitals, lazy loading, CDN",
          },
          {
            name: "Testing",
            icon: "🧪",
            desc: "Jest, React Testing Library, Cypress",
          },
        ],
        outcomes: [
          "Build and deploy Next.js full-stack apps",
          "Implement authentication and protected routes",
          "Optimize for Core Web Vitals",
          "Write unit and integration tests",
        ],
        outcomesKh: [
          "បង្កើត Next.js App ពេញលេញ ភ្ជាប់ Database និង Deploy ទៅ Vercel",
          "Implement ប្រព័ន្ធ Authentication ជាមួយ NextAuth និងការការពារ Route ដែលត្រូវការការចូល",
          "Optimize App ឱ្យទទួលបានពិន្ទុ Core Web Vitals ខ្ពស់ ដំណើរការបានលឿន",
          "សរសេរ Unit Test និង Integration Test ដើម្បីធានា code ដំណើរការត្រឹមត្រូវ",
        ],
        project:
          "Full-Stack Blog Platform — auth, CRUD, SEO, deployed to Vercel",
        projectKh:
          "បង្កើត Platform Blog ពេញលេញ ដែលអ្នកប្រើចូល Account ដើម្បី Create, Edit, Delete អត្ថបទ មានការ Optimize SEO ល្អ ហើយ Deploy ជាក់ស្តែងទៅ Vercel ជាមួយ Domain ផ្ទាល់",
        color: "from-slate-600 to-slate-800",
        resources: [
          {
            label: "Next.js Course",
            url: "/courses/nextjs-ជាភាសាខ្មែរ",
            internal: true,
          },
          { label: "Next.js Docs", url: "https://nextjs.org/docs" },
          { label: "Vercel", url: "https://vercel.com" },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────
  // BACKEND
  // ─────────────────────────────────────────────
  {
    id: "backend",
    label: "Backend",
    labelKh: "ផ្នែកក្រោយ",
    tagline: "Build powerful APIs, databases, and server-side systems",
    taglineKh: "បង្កើត API, Database និងប្រព័ន្ធ Server ដ៏មានអានុភាព",
    summary:
      "A backend developer builds the server, database, and business logic that make an application work behind the scenes.",
    summaryKh:
      "Backend Developer គឺជាអ្នករៀបចំប្រព័ន្ធខាងក្រោយរបស់ Application — រួមមាន Server ដែលទទួល Request, Database ដែលរក្សាទុកទិន្នន័យ, ក៏ដូចជា Logic ដែលគ្រប់គ្រងពីរបៀបដំណើរការ App ទាំងមូល",
    responsibilities: [
      "Build APIs that send and receive data",
      "Design databases and manage stored information securely",
      "Handle authentication, validation, and server performance",
    ],
    tools: ["Java", "Spring Boot", "Node.js", "PostgreSQL", "Docker"],
    icon: "⚙️",
    accent: "emerald",
    gradient: "from-emerald-600 to-teal-500",
    stages: [
      {
        id: "be-1",
        phase: 1,
        title: "Programming Fundamentals",
        titleKh: "មូលដ្ឋានការសរសេរកម្មវិធី",
        window: "ខែ 1–2",
        focus:
          "Choose Java or Python as your primary language, master core programming concepts.",
        focusKh:
          "ជំហានដំបូងនៃ Backend Developer គឺការស្ទាត់ជំនាញភាសាកម្មវិធី។ ដំណាក់កាលនេះលោកអ្នកនឹងជ្រើសយក Java ឬ Python ហើយរៀនគ្រប់គ្រង Logic, Object-Oriented Programming, Data Structures, Algorithms, ក៏ដូចជា Linux Terminal ដែលត្រូវប្រើជារៀងរាល់ថ្ងៃ",
        topics: [
          {
            name: "Java / Python",
            icon: "☕",
            desc: "OOP, data structures, algorithms",
          },
          {
            name: "Data Structures",
            icon: "🏗️",
            desc: "Arrays, lists, maps, trees",
          },
          {
            name: "Algorithms",
            icon: "🧮",
            desc: "Sorting, searching, complexity",
          },
          { name: "Git & CLI", icon: "🔁", desc: "Terminal, version control" },
          {
            name: "Linux Basics",
            icon: "🐧",
            desc: "File system, permissions, processes",
          },
        ],
        outcomes: [
          "Write clean, object-oriented code",
          "Implement common data structures",
          "Analyze algorithm complexity (Big O)",
          "Work comfortably in a Linux terminal",
        ],
        outcomesKh: [
          "សរសេរ code OOP ស្អាតៗ ដោយប្រើ Class, Object, Inheritance, និង Encapsulation",
          "Implement Data Structures ដូចជា Array, LinkedList, HashMap, Stack ជាដើម",
          "វិភាគ Algorithm Complexity ដោយប្រើ Big O Notation ដើម្បីវាស់ស្ទង់ប្រសិទ្ធភាព code",
          "ប្រើ Linux Terminal យ៉ាងស្ទាត់ជំនាញ ដូចជា navigate folder, run script, manage process",
        ],
        project:
          "CLI Task Manager — CRUD operations, file persistence, OOP design",
        projectKh:
          "បង្កើត Task Manager ដំណើរការតាម Terminal ដែលអ្នកប្រើអាច Add, View, Edit, Delete Task ហើយ Task នឹងត្រូវបាន Save ចូល File ដើម្បីរក្សាទុកបានជាអចិន្ត្រៃយ៍ — ប្រើ OOP Design",
        color: "from-emerald-500 to-green-400",
        resources: [
          {
            label: "Java Course",
            url: "/courses/java-ជាភាសាខ្មែរ",
            internal: true,
          },
          { label: "Java Docs", url: "https://docs.oracle.com/en/java/" },
          { label: "Python Docs", url: "https://docs.python.org" },
        ],
      },
      {
        id: "be-2",
        phase: 2,
        title: "REST API Development",
        titleKh: "ការអភិវឌ្ឍ REST API",
        window: "ខែ 2–4",
        focus:
          "Design and build RESTful APIs with Spring Boot or Express.js.",
        focusKh:
          "ដំណាក់កាលនេះគឺការចាប់ផ្តើមបង្កើត API ពិតប្រាកដ ដែលអ្នកផ្សេង (Frontend ឬ App) អាច Call ទៅបាន។ លោកអ្នកនឹងរៀនរចនា API ឱ្យត្រឹមត្រូវ, ការ Validate ទិន្នន័យ, ការ Handle Error, និង Document API ជាមួយ Swagger ដើម្បីងាយស្រួលប្រើ",
        topics: [
          {
            name: "Spring Boot / Express",
            icon: "🍃",
            desc: "Controllers, middleware, routing",
          },
          {
            name: "REST Principles",
            icon: "🔌",
            desc: "HTTP methods, status codes, REST design",
          },
          {
            name: "Validation",
            icon: "✅",
            desc: "Input validation, error handling",
          },
          {
            name: "API Documentation",
            icon: "📖",
            desc: "Swagger / OpenAPI spec",
          },
          {
            name: "Postman Testing",
            icon: "📬",
            desc: "API testing and collections",
          },
        ],
        outcomes: [
          "Design RESTful APIs following best practices",
          "Build CRUD endpoints with proper status codes",
          "Validate input and handle errors gracefully",
          "Document APIs with Swagger",
        ],
        outcomesKh: [
          "រចនា REST API ដោយអនុវត្ត Best Practices ត្រឹមត្រូវ ដូចជាការប្រើ HTTP Method ឱ្យសមហេតុ",
          "បង្កើត CRUD Endpoints ដែលត្រឡប់ Status Code ត្រឹមត្រូវ (200, 201, 400, 404 ជាដើម)",
          "Validate ទិន្នន័យ Input និង Handle Error ដោយ Response ច្បាស់លាស់ ងាយស្រួលអានដោយ Frontend",
          "Document API ជាមួយ Swagger ដើម្បីឱ្យ Developer ផ្សេងអាចយល់ និង Test API បានភ្លាមៗ",
        ],
        project:
          "Bookstore REST API — full CRUD, validation, Swagger docs, Postman tested",
        projectKh:
          "បង្កើត API គ្រប់គ្រងសៀវភៅ ដែលអ្នកប្រើអាច Create, Read, Update, Delete ព័ត៌មានសៀវភៅ — មាន Validation ពេញលេញ, Error Handling ល្អ, Document ជាមួយ Swagger, ហើយ Test ជាមួយ Postman",
        color: "from-teal-500 to-cyan-500",
        resources: [
          {
            label: "Spring Boot Course",
            url: "/courses/spring-boot-ជាភាសាខ្មែរ",
            internal: true,
          },
          {
            label: "Spring Boot Docs",
            url: "https://spring.io/projects/spring-boot",
          },
          { label: "Express.js", url: "https://expressjs.com" },
        ],
      },
      {
        id: "be-3",
        phase: 3,
        title: "Databases & ORM",
        titleKh: "Database និង ORM",
        window: "ខែ 4–6",
        focus:
          "Master SQL and NoSQL databases, and use ORMs for clean data access.",
        focusKh:
          "ទិន្នន័យគឺជាបេះដូងរបស់ Backend System។ ដំណាក់កាលនេះលោកអ្នកនឹងរៀនការរចនា Database Schema, ការ Query ជាមួយ SQL, ការប្រើ ORM ដើម្បីជៀសវាង SQL ដៃ, ក៏ដូចជា NoSQL ជាមួយ MongoDB, និង Redis Cache ដើម្បីពន្លឿន Performance",
        topics: [
          {
            name: "SQL / PostgreSQL",
            icon: "🗄️",
            desc: "Queries, joins, indexes, transactions",
          },
          {
            name: "Database Design",
            icon: "📐",
            desc: "ERD, normalization, relationships",
          },
          {
            name: "JPA / Prisma ORM",
            icon: "🔗",
            desc: "Entities, migrations, queries",
          },
          {
            name: "MongoDB",
            icon: "🍃",
            desc: "Documents, aggregations, indexes",
          },
          {
            name: "Redis",
            icon: "🔴",
            desc: "Caching, sessions, pub/sub",
          },
        ],
        outcomes: [
          "Design normalized relational database schemas",
          "Write complex SQL queries with joins and indexes",
          "Use ORM for database operations",
          "Implement caching with Redis",
        ],
        outcomesKh: [
          "រចនា Database Schema ត្រឹមត្រូវ មាន Relationship ច្បាស់ និង Normalization ល្អ ដើម្បីជៀសវាង Data Duplication",
          "សរសេរ SQL Query ស្មុគស្មាញ ដូចជា JOIN, Subquery, Index ដើម្បីទាញ Data ឱ្យបានឆាប់ និងត្រឹមត្រូវ",
          "ប្រើ ORM ដូចជា JPA ឬ Prisma ដើម្បីផ្លាស់ប្តូរ Database ដោយ code ស្អាត គ្មាន SQL ដៃ",
          "Implement Redis Cache ដើម្បីកាត់បន្ថយ Database Load និងពន្លឿន API Response",
        ],
        project:
          "Social Media API — users, posts, comments, likes with SQL + Redis cache",
        projectKh:
          "បង្កើត API Social Media ដែលគ្រប់គ្រង User, Post, Comment, Like — ប្រើ PostgreSQL ដើម្បី Store Data, ហើយ Implement Redis Cache ដើម្បីពន្លឿនការ Load Feed",
        color: "from-blue-500 to-indigo-500",
        resources: [
          { label: "PostgreSQL Docs", url: "https://postgresql.org/docs" },
          { label: "Prisma ORM", url: "https://prisma.io" },
        ],
      },
      {
        id: "be-4",
        phase: 4,
        title: "Security & DevOps",
        titleKh: "សុវត្ថិភាព និង DevOps",
        window: "ខែ 6–9",
        focus:
          "Secure your APIs with auth, containerize with Docker, and set up CI/CD pipelines.",
        focusKh:
          "ដំណាក់កាលចុងក្រោយនេះ លោកអ្នកនឹងរៀនពង្រឹង API Security ជាមួយ JWT និង OAuth2, Containerize App ជាមួយ Docker, Setup CI/CD Pipeline ដើម្បី Automate Testing & Deployment, ហើយ Deploy ទៅ Cloud ឬ VPS ដោយមាន Monitoring",
        topics: [
          {
            name: "JWT & OAuth2",
            icon: "🔐",
            desc: "Authentication, authorization, refresh tokens",
          },
          {
            name: "Docker",
            icon: "🐳",
            desc: "Containers, images, docker-compose",
          },
          {
            name: "CI/CD",
            icon: "🔄",
            desc: "GitHub Actions, automated testing",
          },
          {
            name: "Cloud Basics",
            icon: "☁️",
            desc: "AWS/GCP basics, VPS deployment",
          },
          {
            name: "Monitoring",
            icon: "📊",
            desc: "Logging, health checks, alerts",
          },
        ],
        outcomes: [
          "Implement JWT authentication and role-based access",
          "Containerize applications with Docker",
          "Set up automated CI/CD pipelines",
          "Deploy to cloud with proper monitoring",
        ],
        outcomesKh: [
          "Implement JWT Authentication ពេញលេញ រួមមាន Register, Login, Refresh Token, និង Role-Based Access Control",
          "Containerize Application ជាមួយ Docker ដើម្បីឱ្យ Run ស្ថិតស្ថេរ គ្រប់ Environment",
          "Setup GitHub Actions CI/CD Pipeline ដើម្បី Auto Test, Build, Deploy App រាល់ពេល Push Code",
          "Deploy App ទៅ Cloud Server ហើយ Monitor ដោយប្រើ Logging, Health Check, និង Alert",
        ],
        project:
          "Production-ready E-commerce API — auth, Docker, CI/CD, deployed to VPS",
        projectKh:
          "បង្កើត E-commerce API ខ្នាត Production ដែលមាន JWT Authentication, Role (Admin/User), Containerize ជាមួយ Docker, CI/CD Pipeline, ហើយ Deploy ទៅ VPS ជាក់ស្តែង",
        color: "from-violet-500 to-purple-600",
        resources: [
          {
            label: "Git & DevOps Course",
            url: "/courses/git-devops-fundamentals",
            internal: true,
          },
          { label: "Docker Docs", url: "https://docs.docker.com" },
          { label: "GitHub Actions", url: "https://docs.github.com/actions" },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────
  // FULLSTACK
  // ─────────────────────────────────────────────
  {
    id: "fullstack",
    label: "Fullstack",
    labelKh: "ពេញលេញ",
    tagline: "Master both frontend and backend to build complete applications",
    taglineKh: "ស្ទាត់ជំនាញ Frontend + Backend ដើម្បីបង្កើត App ពេញលេញដោយខ្លួនឯង",
    summary:
      "A full-stack developer works on both frontend and backend to build complete web applications from start to finish.",
    summaryKh:
      "Full-Stack Developer គឺជាអ្នកដែលធ្វើការទាំងផ្នែក Frontend (UI ដែលអ្នកប្រើប្រាស់) និងផ្នែក Backend (Server & Database) — អាចបង្កើត Web Application ពេញលេញបានដោយខ្លួនឯង ចាប់ពី Design រហូតដល់ Deploy",
    responsibilities: [
      "Build user interfaces and connect them to backend services",
      "Create APIs, databases, and authentication systems",
      "Deliver complete features from design to deployment",
    ],
    tools: ["React", "Next.js", "Node.js", "PostgreSQL", "Git"],
    icon: "🚀",
    accent: "violet",
    gradient: "from-violet-600 to-purple-500",
    stages: [
      {
        id: "fs-1",
        phase: 1,
        title: "Foundations",
        titleKh: "មូលដ្ឋានគ្រឹះ Web",
        window: "ខែ 1–2",
        focus:
          "HTML, CSS, JavaScript and Git — the universal base for all web development.",
        focusKh:
          "ការចាប់ផ្តើមដ៏ត្រឹមត្រូវគឺការសិក្សា HTML, CSS, JavaScript និង Git ដែលជា \"ភាសាមេ\" នៃ Web Developer ទាំងអស់ ដោយមិនគិតពី Frontend ឬ Backend។ ដំណាក់កាលនេះផ្តល់ឱ្យលោកអ្នកនូវទំនុកចិត្ត និង Skill ដែលនឹងប្រើជារៀងរហូត",
        topics: [
          {
            name: "HTML & CSS",
            icon: "🌐",
            desc: "Semantic markup, responsive layouts",
          },
          {
            name: "JavaScript Core",
            icon: "⚡",
            desc: "Variables, functions, DOM, events",
          },
          {
            name: "Git & GitHub",
            icon: "🔁",
            desc: "Commits, branches, pull requests",
          },
          {
            name: "Terminal / CLI",
            icon: "💻",
            desc: "File navigation, scripts, packages",
          },
          {
            name: "Deployment Basics",
            icon: "🌍",
            desc: "GitHub Pages, Netlify, Vercel",
          },
        ],
        outcomes: [
          "Build and deploy static websites",
          "Write basic JavaScript interactions",
          "Use Git effectively for collaboration",
          "Navigate a terminal confidently",
        ],
        outcomesKh: [
          "បង្កើត និង Deploy គេហទំព័រ static ពេញលេញ ជាមួយ HTML, CSS ស្អាតៗ",
          "បន្ថែម Interaction ទំព័រ ដូចជា Menu, Animation, Form Validation ដោយប្រើ JavaScript",
          "ប្រើ Git ដើម្បី Track ការផ្លាស់ប្តូរ code, ធ្វើ Collaboration, និង Submit Pull Request",
          "Navigate Terminal ដោយមិនខ្លាច — ដំណើរការ script, install package, និង manage folder",
        ],
        project:
          "Landing Page with interactivity — animations, form, deployed live",
        projectKh:
          "បង្កើត Landing Page ស្អាត ដែលមាន Animation, Scroll Effect, Contact Form, ហើយ Deploy Live ទៅ Vercel ឬ Netlify ដើម្បីអ្នកដទៃចូលមើលបានតាម Internet",
        color: "from-pink-500 to-rose-500",
        resources: [
          {
            label: "HTML Course",
            url: "/courses/html-សម្រាប់អ្នកចាប់ផ្តើម",
            internal: true,
          },
          {
            label: "CSS Course",
            url: "/courses/css-styling-ជាភាសាខ្មែរ-full-course",
            internal: true,
          },
          {
            label: "JavaScript Course",
            url: "/courses/javascript-ជាភាសាខ្មែរ",
            internal: true,
          },
          {
            label: "Git & DevOps Course",
            url: "/courses/git-devops-fundamentals",
            internal: true,
          },
          { label: "MDN Web Docs", url: "https://developer.mozilla.org" },
          { label: "The Odin Project", url: "https://theodinproject.com" },
        ],
      },
      {
        id: "fs-2",
        phase: 2,
        title: "Frontend with React",
        titleKh: "Frontend ជាមួយ React",
        window: "ខែ 2–4",
        focus:
          "Build modern UIs with React, manage state, and integrate with APIs.",
        focusKh:
          "ដំណាក់កាលនេះលោកអ្នកនឹងបន្តជំហានពី JavaScript ទៅ React — Library ដ៏ពេញនិយមបំផុតក្នុងការបង្កើត UI ទំនើប។ លោកអ្នកនឹងរៀន Component, Hooks, Routing, TypeScript, API Fetching, និង Tailwind CSS ដើម្បីបង្កើត App ស្អាត ឆ្លើយតបឆាប់",
        topics: [
          {
            name: "React + Hooks",
            icon: "⚛️",
            desc: "Components, useState, useEffect",
          },
          {
            name: "React Router",
            icon: "🗺️",
            desc: "Client-side navigation",
          },
          {
            name: "Tailwind CSS",
            icon: "💨",
            desc: "Utility-first styling",
          },
          {
            name: "API Fetching",
            icon: "🔌",
            desc: "Axios, SWR, React Query",
          },
          {
            name: "TypeScript",
            icon: "🔷",
            desc: "Types with React components",
          },
        ],
        outcomes: [
          "Build multi-page React applications",
          "Fetch and display API data with loading states",
          "Style with Tailwind CSS effectively",
          "Type React components with TypeScript",
        ],
        outcomesKh: [
          "បង្កើត React App ដែលមានច្រើនទំព័រ Navigate ដោយ React Router",
          "Fetch ទិន្នន័យពី API ហើយបង្ហាញ Loading, Error, Empty State ឱ្យបានសមស្រប",
          "Style Component ឱ្យស្អាត Responsive ដោយ Tailwind CSS — ឆ្លើយតបបានលឿន",
          "សរសេរ React Component ជាមួយ TypeScript ដើម្បីរកឃើញ Bug ភ្លាមៗ",
        ],
        project:
          "Movie Discovery App — React, TypeScript, TMDB API, Tailwind, deployed",
        projectKh:
          "បង្កើត App ស្វែងរកភាពយន្ត ដោយ Fetch ព័ត៌មានពី TMDB API (ទីតាំង ពិន្ទុ ការពិពណ៌នា) — ប្រើ React, TypeScript, Tailwind CSS, ហើយ Deploy ទៅ Vercel",
        color: "from-sky-500 to-blue-600",
        resources: [
          {
            label: "React Course",
            url: "/courses/reactjs-ជាភាសាខ្មែរ",
            internal: true,
          },
          { label: "React Docs", url: "https://react.dev" },
          { label: "Tailwind CSS", url: "https://tailwindcss.com" },
        ],
      },
      {
        id: "fs-3",
        phase: 3,
        title: "Backend & Database",
        titleKh: "Backend និង Database",
        window: "ខែ 4–7",
        focus:
          "Build REST APIs with Node.js, connect to PostgreSQL, and implement authentication.",
        focusKh:
          "ដំណាក់កាលនេះជាការបន្ថែមសមត្ថភាព Backend ដល់ Full-Stack Developer។ លោកអ្នកនឹងរៀនបង្កើត REST API ជាមួយ Node.js/Express, ភ្ជាប់ PostgreSQL ជាមួយ Prisma ORM, Implement JWT Auth, ក៏ដូចជារៀបចំ File Upload ទៅ Cloud Storage",
        topics: [
          {
            name: "Node.js / Express",
            icon: "🟢",
            desc: "REST API, middleware, routing",
          },
          {
            name: "PostgreSQL",
            icon: "🗄️",
            desc: "Schema design, queries, relations",
          },
          {
            name: "Prisma ORM",
            icon: "🔗",
            desc: "Database access, migrations",
          },
          {
            name: "JWT Auth",
            icon: "🔐",
            desc: "Register, login, protect routes",
          },
          {
            name: "File Upload",
            icon: "📁",
            desc: "Multer, cloud storage (S3/Cloudinary)",
          },
        ],
        outcomes: [
          "Build full REST APIs with authentication",
          "Design and query relational databases",
          "Implement JWT-based auth flows",
          "Handle file uploads to cloud storage",
        ],
        outcomesKh: [
          "បង្កើត REST API ពេញលេញ ជាមួយ Endpoint CRUD, Middleware, Error Handling, ហើយ Secure ជាមួយ JWT",
          "រចនា Relational Database Schema ត្រឹមត្រូវ ហើយ Query ជាមួយ Prisma ORM ដោយ code ស្អាត",
          "Implement Auth Flow ពេញលេញ ដូចជា Register, Login, Refresh Token, Protected Route",
          "Handle File Upload (រូបភាព, ឯកសារ) ហើយ Store ទៅ Cloud Storage ដូចជា S3 ឬ Cloudinary",
        ],
        project:
          "Social Network API — users, posts, follows, image upload, JWT auth",
        projectKh:
          "បង្កើត Social Network API ដែលគ្រប់គ្រង User Profile, Post, Follow System, Like, Comment — ជាមួយ Image Upload ទៅ Cloud, JWT Auth, ហើយ Database ជាមួយ PostgreSQL",
        color: "from-emerald-500 to-teal-500",
        resources: [
          { label: "Express.js", url: "https://expressjs.com" },
          { label: "Prisma", url: "https://prisma.io" },
        ],
      },
      {
        id: "fs-4",
        phase: 4,
        title: "Next.js Full-Stack",
        titleKh: "Next.js Full-Stack Application",
        window: "ខែ 7–9",
        focus:
          "Combine frontend and backend in one Next.js app — SSR, API routes, database.",
        focusKh:
          "ដំណាក់កាលនេះគឺការបញ្ចូល Frontend និង Backend ចូលគ្នាក្នុង Project Next.js តែមួយ — ដោយប្រើ App Router, Server Actions, NextAuth.js, Prisma + PostgreSQL ។ App ដែលបង្កើតនឹងដំណើរការ Server-Side Rendering ហើយ Deploy ទៅ Vercel បានភ្លាមៗ",
        topics: [
          {
            name: "Next.js App Router",
            icon: "▲",
            desc: "SSR, SSG, ISR, layouts, streaming",
          },
          {
            name: "Server Actions",
            icon: "⚡",
            desc: "Mutations without API routes",
          },
          {
            name: "NextAuth.js",
            icon: "🔐",
            desc: "OAuth, credentials, sessions",
          },
          {
            name: "Prisma + PostgreSQL",
            icon: "🗄️",
            desc: "Full-stack data layer",
          },
          {
            name: "Deployment",
            icon: "☁️",
            desc: "Vercel, Railway, environment vars",
          },
        ],
        outcomes: [
          "Build complete full-stack Next.js applications",
          "Implement SSR and SSG for optimal performance",
          "Add OAuth authentication with NextAuth",
          "Deploy full-stack apps to production",
        ],
        outcomesKh: [
          "បង្កើត Full-Stack App ពេញលេញក្នុង Next.js Project តែមួយ — Frontend, Backend, Database ចូលគ្នា",
          "ប្រើ SSR និង SSG ដើម្បី Render ទំព័របានលឿន ជាមួយ SEO ល្អ",
          "Implement OAuth Authentication (Google, GitHub) ជាមួយ NextAuth.js — Login ដោយ Social Account",
          "Deploy Full-Stack App ទៅ Vercel ជាមួយ Database ជាក់ស្តែង ហើយ App Online ភ្លាមៗ",
        ],
        project:
          "SaaS Dashboard — auth, subscriptions, CRUD, analytics, deployed to Vercel",
        projectKh:
          "បង្កើត SaaS Dashboard ពេញលេញ ដែលអ្នកប្រើ Login ដោយ Google, មាន Subscription Plan, CRUD Data, Analytics Chart, ហើយ Deploy ទៅ Vercel ជាមួយ Production Database",
        color: "from-violet-600 to-purple-600",
        resources: [
          {
            label: "Next.js Course",
            url: "/courses/nextjs-ជាភាសាខ្មែរ",
            internal: true,
          },
          { label: "Next.js Docs", url: "https://nextjs.org/docs" },
          { label: "NextAuth.js", url: "https://next-auth.js.org" },
        ],
      },
      {
        id: "fs-5",
        phase: 5,
        title: "DevOps & Launch",
        titleKh: "DevOps និងការបញ្ចេញ App",
        window: "ខែ 9–12",
        focus:
          "Containerize, automate, monitor, and launch production-grade applications.",
        focusKh:
          "ដំណាក់កាលចុងក្រោយគឺការរៀបចំ App ដើម្បី Deploy ក្នុងបរិយាកាស Production ពិតប្រាកដ។ លោកអ្នកនឹងរៀន Docker, CI/CD Pipeline ជាមួយ GitHub Actions, Nginx Reverse Proxy, Monitoring, ហើយ Polish Portfolio ដើម្បីសម្ភាសន៍ Job",
        topics: [
          {
            name: "Docker",
            icon: "🐳",
            desc: "Containers, multi-stage builds, compose",
          },
          {
            name: "CI/CD Pipelines",
            icon: "🔄",
            desc: "GitHub Actions, automated tests",
          },
          {
            name: "Nginx",
            icon: "🌐",
            desc: "Reverse proxy, SSL, load balancing",
          },
          {
            name: "Monitoring",
            icon: "📊",
            desc: "Logs, health checks, error tracking",
          },
          {
            name: "Portfolio Polish",
            icon: "💼",
            desc: "README, case studies, LinkedIn",
          },
        ],
        outcomes: [
          "Containerize full-stack apps with Docker",
          "Automate testing and deployment with CI/CD",
          "Configure Nginx as a reverse proxy",
          "Ship a polished portfolio to land your first job",
        ],
        outcomesKh: [
          "Containerize Full-Stack App ជាមួយ Docker ដើម្បី Deploy ដោយ Consistent គ្រប់ Server",
          "Setup CI/CD Pipeline ដោយ Auto Run Test, Build Image, Deploy ទៅ Server រាល់ពេលដែល Push Code",
          "Config Nginx ជា Reverse Proxy, HTTPS SSL, ហើយ Serve App ផ្ទាល់ Domain",
          "រៀបចំ Portfolio ឱ្យស្អាត ជាមួយ README, Case Study, GitHub, LinkedIn — ត្រៀមសម្ភាសន៍ Job",
        ],
        project:
          "Production Portfolio Platform — Dockerized, CI/CD, custom domain, monitored",
        projectKh:
          "Deploy Portfolio Platform ពេញលេញទៅ Server ជាក់ស្តែង — Containerize ជាមួយ Docker, CI/CD ដោយ GitHub Actions, HTTPS SSL ជាមួយ Nginx, Domain ផ្ទាល់ខ្លួន, ហើយ Monitor Error ដោយ Logging",
        color: "from-rose-500 to-pink-600",
        resources: [
          {
            label: "Git & DevOps Course",
            url: "/courses/git-devops-fundamentals",
            internal: true,
          },
          { label: "Docker Docs", url: "https://docs.docker.com" },
          { label: "GitHub Actions", url: "https://docs.github.com/actions" },
        ],
      },
    ],
  },
];