import { PrettyjsonPipe } from './prettyjson.pipe';

describe('PrettyjsonPipe', () => {
  it('create an instance', () => {
    const pipe = new PrettyjsonPipe();
    expect(pipe).toBeTruthy();
  });
});
