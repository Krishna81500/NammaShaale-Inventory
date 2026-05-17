export type AssetCategory = "Sports" | "Lab" | "IT" | "Classroom" | "Furniture" | "Medical" | "Other";
export type AssetCondition = "Working" | "Needs Repair" | "Broken" | "Lost";
export type IssueType = "Lost" | "Damaged" | "Stolen" | "Malfunctioning";
export type AttendanceStatus = "Present" | "Absent" | "On Leave";

export interface Member {
  id: string;
  name: string;
  staffId: string;
  position: string;
  phoneNumber: string;
  address: string;
  email: string;
  attendanceStatus: AttendanceStatus;
  lastActive: any;
  bio?: string;
  responsibilities?: string;
}

export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  serialNumber?: string;
  condition: AssetCondition;
  photoUrl?: string;
  lastCheckedAt?: any;
  addedAt: any;
  description?: string;
  repairHint?: string;
  estimatedRepairCost?: number;
}

export interface HealthCheck {
  id: string;
  assetId: string;
  condition: AssetCondition;
  notes?: string;
  photoUrl?: string;
  timestamp: any;
  checkedBy: string;
  auditorName: string;
  auditorPhone: string;
  auditorAddress: string;
  auditorPosition: string;
}

export interface IssueLog {
  id: string;
  assetId: string;
  issueType: IssueType;
  description: string;
  date: any;
}
