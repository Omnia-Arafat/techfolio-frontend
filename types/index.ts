export type Status = "PENDING" | "APPROVED" | "REJECTED";

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar?: string | null;
  linkedin?: string | null;
  companyId: string;
  createdAt: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  url?: string | null;
  image?: string | null;
  companyId: string;
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
  slug: string;
  bio: string;
  logo?: string | null;
  website?: string | null;
  industry: string;
  techStack: string[];
  status: Status;
  createdAt: string;
  updatedAt: string;
  teamMembers: TeamMember[];
  projects: Project[];
}

export interface RegisterCompanyInput {
  email: string;
  name: string;
  bio: string;
  industry: string;
  techStack: string[];
  website?: string;
  logo?: string;
  teamMembers: {
    name: string;
    role: string;
    linkedin?: string;
  }[];
  projects: {
    title: string;
    description: string;
    techStack: string[];
    url?: string;
  }[];
}
