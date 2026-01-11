export default interface OrderItemCreateRequest{
  isColor: boolean;
  isDoubleSided: boolean;
  binding: 'ringed' | 'stapled' | 'unringed';
  pages: number;
  comments?: string;
  file: string;
  copies: number;
  amount: number;
  imageWidth?: number;
  imageHeight?: number;
}