import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { Link } from '../../types/Node';
import { useNodeStore } from '../../state/useNodeStore';

interface Props {
    link: Link;
}

export default function ConnectionLine({ link }: Props) {
    const { nodes } = useNodeStore();

    // Find source and target nodes
    const sourceNode = nodes.find(node => node.id === link.source);
    const targetNode = nodes.find(node => node.id === link.target);

    if (!sourceNode || !targetNode) return null;

    // Get positions
    const sourceX = sourceNode.body.position.x;
    const sourceY = sourceNode.body.position.y;
    const targetX = targetNode.body.position.x;
    const targetY = targetNode.body.position.y;

    // Create bezier curve
    const dx = targetX - sourceX;
    const dy = targetY - sourceY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Control points for a nice curve
    const curvature = Math.min(0.4, 60 / distance);
    const controlX = sourceX + dx * 0.5;
    const controlY = sourceY + dy * 0.5 - distance * curvature;

    // Path for quadratic bezier curve
    const path = `M ${sourceX} ${sourceY} Q ${controlX} ${controlY}, ${targetX} ${targetY}`;

    return (
        <Svg style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
            <Path
                d={path}
                stroke="#666"
                strokeWidth={2}
                fill="none"
            />
        </Svg>
    );
}