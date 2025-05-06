// src/components/canvas/PhysicsEngine.tsx

import Matter from 'matter-js';
import { useMindMapStore } from '../../state/useMindMapStore';

const engine = Matter.Engine.create({ enableSleeping: false });
const world = engine.world;

const physics = (entities: any, { time }: any) => {
    Matter.Engine.update(engine, time.delta);

    const { updateNodePosition } = useMindMapStore.getState();

    Object.keys(entities).forEach((key) => {
        if (key === 'physics') return;

        const { body, node } = entities[key];
        if (body && node) {
            // Update node position in the store
            updateNodePosition(node.id, body.position.x, body.position.y);

            // Soft balloon-style pushing
            Object.keys(entities).forEach((otherKey) => {
                if (otherKey === 'physics' || otherKey === key) return;

                const other = entities[otherKey];
                const dx = body.position.x - other.body.position.x;
                const dy = body.position.y - other.body.position.y;
                const distance = Math.hypot(dx, dy);
                const minDistance = 50 + 10; // NODE_SIZE + SPACING

                if (distance < minDistance && distance > 0) {
                    const angle = Math.atan2(dy, dx);
                    const force = 0.005;
                    const fx = Math.cos(angle) * force;
                    const fy = Math.sin(angle) * force;

                    Matter.Body.applyForce(body, body.position, { x: fx, y: fy });
                    Matter.Body.applyForce(other.body, other.body.position, { x: -fx, y: -fy });
                }
            });
        }
    });

    return entities;
};

export { engine, world, physics };
