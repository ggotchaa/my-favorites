import { DecimalFormatterPipe } from './decimal-formatter.pipe';

describe('DecimalFormatterPipe', () => {
  it('create an instance', () => {
    const pipe = new DecimalFormatterPipe();
    expect(pipe).toBeTruthy();
  });
});
