import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Route: /api/files/[...slug]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string[] }> }
) {
  const { slug } = await params;
  const docId = slug[0];

  if (!docId) {
    return new NextResponse('Se requiere el ID del documento', { status: 400 });
  }

  try {
    const document = await prisma.officialDocument.findUnique({
      where: { id: docId }
    });

    if (!document) {
      return new NextResponse('Documento no encontrado', { status: 404 });
    }

    if (!document.fileUrl) {
      return new NextResponse('El documento no tiene URL registrada', { status: 404 });
    }

    return NextResponse.redirect(document.fileUrl);
  } catch (err) {
    console.error('[files] Error fetching document:', err);
    return new NextResponse('Error interno del servidor', { status: 500 });
  }
}
