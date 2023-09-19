import {IsEnum, IsNumber, IsOptional, ValidateNested} from "class-validator";
import {Type} from "class-transformer";
import {GetProductsPaginationDTO} from "../../product/dto/filterProduct.dto";

export enum OrderSortProperties {
    Date = 'createdAt',
    Customer = 'customer',
    Price = 'totalPrice',
    State = 'state',
}

export class GetOrdersSortDTO {
    @IsEnum(OrderSortProperties)
    property: OrderSortProperties;

    @IsOptional()
    @IsNumber()
    direction?: -1 | 1;
}

export class GetOrdersDTO {
    @ValidateNested()
    @Type(() => GetOrdersSortDTO)
    @IsOptional()
    sort?: GetOrdersSortDTO;

    @ValidateNested()
    @Type(() => GetProductsPaginationDTO)
    @IsOptional()
    pagination?: GetProductsPaginationDTO;
}