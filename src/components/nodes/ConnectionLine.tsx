import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { useNodeStore } from '../../state/useNodeStore';
import { Link } from '../../types/Node';

type Props = {
  link: Link;
};

export default function ConnectionLine({ link }: Props) {
  const { nodes } = useNodeStore();
  const source = nodes.find((n) => n.id === link.sourceId);
  const target = nodes.find((n) => n.id === link.targetId);

  if (!source || !target) return null;

  const startX = source.x + 40;
  const startY = source.y + 20;
  const endX = target.x + 40;
  const endY = target.y + 20;

  const dx = endX - startX;
  const dy = endY - startY;
  const cx1 = startX + dx * 0.25;
  const cy1 = startY;
  const cx2 = startX + dx * 0.75;
  const cy2 = endY;

  const path = `M ${startX} ${startY} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${endX} ${endY}`;

  return (
    <Svg style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: '100%' }}>
      <Path d={path} stroke="#aaa" strokeWidth={2} fill="none" />
    </Svg>
  );
}
