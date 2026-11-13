# Particle Entity & LayoutContainer Analysis

## 1. Initial Issue Analysis

### Observed Behavior (`Screenshot from 2026-11-13 11-40-36.png`)
* In the initial implementation, particle triangles rendered in the canvas center appeared horizontally sliced/truncated at the top (a flat apex) and had stepped vertical edges on the left.
* **Diagnosis:** The geometry was **not** being clipped or culled by WebGL, masks, or canvas boundaries. Instead, it was an optical illusion caused by 100 differently-sized particles stacked on top of each other at the exact same position (`centerCoordinate`):
  1. **Flat apex cut:** Each triangle was drawn with `.poly([dimension * 0.5, 0, dimension, dimension, 0, dimension])`. With random `dimension` values between 25px and 50px, the apex Y was always `0`, but the apex X varied from `12.5px` to `25px`. Overlapping 100 triangles with apexes spread across a 12.5px line formed a flat horizontal edge instead of a single sharp point.
  2. **Stepped edges:** Smaller triangles ended at smaller heights (e.g., `y = 25`), exposing the underlying edges of larger triangles (up to `y = 50`).
  3. **No tick loop:** Particles were generated with `velocity` and `acceleration`, but remained frozen at the spawn point because no frame ticker was advancing `position.x += velocity.x`.

---

## 2. Validation of the `LayoutContainer` Solution (`Screenshot from 2026-11-13 12-32-41.png`)

### Implementation
```jsx
// source/Route_/Home.js
const ParticleEntity = ({ particleEntity }) => {
  const { dimension, position, color } = particleEntity;

  useExtend({ LayoutContainer, Graphics });

  return (
    <pixiLayoutContainer
      layout={{
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 0x00ff00
      }}
      position={position}
    >
      <pixiGraphics
        draw={(graphics) =>
          graphics
            .clear()
            .poly([dimension * 0.5, 0, dimension, dimension, 0, dimension])
            .fill({ color })
        }
        layout={{}}
      />
    </pixiLayoutContainer>
  );
};
```
With spawn offset in `particleGenerate`:
```javascript
position: {
  x: centerCoordinate.x - dimension * 0.5,
  y: centerCoordinate.y - dimension * 0.5
}
```

### Why This Works
1. **Bounding Box Isolation:** Each particle is placed inside its own isolated layout box measuring `dimension × dimension`.
2. **Flex Centering:** With `justifyContent: 'center'` and `alignItems: 'center'`, Yoga centers the `pixiGraphics` element inside the container. Since each triangle is symmetrical within its bounding box, all 100 apexes now line up along the exact same vertical center axis.
3. **Spawn Offset:** Offsetting the container's spawn position by `-dimension * 0.5` aligns the visual center of every container to `centerCoordinate`.
4. **Visual Result:** The apex is sharp and concentric, and the debug outline (`0x00ff00`) confirms proper alignment.

---

## 3. Practical Considerations & Guidelines

### Performance & Scaling
* **Current Scale (100 particles):** Runs smoothly at **~60 FPS (59.9 – 60.2 FPS)**.
* **Internal Overhead:** Each `LayoutContainer` creates a Yoga WASM node, an overflow container, background graphics, mask graphics, stroke graphics, and a trackpad listener. 100 particles equal ~400+ display objects and 100 Yoga layout nodes.
* **Scale Guideline:** 
  * **50–200 particles:** Perfectly fine on desktop browsers; development comfort and ergonomics outweigh the overhead.
  * **500+ particles:** Yoga recalculation and display object depth will become a CPU bottleneck. If you need massive particle counts later, consider lightweight alternatives.

### Animation & Physics Loop Best Practices
When implementing the movement loop (`useTick` / `requestAnimationFrame`):
* **Update Pixi Transforms Directly:** Modify `particle.position.x += velocity.x` directly on the Pixi container instance or state.
* **Keep `layout` Static:** Avoid modifying or recalculating the `layout={{ ... }}` prop every frame to prevent unnecessary Yoga layout recomputations in WASM during high-speed motion.

### Production Clean-up
* When done debugging alignment, set `borderWidth: 0` (or remove `borderColor` / `borderWidth`) on the `<pixiLayoutContainer>` to hide the green debug bounding box.

---

## 4. Alternative Lightweight Reference (For Future High-Count Systems)

If you ever need hundreds or thousands of particles without the `LayoutContainer` overhead, you can achieve the exact same centering purely via local vertex math in a single `pixiGraphics`:

```javascript
const half = dimension * 0.5;

graphics
  .clear()
  .poly([
     0,    -half,  // Apex (centered at 0)
     half,  half,  // Bottom-Right
    -half,  half   // Bottom-Left
  ])
  .fill({ color });
```
With this coordinate setup, `position={centerCoordinate}` requires no position offset or layout wrapper because `(0, 0)` is already the geometric center.
