import { Component, NgZone, OnInit } from '@angular/core';
import { FormGroup, FormControl, ReactiveFormsModule, Validators, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/legacy/build/pdf';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../services/Cart/cart-service';
import { PriceManagerService } from '../../../services/Prices/price-manager-service';
import { UserService } from '../../../services/Users/user-service';
import Cart from '../../../models/Cart/cart';
import { OrderService } from '../../../services/Orders/order-service';
import { NotificationService } from '../../../services/Notification/notification-service';
import OrderItemCreateRequest from '../../../models/OrderItem/orderItemCreateRequest';

GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.4.149/pdf.worker.min.mjs';

@Component({
  selector: 'app-make-order-page',
  templateUrl: './make-order-page.html',
  standalone: true,
  imports : [ReactiveFormsModule, CommonModule],
  styleUrls: ['./make-order-page.css']
})
export class MakeOrderPage implements OnInit{

  orderForm: FormGroup;
  selectedFile: File | null = null;
  selectedFileName: string = 'Selecciona un archivo';
  pageCount: number | null = null;
  imageWidth: number | null = null;
  imageHeight: number | null = null;
  private currentObjectUrl: string | null = null;
  public calculatedPrice: number | null = null;
  orderItemService: any;
  public editingOrderId: string | null = null;

  readonly FILE_BASE_PATH = 'C:/print-files/'

constructor(
    private zone: NgZone,
    private cartService: CartService,
    private priceS: PriceManagerService,
    private orderService: OrderService,
    private userService: UserService,
    private notificationService: NotificationService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.orderForm = this.fb.group({
      pages: [1, [Validators.required, Validators.min(1)]],
      copies: [1, [Validators.required, Validators.min(1)]],
      isDoubleSided: [false],
      binding: ['UNRINGED', [Validators.required]],
      isColor: [false],
      comments: [''],
      file: [null],
      amount: [0]
    });
  }


  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    this.selectedFile = input.files[0];
    this.selectedFileName = this.selectedFile.name;
    this.pageCount = null;
    this.imageWidth = null;
    this.imageHeight = null;

    const fileType = this.selectedFile.type;

    if (this.currentObjectUrl) {
      URL.revokeObjectURL(this.currentObjectUrl);
      this.currentObjectUrl = null;
    }

    if (fileType === 'application/pdf' || this.selectedFile.name.toLowerCase().endsWith('.pdf')) {
      this.countPdfPages(this.selectedFile);
   } else if (fileType === 'image/jpeg' || fileType === 'image/png' || this.selectedFile.type.startsWith('image/')) {
      const objUrl = URL.createObjectURL(this.selectedFile);
      this.currentObjectUrl = objUrl;
      const img = new Image();
      img.onload = () => {
        this.zone.run(() => {
          this.imageWidth = img.width;
          this.imageHeight = img.height;
          if (this.currentObjectUrl) {
            URL.revokeObjectURL(this.currentObjectUrl);
            this.currentObjectUrl = null;
          }
        });
      };
      img.src = objUrl;
    } else {
      console.log('Tipo de archivo no soportado');
    }
  }


  async countPdfPages(file: File) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8 = new Uint8Array(arrayBuffer);
      const pdf = await getDocument({ data: uint8 }).promise;

      this.zone.run(() => {
        this.pageCount = pdf.numPages;
        this.orderForm.get('pages')?.setValue(this.pageCount);
      });

      console.log('Número de páginas:', this.pageCount);
    } catch (err) {
      console.error('Error leyendo PDF:', err);
      this.zone.run(() => {
        this.pageCount = null;
      });
    }
  }


  get isPdf(): boolean {
    return !!this.selectedFile && (
      this.selectedFile.type === 'application/pdf' ||
      this.selectedFile.name.toLowerCase().endsWith('.pdf')
    );
  }

  get isText(): boolean {
    return !!this.selectedFile && this.selectedFile.type === 'text/plain';
  }

  get isImage(): boolean {
    return !!this.selectedFile && this.selectedFile.type.startsWith('image/');
  }

  get fileSize(): number | null {
    return this.selectedFile ? this.selectedFile.size : null;
  }


  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const orderId = params.get('orderId');
      if (orderId) {
        this.editingOrderId = orderId;
        this.loadOrderForEditing(orderId);
      }
    });

    this.cargarPrecios();
    this.orderForm.valueChanges.subscribe(() => {
        this.calcularPrecio();
    });
    this.calcularPrecio();
  }


  private loadOrderForEditing(orderId: string): void {
    this.orderService.getOrderById(orderId).subscribe({
      next: (order) => {
        this.orderForm.patchValue({
          copies: order.copies,
          isDoubleSided: order.isDoubleSided,
          isColor: order.isColor,
          binding: order.binding,
          comments: order.comments,
          pages: order.pages || 1
        });
       
        if (typeof order.file === 'string') {
          this.selectedFileName = order.file;
        }
        this.pageCount = order.pages;
        this.calcularPrecio();
      },
      error: (err) => console.error('Error loading order for editing:', err)
    });
  }


  cargarPrecios() {
    this.priceS.getPrices().subscribe({
      next: (data) => {
        this.priceS.Prices = data;
      },
      error: (error) => {
        console.error('Error al cargar los precios:', error);
      }
    });
  }


  calcularPrecio() {
    if (this.orderForm.valid) {
      const { pages, copies, isDoubleSided, binding, isColor } = this.orderForm.value;
      this.calculatedPrice = this.priceS.calculatePrice(pages, copies, isDoubleSided, binding, isColor);
    }
  }


  addToCart() {
    if ((!this.selectedFile && !this.editingOrderId) || !this.orderForm.valid) {
      this.notificationService.error('Selecciona un archivo y completa todos los campos.');
      return;
    }
    
    const currentUser = this.userService.getDecodedUserPayload();
    const userId = currentUser?.userId;

    if (userId) {
      this.cartService.getCartByUserId(userId).subscribe({
        next: (carts) => {
          if (carts.length > 0) {
            this.createOrderItem(carts[0].id);
          } else {
            const newCart: Cart = {
              userId,
              total: 0,
              status: 'pending'
            } as Cart;

            this.cartService.postCart(newCart).subscribe({
              next: (createdCart) => {
                this.createOrderItem(createdCart.id);
              },
              error: () => this.notificationService.error('Error creando el carrito')
            });
          }
        },
        error: () => this.notificationService.error('Error obteniendo carrito')
      });

      return;
    }

    
    const storedCartId = localStorage.getItem('cartId');

    if (storedCartId) {
      this.createOrderItem(storedCartId);
      return;
    }

    const guestCart: Cart = {
      total: 0,
      status: 'pending'
    } as Cart;

    this.cartService.postCart(guestCart).subscribe({
      next: (createdCart) => {
        localStorage.setItem('cartId', createdCart.id);
        this.createOrderItem(createdCart.id);
      },
      error: () => this.notificationService.error('Error creando carrito de invitado')
    });
}


