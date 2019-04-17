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
  hGap: range(0, 400, 1),
  vGap: range(0, 400, 1),
  zGap: range(0, 400, 1),
  strokeWeight: range(0.01, 1, 0.01),
  strokeAlpha: range(0, 1, 0.01),
  diameter: range(0.1, 50, 0.01),
  rotation: range(0, 360, 1),
  itemWidth: range(0, 200, 0.01),
  itemHeight: range(0, 200, 0.01),
  faces: range(1, 24, 1),
  renderType: select(['normal', 'wire']),
  blendMode: select([
    'BLEND',
    'DARKEST',
    'LIGHTEST',
    'DIFFERENCE',
    'MULTIPLY',
    'EXCLUSION',
    'SCREEN',
    'REPLACE',
    'OVERLAY',
    'HARD_LIGHT',
    'SOFT_LIGHT',
    'DODGE',
    'BURN',
    'ADD',
    'SUBTRACT',
  ]),
};

export const state = {
  cols: 10,
  rows: 10,
  vGap: 100,
  hGap: 100,
  zGap: 100,
  strokeWeight: 1,
  strokeAlpha: 1,
  diameter: 10,
  rotation: 0,
  itemWidth: 10,
  itemHeight: 10,
  faces: 8,
  renderType: 'normal',
  palette: [
    [0, 0, 0],
    [64, 64, 64],
    [128, 128, 128],
    [190, 190, 190],
    [255, 255, 255],
  ],
  blendMode: 'BLEND'
};
