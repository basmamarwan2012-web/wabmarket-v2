export type ActivityType =
  | "created"
  | "imported"
  | "purchased"
  | "updated"
  | "campaign_started"
  | "email_sent"
  | "reply_received"
  | "negotiation_started"
  | "sold";

export interface Activity {
  id: string;

  domainId: string;

  type: ActivityType;

  description: string;

  createdAt: Date;
}