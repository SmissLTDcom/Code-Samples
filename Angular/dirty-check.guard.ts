import { Injectable } from '@angular/core';
import { CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
export interface CanComponentDeactivate {
  canDeactivate: (nextURL) => Observable<boolean> | Promise<boolean> | boolean;
}
@Injectable({
  providedIn: 'root'
})
export class DirtyCheckGuard implements CanDeactivate<unknown> {
  canDeactivate(
    component: CanComponentDeactivate,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      let nextURL = nextState?.url;
      return component.canDeactivate ? component.canDeactivate(nextURL) : true;
  }
  
}
