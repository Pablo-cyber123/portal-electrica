import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Route: /api/view?id=<docId>  OR  /api/view?url=<directUrl>
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const docId = searchParams.get('id');
  const directUrl = searchParams.get('url');

  if (directUrl) {
    try {
      new URL(directUrl);
      return NextResponse.redirect(directUrl);
    } catch {
      return new NextResponse('URL inválida', { status: 400 });
    }
  }

  if (!docId) {
    return new NextResponse('Se requiere el parámetro id o url', { status: 400 });
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
    console.error('[view] Error fetching document:', err);
    return new NextResponse('Error interno del servidor', { status: 500 });
  }
}
