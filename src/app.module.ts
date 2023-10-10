import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { ProductModule } from './product/product.module';
import { AuthModule } from './auth/auth.module';
import { CartModule } from './cart/cart.module';
import { CategoryModule } from './category/category.module';
import { OrderModule } from './order/order.module';
import { StorageModule } from './storage/storage.module';
import { ArticleModule } from './article/article.module';
import { NotifyModule } from './notify/notify.module';
import { ConfigModule } from '@nestjs/config';
import { getMongoDB } from '../config/getMongoDB';
import { StoreConfigModule } from './storeConfig/storeConfig.module';
import { MenuModule } from './menu/menu.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['./.env', './.env.local'],
    }),
    MongooseModule.forRoot(getMongoDB().URI, { dbName: getMongoDB().DB }),
    UserModule,
    ProductModule,
    AuthModule,
    CartModule,
    CategoryModule,
    OrderModule,
    StorageModule,
    ArticleModule,
    NotifyModule,
    StoreConfigModule,
    MenuModule,
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class AppModule {
}
