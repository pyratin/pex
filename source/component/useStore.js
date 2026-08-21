import { create } from 'zustand';
import { combine, subscribeWithSelector, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { current, produce } from 'immer';

/** @typedef {ReturnType<typeof stateInitializedGet>} stateType */

/** @typedef {ReturnType<typeof displayDefinitionGet>} displayDefinitionType */

/** @typedef {(state: object) => object} setType */

const displayDefinitionDimensionGet = () => {
  const { innerWidth, innerHeight } = window;

  return { width: innerWidth, height: innerHeight };
};

/** @type {(widthMaximum: number) => number} */
const scaleFactorGet = (widthMaximum) => {
  const { width } = displayDefinitionDimensionGet();

  return Math.min(width / widthMaximum, 1);
};

const displayDefinitionGet = () => {
  const widthMaximum = 707;

  return {
    widthMaximum,
    dimension: displayDefinitionDimensionGet(),
    scaleFactor: scaleFactorGet(widthMaximum)
  };
};

const stateInitializedGet = () => ({
  displayDefinition: displayDefinitionGet()
});

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

          const { widthMaximum } = rest;

          return /** @type {displayDefinitionType} */ ({
            ...rest,
            dimension: displayDefinitionDimensionGet(),
            scaleFactor: scaleFactorGet(widthMaximum)
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

useStore.subscribe(() => {}, _onWindowResizeHandle, { fireImmediately: true });

window.removeEventListener('resize', _onWindowResizeHandle);

window.addEventListener('resize', _onWindowResizeHandle);

export default useStore;
