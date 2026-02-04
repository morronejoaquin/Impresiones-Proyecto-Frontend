import { BindingTypeEnum } from "../Enums/bindingTypeEnum";

export default interface OrderItemUpdateRequest{
    copies: number;
    color: boolean;
    doubleSided: boolean;
    binding: BindingTypeEnum;
    comments: string;
}