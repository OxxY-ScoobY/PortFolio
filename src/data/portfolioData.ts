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
  title: "Software Developer Portfolio",
  subtitles: [
    "Full-Stack Developer",
    "Python Developer",
    "Backend Developer",
    "Systems Integrator"
  ],
  bio: "B.Tech Computer Science & Engineering graduate with hands-on experience building robust full-stack and backend web applications using Python, Flask, FastAPI, and Angular. Specializing in building scalable REST APIs, integrating IoT, and deploying computer vision solutions.",
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
    score: "CGPA: 7.25 / 10",
    coursework: "Data Structures & Algorithms, OOP, Operating Systems, Computer Networks, Artificial Intelligence, Embedded Systems, Web Programming"
  },
  {
    duration: "2020 - 2022",
    degree: "Higher Secondary School (XII)",
    school: "VIJAYA HSS, Pulpally",
    score: "Score: 76%"
  },
  {
    duration: "2020",
    degree: "Secondary Education (X)",
    school: "VIJAYA HSS, Pulpally",
    score: "Score: 94%"
  }
];

export const EXPERIENCE_DATA: ExperienceItem[] = [
  {
    title: "Front-End Development Intern",
    company: "NeST Digital Academy",
    companyUrl: "#",
    duration: "Mar 2025 – Apr 2025",
    location: "Kochi, Kerala",
    badge: "Internship",
    bullets: [
      "Developed responsive, component-based web interfaces using HTML5, CSS3, JavaScript, and Angular, applying data binding and modular architecture patterns.",
      "Practiced collaborative version control with Git and GitHub in a multi-developer team environment, successfully resolving merge conflicts and maintaining clean commit histories.",
      "Gained practical exposure to Agile software development workflows, sprint planning, and professional software delivery standards."
    ],
    techTags: ["Angular", "HTML5", "CSS3", "JavaScript", "Git & GitHub", "Agile Workflows"]
  }
];

export const PROJECTS_DATA: Project[] = [
  {
    id: "cartify",
    title: "Smart Shopping Cart System (Cartify GnG)",
    category: "iot",
    excerpt: "An event-driven smart retail cart integrating Raspberry Pi, load cell sensors, and YOLOv8 object detection for automatic item identification and billing.",
    tags: ["IoT", "AI / CV", "FastAPI", "Angular"],
    bullets: [
      "Architected an event-driven smart cart system using Raspberry Pi, YOLOv8 object detection, and load cell sensors for automated item identification and billing.",
      "Designed a REST API backend (FastAPI + MongoDB Atlas) to handle real-time cart events, item verification, dynamic pricing logic, and user-cart synchronisation.",
      "Built an Angular front-end dashboard consuming the REST API to display live cart state, item additions, and billing summaries."
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
    title: "Grab & Go – Supermarket Assistant",
    category: "web",
    excerpt: "Real-time smart retail web application featuring live shopping list synchronization, location-based navigation, and multi-modal sensor fusion.",
    tags: ["Flask", "Firebase", "Sensor Fusion", "Web App"],
    bullets: [
      "Co-developed a smart retail web application with real-time shopping lists, location-based in-store guidance, and a live offers feed using Flask and Firebase Firestore.",
      "Implemented multi-modal sensor fusion (computer vision + weight sensors) to improve product detection reliability for fixed-weight and variable-weight items.",
      "Designed a RESTful Flask backend with Firestore integration, enabling real-time data synchronisation across multiple client sessions."
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
  }
];

export const SKILLS_ROW_1: SkillItem[] = [
  { name: "Python", color: "#3776AB" },
  { name: "Angular", color: "#dd0031" },
  { name: "MongoDB Atlas", color: "#47A248" },
  { name: "Git", color: "#F05032" },
  { name: "HTML5", color: "#E34F26" },
  { name: "Flask", color: "#c5c9d4" },
  { name: "OpenCV", color: "#2196F3" },
  { name: "VS Code", color: "#007ACC" }
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
    issuer: "NeST Digital Academy (Industry Immersion Program)",
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
    title: "Programming in Java (NPTEL)",
    issuer: "IIT Kharagpur (12-Week Course, Score: 66%)",
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
  "Participated in college-level hackathons and tech fests. Collaborated in team-based problem solving under severe time constraints, designing and prototyping software solutions end-to-end."
];
