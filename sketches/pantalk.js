import canvasSketch from 'canvas-sketch';
import p5 from 'p5';
import * as dat from 'dat.gui';
import nanoKontrol from 'korg-nano-kontrol';

import { schema, state } from './pantalk.store';

import easyCamInstall from '../lib/p5.easycam';

const Dw = easyCamInstall(p5);

const preload = p5 => {
  // setup gui
  const gui = new dat.GUI();

  const redraw = () => {
    p5.redraw();
  };

  const addGuiOption = name => {
    const { type, values, min, max, step } = schema[name];

    let option;

    switch (type) {
      case 'range':
        option = gui.add(state, name, min, max, step);
        break;
      case 'select':
        option = gui.add(state, name, values);
        break;
    }

    option.listen().onChange();
  };

  [
    'cols',
    'rows',
    'cows',
    'vGap',
    'hGap',
    'zGap',
    'itemWidth',
    'itemHeight',
    'itemDepth',
  ].forEach(addGuiOption);

  const slidersMap = [
    'cols',
    'rows',
    'cows',
    'vGap',
    'hGap',
    'zGap',
    'itemWidth',
    'itemHeight',
    'itemDepth',
  ];
  const knobsMap = [];

  // setup nanoKontrol
  nanoKontrol
    .connect()
    .then(function(device) {
      console.log('connect! ' + device.name);

      const mapToRange = (value, { min, max, step }) => {
        let v = min + (max - min) * value;
        v = Math.round(v / step) * step;

        return v;
      };

      const handleRangeChange = map => {
        return function(value) {
          value = value / 127;

          const index = Number(this.event.split(':').pop());
          const key = map[index];

          if (key === undefined) {
            return;
          }

          state[key] = mapToRange(value, schema[key]);

          redraw();
        };
      };

      const handleButtonChange = function(value) {
        const parts = this.event.split(':');
        const index = Number(parts.pop());
        const ab = parts.pop();

        if (ab === 'b') {
          if (index === 0) {
            // state.renderType = value ? 'wire' : 'normal';
          }
        }

        redraw();
      };

      device.on('slider:*', handleRangeChange(slidersMap));
      device.on('knob:*', handleRangeChange(knobsMap));
      device.on('button:**', handleButtonChange);
    })
    .catch(err => {
      console.error(err);
    });
};

const settings = {
  p5: { p5, preload },
  context: 'webgl',
  animate: true,
  fps: 30,
  attributes: {
    antialias: true,
  },
};

canvasSketch(({ p5, width, height }) => {
  function makeGrid2d(xCount, yCount) {
    const points = [];

    for (let y = 0; y < yCount; y++) {
      for (let x = 0; x < xCount; x++) {
        points.push({ x, y });
      }
    }

    return points;
  }

  function makeGrid3d(xCount, yCount, zCount = 1) {
    const points = [];

    for (let z = 0; z < zCount; z++) {
      for (let y = 0; y < yCount; y++) {
        for (let x = 0; x < xCount; x++) {
          points.push({ x, y, z });
        }
      }
    }

    return points;
  }

  const easycam = p5.createEasyCam({ distance: 200 });

  return ({ time }) => {
    const {
      cols,
      rows,
      cows,
      hGap,
      vGap,
      zGap,
      itemWidth,
      itemHeight,
      itemDepth,
    } = state;

    const grid = makeGrid3d(cols, rows, cows);

    let gridWidth = (cols - 1) * hGap;
    let gridHeight = (rows - 1) * vGap;

    p5.clear();

    p5.ambientLight(100);
    p5.pointLight(255, 255, 255, 0, 0, 0);

    p5.push();
    p5.translate(-(gridWidth / 2), -(gridHeight / 2));

    // p5.fill(0);
    p5.noFill();
    p5.stroke(255);
    p5.strokeWeight(0.2);
    // p5.noStroke();

    grid.forEach(p => {
      p5.push();
      p5.rectMode(p5.CENTER);
      p5.translate(p.x * hGap, p.y * vGap, p.z * zGap);
      // p5.rotate(rotation);
      p5.ambientLight(255, 0, 0);
      // p5.box(itemWidth, itemHeight, itemDepth);
      p5.sphere(itemWidth, 16, 16);
      p5.pop();
    });

    p5.pop();
  };
}, settings);
