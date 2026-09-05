import { useRef } from 'react';
import { useExtend } from '@pixi/react';
import { LayoutContainer } from '@pixi/layout/components';
import * as pixiJs from 'pixi.js';
import { Graphics } from 'pixi.js';

const Arrow = () => {
  useExtend({ LayoutContainer, Graphics });

  return (
    <pixiLayoutContainer
      label='Arrow'
      layout={{
        borderWidth: 1,
        borderColor: 0x00ff00
      }}
    >
      <pixiGraphics
        draw={(graphics) =>
          graphics
            .moveTo(0, 0)
            .lineTo(-10, -10)
            .moveTo(0, 0)
            .lineTo(-10, 10)
            .moveTo(0, 0)
            .lineTo(-30, 0)
            .stroke({ width: 4, color: 0x00ff00 })
        }
        layout={{}}
      />
    </pixiLayoutContainer>
  );
};

const Home = () => {
  useExtend({ LayoutContainer });

  const ref = useRef(undefined);

  /** @type {(event: pixiJs.FederatedPointerEvent) => void} */
  const onPointerMoveHandle = ({ global, currentTarget }) => {
    const arrowElement = currentTarget.getChildAt(0);

    Object.assign(
      currentTarget.getChildAt(0),
      /** @type {pixiJs.ContainerOptions} */ ({
        rotation: (() => {
          const { x, y } = global;

          const {
            layout: { realX, realY }
          } = arrowElement;

          return Math.atan2(y - realY, x - realX);
        })()
      })
    );
  };

  return (
    <pixiLayoutContainer
      ref={ref}
      layout={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 0xff0000
      }}
      eventMode='static'
      cursor='pointer'
      onPointerMove={onPointerMoveHandle}
    >
      <Arrow />
    </pixiLayoutContainer>
  );
};

export default Home;
