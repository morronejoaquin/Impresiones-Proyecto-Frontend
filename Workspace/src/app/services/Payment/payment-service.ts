import { Injectable } from '@angular/core';
import Payment from '../../models/Payment/paymentHistoryResponse';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  readonly URL = 'http://localhost:3000/payments'

  payments: Payment[]

  constructor(private http: HttpClient){
    this.payments = []
  }

  getPayments(){
    return this.http.get<Payment>(this.URL)
  }

  getPaymentById(id: string){
    return this.http.get<Payment>(`${this.URL}/${id}`)
  }

  postPayment(payment: Payment){
    return this.http.post<Payment>(this.URL, payment)
  }
}
