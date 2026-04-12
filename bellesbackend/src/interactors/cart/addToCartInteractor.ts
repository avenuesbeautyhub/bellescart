import { ICartService } from '@/services/cartService';

export interface IAddToCartInteractor {
  execute(userId: string, productId: string, quantity: number, size?: string, color?: string): Promise<any>;
}

export class AddToCartInteractor implements IAddToCartInteractor {
  constructor(private cartService: ICartService) {}

  async execute(userId: string, productId: string, quantity: number, size?: string, color?: string): Promise<any> {
    return this.cartService.addToCart(userId, productId, quantity, size, color);
  }
}
