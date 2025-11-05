
export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  website: string;
  location: string;
  summary: string;
}

export interface WorkExperience {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
}

export interface Skill {
  id: string;
  name: string;
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  experience: WorkExperience[];
  education: Education[];
  skills: Skill[];
}

export interface AIFeedback {
  original: string;
  edited: string;
}

export type TemplateId = 'classic' | 'modern' | 'creative';


export const sampleResumeData: ResumeData = {
  personalInfo: {
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    phone: '123-456-7890',
    website: 'janedoe.dev',
    location: 'San Francisco, CA',
    summary: 'Innovative and deadline-driven Software Engineer with 5+ years of experience designing and developing user-centered digital products from initial concept to final, polished deliverable.',
  },
  experience: [
    {
      id: 'exp1',
      jobTitle: 'Senior Software Engineer',
      company: 'Tech Solutions Inc.',
      location: 'Palo Alto, CA',
      startDate: '2021-08',
      endDate: 'Present',
      description: '- Led a team of 5 engineers in developing a new cloud-based SaaS platform, resulting in a 20% increase in user engagement.\n- Architected and implemented a scalable microservices architecture using Node.js and Docker, improving system reliability by 30%.\n- Optimized application performance, reducing page load times by 40% through code splitting and lazy loading techniques.',
    },
    {
      id: 'exp2',
      jobTitle: 'Software Engineer',
      company: 'Digital Innovations',
      location: 'San Jose, CA',
      startDate: '2018-06',
      endDate: '2021-07',
      description: '- Developed and maintained front-end features for a high-traffic e-commerce website using React and Redux.\n- Collaborated with cross-functional teams to define, design, and ship new features.\n- Wrote and maintained comprehensive unit and integration tests, ensuring code quality and stability.',
    },
  ],
  education: [
    {
      id: 'edu1',
      institution: 'State University',
      degree: 'Master of Science',
      fieldOfStudy: 'Computer Science',
      startDate: '2016-09',
      endDate: '2018-05',
    },
     {
      id: 'edu2',
      institution: 'University of California',
      degree: 'Bachelor of Science',
      fieldOfStudy: 'Computer Engineering',
      startDate: '2012-09',
      endDate: '2016-05',
    },
  ],
  skills: [
    { id: 'skill1', name: 'JavaScript (ES6+)' },
    { id: 'skill2', name: 'TypeScript' },
    { id: 'skill3', name: 'React' },
    { id: 'skill4', name: 'Node.js' },
    { id: 'skill5', name: 'Python' },
    { id: 'skill6', name: 'SQL & NoSQL' },
    { id: 'skill7', name: 'Docker' },
    { id: 'skill8', name: 'AWS' },
  ],
};
