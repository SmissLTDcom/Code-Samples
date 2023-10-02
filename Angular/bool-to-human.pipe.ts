import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "boolToHuman",
})
export class BoolToHumanPipe implements PipeTransform {
  transform(value: unknown, ...args: unknown[]): unknown {
    return value ? "Yes" : "No";
  }
}
