import { CustomerData } from "./cart";

export default interface CartCreateRequest{
    userId?: string;
    customer: CustomerData;
}