# Guía: Conectar la Página de Facebook al Portal Eléctrica UTS

**Meta:** Obtener las claves de acceso de Facebook para que el portal cargue automáticamente las últimas 10 publicaciones de `IngenieriaElectricaUTS` con nuestro diseño personalizado.

## 1. Crear una Aplicación en Facebook Developers
1. Ve a [Facebook for Developers](https://developers.facebook.com/) e inicia sesión con tu cuenta de Facebook (la que administra la página de Ingeniería Eléctrica UTS).
2. Haz clic en **Mis Apps** (My Apps) y luego en el botón **Crear App** (Create App).
3. Selecciona el tipo de App **"Otros"** o **"Empresa"** (Business).
4. Dale un nombre, por ejemplo: `Portal UTS Electrica`.

## 2. Generar el Token de Acceso
1. Dentro del panel de tu nueva App, busca el producto **"Inicio de sesión con Facebook para empresas"** o ve a **Herramientas > Explorador de la API Graph** (Graph API Explorer).
2. En el Explorador, en la sección de la derecha ("Usuario o página"), selecciona **"Obtener token de acceso a la página"**.
3. Te pedirá permisos; selecciona tu página `IngenieriaElectricaUTS`.
4. Asegúrate de pedir los permisos: `pages_read_engagement` y `pages_show_list`.
5. Esto generará un código largo. Cópialo. 
6. *(Opcional pero recomendado)*: Ve a la [Herramienta de depuración de tokens](https://developers.facebook.com/tools/debug/accesstoken/), pega el token y pulsa "Ampliar token de acceso" para obtener una llave que nunca expire o dure meses, en lugar de unas horas.

## 3. Obtener el ID de la Página
1. Entra a tu página de Facebook desde un navegador normal.
2. Ve a la sección de "Información" (About) > "Transparencia de la página" o usa una herramienta web como [Find my FB ID](https://lookup-id.com/).
3. O si vas a las opciones de tu página > Configuración de la página, encontrarás un número largo (generalmente de 15 dígitos) que es tu **Page ID**.

## 4. Agregar los datos al Portal (Archivo `.env`)
Una vez tengas estos dos códigos, abre el archivo `.env` que está dentro de los archivos del código del portal y pégalos aquí:

```env
FACEBOOK_PAGE_ID="Pega_aqui_el_ID_de_la_pagina"
FACEBOOK_ACCESS_TOKEN="Pega_aqui_el_Token_largo"
```

¡Listo! Al guardar el archivo, la sección de publicaciones de la página web dejará de mostrar las noticias "mock" (de prueba) y empezará a descargar las imágenes y textos reales de la facultad en tiempo real.
