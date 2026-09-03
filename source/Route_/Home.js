import React, { useRef, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { useExtend } from '@pixi/react';
import { useShallow } from 'zustand/react/shallow';
import * as pixiLayout from '@pixi/layout';
import { LayoutContainer } from '@pixi/layout/components';
import * as pixiJs from 'pixi.js';
import { Graphics } from 'pixi.js';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { PixiPlugin } from 'gsap/PixiPlugin';

import useStore from '#/component/useStore';
import style from './index.module.scss';

gsap.registerPlugin(useGSAP, PixiPlugin);
PixiPlugin.registerPIXI(pixiJs);

const gridDimension = 50;

/** @type {(index: number) => number} */
const gridOffsetGet = (index) => index * gridDimension;

const strokeDefinition = /** @type {pixiJs.StrokeStyle} */ ({
  width: 1,
  color: 0xcccccc
});

const Grid = () => {
  useExtend({ Graphics });

  const { width, height } = useStore(
    useShallow(
      ({
        displayDefinition: {
          dimension: { width, height }
        }
      }) => ({
        width,
        height
      })
    )
  );

  return (
    <>
      {Array.from({ length: Math.ceil(width / gridDimension) }).map(
        (_, index) => (
          <pixiGraphics
            key={index}
            draw={(graphics) =>
              graphics
                .moveTo(gridOffsetGet(index), 0)
                .lineTo(gridOffsetGet(index), height)
                .stroke(strokeDefinition)
            }
          />
        )
      )}

      {Array.from({ length: Math.ceil(height / gridDimension) }).map(
        (_, index) => (
          <pixiGraphics
            key={index}
            draw={(graphics) =>
              graphics
                .moveTo(0, gridOffsetGet(index))
                .lineTo(width, gridOffsetGet(index))
                .stroke(strokeDefinition)
            }
          />
        )
      )}
    </>
  );
};

const OriginMarker = () => {
  useExtend({ Graphics });

  return (
    <pixiGraphics
      label='OriginMarker'
      draw={(graphics) =>
        graphics
          .moveTo(-10, 0)
          .lineTo(10, 0)
          .moveTo(0, -10)
          .lineTo(0, 10)
          .stroke({ width: 4, color: 0xff0000 })
      }
    />
  );
};

const dimension = { width: 150, height: 100 };

const LayoutContainer_ = () => {
  useExtend({ LayoutContainer });

  const ref = useRef(undefined);

  useGSAP(
    () => {
      gsap.to(ref.current, {
        pixi: { angle: 360 },
        repeat: -1,
        ease: 'none',
        duration: 5
      });
    },
    { dependencies: [] }
  );

  return (
    <pixiLayoutContainer
      ref={ref}
      label='LayoutContainer_'
      layout={{
        position: 'absolute',
        ...dimension,
        borderWidth: 0,
        borderColor: 0x00ff00
      }}
      position={{ x: 100, y: 100 }}
    >
      <pixiGraphics
        draw={(graphics) =>
          graphics
            .rect(
              ...(() => {
                const { width, height } = dimension;

                return /** @type {const} */ ([0, 0, width, height]);
              })()
            )
            .fill({ color: 0x3489db })
            .stroke({ width: 4, color: 0x000000 })
        }
      />

      <OriginMarker />
    </pixiLayoutContainer>
  );
};

const transformOrigininitializedGet = () =>
  Object.values(dimension).map((value) => value / 2);

const Control = ({ transformOrigin, transformOriginSet }) => {
  const definitionCollection = ['x', 'y'].map((key, index) => ({
    key,
    value: transformOrigin[index],
    max: Object.values(dimension)[index]
  }));

  return (
    <div className={style.Control}>
      <h3>Adjust Origin</h3>

      <div>
        {definitionCollection.map(({ key, value, max }, index) => (
          <div key={index}>
            <label htmlFor={key} className='form-label'>
              {key}:
            </label>

            <input
              type='range'
              className='form-range'
              id={key}
              value={value}
              min={0}
              max={max}
              step={5}
              onChange={({ target: { valueAsNumber } }) => {
                transformOriginSet(
                  /** @type {(transformOrigin: number[]) => number[]} */
                  (transformOrigin) => {
                    return transformOrigin.map((value, _index) => {
                      return _index === index ? valueAsNumber : value;
                    });
                  }
                );
              }}
            />
          </div>
        ))}
      </div>

      <button
        className='btn btn-outline-light btn-sm'
        onClick={() => transformOriginSet(transformOrigininitializedGet())}
      >
        Reset
      </button>
    </div>
  );
};

const Home = () => {
  useExtend({ LayoutContainer });

  const ref = useRef(undefined);

  const rootRef = useRef(undefined);

  const [transformOrigin, transformOriginSet] = useState(
    transformOrigininitializedGet()
  );

  useEffect(() => {
    const refCurrent = /** @type {pixiJs.Container} */ (ref.current);

    Object.assign(
      refCurrent.getChildByLabel('LayoutContainer_'),
      /** @type {pixiJs.ContainerOptions} */ ({
        layout: /** @type {pixiLayout.LayoutOptions} */ ({
          transformOrigin: transformOrigin.join(', ')
        })
      })
    );

    Object.assign(
      refCurrent
        .getChildByLabel('LayoutContainer_')
        .getChildByLabel('OriginMarker'),
      /** @type {pixiJs.ContainerOptions} */ ({
        position: transformOrigin.reduce(
          (memo, value, index) => ({
            ...memo,
            [!index ? 'x' : 'y']: value
          }),
          {}
        )
      })
    );
  }, [transformOrigin]);

  useEffect(() => {
    const element = document.createElement('div');

    document.body.appendChild(element);

    Object.assign(
      element.style,
      /** @type {React.CSSProperties} */ ({
        position: 'absolute',
        top: 0,
        right: 0
      })
    );

    const root = createRoot(element);

    Object.assign(rootRef, { current: root });

    return () => {
      root.unmount();

      element.remove();
    };
  }, []);

  useEffect(() => {
    rootRef.current.render(
      <Control
        transformOrigin={transformOrigin}
        transformOriginSet={transformOriginSet}
      />
    );
  }, [transformOrigin]);

  return (
    <pixiLayoutContainer
      ref={ref}
      layout={{
        position: 'relative',
        flex: 1,
        borderWidth: 1,
        borderColor: 0xff0000,
        backgroundColor: 0xffffff
      }}
    >
      <Grid />

      <LayoutContainer_ />
    </pixiLayoutContainer>
  );
};

export default Home;
