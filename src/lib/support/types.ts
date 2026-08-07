export type TicketStatus = "open" | "in_progress" | "resolved";

export interface SupportTicketSummary {
  id: string;
  subject: string;
  status: TicketStatus;
  createdAt: string;
}

export interface SupportTicketDetail extends SupportTicketSummary {
  message: string;
  adminReply: string | null;
  repliedAt: string | null;
}
