export default interface PriceCalculationResponse{
    total: number;
    pricePerSheet: number;
    doubleSided: boolean;
    bindingPrice: number;
}