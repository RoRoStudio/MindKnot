// Add the Text import at the top of Canvas.tsx
import { Text } from 'react-native';

// Make sure the connectNodes function is exported and works correctly:
connectNodes: (source: string, target: string) => {
    if (source === target) return;

    const { links } = get();

    // Check if this link already exists
    const exists = links.some(link =>
        (link.source === source && link.target === target) ||
        (link.source === target && link.target === source)
    );

    if (!exists) {
        const newLink: Link = {
            id: `link-${links.length + 1}`,
            source,
            target
        };

        set({ links: [...links, newLink] });
    }
},