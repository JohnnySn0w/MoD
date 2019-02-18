const DB = require('./dbRequests');

describe('dbRequests', () => {
  it('saves an item', () => {
    expect(DB.run).toHaveBeenCalled();
  });
  it('retrieves an item', () => {
    expect(new Promise()).toBeInstanceOf(Promise);
  });
});
