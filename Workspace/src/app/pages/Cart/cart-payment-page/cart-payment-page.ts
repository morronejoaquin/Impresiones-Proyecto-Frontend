import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../../services/Users/user-service';
import User from '../../../models/Users/user';
import { CommonModule } from '@angular/common';
import { PaymentService } from '../../../services/Payment/payment-service';
import { CartService } from '../../../services/Cart/cart-service';
import { Router } from '@angular/router';
import { OrderService } from '../../../services/Orders/order-service';
import { switchMap } from 'rxjs';
import { NotificationService } from '../../../services/Notification/notification-service';

@Component({
  selector: 'app-cart-payment-page',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './cart-payment-page.html',
  styleUrl: './cart-payment-page.css'
})
export class CartPaymentPage implements OnInit{
  
  cartTotal: number = 0;
  cartForm: FormGroup;
  user: User | null = null;
  userId!: string;

  constructor(private fb: FormBuilder, 
    private userService: UserService, 
    private paymentService: PaymentService,
    private cartService: CartService,
    private orderService: OrderService,
    private notificationService: NotificationService,
    private router: Router
  ){
    this.cartForm = this.fb.group({
      customerName: ['', Validators.required],
      surname: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      paymentMethod: ['cash', Validators.required],
      sign: ['']
    });
  }

  ngOnInit(): void {
    
  }

  onSubmit() {
    
  }


  getCustomerName() {
    return this.cartForm.get('customerName');
  }

  getSurname() {
    return this.cartForm.get('surname');
  }

  getPhone() {
    return this.cartForm.get('phone');
  }

  getPaymentMethod() {
    return this.cartForm.get('paymentMethod');
  }
}
