export {}

declare global {
  interface String {
    containsNumber(): boolean;
  }
}
  
String.prototype.containsNumber = function (): boolean {
  return /\d/.test(this);
}
  
 