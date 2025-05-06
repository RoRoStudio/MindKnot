import { PhysicsBody, PhysicsWorld, Vector } from '../types/Physics';

export const createPhysicsBody = (x: number, y: number, radius: number): PhysicsBody => {
    return {
        position: { x, y },
        velocity: { x: 0, y: 0 },
        force: { x: 0, y: 0 },
        radius,
        mass: radius * 0.1,
    };
};

export const createPhysicsWorld = (width: number, height: number): PhysicsWorld => {
    const bodies: PhysicsBody[] = [];

    const addBody = (body: PhysicsBody) => {
        bodies.push(body);
    };

    const removeBody = (body: PhysicsBody) => {
        const index = bodies.indexOf(body);
        if (index !== -1) {
            bodies.splice(index, 1);
        }
    };

    const update = () => {
        // Apply repulsion between bodies
        for (let i = 0; i < bodies.length; i++) {
            for (let j = i + 1; j < bodies.length; j++) {
                const bodyA = bodies[i];
                const bodyB = bodies[j];

                const dx = bodyB.position.x - bodyA.position.x;
                const dy = bodyB.position.y - bodyA.position.y;
                const distSq = dx * dx + dy * dy;
                const dist = Math.sqrt(distSq);
                const minDist = bodyA.radius + bodyB.radius;

                // If bodies are overlapping, push them apart
                if (dist < minDist) {
                    // Calculate normalized direction vector
                    const nx = dx / dist;
                    const ny = dy / dist;

                    // Calculate repulsion force (stronger when closer)
                    const force = 0.05 * (minDist - dist);

                    // Apply forces in opposite directions
                    bodyA.velocity.x -= nx * force;
                    bodyA.velocity.y -= ny * force;
                    bodyB.velocity.x += nx * force;
                    bodyB.velocity.y += ny * force;
                }
            }
        }

        // Update positions and apply forces
        for (const body of bodies) {
            // Update position based on velocity
            body.position.x += body.velocity.x;
            body.position.y += body.velocity.y;

            // Apply damping to velocity
            body.velocity.x *= 0.95;
            body.velocity.y *= 0.95;

            // Keep bodies on screen with bouncing
            if (body.position.x - body.radius < 0) {
                body.position.x = body.radius;
                body.velocity.x = Math.abs(body.velocity.x) * 0.5;
            } else if (body.position.x + body.radius > width) {
                body.position.x = width - body.radius;
                body.velocity.x = -Math.abs(body.velocity.x) * 0.5;
            }

            if (body.position.y - body.radius < 0) {
                body.position.y = body.radius;
                body.velocity.y = Math.abs(body.velocity.y) * 0.5;
            } else if (body.position.y + body.radius > height) {
                body.position.y = height - body.radius;
                body.velocity.y = -Math.abs(body.velocity.y) * 0.5;
            }

            // Reset forces
            body.force.x = 0;
            body.force.y = 0;
        }
    };

    return {
        bodies,
        update,
        addBody,
        removeBody
    };
};