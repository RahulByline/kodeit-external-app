import { Shield, School, Users, GraduationCap } from "lucide-react";

export interface DashboardRoleMeta {
  id: "admin" | "school-admin" | "teacher" | "student";
  title: string;
  description: string;
  icon: any;
  iconColor: string;
  iconBg: string;
  features: string[];
  gradient: string;
  borderColor?: string;
  hoverGlow?: string;
}

export const dashboardRoles: DashboardRoleMeta[] = [
  {
    id: "admin",
    title: "Admin",
    description:
      "Complete system administration and comprehensive analytics dashboard",
    icon: Shield,
    iconColor: "text-red-600", // Changed from text-red-400
    iconBg: "bg-red-500/30", // Changed from bg-red-500/20
    features: ["System Management", "Advanced Analytics", "User Administration"],
    gradient: "from-rose-100 to-pink-500", // Changed from from-rose-100 to-pink-100
    borderColor: "border-red-500/40", // Changed from border-red-500/30
    hoverGlow: "shadow-red-500/30", // Changed from shadow-red-500/20
  },
  {
    id: "school-admin",
    title: "School Admin",
    description:
      "Monitor school-wide progress and manage teacher development programs",
    icon: School,
    iconColor: "text-purple-600", // Changed from text-purple-400
    iconBg: "bg-purple-500/30", // Changed from bg-purple-500/20
    features: ["School Analytics", "Teacher Reports", "Progress Monitoring"],
    gradient: "from-violet-100 to-indigo-500", // Changed from from-violet-100 to-indigo-100
    borderColor: "border-purple-500/40", // Changed from border-purple-500/30
    hoverGlow: "shadow-purple-500/30", // Changed from shadow-purple-500/20
  },
  {
    id: "teacher",
    title: "Teacher",
    description:
      "Manage courses, track student progress, and create assignments",
    icon: Users,
    iconColor: "text-green-600", // Changed from text-green-400
    iconBg: "bg-green-500/30", // Changed from bg-green-500/20
    features: [
      "Course Management",
      "Student Analytics",
      "Assignment Tools",
    ],
    gradient: "from-emerald-100 to-teal-500", // Changed from from-emerald-100 to-teal-100
    borderColor: "border-green-500/40", // Changed from border-green-500/30
    hoverGlow: "shadow-green-500/30", // Changed from shadow-green-500/20
  },
  {
    id: "student",
    title: "Student",
    description:
      "Access your courses, track progress, and submit assignments",
    icon: GraduationCap,
    iconColor: "text-blue-600", // Changed from text-blue-400
    iconBg: "bg-blue-500/30", // Changed from bg-blue-500/20
    features: [
      "Course Access",
      "Progress Tracking",
      "Assignment Submission",
    ],
    gradient: "from-sky-100 to-blue-500", // Changed from from-sky-100 to-blue-100
    borderColor: "border-blue-500/40", // Changed from border-blue-500/30
    hoverGlow: "shadow-blue-500/30", // Changed from shadow-blue-500/20
  },
];

export function findRoleMetaById(roleId: string): DashboardRoleMeta | undefined {
  return dashboardRoles.find((r) => r.id === roleId);
}