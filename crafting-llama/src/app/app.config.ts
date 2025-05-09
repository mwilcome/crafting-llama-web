import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { loadingInterceptorFn } from '@core/loading.interceptor.fn';
import {provideRouter} from "@angular/router";
import {routes} from "./app.routes";
import {ApplicationConfig} from "@angular/core";

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
        withInterceptors([loadingInterceptorFn])
    )
  ]
};
