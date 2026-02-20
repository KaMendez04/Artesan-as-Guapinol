/**
 * Configuración de Cloudinary para el proyecto
 */

export const cloudinaryConfig = {
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
    apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY,
    // La API Secret no debe exponerse en el cliente, 
    // se mantiene en el .env por si se necesita en un futuro (edge functions, etc.)
};

/**
 * Helper para obtener una URL optimizada de Cloudinary
 * @param publicId - El ID público de la imagen en Cloudinary
 * @param options - Opciones de transformación (width, height, crop, etc.)
 * @returns La URL de la imagen transformada
 */
export function getCloudinaryImageUrl(publicId: string, options: { width?: number; height?: number; crop?: string } = {}) {
    const { width, height, crop = 'fill' } = options;
    const baseUrl = `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/image/upload`;

    let transformations = '';
    if (width || height) {
        transformations = `c_${crop}${width ? `,w_${width}` : ''}${height ? `,h_${height}` : ''}/`;
    }

    return `${baseUrl}/${transformations}${publicId}`;
}

/**
 * Sube una imagen a Cloudinary usando el método de unsigned upload.
 * Requiere un 'upload preset' configurado en Cloudinary como 'unsigned'.
 * @param file - El archivo a subir
 * @returns La respuesta de Cloudinary con la URL y otros metadatos
 */
export async function uploadImage(file: File) {
    const cloudName = cloudinaryConfig.cloudName;
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    // NOTA: Para producción, el preset 'ml_default' u otro debe estar configurado como 'unsigned'
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'ml_default');

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Error al subir imagen a Cloudinary');
        }

        const data = await response.json();
        return {
            url: data.secure_url,
            public_id: data.public_id,
            width: data.width,
            height: data.height,
        };
    } catch (error) {
        console.error('Cloudinary Upload Error:', error);
        throw error;
    }
}

/**
 * Valida si una cadena es una URL de Cloudinary
 * @param url - La URL a validar
 * @returns true si es de Cloudinary
 */
export function isCloudinaryUrl(url: string) {
    return url && url.includes('res.cloudinary.com');
}
