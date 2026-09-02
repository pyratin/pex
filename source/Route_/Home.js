import { useRef, useEffect } from 'react';
import { useExtend } from '@pixi/react';
import { LayoutContainer } from '@pixi/layout/components';
import * as pixiJs from 'pixi.js';
import { Graphics } from 'pixi.js';

const dimension = 200;

const LayoutContainer_ = () => {
  useExtend({ LayoutContainer, Graphics });

  const ref = useRef(undefined);

  useEffect(() => {
    const refCurrent = /** @type {pixiJs.Container} */ (ref.current);

    refCurrent.getChildAt(0).setMask({
      mask: refCurrent.getChildAt(1).getChildAt(0),
      inverse: true
    });
  }, []);

  return (
    <pixiLayoutContainer
      ref={ref}
      layout={{
        position: 'relative',
        borderWidth: 0,
        borderColor: 0x00ff00
      }}
    >
      <pixiGraphics
        draw={(graphics) =>
          graphics.rect(0, 0, dimension, dimension).fill({ color: 0x00ff00 })
        }
        layout={{}}
      />

      <pixiLayoutContainer
        layout={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <pixiGraphics
          draw={(graphics) =>
            graphics.star(0, 0, 5, dimension / 2).fill({ color: 0x0000ff })
          }
          layout={{}}
        />
      </pixiLayoutContainer>
    </pixiLayoutContainer>
  );
};

const Home = () => {
  useExtend({ LayoutContainer });

  return (
    <pixiLayoutContainer
      layout={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 0,
        borderColor: 0xff0000
      }}
    >
      <LayoutContainer_ />
    </pixiLayoutContainer>
  );
};

export default Home;
