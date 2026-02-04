import { BindingTypeEnum } from "../Enums/bindingTypeEnum";
import { FileTypeEnum } from "../Enums/fileTypeEnum";

export default interface OrderItemResponse {
  id: string;
  cartId: string;
  color: boolean;
  doubleSided: boolean;
  binding?: BindingTypeEnum;
  pages: number;
  comments?: string;
  driveFileId?: string;
  fileName: string;
  fileType?: FileTypeEnum;
  copies: number;
  amount: number;
  pricePerSheet: number;
  priceRingedBinding: number;
  imageWidth?: number;
  imageHeight?: number;
  deleted?: boolean;
}