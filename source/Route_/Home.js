import { memo, useRef, useState, useEffect } from 'react';
import { useExtend, useApplication } from '@pixi/react';
import '@pixi/layout';
import { LayoutContainer } from '@pixi/layout/components';
import * as pixiJs from 'pixi.js';
import { Assets, Texture, Graphics, Sprite } from 'pixi.js';

const _dimension = 24;

const dimension = { width: 320, height: _dimension };

const borderRadius = 4;

const Sprite_ = ({ scaleFactor }) => {
  useExtend({ LayoutContainer, Sprite });

  const [texture, textureSet] = useState(Texture.EMPTY);

  useEffect(() => {
    Assets.load('/asset/image/bunny.png').then((texture) => {
      Object.assign(
        texture.source,
        /** @type {pixiJs.TextureSourceOptions} */ ({
          scaleMode: 'nearest'
        })
      );

      /** @type {pixiJs.Texture} */ (texture).update();

      textureSet(texture);
    });
  }, []);

  return (
    <pixiLayoutContainer
      layout={{
        position: 'absolute',
        marginBottom: 50,
        borderWidth: 0,
        borderColor: 0x0000ff
      }}
    >
      <pixiSprite
        texture={texture}
        layout={{
          ...(() => {
            const { width, height } = texture;

            return Object.entries({ width, height }).reduce(
              (memo, [key, value]) => ({
                ...memo,
                [key]: value * 3 * (scaleFactor + 2)
              }),
              {}
            );
          })()
        }}
      />
    </pixiLayoutContainer>
  );
};

const RangeControl_ = ({ scaleFactorSet }) => {
  useExtend({ LayoutContainer, Graphics });

  const {
    app: { stage, screen }
  } = useApplication();

  const ref = useRef(undefined);

  const pointerIdRef = useRef(undefined);

  useEffect(() => {
    Object.assign(
      stage,
      /** @type {pixiJs.ContainerOptions} */ ({
        eventMode: 'static',
        hitArea: screen
      })
    );
  }, [stage, screen]);

  /** @type {(event: pixiJs.FederatedPointerEvent) => void} */
  const onPointerMoveHandle = ({ pointerId, global }) => {
    const { current: _pointerId } = pointerIdRef;

    pointerId === _pointerId &&
      (() => {
        const refCurrent = /** @type {pixiJs.Container} */ (ref.current);

        const refCurrentGraphics = /** @type {pixiJs.Graphics} */ (
          refCurrent.getChildAt(0)
        );

        Object.assign(
          refCurrentGraphics,
          /** @type {pixiJs.ContainerOptions} */ ({
            position: (() => {
              return /** @type {{ x: number; y: number }} */ ({
                x: (() => {
                  const { x: _x } = refCurrent.toLocal(global);

                  const { width } = dimension;

                  const x = Math.max(0, Math.min(_x, width - _dimension));

                  scaleFactorSet((x / (width - _dimension) - 0.5) * 2);

                  return x;
                })(),
                y: (() => {
                  const {
                    position: { y }
                  } = refCurrentGraphics;

                  return y;
                })()
              });
            })()
          })
        );
      })();
  };

  /** @type {(event: pixiJs.FederatedPointerEvent) => void} */
  const onPointerDownHandle = ({ pointerId }) => {
    Object.assign(pointerIdRef, { current: pointerId });

    stage.on('pointermove', onPointerMoveHandle);
  };

  /** @type {(event: pixiJs.FederatedPointerEvent) => void} */
  const onPointerUpHandle = ({ pointerId }) => {
    const { current: _pointerId } = pointerIdRef;

    pointerId === _pointerId &&
      (() => {
        Object.assign(pointerId, { current: undefined });

        stage.off('pointermove', onPointerMoveHandle);
      })();
  };

  return (
    <pixiLayoutContainer
      ref={ref}
      layout={{
        ...dimension,
        borderWidth: 1,
        borderColor: '#ffffff55',
        borderRadius
      }}
    >
      <pixiGraphics
        draw={(graphics) =>
          graphics
            .roundRect(0, 0, _dimension, _dimension, borderRadius)
            .fill({ color: 0xffffff })
        }
        position={(() => {
          const { width } = dimension;

          return { x: (width - _dimension) / 2, y: 0 };
        })()}
        alpha={0.5}
        eventMode='static'
        cursor='pointer'
        onPointerDown={onPointerDownHandle}
        onPointerUp={onPointerUpHandle}
        onPointerUpOutside={onPointerUpHandle}
      />
    </pixiLayoutContainer>
  );
};

const RangeControl = memo(RangeControl_);

const Home = () => {
  useExtend({ LayoutContainer });

  const [scaleFactor, scaleFactorSet] = useState(0);

  return (
    <pixiLayoutContainer
      layout={{
        position: 'relative',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingBottom: 100,
        borderWidth: 0,
        borderColor: 0xff0000
      }}
    >
      <Sprite_ scaleFactor={scaleFactor} />

      <RangeControl scaleFactorSet={scaleFactorSet} />
    </pixiLayoutContainer>
  );
};

export default Home;
