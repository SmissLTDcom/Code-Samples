import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "onlyActive",
  pure: false,
})
export class OnlyActivePipe implements PipeTransform {
  transform(value: unknown, ...args: unknown[]): unknown {
    if (Array.isArray(value)) return value.filter((e) => e.isActive);
    else return value;
  }
}
