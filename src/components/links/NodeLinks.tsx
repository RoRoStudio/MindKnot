// src/components/links/NodeLinks.tsx
import React from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Path, Text as SvgText } from 'react-native-svg';
import { LinkModel, NodeModel } from '../../types/NodeTypes';

interface NodeLinksProps {
    links: LinkModel[];
    nodes: NodeModel[];
    tempLink?: {
        sourceId: string | null;
        targetId: string | null;
        sourceX?: number;
        sourceY?: number;
        targetX?: number;
        targetY?: number;
    } | null;
}

export default function NodeLinks({ links, nodes, tempLink }: NodeLinksProps) {
    // Find a node by ID
    const findNode = (id: string): NodeModel | undefined => {
        return nodes.find(node => node.id === id);
    };

    // Generate styles for different link types
    const getLinkStyle = (type: string, color?: string) => {
        switch (type) {
            case 'cause':
                return { stroke: color || '#F2994A', strokeWidth: 2 };
            case 'reference':
                return { stroke: color || '#2D9CDB', strokeWidth: 1.5, strokeDasharray: '5,3' };
            case 'related':
                return { stroke: color || '#BB6BD9', strokeWidth: 1.5 };
            default:
                return { stroke: color || '#666', strokeWidth: 1 };
        }
    };

    // Generate a curved path between two nodes
    const getCurvedPath = (sourceX: number, sourceY: number, targetX: number, targetY: number) => {
        // Calculate distance between nodes
        const dx = targetX - sourceX;
        const dy = targetY - sourceY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Calculate control point for curved lines (perpendicular to line)
        const midX = (sourceX + targetX) / 2;
        const midY = (sourceY + targetY) / 2;

        // Calculate curvature based on distance
        const curvature = Math.min(0.3, 50 / distance);

        // Perpendicular vector
        const perpX = -dy * curvature;
        const perpY = dx * curvature;

        // Control point
        const cpX = midX + perpX;
        const cpY = midY + perpY;

        return `M ${sourceX} ${sourceY} Q ${cpX} ${cpY}, ${targetX} ${targetY}`;
    };

    return (
        <Svg style={StyleSheet.absoluteFill}>
            {/* Render actual links */}
            {links.map(link => {
                const source = findNode(link.sourceId);
                const target = findNode(link.targetId);

                if (!source || !target) return null;

                const linkStyle = getLinkStyle(link.type, link.color);
                const path = getCurvedPath(source.x, source.y, target.x, target.y);

                return (
                    <Path
                        key={link.id}
                        d={path}
                        fill="none"
                        {...linkStyle}
                        strokeLinecap="round"
                    />
                );
            })}

            {/* Render temporary link during creation */}
            {tempLink && tempLink.sourceId && (
                <Path
                    d={
                        tempLink.targetX !== undefined && tempLink.targetY !== undefined
                            ? getCurvedPath(
                                tempLink.sourceX ?? findNode(tempLink.sourceId)?.x ?? 0,
                                tempLink.sourceY ?? findNode(tempLink.sourceId)?.y ?? 0,
                                tempLink.targetX,
                                tempLink.targetY
                            )
                            : ''
                    }
                    fill="none"
                    stroke="#666"
                    strokeWidth={1.5}
                    strokeDasharray="5,5"
                    strokeLinecap="round"
                />
            )}
        </Svg>
    );
}