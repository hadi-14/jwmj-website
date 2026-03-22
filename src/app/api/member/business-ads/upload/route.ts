import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        if (!file.type.startsWith('image/')) {
            return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
        }

        // Limit to 2MB to match UI expectations
        if (file.size > 2 * 1024 * 1024) {
            return NextResponse.json({ error: 'File must be less than 2MB' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        const safeName = file.name.replace(/[^a-zA-Z0-9-_\.]/g, '_');
        const filename = `business-logo-${timestamp}-${randomStr}-${safeName}`;

        const uploadDir = join(process.cwd(), 'public', 'uploads', 'business-logos');
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        const filepath = join(uploadDir, filename);
        await writeFile(filepath, buffer);

        const publicPath = `/uploads/business-logos/${filename}`;
        return NextResponse.json({ success: true, path: publicPath, filename });
    } catch (error) {
        console.error('Business logo upload failed:', error);
        return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }
}
