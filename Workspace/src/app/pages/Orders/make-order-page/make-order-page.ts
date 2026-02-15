import { Component, NgZone, OnInit } from '@angular/core';
import {
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormBuilder,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/legacy/build/pdf';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../services/Cart/cart-service';
import { CalculatorService } from '../../../services/Calculator/calculator-service';
import { AuthService } from '../../../services/Auth/auth.service';
import { OrderService } from '../../../services/Orders/order-service';
import { NotificationService } from '../../../services/Notification/notification-service';
import OrderItemCreateRequest from '../../../models/OrderItem/orderItemCreateRequest';
import OrderItemUpdateRequest from '../../../models/OrderItem/orderItemUpdateRequest';
import PriceCalculationResponse from '../../../models/Prices/priceCalculationResponse';

GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.4.149/pdf.worker.min.mjs';

@Component({
  selector: 'app-make-order-page',
  templateUrl: './make-order-page.html',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  styleUrls: ['./make-order-page.css'],
})
export class MakeOrderPage implements OnInit {
  orderForm: FormGroup;
  selectedFile: File | null = null;
  selectedFileName: string = 'Selecciona un archivo';
  pageCount: number | null = null;
  imageWidth: number | null = null;
  imageHeight: number | null = null;
  private currentObjectUrl: string | null = null;
  public calculatedPrice: number | null = null;
  public editingOrderId: string | null = null;
  isLoading: boolean = false;

  constructor(
    private zone: NgZone,
    private cartService: CartService,
    private calculatorService: CalculatorService,
    private orderService: OrderService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.orderForm = this.fb.group({
      pages: [1, [Validators.required, Validators.min(1)]],
      copies: [1, [Validators.required, Validators.min(1)]],
      doubleSided: [false],
      binding: ['NONE', [Validators.required]],
      color: [false],
      comments: [''],
      file: [null],
      amount: [0],
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
    } else if (
      fileType === 'image/jpeg' ||
      fileType === 'image/png' ||
      this.selectedFile.type.startsWith('image/')
    ) {
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

  removeFile(event: Event) {
    event.stopPropagation(); // Evita que se abra el selector de archivos al hacer clic en X
    this.selectedFile = null;
    this.selectedFileName = '';
    this.pageCount = null;
    this.imageHeight = null;
    this.imageWidth = null;
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
    return (
      !!this.selectedFile &&
      (this.selectedFile.type === 'application/pdf' ||
        this.selectedFile.name.toLowerCase().endsWith('.pdf'))
    );
  }

  get isImage(): boolean {
    return !!this.selectedFile && this.selectedFile.type.startsWith('image/');
  }

  get fileSize(): number | null {
    return this.selectedFile ? this.selectedFile.size : null;
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const orderId = params.get('orderId');
      if (orderId) {
        this.editingOrderId = orderId;
        this.loadOrderForEditing(orderId);
      }
    });

    this.orderForm.valueChanges.subscribe(() => {
      this.calcularPrecio();
    });
    this.calcularPrecio();
  }

  private loadOrderForEditing(orderId: string): void {
    this.isLoading = true;
    this.orderService.getById(orderId).subscribe({
      next: (order) => {
        this.orderForm.patchValue({
          copies: order.copies,
          doubleSided: order.doubleSided,
          color: order.color,
          binding: order.binding,
          comments: order.comments,
          pages: order.pages || 1,
        });
        this.pageCount = order.pages;
        this.selectedFileName = order.fileName || 'Archivo cargado';
        this.isLoading = false;
        this.calcularPrecio();
      },
      error: (err) => {
        console.error('Error loading order for editing:', err);
        this.isLoading = false;
        this.notificationService.error('Error al cargar el pedido para edición.');
      },
    });
  }

  calcularPrecio() {
    if (this.orderForm.valid) {
      const { pages, copies, doubleSided, binding, color } = this.orderForm.value;

      const calculateRequest = {
        pages,
        copies,
        color,
        binding: binding || null,
      };

      this.calculatorService.calculation(calculateRequest).subscribe({
        next: (response: PriceCalculationResponse) => {
          this.calculatedPrice = response.total;
        },
        error: (err: any) => console.error('Error calculating price:', err),
      });
    }
  }

  addToCart() {
    if (this.editingOrderId) {
      this.updateOrderItem();
      return;
    }

    if ((!this.selectedFile && !this.editingOrderId) || !this.orderForm.valid) {
      this.notificationService.error('Selecciona un archivo y completa todos los campos.');
      return;
    }
    const token = this.authService.getToken();
    if (!token) {
      this.notificationService.info('Debes iniciar sesión para agregar productos al carrito.');
      return;
    }

    this.cartService.getMyCart().subscribe({
      next: (cart) => {
        this.createOrderItem(cart.id);
      },
      error: (err) => {
        this.cartService.createCart().subscribe({
          next: (newCart) => {
            this.createOrderItem(newCart.id);
          },
        });
      },
    });
  }

  private createOrderItem(cartId: string) {
    this.isLoading = true;
    const orderItemRequest: OrderItemCreateRequest = {
      color: this.orderForm.get('color')?.value,
      doubleSided: this.orderForm.get('doubleSided')?.value,
      binding: this.orderForm.get('binding')?.value,
      comments: this.orderForm.get('comments')?.value,
      copies: this.orderForm.get('copies')?.value,
    };

    this.cartService.agregarItem(orderItemRequest, this.selectedFile!).subscribe({
      next: () => {
        this.isLoading = false;
        this.notificationService.success('Archivo agregado al carrito');

        setTimeout(() => {
          this.selectedFile = null;
          this.selectedFileName = 'Selecciona un archivo';
          this.orderForm.reset({
            pages: 1,
            copies: 1,
            doubleSided: false,
            binding: 'NONE',
            color: false,
            comments: '',
          });
          this.calculatedPrice = null;
        }, 500);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error agregando item:', err);
      },
    });
  }

  private updateOrderItem(): void {
    if (!this.editingOrderId) return;

    this.isLoading = true;

    const updatedOrderItem: OrderItemUpdateRequest = {
      color: this.orderForm.get('color')?.value,
      doubleSided: this.orderForm.get('doubleSided')?.value,
      binding: this.orderForm.get('binding')?.value,
      comments: this.orderForm.get('comments')?.value,
      copies: this.orderForm.get('copies')?.value,
    };

    this.orderService.update(this.editingOrderId, updatedOrderItem).subscribe({
      next: () => {
        this.isLoading = false;
        this.notificationService.success('Pedido actualizado correctamente.');
        this.router.navigate(['/cart']);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error updating order item:', err);
        this.notificationService.error('Error al actualizar el pedido. Intenta nuevamente.');
      },
    });
  }
}