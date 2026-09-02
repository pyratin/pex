import { create } from 'zustand';
import { combine, subscribeWithSelector, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { current, produce } from 'immer';

/** @typedef {ReturnType<typeof stateInitializedGet>} stateType */

/** @typedef {ReturnType<typeof displayDefinitionGet>} displayDefinitionType */

/** @typedef {(state: object) => object} setType */

const displayDimensionGet = () => {
  const { innerWidth, innerHeight } = window;

  return { width: innerWidth, height: innerHeight };
};

/** @type {(widMaximum: number) => number} */
const scaleFactorGet = (widMaximum) => {
  const { width } = displayDimensionGet();

  return Math.min(width / widMaximum, 1);
};

const displayDefinitionGet = () => {
  const widMaximum = 707;

  return {
    widMaximum,
    dimension: displayDimensionGet(),
    scaleFactor: scaleFactorGet(widMaximum)
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

      return {
        ...rest,
        displayDefinition: produce((displayDefinition) => {
          const rest = /** @type {displayDefinitionType} */ (
            current(displayDefinition)
          );

          const { widMaximum } = rest;

          return /** @type {displayDefinitionType} */ ({
            ...rest,
            dimension: displayDimensionGet(),
            scaleFactor: scaleFactorGet(widMaximum)
          });
        })(displayDefinition)
      };
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
