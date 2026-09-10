import { useEffect } from 'react';
import { Application, useExtend, useApplication } from '@pixi/react';
import { useShallow } from 'zustand/react/shallow';
import * as pixiLayout from '@pixi/layout';
import { LayoutContainer } from '@pixi/layout/components';
import * as pixiJs from 'pixi.js';

import useStore from '#/component/useStore';

const Application__ = ({ displayDimension, children }) => {
  useExtend({ LayoutContainer });

  const {
    app: { stage }
  } = useApplication();

  useEffect(() => {
    Object.assign(
      stage,
      /** @type {pixiJs.ContainerOptions} */ ({
        layout: /** @type {pixiLayout.LayoutOptions} */ (displayDimension)
      })
    );
  }, [displayDimension, stage]);

  return (
    <pixiLayoutContainer
      layout={{
        flex: 1,
        borderWidth: 0,
        borderColor: 0xff0000
      }}
    >
      {children}
    </pixiLayoutContainer>
  );
};

const Application_ = ({ children }) => {
  const { displayDimension } = useStore(
    useShallow(({ displayDefinition: { dimension } }) => ({
      displayDimension: dimension
    }))
  );

  return (
    <Application
      resizeTo={window}
      useBackBuffer
      antialias
      onInit={({ stage }) =>
        Object.assign(
          stage,
          /** @type {pixiJs.ContainerOptions} */ ({
            layout: /** @type {pixiLayout.LayoutOptions} */ (displayDimension)
          })
        )
      }
    >
      <Application__ displayDimension={displayDimension}>
        {children}
      </Application__>
    </Application>
  );
};

export default Application_;
