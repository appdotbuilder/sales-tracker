import { type Activity } from '../schema';

export async function getProspectActivities(prospectId: number): Promise<Activity[]> {
    // This is a placeholder declaration! Real code should be implemented here.
    // The goal of this handler is fetching all activities for a specific prospect.
    // Should return activities ordered by activity_date desc (most recent first).
    return Promise.resolve([
        {
            id: 1,
            prospect_id: prospectId,
            activity_type: "call" as const,
            title: "Initial contact call",
            description: "Discussed their requirements and our solutions",
            activity_date: new Date(),
            created_at: new Date()
        },
        {
            id: 2,
            prospect_id: prospectId,
            activity_type: "email" as const,
            title: "Follow-up email sent",
            description: "Sent proposal and pricing information",
            activity_date: new Date(Date.now() - 86400000), // Yesterday
            created_at: new Date(Date.now() - 86400000)
        }
    ] as Activity[]);
}