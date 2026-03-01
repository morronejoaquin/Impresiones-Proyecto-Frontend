export default interface PriceCalculationResponse{
    total: number;
    pricePerSheet: number;
    isDoubleSided: boolean;
    bindingPrice: number;
}