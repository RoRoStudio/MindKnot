// src/components/links/NodeLinks.tsx
import React from 'react';
import { StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
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
                return {
                    stroke: color || '#F2994A',
                    strokeWidth: 2,
                    showArrow: true,
                    dashArray: ''
                };
            case 'reference':
                return {
                    stroke: color || '#2D9CDB',
                    strokeWidth: 1.5,
                    showArrow: false,
                    dashArray: '5,3'
                };
            case 'related':
                return {
                    stroke: color || '#BB6BD9',
                    strokeWidth: 1.5,
                    showArrow: false,
                    dashArray: '2,2'
                };
            default:
                return {
                    stroke: color || '#666',
                    strokeWidth: 1,
                    showArrow: false,
                    dashArray: ''
                };
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

        // Calculate curvature based on distance - less curve for close nodes
        const curvature = Math.min(0.3, 50 / distance);

        // Perpendicular vector
        const perpX = -dy * curvature;
        const perpY = dx * curvature;

        // Control point
        const cpX = midX + perpX;
        const cpY = midY + perpY;

        return `M ${sourceX} ${sourceY} Q ${cpX} ${cpY}, ${targetX} ${targetY}`;
    };

    // Calculate coordinates for the arrow at the end of the path
    const getArrow = (sourceX: number, sourceY: number, targetX: number, targetY: number) => {
        // Vector from source to target
        const dx = targetX - sourceX;
        const dy = targetY - sourceY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Normalized vector
        const ndx = dx / distance;
        const ndy = dy / distance;

        // Calculate point near the target (slightly offset from actual target)
        const arrowSize = 10;
        const offset = 15; // Distance from target node
        const arrowX = targetX - ndx * offset;
        const arrowY = targetY - ndy * offset;

        // Calculate perpendicular vector for arrow wings
        const perpX = -ndy;
        const perpY = ndx;

        // Calculate the three points of the arrow
        const tip = { x: arrowX, y: arrowY };
        const left = {
            x: arrowX - ndx * arrowSize + perpX * arrowSize * 0.6,
            y: arrowY - ndy * arrowSize + perpY * arrowSize * 0.6
        };
        const right = {
            x: arrowX - ndx * arrowSize - perpX * arrowSize * 0.6,
            y: arrowY - ndy * arrowSize - perpY * arrowSize * 0.6
        };

        return `M ${tip.x},${tip.y} L ${left.x},${left.y} L ${right.x},${right.y} Z`;
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
                    <React.Fragment key={link.id}>
                        {/* Main link path */}
                        <Path
                            d={path}
                            fill="none"
                            stroke={linkStyle.stroke}
                            strokeWidth={linkStyle.strokeWidth}
                            strokeDasharray={linkStyle.dashArray}
                            strokeLinecap="round"
                        />

                        {/* Arrow if needed */}
                        {linkStyle.showArrow && (
                            <Path
                                d={getArrow(source.x, source.y, target.x, target.y)}
                                fill={linkStyle.stroke}
                            />
                        )}
                    </React.Fragment>
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