export interface Service {
  id: string;
  title: string;
  desc: string;
  tags: string[];
}

export interface Founder {
  name: string;
  role: string;
  bio: string;
  tags: string[];
  avatarChar: string;
}

export interface Stat {
  count: string;
  label: string;
  icon: string;
}

export interface WhyReason {
  title: string;
  desc: string;
  icon: string;
}

export interface ProcessStep {
  num: string;
  title: string;
  desc: string;
}

export interface FeatureProject {
  category: string;
  sub: string;
  title: string;
  desc: string;
  bullets: string[];
  tech: string[];
}

export interface PricingPlan {
  title: string;
  subtitle: string;
  originalPrice: string;
  currentPrice: string;
  isPopular?: boolean;
  features: string[];
}

export interface FAQItem {
  q: string;
  a: string;
}

export interface ContactInfo {
  email: string;
  phone: string;
  location: string;
  website: string;
  upiId?: string;
}

export interface PageData {
  heroBadge: string;
  heroTitleLine1: string;
  heroTitleLine2: string;
  heroSubtitle: string;
  heroPrimaryCta: string;
  heroSecondaryCta: string;
  logoText: string;
  logoSub: string;
  stats: Stat[];
  services: Service[];
  founders: Founder[];
  whyChooseUs: WhyReason[];
  process: ProcessStep[];
  featuredProject: FeatureProject;
  pricing: PricingPlan[];
  faqs: FAQItem[];
  contactInfo: ContactInfo;
}

