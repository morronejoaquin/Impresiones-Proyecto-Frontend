export default interface OrderItemCreateRequest{
  color: boolean;
  doubleSided: boolean;
  binding?: 'ringed' | 'stapled' | 'unringed';
  pages: number;
  comments?: string;
  driveFileId?: string;
  fileName: string;
  fileType?: string;
  copies: number;
  amount: number;
  imageWidth?: number;
  imageHeight?: number;
  deleted?: boolean;
  file?: File | string | null;
}