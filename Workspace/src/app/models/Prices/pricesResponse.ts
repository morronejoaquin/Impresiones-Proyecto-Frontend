export default interface PricesResponse {
  id: string;
  pricePerSheetBW: number;
  pricePerSheetColor: number;
  priceRingedBinding: number;
  priceStapledBinding: number;
  validFrom: string;
  validTo: string;
}