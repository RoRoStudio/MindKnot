import React, { useEffect, useState, useRef, useCallback } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { GameEngine } from 'react-native-game-engine';
import Matter from 'matter-js';
import { useMindMapStore } from '../../state/useMindMapStore';
import NodeCard from '../nodes/NodeCard';
import { engine, world, physics, cleanupPhysics, existingBodies } from './PhysicsEngine';

const NODE_SIZE = 50;
const { width, height } = Dimensions.get('window');

// Add interfaces for entity objects
interface GameEntity {
    body: Matter.Body;
    node: any;
    size: [number, number];
    color: string;
    renderer: React.FC<any>;
}

interface Entities {
    physics: {
        engine: Matter.Engine;
        world: Matter.World;
    };
    [key: string]: GameEntity | { engine: Matter.Engine; world: Matter.World };
}

export default function Canvas() {
    // Use individual selectors for better performance and proper context
    const nodes = useMindMapStore(state => state.nodes);
    const addNode = useMindMapStore(state => state.addNode);

    const [gameEngineKey, setGameEngineKey] = useState(0);
    const gameEngineRef = useRef(null);

    // Prepare entities based on nodes - make it memoized
    const prepareEntities = useCallback((): Entities => {
        console.log("Preparing entities for", nodes.length, "nodes");

        // Base entity with physics engine
        const entities: Entities = {
            physics: { engine, world }
        };

        // Track current entity IDs for cleanup
        const currentEntityKeys: string[] = ['physics'];

        // Create entities for each node
        nodes.forEach((node) => {
            // Use node ID as the entity key and Matter body label
            const entityKey = node.id;
            currentEntityKeys.push(entityKey);

            // Check if this body already exists in the world
            const existingBody = Matter.Composite.allBodies(world).find(
                body => body.label === entityKey
            );

            let body;

            if (existingBody) {
                // Use existing body, just update position if needed
                body = existingBody;

                // Prevent updating position if being dragged
                if (!body.isStatic) {
                    Matter.Body.setPosition(body, { x: node.x, y: node.y });
                }
            } else {
                // Create a new body
                body = Matter.Bodies.circle(node.x, node.y, NODE_SIZE / 2, {
                    label: entityKey,
                    restitution: 0.2,
                    frictionAir: 0.2,
                    friction: 0.1,
                });

                // Add to world
                Matter.World.add(world, body);
                console.log("Added new body to world:", entityKey);
            }

            // Create entity for this node
            entities[entityKey] = {
                body,
                node,
                size: [NODE_SIZE, NODE_SIZE],
                color: node.color,
                renderer: NodeCard
            } as GameEntity;
        });

        // Clean up any bodies that don't have entities anymore
        cleanupPhysics(currentEntityKeys);

        return entities;
    }, [nodes]);

    // Reset the game engine when nodes change
    useEffect(() => {
        try {
            // Refresh the game engine to avoid stale references
            setGameEngineKey(prev => prev + 1);
        } catch (err) {
            console.error("Error updating game engine:", err);
        }
    }, [nodes.length]); // Only recreate when nodes array length changes

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            try {
                // Clear all physics bodies
                Matter.World.clear(world, false);
                Matter.Engine.clear(engine);
            } catch (err) {
                console.error("Error cleaning up physics:", err);
            }
        };
    }, []);

    return (
        <View style={styles.canvasWrapper}>
            <GameEngine
                key={gameEngineKey}
                ref={gameEngineRef}
                style={styles.gameEngine}
                systems={[physics]}
                entities={prepareEntities()}
                running={true}
            />
        </View>

    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
    },
    canvasWrapper: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    gameEngine: {
        flex: 1,
        backgroundColor: 'transparent',
    },
});