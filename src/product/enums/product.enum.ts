export enum ComparisonOperator {
    eq = '$eq',
    gt = '$gt',
    gte = '$gte',
    lt = '$lt',
    lte = '$lte',
    ne = '$ne',
    in = '$in',
}

export enum BasePropertyName {
    Id = '_id',
    Name = 'name',
    Brand = 'brand',
    Category = 'categoryId',
    Type = 'productTypeId',
    Price = 'price',
    TotalPrice = 'totalPrice',
    IsNew = 'isNew',
    IsRec = 'isRec',
    IsStock= 'isStock',
    Discount = 'discount',
    CreatedAt = 'createdAt',
    UpdatedAt = 'updatedAt',
}