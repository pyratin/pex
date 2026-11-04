import { useRef, useState, useCallback, useEffect } from 'react';
import { useExtend, useApplication } from '@pixi/react';
import { LayoutContainer } from '@pixi/layout/components';
import * as pixiJs from 'pixi.js';
import { Assets, Texture, Sprite, Graphics } from 'pixi.js';

const Sprite_ = ({ scaleFactor }) => {
  useExtend({ LayoutContainer, Sprite });

  const [texture, textureSet] = useState(Texture.EMPTY);

  useEffect(() => {
    Assets.load('/asset/image/bunny.png').then((texture) => {
      Object.assign(
        texture.source,
        /** @type {pixiJs.TextureSourceOptions} */ ({
          scaleMode: 'nearest',
          resolution: 1 / 3
        })
      );

      /** @type {pixiJs.Texture} */ (texture).update();

      textureSet(texture);
    });
  }, []);

  return (
    <pixiLayoutContainer
      layout={{
        borderWidth: 1,
        borderColor: 0x00ff00
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
                [key]: (scaleFactor + 1) * value + value
              }),
              {}
            );
          })()
        }}
      />
    </pixiLayoutContainer>
  );
};

const controlDimension = (() => {
  const height = 32;

  return { width: height * (height * 0.25), height };
})();

const controlStrokeWidth = 4;

const dragDefinitionInitial = {
  pointerId: undefined,
  offset: { x: undefined, y: undefined }
};

const Control = ({ scaleFactorSet }) => {
  useExtend({ LayoutContainer, Graphics });

  const {
    app: { stage, screen }
  } = useApplication();

  const ref = useRef(undefined);

  const dragDefinitionRef = useRef(dragDefinitionInitial);

  useEffect(() => {
    const { width, height } = controlDimension;

    Object.assign(
      /** @type {pixiJs.Container} */ (ref.current)?.getChildAt(1),
      /** @type {pixiJs.ContainerOptions} */ ({
        position: { x: (width - height) * 0.5, y: 0 }
      })
    );
  }, []);

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
  const onPointerMoveHandle = useCallback(
    ({ pointerId, global }) => {
      const {
        current: { pointerId: _pointerId, offset }
      } = dragDefinitionRef;

      pointerId === _pointerId &&
        (() => {
          const refCurrentGraphics_ = /** @type {pixiJs.Container} */ (
            ref.current
          ).getChildAt(1);

          Object.assign(
            refCurrentGraphics_,
            /** @type {pixiJs.ContainerOptions} */ ({
              position: (() => {
                const _x = (() => {
                  const { x } = refCurrentGraphics_.parent.toLocal(global);

                  const { x: _x } = offset;

                  return x + _x;
                })();

                const { width, height } = controlDimension;

                const x = Math.max(0, Math.min(_x, width - height));

                scaleFactorSet((x / (width - height) - 0.5) * 2);

                return { x, y: 0 };
              })()
            })
          );
        })();
    },
    [scaleFactorSet]
  );

  /** @type {(event: pixiJs.FederatedPointerEvent) => void} */
  const onPointerDownHandle = ({ pointerId, global, currentTarget }) => {
    Object.assign(dragDefinitionRef, {
      current: /** @type {typeof dragDefinitionInitial} */ ({
        pointerId,
        offset: (() => {
          const {
            position: { x }
          } = currentTarget;

          const { x: _x } = currentTarget.parent.toLocal(global);

          return { x: x - _x };
        })()
      })
    });

    stage.on('pointermove', onPointerMoveHandle);
  };

  /** @type {(event: pixiJs.FederatedPointerEvent) => void} */
  const onPointerUpHandle = ({ pointerId }) => {
    const {
      current: { pointerId: _pointerId }
    } = dragDefinitionRef;

    pointerId === _pointerId &&
      (() => {
        Object.assign(dragDefinitionRef, { current: dragDefinitionInitial });

        stage.off('pointermove', onPointerMoveHandle);
      })();
  };

  return (
    <pixiLayoutContainer
      ref={ref}
      layout={{
        ...controlDimension,
        borderWidth: 0,
        borderColor: 0x00ff00
      }}
    >
      <pixiGraphics
        draw={(graphics) =>
          graphics
            .rect(
              ...(() => {
                const { width, height } = controlDimension;

                return /** @type {const} */ ([0, 0, width, height]);
              })()
            )
            .stroke({
              width: controlStrokeWidth,
              color: 0xffffff,
              alignment: 1
            })
        }
      />

      <pixiGraphics
        draw={(graphics) =>
          graphics
            .rect(
              ...(() => {
                const { height } = controlDimension;

                const _height = height - controlStrokeWidth * 2;

                return /** @type {const} */ ([
                  controlStrokeWidth,
                  controlStrokeWidth,
                  _height,
                  _height
                ]);
              })()
            )
            .fill({ color: 0xffffff })
            .stroke({ width: 1, color: 0x000000, alignment: 1 })
        }
        eventMode='static'
        cursor='pointer'
        onPointerDown={onPointerDownHandle}
        onPointerUp={onPointerUpHandle}
        onPointerUpOutside={onPointerUpHandle}
      />
    </pixiLayoutContainer>
  );
};

const Home = () => {
  useExtend({ LayoutContainer });

  const [scaleFactor, scaleFactorSet] = useState(0);

  return (
    <pixiLayoutContainer
      layout={{
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 10,
        marginBottom: '25%',
        borderWidth: 1,
        borderColor: 0xff0000
      }}
    >
      <Sprite_ scaleFactor={scaleFactor} />

      <Control scaleFactorSet={scaleFactorSet} />
    </pixiLayoutContainer>
  );
};

export default Home;
