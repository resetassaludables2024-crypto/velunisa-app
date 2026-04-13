import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:     true,
})

export async function uploadImage(
  file: string,  // base64 or URL
  folder: string = 'products'
): Promise<{ url: string; publicId: string }> {
  const result = await cloudinary.uploader.upload(file, {
    folder:           `velunisa/${folder}`,
    transformation:   [{ quality: 'auto', fetch_format: 'auto' }],
    allowed_formats:  ['jpg', 'jpeg', 'png', 'webp'],
  })
  return {
    url:      result.secure_url,
    publicId: result.public_id,
  }
}

export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId)
}

export function getOptimizedUrl(
  url: string,
  width?: number,
  height?: number
): string {
  if (!url.includes('cloudinary.com')) return url
  const transforms = ['f_auto', 'q_auto']
  if (width)  transforms.push(`w_${width}`)
  if (height) transforms.push(`h_${height},c_fill`)
  return url.replace('/upload/', `/upload/${transforms.join(',')}/`)
}

export { cloudinary }
