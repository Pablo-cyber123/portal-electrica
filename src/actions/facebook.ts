"use server"

import { prisma } from "@/lib/prisma"

export async function getFacebookPosts() {
  const settings = await prisma.appSetting.findMany()

  const pageIdSetting = settings.find(s => s.key === "FACEBOOK_PAGE_ID")
  const accessTokenSetting = settings.find(s => s.key === "FACEBOOK_ACCESS_TOKEN")

  const pageId = pageIdSetting?.value || process.env.FACEBOOK_PAGE_ID;
  const accessToken = accessTokenSetting?.value || process.env.FACEBOOK_ACCESS_TOKEN;

  if (!pageId || !accessToken) {
    return { error: 'Faltan credenciales de Facebook' };
  }

  try {
    const url = `https://graph.facebook.com/v19.0/${pageId}/posts?fields=id,message,created_time,full_picture,permalink_url,attachments{subattachments}&limit=10&access_token=${accessToken}`;
    
    // Configuración para evitar el cacheo agresivo de Next.js
    const response = await fetch(url, { 
      cache: 'no-store'
    });
    
    const data = await response.json();

    if (data.error) {
      console.error('Facebook API Error:', data.error);
      return { error: data.error.message || 'Error al conectar con la API de Facebook' };
    }

    const posts = data.data.map((post: any) => {
      let title = "Nueva Publicación";
      if (post.message) {
        const firstLine = post.message.split('\n')[0].trim();
        title = firstLine.length > 50 ? firstLine.substring(0, 50) + '...' : firstLine;
      }

      const postDate = new Date(post.created_time);
      const date = postDate.toLocaleDateString('es-CO');
      const time = postDate.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

      const images: string[] = [];
      if (post.full_picture) images.push(post.full_picture);
      
      if (post.attachments?.data?.[0]?.subattachments?.data) {
        post.attachments.data[0].subattachments.data.forEach((sub: any) => {
          if (sub.media?.image?.src && !images.includes(sub.media.image.src)) {
            images.push(sub.media.image.src);
          }
        });
      }

      return {
        id: post.id,
        title,
        date,
        time,
        modality: "Vía Facebook",
        speaker: "Comunidad Eléctrica UTS",
        content: post.message || "Ver más detalles en la publicación original.",
        images: images.length > 0 ? images : ["https://picsum.photos/seed/uts-fb-default/800/600"],
        url: post.permalink_url || `https://www.facebook.com/${pageId}`
      };
    });

    return { data: posts };
  } catch (error) {
    console.error('Fetch error:', error);
    return { error: 'Error de red al intentar obtener las publicaciones' };
  }
}