export const INITIAL_PAGE_DATA: PageData = {
  heroBadge: "Innovate • Build • Elevate",
  heroTitleLine1: "Building digital solutions",
  heroTitleLine2: "for a better tomorrow.",
  heroSubtitle: "A&T TECH FIRM is a technology and digital-solutions company focused on building useful, modern and accessible digital products.",
  heroPrimaryCta: "Start a Project",
  heroSecondaryCta: "View Services",
  logoText: "A&T TECH FIRM",
  logoSub: "Building Digital Solutions for a Better Tomorrow",
  stats: [
    { count: "15+ Projects", label: "Projects Delivered", icon: "CheckSquare" },
    { count: "24-48h", label: "Support Response", icon: "Clock" },
    { count: "100%", label: "Client Focus", icon: "Heart" }
  ],
  services: [
    {
      id: "web-dev",
      title: "Web Development",
      desc: "Modern, responsive and scalable websites built around client requirements.",
      tags: ["Business websites", "E-commerce", "Custom web apps"]
    },
    {
      id: "db-solutions",
      title: "Database Solutions",
      desc: "Secure and structured database systems for managing business, customer and student information.",
      tags: ["Cloud databases", "Backups", "Custom systems"]
    },
    {
      id: "digital-growth",
      title: "Digital Growth",
      desc: "Digital solutions designed to improve online presence, engagement and business growth.",
      tags: ["Presence audit", "Strategy", "Optimization"]
    },
    {
      id: "web-opt",
      title: "Website Optimization",
      desc: "Improve website performance, loading speed and user experience.",
      tags: ["Speed tuning", "Core Web Vitals", "UX improvements"]
    },
    {
      id: "email-setup",
      title: "Professional Email",
      desc: "Professional business email setup using the client's domain for credible communication.",
      tags: ["Domain email", "Spam protection", "Migration"]
    },
    {
      id: "payment-integ",
      title: "Payment Integration",
      desc: "Integration of supported online payment solutions with secure checkout.",
      tags: ["Gateway setup", "Subscriptions", "Secure checkout"]
    },
    {
      id: "web-maint",
      title: "Website Maintenance",
      desc: "Website updates, improvements and ongoing maintenance to keep things running.",
      tags: ["Updates", "Bug fixes", "Tech support"]
    },
    {
      id: "custom-feat",
      title: "Custom Features",
      desc: "Development of custom functionality based on individual requirements.",
      tags: ["Dashboards", "Client portals", "Integrations"]
    },
    {
      id: "digi-sol",
      title: "Digital Solutions",
      desc: "End-to-end digital products combining design, development and strategy.",
      tags: ["Full-stack", "Scalable", "Long-term support"]
    }
  ],
  founders: [
    {
      name: "Tirtharaj",
      role: "Co-Founder & Technology Lead",
      bio: "Tirtharaj is one of the founding members of A&T TECH FIRM, focusing on technology, web development, digital solutions and the technical direction of the company. He leads the engineering efforts and ensures every digital product meets modern standards of performance, security and reliability.",
      tags: ["Web Development", "Database Architecture", "Digital Solutions", "Technical Strategy", "System Design"],
      avatarChar: "T"
    },
    {
      name: "Aditya",
      role: "Co-Founder & Operations & Strategy Lead",
      bio: "Aditya is one of the founding members of A&T TECH FIRM, contributing to business operations, strategy, client coordination and the overall growth of the company. He focuses on building strong client relationships and ensuring projects align with each client's goals and timeline.",
      tags: ["Business Operations", "Client Strategy", "Project Coordination", "Growth Planning", "Account Management"],
      avatarChar: "A"
    }
  ],
  whyChooseUs: [
    { title: "Transparent Pricing", desc: "Clear pricing and clearly defined services. No hidden costs, no surprises.", icon: "DollarSign" },
    { title: "Custom Development", desc: "Solutions designed around the client's requirements — not generic templates.", icon: "PenTool" },
    { title: "Reliable Support", desc: "Professional post-launch support to keep your digital products running smoothly.", icon: "LifeBuoy" },
    { title: "Modern Technology", desc: "Modern development practices and technologies for performance and longevity.", icon: "Cpu" },
    { title: "Scalable Solutions", desc: "Solutions that can grow with the client — built for the future, not just today.", icon: "TrendingUp" },
    { title: "Client First", desc: "Focus on communication, reliability and long-term satisfaction.", icon: "Users" }
  ],
  process: [
    { num: "01", title: "Discover", desc: "We understand the client's requirements, goals and constraints in detail." },
    { num: "02", title: "Plan", desc: "We plan the design, features and technical architecture before building." },
    { num: "03", title: "Build", desc: "We develop the website or digital solution using modern technology." },
    { num: "04", title: "Test & Deploy", desc: "We test functionality, responsiveness and performance before deployment." },
    { num: "05", title: "Support", desc: "We provide post-launch support and maintenance to keep things running." }
  ],
  featuredProject: {
    category: "Education",
    sub: "Apex Chemistry",
    title: "Apex Chemistry Educational Portal",
    desc: "An educational platform built to support chemistry learning with structured content and a clean, focused experience. We built a structured, responsive platform with clear content organization, fast navigation and a clean interface focused on learning.",
    bullets: ["Structured content", "Responsive design", "Fast navigation", "Clean learning interface"],
    tech: ["Next.js", "React", "Tailwind CSS", "Modern UI"]
  },
  pricing: [
    {
      title: "Starter Website",
      subtitle: "PERSONAL • PORTFOLIO • SMALL BIZ",
      originalPrice: "₹4,999+",
      currentPrice: "₹3,999+",
      isPopular: false,
      features: [
        "Responsive website",
        "Up to 5 pages",
        "Contact form",
        "Basic SEO",
        "Deployment",
        "Basic animations"
      ]
    },
    {
      title: "Business Website",
      subtitle: "CMS • ANALYTICS • SEO",
      originalPrice: "₹9,999+",
      currentPrice: "₹7,999+",
      isPopular: false,
      features: [
        "Up to 10 pages",
        "Advanced UI",
        "CMS integration",
        "Contact system",
        "SEO + Analytics",
        "Animations",
        "Basic backend"
      ]
    },
    {
      title: "Pro Web App",
      subtitle: "DASHBOARD • AUTH • DATABASE",
      originalPrice: "₹19,999+",
      currentPrice: "₹15,999+",
      isPopular: false,
      features: [
        "Authentication",
        "Dashboard",
        "Database",
        "Admin panel",
        "API integration",
        "Notifications",
        "Deployment"
      ]
    },
    {
      title: "AI Powered",
      subtitle: "CHATBOTS • AGENTS • WORKFLOWS",
      originalPrice: "₹24,999+",
      currentPrice: "₹19,999+",
      isPopular: true,
      features: [
        "AI chatbot",
        "AI API integration",
        "Prompt engineering",
        "AI workflows",
        "AI-powered features",
        "Database integration",
        "Admin controls"
      ]
    },
    {
      title: "Mobile App",
      subtitle: "ANDROID • IOS-READY • BACKEND",
      originalPrice: "29,999+",
      currentPrice: "₹23,999+",
      isPopular: false,
      features: [
        "Android application",
        "iOS-ready architecture",
        "Backend + Auth",
        "Push notifications",
        "API integration",
        "Deployment assistance"
      ]
    },
    {
      title: "Complete Product",
      subtitle: "WEB • APP • AI • MAINTENANCE",
      originalPrice: "₹59,999+",
      currentPrice: "₹47,999+",
      isPopular: false,
      features: [
        "Website + Web app",
        "Mobile application",
        "Backend + Database",
        "Admin panel",
        "AI integration",
        "Analytics",
        "Deployment + Maintenance"
      ]
    }
  ],
  faqs: [
    { q: "What types of websites do you develop?", a: "We develop business websites, educational websites, portfolio websites, landing pages, e-commerce websites and custom web applications — all tailored to your requirements." },
    { q: "How long does website development take?", a: "Timelines depend on project scope and complexity. A starter website typically takes less time, while custom solutions take longer. We share a clear timeline during the planning phase." },
    { q: "Do you provide domain registration?", a: "We help configure and connect your domain. Domain registration specifics can be discussed during the project planning phase." },
    { q: "Do you provide database solutions?", a: "Yes. We build secure, structured database systems for managing student, customer and business information, including cloud databases and backup solutions." },
    { q: "Can I request new features later?", a: "Yes. We support new feature additions even after launch. Features can be added as part of a maintenance plan or as a separate request." },
    { q: "Do you provide website maintenance?", a: "Yes. We offer website maintenance including updates, bug fixes, feature additions, performance improvements and technical support." },
    { q: "Can you integrate payment gateways?", a: "Yes. We integrate supported online payment solutions with secure checkout and reliable processing." },
    { q: "Can I request a custom package?", a: "Absolutely. If our packages don't fit your needs, request a custom quote and we'll tailor a solution around your requirements." }
  ],
  contactInfo: {
    email: "hello@attechfirm.com",
    phone: "+91 99999 99999",
    location: "India",
    website: "www.attechfirm.com",
    upiId: "9635996626@fam"
  }
};
