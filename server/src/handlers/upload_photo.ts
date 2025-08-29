import { db } from '../db';
import { salesProspectsTable } from '../db/schema';
import { eq } from 'drizzle-orm';
import { type UploadPhotoInput, type SalesProspect } from '../schema';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export const uploadPhoto = async (input: UploadPhotoInput): Promise<SalesProspect> => {
  try {
    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate filename
    const timestamp = Date.now();
    const filename = input.filename || `prospect_${input.prospect_id}_${timestamp}.jpg`;
    const filePath = join(uploadsDir, filename);

    // Remove data:image/[type];base64, prefix if present
    const base64Data = input.photo_data.replace(/^data:image\/[a-z]+;base64,/, '');
    
    // Convert base64 to buffer and save file
    const buffer = Buffer.from(base64Data, 'base64');
    writeFileSync(filePath, buffer);

    // Create the URL path for the saved image
    const photoUrl = `/uploads/${filename}`;

    // Update the prospect with the photo URL
    const result = await db.update(salesProspectsTable)
      .set({ 
        photo_url: photoUrl,
        updated_at: new Date()
      })
      .where(eq(salesProspectsTable.id, input.prospect_id))
      .returning()
      .execute();

    if (result.length === 0) {
      throw new Error(`Sales prospect with id ${input.prospect_id} not found`);
    }

    return result[0];
  } catch (error) {
    console.error('Photo upload failed:', error);
    throw error;
  }
};