private createOrderItem(cartId: string) {
  const f = this.orderForm.value;
  const orderItemCreateRequest: OrderItemCreateRequest = {
    isColor: f.isColor,
    isDoubleSided: f.isDoubleSided,
    binding: f.binding.toLowerCase() as any,
    pages: this.isPdf ? f.pages : this.pageCount!,
    comments: f.comments,
    file: this.FILE_BASE_PATH + this.selectedFileName,
    copies: f.copies,
    amount: this.calculatedPrice!,
    imageWidth: this.isImage ? this.imageWidth! : undefined,
    imageHeight: this.isImage ? this.imageHeight! : undefined
  };

  
  this.orderService.postOrderToCart(cartId, orderItemCreateRequest).subscribe({
    next: () => {
      this.notificationService.success('Archivo agregado al carrito');
      this.resetForm();
    },
    error: (err: any) => console.error('Error agregando item:', err)
  });
}


private resetForm() {
  this.selectedFile = null;
  this.selectedFileName = 'Selecciona un archivo';
  this.orderForm.reset({
    pages: 1,
    copies: 1,
    isDoubleSided: false,
    binding: 'UNRINGED',
    isColor: false,
    comments: ''
  });
  this.calculatedPrice = null;
}


private updateOrderItem(): void {
  if (!this.editingOrderId) return;

  const f = this.orderForm.value;
  const updatedOrderItem = {
    ...f,
    amount: this.calculatedPrice,
    file: this.selectedFileName,
  };

  this.orderService.updateOrder(this.editingOrderId, updatedOrderItem).subscribe({
    next: () => {
      this.notificationService.success('Pedido actualizado correctamente.');
      this.router.navigate(['/cart']);
    },
    error: (err) => console.error('Error updating order item:', err)
  });
}
}