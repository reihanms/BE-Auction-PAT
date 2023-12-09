import { Injectable } from '@nestjs/common';
import { UploadApiResponse, v2 as cloudinary } from 'cloudinary';
import { CloudinaryResponse } from './cloudinary-response';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  uploadFile(file: Express.Multer.File): Promise<CloudinaryResponse> {
    return new Promise<CloudinaryResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'Auction-Storage-PAT' },
        (error: any, result: UploadApiResponse) => {
          if (error) return reject(error);
          const filteredResponse: CloudinaryResponse = {
            statusCode: 200,
            message: 'success',
            data: {
              type: result.type,
              url: result.url,
              secure_url: result.secure_url,
            },
          };
          resolve(filteredResponse);
        },
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  uploadFiles(files: Express.Multer.File[]): Promise<CloudinaryResponse> {
    return new Promise<CloudinaryResponse>((resolve, reject) => {
      const promises = files.map((file) =>
        this.uploadFile(file).then((response) => {
          return response;
        }),
      );

      // Wait for all individual uploads to complete
      Promise.all(promises)
        .then((results) => {
          const filteredResponse: CloudinaryResponse = {
            statusCode: 200,
            message: 'success',
            data: {
              url: results.map((item) => item.data.url),
            },
          };
          resolve(filteredResponse);
        })
        .catch((error) => reject(error));
    });
  }
}
