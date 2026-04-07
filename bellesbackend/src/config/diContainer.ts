import { UserRepository } from '@/repositories/userRepository';
import { ProductRepository } from '@/repositories/productRepository';
import { CategoryRepository } from '@/repositories/categoryRepository';
import { CartRepository } from '@/repositories/cartRepository';
import { OrderRepository } from '@/repositories/orderRepository';
import { WishlistRepository } from '@/repositories/wishlistRepository';

import { AuthService } from '@/services/authService';
import { ProductService } from '@/services/productService';
import { CartService } from '@/services/cartService';
import { OrderService } from '@/services/orderService';
import { WishlistService } from '@/services/wishlistService';

import { RegisterUserInteractor } from '@/interactors/auth/registerUserInteractor';
import { LoginUserInteractor } from '@/interactors/auth/loginUserInteractor';
import { AddToCartInteractor } from '@/interactors/cart/addToCartInteractor';
import { CreateOrderInteractor } from '@/interactors/order/createOrderInteractor';

import { AuthController } from '@/controllers/authController';
import { ProductController } from '@/controllers/productController';
import { CartController } from '@/controllers/cartController';
import { OrderController } from '@/controllers/orderController';

export class DIContainer {
  private static instance: DIContainer;
  
  private userRepository: UserRepository;
  private productRepository: ProductRepository;
  private categoryRepository: CategoryRepository;
  private cartRepository: CartRepository;
  private orderRepository: OrderRepository;
  private wishlistRepository: WishlistRepository;

  private authService: AuthService;
  private productService: ProductService;
  private categoryService: any;
  private cartService: CartService;
  private orderService: OrderService;
  private wishlistService: WishlistService;

  private registerUserInteractor: RegisterUserInteractor;
  private loginUserInteractor: LoginUserInteractor;
  private addToCartInteractor: AddToCartInteractor;
  private createOrderInteractor: CreateOrderInteractor;

  private authController: AuthController;
  private productController: ProductController;
  private cartController: CartController;
  private orderController: OrderController;

  private constructor() {
    this.initializeRepositories();
    this.initializeServices();
    this.initializeInteractors();
    this.initializeControllers();
  }

  public static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  private initializeRepositories(): void {
    this.userRepository = new UserRepository();
    this.productRepository = new ProductRepository();
    this.categoryRepository = new CategoryRepository();
    this.cartRepository = new CartRepository();
    this.orderRepository = new OrderRepository();
    this.wishlistRepository = new WishlistRepository();
  }

  private initializeServices(): void {
    this.authService = new AuthService(this.userRepository);
    this.productService = new ProductService(this.productRepository, this.categoryRepository);
    this.categoryService = null; // Placeholder for category service
    this.cartService = new CartService(this.cartRepository, this.productRepository);
    this.orderService = new OrderService(this.orderRepository, this.cartRepository, this.productRepository);
    this.wishlistService = new WishlistService(this.wishlistRepository, this.productRepository);
  }

  private initializeInteractors(): void {
    this.registerUserInteractor = new RegisterUserInteractor(this.authService);
    this.loginUserInteractor = new LoginUserInteractor(this.authService);
    this.addToCartInteractor = new AddToCartInteractor(this.cartService);
    this.createOrderInteractor = new CreateOrderInteractor(this.orderService);
  }

  private initializeControllers(): void {
    this.authController = new AuthController(this.registerUserInteractor, this.loginUserInteractor);
    this.productController = new ProductController(this.productService, this.categoryService);
    this.cartController = new CartController(this.addToCartInteractor, this.cartService);
    this.orderController = new OrderController(this.createOrderInteractor, this.orderService);
  }

  getAuthController(): AuthController {
    return this.authController;
  }

  getProductController(): ProductController {
    return this.productController;
  }

  getCartController(): CartController {
    return this.cartController;
  }

  getOrderController(): OrderController {
    return this.orderController;
  }
}
