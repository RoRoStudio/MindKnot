import Matter from 'matter-js';

// Define interfaces for better type safety
interface PhysicsEntities {
    physics: {
        engine: Matter.Engine;
        world: Matter.World;
    };
    [key: string]: any; // Add index signature for other entities
}

interface TimeInput {
    time: {
        delta: number;
        elapsed: number;
    };
    [key: string]: any; // For other possible inputs
}

// Create a clean engine instance
const engine = Matter.Engine.create({
    enableSleeping: false,
});
const world = engine.world;

// Disable gravity for this type of app
world.gravity.y = 0;
world.gravity.x = 0;

// Keep track of bodies that exist in the world for proper cleanup
const existingBodies = new Set<number>();

const physics = (entities: PhysicsEntities, { time }: TimeInput) => {
    // Safety check
    if (!entities || !entities.physics) {
        return entities;
    }

    // Update physics simulation with appropriate timing
    // Clamp the delta to avoid large time steps
    const delta = Math.min(time.delta, 16.667);
    Matter.Engine.update(engine, delta);

    // Process each entity
    Object.keys(entities).forEach((key) => {
        if (key === 'physics') return;

        const entity = entities[key];
        if (entity && entity.body && entity.node) {
            // Apply repulsion forces between nodes
            Object.keys(entities).forEach((otherKey) => {
                if (otherKey === 'physics' || otherKey === key) return;

                const otherEntity = entities[otherKey];
                if (!otherEntity || !otherEntity.body) return;

                // Skip if either body is static (being dragged)
                if (entity.body.isStatic || otherEntity.body.isStatic) return;

                const dx = entity.body.position.x - otherEntity.body.position.x;
                const dy = entity.body.position.y - otherEntity.body.position.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const minDistance = 60; // Minimum distance between nodes

                if (distance < minDistance && distance > 0) {
                    const angle = Math.atan2(dy, dx);
                    const force = 0.0001; // Even smaller force for smoother effect
                    const fx = Math.cos(angle) * force;
                    const fy = Math.sin(angle) * force;

                    Matter.Body.applyForce(entity.body, entity.body.position, { x: fx, y: fy });
                    Matter.Body.applyForce(otherEntity.body, otherEntity.body.position, { x: -fx, y: -fy });
                }
            });
        }
    });

    return entities;
};

// Expose function to clean up bodies that are no longer needed
const cleanupPhysics = (currentEntityKeys: string[]) => {
    const bodiesInWorld = Matter.Composite.allBodies(world);

    // Remove bodies that no longer have a corresponding entity
    bodiesInWorld.forEach(body => {
        // Skip the default world bounds
        if (body.label === "World Bounds") return;

        // If this body isn't in our current entities, remove it
        if (!currentEntityKeys.includes(body.label)) {
            Matter.World.remove(world, body);
            existingBodies.delete(body.id);
        }
    });
};

export { engine, world, physics, cleanupPhysics, existingBodies };