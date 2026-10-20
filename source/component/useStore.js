import { create } from 'zustand';
import { combine, subscribeWithSelector, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { current, produce } from 'immer';

const displayDimensionGet = () => {
  const { innerWidth, innerHeight } = window;

  return { width: innerWidth, height: innerHeight };
};

/** @type {(widthMaximum: number) => number} */
const displayScaleFactorGet = (widthMaximum) => {
  const { width } = displayDimensionGet();

  return Math.min(width / widthMaximum, 1);
};

const displayDefinitionGet = () => {
  const widthMaximum = 707;

  return {
    widthMaximum,
    dimension: displayDimensionGet(),
    scaleFactor: displayScaleFactorGet(widthMaximum)
  };
};

const stateInitial = {
  displayDefinition: displayDefinitionGet()
};

/** @type {(set: (state: object) => object) => void} */
const onWindowResizeHandle = (set) =>
  set(
    /** @type {(state: object) => object} */
    (state) => {
      const { displayDefinition, ...rest } =
        /** @type {typeof stateInitial} */ (current(state));

      return /** @type {typeof stateInitial} */ ({
        ...rest,
        displayDefinition: produce((displayDefinition) => {
          const rest = /** @type {ReturnType<typeof displayDefinitionGet>} */ (
            current(displayDefinition)
          );

          const { widthMaximum } = rest;

          return /** @type {ReturnType<typeof displayDefinitionGet>} */ ({
            ...rest,
            dimension: displayDimensionGet(),
            scaleFactor: displayScaleFactorGet(widthMaximum)
          });
        })(displayDefinition)
      });
    }
  );

const useStore = create(
  persist(
    subscribeWithSelector(
      immer(
        combine(stateInitial, (set) => ({
          onWindowResizeHandle: () => onWindowResizeHandle(set)
        }))
      )
    ),
    {
      name: 'pex',
      partialize: ({ displayDefinition, ...rest }) => rest
    }
  )
);

const _onWindowResizeHandle = () => {
  const { getState } = useStore;

  const { onWindowResizeHandle } = getState();

  return onWindowResizeHandle();
};

useStore.subscribe(() => {}, _onWindowResizeHandle, { fireImmediately: true });

window.removeEventListener('resize', _onWindowResizeHandle);

window.addEventListener('resize', _onWindowResizeHandle);

export default useStore;
