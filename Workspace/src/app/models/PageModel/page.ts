export default interface Page<T> {
  content: T[];          
  totalElements: number; 
  totalPages: number;   
  size: number;        
  number: number;       
  last: boolean;
  first: boolean;
  empty: boolean;
}