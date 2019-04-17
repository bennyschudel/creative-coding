const range = (min = 0, max = 1, step = 0.001) => ({
  type: 'range',
  min,
  max,
  step,
});

const select = (values = []) => ({
  type: 'select',
  values,
});

export const schema = {
  cols: range(1, 40, 1),
  rows: range(1, 40, 1),
  cows: range(1, 10, 1),
  hGap: range(0, 400, 1),
  vGap: range(0, 400, 1),
  zGap: range(0, 400, 1),
  itemWidth: range(0, 400, 1),
  itemHeight: range(0, 400, 1),
  itemDepth: range(0, 400, 1),
  // zGap: range(0, 400, 1),
};

export const state = {
  cols: 10,
  rows: 10,
  cows: 1,
  vGap: 100,
  hGap: 100,
  zGap: 100,
  itemHeight: 20,
  itemWidth: 20,
  itemDepth: 20,
};
