import { PhysicsBody } from './Physics';

export interface Node {
    id: string;
    title: string;
    color: string;
    body: PhysicsBody;
}

export interface Link {
    id: string;
    source: string;
    target: string;
}