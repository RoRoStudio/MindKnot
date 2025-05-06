import React, { useEffect, useState, useRef, useCallback } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { GameEngine } from 'react-native-game-engine';
import Matter from 'matter-js';
import { useMindMapStore } from '../../state/useMindMapStore';
import NodeCard from '../nodes/NodeCard';
import { engine, world, physics, cleanupPhysics } from './PhysicsEngine';

const NODE_SIZE = 50;
const { width, height } = Dimensions.get('window');

interface GameEntity {
    body: Matter.Body;
    node: any;
    size: [number, number];
    color: string;
    renderer: React.FC<any>;
    simultaneousHandlers?: any;
}

interface Entities {
    physics: {
        engine: Matter.Engine;
        world: Matter.World;
    };
    [key: string]: GameEntity | { engine: Matter.Engine; world: Matter.World };
}

export default function Canvas() {
    const nodes = useMindMapStore(state => state.nodes);
    const [gameEngineKey, setGameEngineKey] = useState(0);
    const gameEngineRef = useRef(null);
    const gestureHandlerRef = useRef(null);

    const prepareEntities = useCallback((): Entities => {
        console.log("Preparing entities for", nodes.length, "nodes");

        const entities: Entities = {
            physics: { engine, world }
        };

        const currentEntityKeys: string[] = ['physics'];

        nodes.forEach((node) => {
            const entityKey = node.id;
            currentEntityKeys.push(entityKey);

            const existingBody = Matter.Composite.allBodies(world).find(
                body => body.label === entityKey
            );

            let body;
            if (existingBody) {
                body = existingBody;
                if (!body.isStatic) {
                    Matter.Body.setPosition(body, { x: node.x, y: node.y });
                }
            } else {
                body = Matter.Bodies.circle(node.x, node.y, NODE_SIZE / 2, {
                    label: entityKey,
                    restitution: 0.2,
                    frictionAir: 0.2,
                    friction: 0.1,
                });
                Matter.World.add(world, body);
                console.log("Added new body to world:", entityKey);
            }

            entities[entityKey] = {
                body,
                node,
                size: [NODE_SIZE, NODE_SIZE],
                color: node.color,
                renderer: (props: any) => (
                    <NodeCard {...props} simultaneousHandlers={gestureHandlerRef} />
                ),
            } as GameEntity;
        });

        cleanupPhysics(currentEntityKeys);
        return entities;
    }, [nodes]);

    useEffect(() => {
        setGameEngineKey(prev => prev + 1);
    }, [nodes.length]);

    useEffect(() => {
        return () => {
            Matter.World.clear(world, false);
            Matter.Engine.clear(engine);
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
