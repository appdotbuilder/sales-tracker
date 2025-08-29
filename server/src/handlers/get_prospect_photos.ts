import { type Photo } from '../schema';

export async function getProspectPhotos(prospectId: number): Promise<Photo[]> {
    // This is a placeholder declaration! Real code should be implemented here.
    // The goal of this handler is fetching all photos for a specific prospect.
    // Should return photos ordered by uploaded_at desc (newest first).
    return Promise.resolve([
        {
            id: 1,
            prospect_id: prospectId,
            filename: "photo_001.jpg",
            original_name: "profile_picture.jpg",
            mime_type: "image/jpeg",
            file_size: 1024000, // 1MB
            file_path: "/uploads/prospects/1/photo_001.jpg",
            uploaded_at: new Date()
        }
    ] as Photo[]);
}