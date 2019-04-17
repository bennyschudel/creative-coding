import canvasSketch from 'canvas-sketch';
import p5 from 'p5';
import * as dat from 'dat.gui';
import nanoKontrol from 'korg-nano-kontrol';
import _ from 'lodash';

import easyCamInstall from '../lib/p5.easycam';
import uBit from '../lib/microBit';

import { schema, state } from './card.store';

const Dw = easyCamInstall(p5);

let microbit = undefined;

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
    'vGap',
    'hGap',
    'zGap',
    'strokeWeight',
    'strokeAlpha',
    'rotation',
    'faces',
    'itemWidth',
    'itemHeight',
    'renderType',
  ].forEach(addGuiOption);

  const slidersMap = [
    'cols',
    'rows',
    'vGap',
    'hGap',
    'zGap',
    'itemWidth',
    'itemHeight',
    'faces',
  ];
  const knobsMap = ['rotation', 'strokeWeight', 'strokeAlpha'];

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
            state.renderType = value ? 'wire' : 'normal';
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

  // setup microbit
  microbit = new uBit();

  gui
    .add(
      {
        searchDevice() {
          microbit.searchDevice();
        },
      },
      'searchDevice',
    )
    .name('Connect microBit');
};

const settings = {
  p5: { p5, preload },
  context: 'webgl',
  animate: true,
  fps: 30,
  attributes: {
    antialias: false,
  },
};

canvasSketch(({ p5, width, height }) => {
  // setup
  function loadColormind() {
    var url = 'http://colormind.io/api/';
    var data = {
      model: 'default'
    };

    var http = new XMLHttpRequest();

    http.onreadystatechange = function() {
      if (http.readyState == 4 && http.status == 200) {
        state.palette = JSON.parse(http.responseText).result;
      }
    };

    http.open('POST', url, true);
    http.send(JSON.stringify(data));
  }

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

  const readAcceleration = _.throttle(function() {
    const a = microbit.getAccelerometer();

    const x = p5.map(a.x, -1040, 1040, 0, 360);
    const y = p5.map(a.y, -1040, 1040, 0, 360);
    const z = p5.map(a.z, -1040, 1040, 0, 360);

    return { x, y, z };
  }, 100);

  const easycam = p5.createEasyCam({ distance: 200 });

  loadColormind();

  p5.angleMode(p5.DEGREES);

  // draw
  return ({ time, width, height }) => {
    const {
      cols,
      rows,
      vGap,
      hGap,
      zGap,
      strokeWeight,
      strokeAlpha,
      diameter,
      rotation,
      itemWidth,
      itemHeight,
      faces,
      renderType,
      palette,
      blendMode,
    } = state;

    const a = readAcceleration();
    const grid = makeGrid3d(cols, rows, 5);

    p5.clear();
    p5.background(255);

    if (renderType === 'wire') {
      p5.noFill();
      p5.stroke(255);
      p5.strokeWeight(strokeWeight);
    } else {
      p5.fill(255);
      p5.noStroke();
    }

    // p5.blendMode(p5[blendMode]);

    p5.ambientLight(100);
    p5.pointLight(255, 255, 255, 0, 0, 0);

    let gridWidth = (cols - 1) * hGap;
    let gridHeight = (rows - 1) * vGap;

    // p5.translate(width / 2, height / 2, 0);

    p5.push();
    p5.translate(-(gridWidth / 2), -(gridHeight / 2));

    const dirY = (p5.mouseY / height - 0.5) * 2;
    const dirX = (p5.mouseX / width - 0.5) * 2;
    p5.directionalLight(250, 250, 250, dirX, -dirY, 0);

    p5.randomSeed(2);

    grid.forEach(p => {
      p5.push();
      p5.rectMode(p5.CENTER);
      p5.translate(p.x * hGap, p.y * vGap, p.z * zGap);
      p5.rotate(rotation);
      
      // p5.fill(palette[p5.int(p5.random(5))]);
      // p5.rect(0, 0, itemWidth, itemHeight);

      p5.ambientMaterial(...palette[p5.int(p5.random(5))]);
      // p5.sphere(itemWidth, faces, faces);
      p5.box(itemWidth, itemHeight, 40 + p5.random(-20, 20));
      p5.pop();
    });

    p5.pop();
  };
}, settings);
