import { UploadedFile } from 'express-fileupload';
import cloudinary from '@/config/cloudinary';

export const uploadSingleImage = async (
  image: UploadedFile, // req.files?.image as UploadedFile
  folderName: string,
) => {
  try {
    const result = await cloudinary.uploader.upload(image.tempFilePath, {
      folder: folderName,
    });
    return {
      url: result.secure_url,
      public_id: result.public_id.split('/')[1],
    };
  } catch (err) {
    throw err;
  }
};

export const deleteSingleImage = async (publicId: string) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    throw err;
  }
};

export const uploadMultipleImages = async (
  images: UploadedFile[], // req.files?.images as UploadedFile[]
  folderName: string,
) => {
  try {
    const results = await Promise.all(
      images.map(async (image) => {
        const result = await cloudinary.uploader.upload(image.tempFilePath, {
          folder: folderName,
        });
        return {
          url: result.secure_url,
          public_id: result.public_id.split('/')[1],
        };
      }),
    );
    return results;
  } catch (err) {
    throw err;
  }
};
export const deleteMultipleImages = async (publicIds: string[]) => {
  try {
    await cloudinary.api.delete_resources(publicIds);
  } catch (err) {
    throw err;
  }
};
