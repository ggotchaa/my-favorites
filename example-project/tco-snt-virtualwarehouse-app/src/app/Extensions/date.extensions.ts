export { }

declare global {
  interface Date {
    toYearMonthDateString(): string;
    toDateOnly(): void
    dateIsActual(): boolean

  }
}

Date.prototype.toYearMonthDateString = function (): string {
  var mm = this.getMonth() + 1;
  var dd = this.getDate();

  return [this.getFullYear(),
  (mm > 9 ? '' : '0') + mm,
  (dd > 9 ? '' : '0') + dd]
    .join('-');
}

Date.prototype.toDateOnly = function (): void {
  this.setHours(0);
  this.setMinutes(0);
  this.setSeconds(0);
}

Date.prototype.dateIsActual = function (): boolean {
  let dateNow = new Date();
  return dateNow.toYearMonthDateString() === this.toYearMonthDateString();
}
