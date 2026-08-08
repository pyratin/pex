import { create } from 'zustand';
import { combine, subscribeWithSelector, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { current, produce } from 'immer';

/** @typedef {ReturnType<typeof stateInitializedGet>} stateType */

/** @typedef {ReturnType<typeof displayDefinitionGet>} displayDefinitionType */

/** @typedef {(state: object) => object} setType */

const windowVisualViewportDimensionGet = () => {
  const {
    visualViewport: { width, height }
  } = window;

  return { width, height };
};

/** @type {(widthMinimum: number) => number} */
const scaleFactorGet = (widthMinimum) => {
  const { width } = windowVisualViewportDimensionGet();

  return Math.min(width / widthMinimum, 1);
};

const displayDefinitionGet = () => {
  const widthMinimum = 707;

  const dimension = windowVisualViewportDimensionGet();

  return {
    widthMinimum,
    dimension,
    scaleFactor: scaleFactorGet(widthMinimum)
  };
};

const stateInitializedGet = () => {
  const displayDefinition = displayDefinitionGet();

  return { displayDefinition };
};

/** @type {(set: setType) => void} */
const onWindowResizeHandle = (set) =>
  set(
    /** @type {setType} */
    (state) => {
      const { displayDefinition, ...rest } = /** @type {stateType} */ (
        current(state)
      );

      return /** @type {stateType} */ ({
        ...rest,
        displayDefinition: produce((displayDefinition) => {
          const rest = /** @type {displayDefinitionType} */ (
            current(displayDefinition)
          );

          const { widthMinimum } = rest;

          return /** @type {displayDefinitionType} */ ({
            ...rest,
            dimension: windowVisualViewportDimensionGet(),
            scaleFactor: scaleFactorGet(widthMinimum)
          });
        })(displayDefinition)
      });
    }
  );

const useStore = create(
  persist(
    subscribeWithSelector(
      immer(
        combine(stateInitializedGet(), (set) => ({
          onWindowResizeHandle: () => onWindowResizeHandle(set)
        }))
      )
    ),
    {
      name: 'pex',
      partialize: (state) => {
        const { displayDefinition, ...rest } = state;

        return rest;
      }
    }
  )
);

const _onWindowResizeHandle = () => {
  const { getState } = useStore;

  const { onWindowResizeHandle } = getState();

  onWindowResizeHandle();
};

useStore.subscribe(
  () => {},
  () => _onWindowResizeHandle,
  { fireImmediately: true }
);

window.removeEventListener('resize', _onWindowResizeHandle);

window.addEventListener('resize', _onWindowResizeHandle);

export default useStore;
