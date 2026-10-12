export interface Project {
  id: string;
  title: string;
  excerpt: string;
  category: "all" | "iot" | "web";
  tags: string[];
  bullets: string[];
  architectureDetails: {
    subtitle: string;
    description: string;
    detailsList: { label: string; text: string }[];
  };
}

export interface SkillItem {
  name: string;
  color?: string;
}

export interface EducationItem {
  duration: string;
  degree: string;
  school: string;
  score: string;
  coursework?: string;
}

export interface ExperienceItem {
  title: string;
  company: string;
  companyUrl?: string;
  duration: string;
  location: string;
  badge: string;
  bullets: string[];
  techTags: string[];
}

export interface CertificationItem {
  title: string;
  issuer: string;
  detail: string;
  iconType: "award" | "box" | "shield" | "monitor";
}

export const PERSONAL_INFO = {
  name: "ATHIL HISHAM",
  title: "Software Developer | Python | Backend | Full-Stack",
  subtitles: [
    "Software Developer",
    "Python Developer",
    "Backend Engineer",
    "Full-Stack Developer",
    "AI & Computer Vision Specialist"
  ],
  bio: "Software Developer and B.Tech Computer Science graduate (2026) with 2 production products shipped, 2 deployed full-stack projects, and 4 certifications, delivering full-stack and backend products with Python, Flask, FastAPI, Angular, REST APIs, MongoDB, and Firebase. Currently shipping features for a commercially launched ERP product and an AI-assisted security operations platform at MINTS Global.",
  contact: {
    email: "athilhishamcym@gmail.com",
    phone: "+91 8943544897",
    location: "Wayanad, Kerala, India",
    linkedin: "https://linkedin.com/in/athil-hisham",
    github: "https://github.com/OxxY-ScoobY"
  },
  languages: [
    { name: "English", level: "Professional" },
    { name: "Malayalam", level: "Native" },
    { name: "Hindi", level: "Conversational" }
  ]
};

export const EDUCATION_DATA: EducationItem[] = [
  {
    duration: "2022 - 2026",
    degree: "B.Tech in Computer Science and Engineering",
    school: "Ilahia College of Engineering and Technology",
    score: "CGPA: 7.25",
    coursework: "Data Structures & Algorithms, OOP, Operating Systems, Computer Networks, Artificial Intelligence, Embedded Systems, Web Programming"
  },
  {
    duration: "2022",
    degree: "Higher Secondary (XII), Computer Science",
    school: "Vijaya HSS, Pulpally",
    score: "Score: 76%"
  },
  {
    duration: "2020",
    degree: "Secondary (X)",
    school: "Vijaya HSS, Pulpally",
    score: "Score: 94%"
  }
];

export const EXPERIENCE_DATA: ExperienceItem[] = [
  {
    title: "Software Developer / Software Developer Intern",
    company: "MINTS Global",
    companyUrl: "#",
    duration: "Jul 2026 – Present",
    location: "Kochi, Kerala",
    badge: "Production Engineering",
    bullets: [
      "Ship production features across 2 enterprise and security products, owning development, integration, and testing through to delivery.",
      "Contributed to Mints ERP, helping take an internal solution to a commercially launched product used by external customers.",
      "Contributed to ShieldDesk, an AI-assisted security operations platform enabling real-time incident investigation through controlled, auditable workflows.",
      "Built the full admin section (1 of 2 modules) of an ERP task/kanban module in Next.js and Firebase in coordination with the employee-side developer.",
      "Collaborated with a cross-functional team to integrate and validate features in iterative Agile cycles."
    ],
    techTags: ["Next.js", "Firebase", "Python", "FastAPI", "REST APIs", "Agile"]
  },
  {
    title: "Front-End Development Intern",
    company: "NeST Digital Academy",
    companyUrl: "#",
    duration: "Mar 2025 – Apr 2025",
    location: "Kochi, Kerala",
    badge: "Internship",
    bullets: [
      "Built responsive, component-based interfaces with HTML5, CSS3, JavaScript, and Angular using data binding and modular design.",
      "Delivered work in an Agile team using Git/GitHub for version control and collaborative review.",
      "Gained practical exposure to professional UI development workflows, sprint planning, and collaborative engineering practices."
    ],
    techTags: ["Angular", "HTML5", "CSS3", "JavaScript", "Git & GitHub", "Agile Workflows"]
  }
];

