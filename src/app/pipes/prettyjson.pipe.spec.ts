import {PrettyJsonPipe} from "./prettyjson.pipe";

describe('PrettyjsonPipe', () => {
  it('create an instance', () => {
    const pipe = new PrettyJsonPipe();
    expect(pipe).toBeTruthy();
  });
});
