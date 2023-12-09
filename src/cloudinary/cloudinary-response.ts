import { UploadApiErrorResponse } from 'cloudinary';

interface UploadFilteredApiResponse {
  statusCode: number;
  message: string;
  data: object;
}
export type CloudinaryResponse =
  | UploadFilteredApiResponse
  | UploadApiErrorResponse;