export const PROJECTS_DATA: Project[] = [
  {
    id: "cartify",
    title: "Smart Shopping Cart System (Cartify GnG)",
    category: "iot",
    excerpt: "An event-driven smart retail cart integrating Raspberry Pi, load cell sensors, and YOLOv8 object detection for automated item identification and billing.",
    tags: ["IoT", "AI / CV", "FastAPI", "Angular", "MongoDB"],
    bullets: [
      "Automated item identification and billing end to end by fusing 2 inputs (YOLOv8 detection + load-cell weight) on Raspberry Pi.",
      "Engineered a real-time FastAPI + MongoDB Atlas backend handling 4 core flows: cart events, item verification, dynamic pricing, and cart sync.",
      "Delivered an Angular dashboard for live cart state and billing, deployed to Render with configured build commands and environment variables."
    ],
    architectureDetails: {
      subtitle: "System Architecture",
      description: "The Smart Shopping Cart System is a state-of-the-art solution resolving the friction of checkout lines in traditional supermarkets. Built as an event-driven edge-cloud architecture, it utilizes a hardware suite deployed on the retail cart itself.",
      detailsList: [
        {
          label: "Edge AI Detection",
          text: "A Raspberry Pi connected to a camera module runs the YOLOv8 object detection model, capturing visual frames of item insertions and removals, processed using OpenCV to identify specific products."
        },
        {
          label: "Sensor Fusion",
          text: "Deployed load cell sensors calculate weight adjustments. The combined dataset (weight check + visual check) is packaged and dispatched as an event to the backend, preventing theft and minimizing false detections."
        },
        {
          label: "FastAPI & MongoDB",
          text: "The backend, written with FastAPI, parses these incoming events, runs verification rules, coordinates item price database lookups on MongoDB Atlas, and computes dynamic pricing or discounts."
        },
        {
          label: "Angular Dashboard",
          text: "The user views their cart state, pricing tallies, and discounts in real-time through an interactive dashboard built with Angular."
        }
      ]
    }
  },
  {
    id: "grabngo",
    title: "Grab & Go – Supermarket Assistant Web App",
    category: "web",
    excerpt: "Real-time smart retail web application with shopping lists, location-based in-store guidance, live offers, and sensor-fused product detection.",
    tags: ["Flask", "Firebase", "Sensor Fusion", "Web App"],
    bullets: [
      "Co-developed a retail web app with real-time shopping lists, location-based in-store guidance, and a live offers feed.",
      "Improved product detection reliability by fusing 2 sensor modalities (computer vision + weight).",
      "Built a RESTful Flask backend on Firestore for real-time cross-session sync while following CI/CD deployment principles."
    ],
    architectureDetails: {
      subtitle: "System Architecture",
      description: "Grab & Go is a smart supermarket assistant system co-developed to provide location-based, automated assistance. By integrating a responsive client web app with multi-modal sensor fusion algorithms, the web app assists users in tracking their budgets and routing their shopping trip.",
      detailsList: [
        {
          label: "Real-time Shopping Lists",
          text: "Synchronizes client shopping lists across multiple active sessions using Firebase Firestore listeners, ensuring immediate UI updates when items are scanned or manually selected."
        },
        {
          label: "Multi-Modal Sensor Fusion",
          text: "Implements a Flask-based fusion algorithm combining input from computer vision scanners and load cells. This enables precise categorization of fixed-weight items (e.g. boxed products) and variable-weight items (e.g. produce)."
        },
        {
          label: "In-Store Guidance & Offers",
          text: "Incorporates location-based metrics to guide the shopper dynamically through supermarket aisles, prompting them with customized live discounts depending on their proximity to product shelves."
        }
      ]
    }
  },
];

export const SKILLS_ROW_1: SkillItem[] = [
  { name: "Python", color: "#3776AB" },
  { name: "Angular", color: "#dd0031" },
  { name: "MongoDB Atlas", color: "#47A248" },
  { name: "Git", color: "#F05032" },
  { name: "HTML5", color: "#E34F26" },
  { name: "Flask", color: "#c5c9d4" },
  { name: "OpenCV", color: "#2196F3" },
  { name: "Next.js", color: "#000000" }
];

export const SKILLS_ROW_2: SkillItem[] = [
  { name: "Java", color: "#5382a1" },
  { name: "FastAPI", color: "#009688" },
  { name: "Firebase", color: "#FFCA28" },
  { name: "GitHub", color: "#f3f4f6" },
  { name: "CSS3", color: "#1572B6" },
  { name: "YOLOv8", color: "#FF007F" },
  { name: "Raspberry Pi", color: "#C51A4A" },
  { name: "C / C++", color: "#00599C" }
];

export const CERTIFICATIONS_DATA: CertificationItem[] = [
  {
    title: "Front-End Development with Angular",
    issuer: "NeST Digital Academy",
    detail: "Angular Components, Routing, & UI Design",
    iconType: "award"
  },
  {
    title: "Introduction to Generative AI",
    issuer: "Microsoft",
    detail: "AI Models, Prompt Engineering, & Ethical Principles",
    iconType: "box"
  },
  {
    title: "Programming in Java",
    issuer: "NPTEL (66%)",
    detail: "OOP, Multithreading, Exception Handling, File I/O",
    iconType: "shield"
  },
  {
    title: "Python 3 Bootcamp",
    issuer: "Udemy",
    detail: "Full-stack Python, Decorators, File Handling & Error Management",
    iconType: "monitor"
  }
];

export const ACHIEVEMENTS_DATA = [
  "Shipped production features across enterprise and security products at MINTS Global, helping take an ERP from internal prototype to commercial launch.",
  "Built and deployed an end-to-end IoT + computer-vision retail system alongside a smart supermarket assistant web app.",
  "Participated in college-level hackathons and technology events, collaborating in fast-paced team-based problem solving."
];
