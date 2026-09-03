import { useRef, useState, useEffect } from 'react';
import { useExtend, useApplication } from '@pixi/react';
import { useShallow } from 'zustand/react/shallow';
import { LayoutContainer } from '@pixi/layout/components';
import * as pixiJs from 'pixi.js';
import { Assets, Texture, Sprite } from 'pixi.js';

import useStore from '#/component/useStore';

const dragDefinitionInitialized = {
  pointerId: undefined,
  offset: { x: undefined, y: undefined }
};

const LayoutContainer_ = () => {
  useExtend({ LayoutContainer, Sprite });

  const {
    app: { stage, screen }
  } = useApplication();

  const { displayDimension } = useStore(
    useShallow(({ displayDefinition: { dimension } }) => ({
      displayDimension: dimension
    }))
  );

  const ref = useRef(undefined);

  const dragDefinitionRef = useRef(dragDefinitionInitialized);

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
    const {
      current: { pointerId: _pointerId, offset }
    } = dragDefinitionRef;

    pointerId === _pointerId &&
      (() => {
        const refCurrent = /** @type {pixiJs.Container} */ (ref.current);

        Object.assign(
          refCurrent,
          /** @type {pixiJs.ContainerOptions} */ ({
            position: (() => {
              const { x, y } = refCurrent.parent.toLocal(global);

              const { x: _x, y: _y } = offset;

              return { x: x + _x, y: y + _y };
            })()
          })
        );
      })();
  };

  /** @type {(event: pixiJs.FederatedPointerEvent) => void} */
  const onPointerDownHandle = ({ pointerId, global, currentTarget }) => {
    Object.assign(dragDefinitionRef, {
      current: /** @type {typeof dragDefinitionInitialized} */ ({
        pointerId,
        offset: (() => {
          const {
            position: { x, y }
          } = currentTarget;

          const { x: _x, y: _y } = currentTarget.parent.toLocal(global);

          return { x: x - _x, y: y - _y };
        })()
      })
    });

    Object.assign(
      currentTarget,
      /** @type {pixiJs.ContainerOptions} */ ({
        alpha: 0.75
      })
    );

    stage.on('pointermove', onPointerMoveHandle);
  };

  /** @type {(event: pixiJs.FederatedPointerEvent) => void} */
  const onPointerUpHandle = ({ pointerId, currentTarget }) => {
    const {
      current: { pointerId: _pointerId }
    } = dragDefinitionRef;

    pointerId === _pointerId &&
      (() => {
        Object.assign(dragDefinitionRef, {
          current: dragDefinitionInitialized
        });

        Object.assign(
          currentTarget,
          /** @type {pixiJs.ContainerOptions} */ ({
            alpha: 1
          })
        );

        stage.off('pointermove', onPointerMoveHandle);
      })();
  };

  return (
    <pixiLayoutContainer
      ref={ref}
      layout={{
        position: 'absolute',
        borderWidth: 1,
        borderColor: 0x00ff00
      }}
      position={(() => {
        const { width, height } = displayDimension;

        const { width: _width, height: _height } = texture;

        return /** @type {{ x: number; y: number }} */ (
          Object.entries({
            x: width - _width,
            y: height - _height
          }).reduce(
            (memo, [key, value]) => ({
              ...memo,
              [key]: Math.random() * value
            }),
            {}
          )
        );
      })()}
      eventMode='static'
      cursor='pointer'
      onPointerDown={onPointerDownHandle}
      onPointerUp={onPointerUpHandle}
      onPointerUpOutside={onPointerUpHandle}
    >
      <pixiSprite texture={texture} layout={{}} />
    </pixiLayoutContainer>
  );
};

const Home = () => {
  useExtend({ LayoutContainer });

  return (
    <pixiLayoutContainer
      layout={{
        flex: 1,
        position: 'relative',
        borderWidth: 1,
        borderColor: 0xff0000
      }}
    >
      {Array.from({ length: 10 }).map((_, index) => (
        <LayoutContainer_ key={index} />
      ))}
    </pixiLayoutContainer>
  );
};

export default Home;
