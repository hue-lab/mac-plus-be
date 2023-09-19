import {CreateProductDTO} from "../../product/dto/createProduct.dto";

export interface ITotal {
  products?: IProduct[];
  orderPrice: number;
  totalItemsCount: number;
  totalDiscount: number;
  totalPrice: number;
}

export interface IProduct extends CreateProductDTO {
  _id: string;
}
