import { BindingTypeEnum } from "../Enums/bindingTypeEnum";

export default interface PriceCalculationRequest{
    pages: number;
    copies: number;
    color: boolean;
    isDoubleSided: boolean;
    binding: BindingTypeEnum;
}