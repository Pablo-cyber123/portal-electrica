"use server"

export async function getFacebookPosts() {
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;

  if (!pageId || !accessToken) {
    return { error: 'Faltan credenciales de Facebook' };
  }

  try {
    // Pedimos el mensaje, fecha de creación, imagen principal, URL permanente
    // y si hay álbum de fotos, los attachments proporcionan más imágenes.
    const url = `https://graph.facebook.com/v19.0/${pageId}/posts?fields=id,message,created_time,full_picture,permalink_url,attachments{subattachments}&limit=10&access_token=${accessToken}`;
    
    const response = await fetch(url, { 
      // Revalidar cada 15 minutos para mantenerlo actualizado pero sin saturar la API
      next: { revalidate: 900 } 
    }); 
    
    const data = await response.json();

    if (data.error) {
      console.error('Facebook API Error:', data.error);
      return { error: data.error.message || 'Error al conectar con la API de Facebook' };
    }

    // Mapear la respuesta de Facebook a nuestra interfaz
    const posts = data.data.map((post: any) => {
      // Extraer un título lógico de la primera línea del mensaje
      let title = "Nueva Publicación";
      if (post.message) {
        const firstLine = post.message.split('\n')[0].trim();
        title = firstLine.length > 50 ? firstLine.substring(0, 50) + '...' : firstLine;
      }

      const postDate = new Date(post.created_time);
      const date = postDate.toLocaleDateString('es-CO');
      const time = postDate.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });

      // Obtener todas las imágenes posibles (principal + subadjuntos)
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
        modality: "Vía Facebook", // Dato genérico para Facebook
        speaker: "Comunidad Eléctrica UTS", // Dato genérico
        content: post.message || "Ver más detalles en la publicación original.",
        images: images.length > 0 ? images : ["https://picsum.photos/seed/uts-fb-default/800/600"], // Fallback si no hay foto
        url: post.permalink_url || `https://www.facebook.com/${pageId}`
      };
    });

    return { data: posts };
  } catch (error) {
    console.error('Fetch error:', error);
    return { error: 'Error de red al intentar obtener las publicaciones' };
  }
}
