import { Request } from 'express';
import multer from 'multer';
import cloudinaryConfig from '../config/cloudinary';

// Configure multer for memory storage
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept images only
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

export interface UploadedImage {
  url: string;
  publicId: string;
  originalName: string;
  size: number;
  mimeType: string;
}

export { upload };

export const uploadProductImage = async (req: Request): Promise<UploadedImage> => {
  return new Promise((resolve, reject) => {
    upload.single('image')(req, {} as any, (error) => {
      if (error) {
        return reject(error);
      }

      const file = req.file;
      if (!file) {
        return reject(new Error('No file uploaded'));
      }

      // Upload to Cloudinary
      cloudinaryConfig.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: 'bellescart/products',
          public_id: `${Date.now()}-${file.originalname}`,
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }

          if (!result) {
            return reject(new Error('Upload failed'));
          }

          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            originalName: file.originalname,
            size: file.size,
            mimeType: file.mimetype,
          });
        }
      ).end(file.buffer);
    });
  });
};

export const uploadMultipleImages = async (req: Request): Promise<UploadedImage[]> => {
  return new Promise((resolve, reject) => {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return reject(new Error('No files uploaded'));
    }

    // Upload all files to Cloudinary
    const uploadPromises = files.map(file => {
      return new Promise<UploadedImage>((resolveFile, rejectFile) => {
        cloudinaryConfig.uploader.upload_stream(
          {
            resource_type: 'auto',
            folder: 'bellescart/products',
            public_id: `${Date.now()}-${file.originalname}`,
          },
          (error, result) => {
            if (error) {
              return rejectFile(error);
            }

            if (!result) {
              return rejectFile(new Error('Upload failed'));
            }

            resolveFile({
              url: result.secure_url,
              publicId: result.public_id,
              originalName: file.originalname,
              size: file.size,
              mimeType: file.mimetype,
            });
          }
        ).end(file.buffer);
      });
    });

    Promise.all(uploadPromises)
      .then(resolve)
      .catch(reject);
  });
};

export const deleteImage = async (publicId: string): Promise<void> => {
  try {
    await cloudinaryConfig.uploader.destroy(publicId);
  } catch (error) {
    throw new Error(`Failed to delete image: ${error}`);
  }
};
