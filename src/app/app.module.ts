import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { FirebaseModule } from 'nestjs-firebase';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PingModule } from './ping/ping.module';
import { PokemonsController } from './pokemon/pokemons.controller';
import { UsersController } from './users/users.controller';
import { AuthModule } from './modules/auth/auth.module';
import { AuthMiddleware } from './modules/auth/auth.middleware';
import { FirebaseService } from './firebase.service';

@Module({
  imports: [
    PingModule,
    FirebaseModule.forRoot({
      googleApplicationCredential: 'src/assets/quizzy-back-firebase-key.json',
    }),
    AuthModule,
  ],
  controllers: [AppController, PokemonsController, UsersController],
  providers: [AppService, FirebaseService],
  exports: [FirebaseService],
})
export class AppModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
