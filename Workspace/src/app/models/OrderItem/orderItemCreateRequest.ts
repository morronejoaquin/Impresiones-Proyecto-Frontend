import { BindingTypeEnum } from "../Enums/bindingTypeEnum";

export default interface OrderItemCreateRequest{
  color: boolean;
  doubleSided: boolean;
  binding?: BindingTypeEnum;
  comments?: string;
  copies: number;
}