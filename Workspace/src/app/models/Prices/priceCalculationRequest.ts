import { BindingTypeEnum } from "../Enums/bindingTypeEnum";

export default interface PriceCalculationRequest{
    pages: number;
    copies: number;
    color: boolean;
    binding: BindingTypeEnum;
}