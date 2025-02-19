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
import { UsersModule } from './users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { AuthMiddleware } from './modules/auth/auth.middleware';
import { VersionRepositoryService } from './ping/version-repository.service';
import { QuizzController } from './quizz/quizz.controller';
import { QuizzModule } from './quizz/quizz.module';

@Module({
  imports: [
    PingModule,
    FirebaseModule.forRoot({
      googleApplicationCredential: 'src/assets/quizzy-back-firebase-key.json',
    }),
    AuthModule,
    UsersModule,
    QuizzModule,
  ],
  controllers: [AppController, PokemonsController, QuizzController],
  providers: [AppService, VersionRepositoryService],
  exports: [VersionRepositoryService],
})
export class AppModule implements NestModule {
  public configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
